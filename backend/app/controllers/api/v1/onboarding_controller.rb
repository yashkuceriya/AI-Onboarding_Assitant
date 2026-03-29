module Api
  module V1
    class OnboardingController < BaseController
      def dashboard
        steps = OnboardingStep.ordered.includes(:onboarding_items)
        checklist = ChecklistItem.ordered
        user_checklist = current_user.user_checklist_items.index_by(&:checklist_item_id)
        user_progress = current_user.user_onboarding_progresses.index_by(&:onboarding_step_id)

        render json: {
          steps: steps.map { |step|
            progress = user_progress[step.id]
            {
              id: step.id,
              title: step.title,
              color: step.color,
              position: step.position,
              status: progress&.status || "not_started",
              items: step.onboarding_items.map { |item|
                {
                  id: item.id,
                  title: item.title,
                  emoji: item.emoji,
                  position: item.position
                }
              }
            }
          },
          checklist: checklist.map { |item|
            user_item = user_checklist[item.id]
            {
              id: item.id,
              title: item.title,
              completed: user_item&.completed || false,
              completed_at: user_item&.completed_at
            }
          },
          progress: {
            steps_completed: user_progress.values.count { |p| p.completed? },
            steps_total: steps.size,
            checklist_completed: user_checklist.values.count { |c| c.completed },
            checklist_total: checklist.size
          }
        }
      end

      def update_step_progress
        step = OnboardingStep.find(params[:step_id])
        progress = current_user.user_onboarding_progresses.find_or_initialize_by(onboarding_step: step)
        progress.status = params[:status]
        progress.save!

        render json: { id: step.id, status: progress.status }
      end

      def progress
        engine = ProgressEngine.new(current_user)
        engine.check_and_award_achievements
        render json: engine.summary
      end

      def toggle_checklist
        item = ChecklistItem.find(params[:checklist_item_id])
        user_item = current_user.user_checklist_items.find_or_initialize_by(checklist_item: item)

        if user_item.completed
          user_item.update!(completed: false, completed_at: nil)
        else
          user_item.update!(completed: true, completed_at: Time.current)
        end

        render json: { id: item.id, completed: user_item.completed, completed_at: user_item.completed_at }
      end
    end
  end
end
