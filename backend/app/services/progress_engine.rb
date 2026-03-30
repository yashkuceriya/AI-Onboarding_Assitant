class ProgressEngine
  TIME_ESTIMATES = {
    "welcome" => 2,
    "assessment" => 5,
    "documents" => 5,
    "scheduling" => 3,
    "complete" => 0
  }.freeze

  def initialize(user)
    @user = user
  end

  def summary
    {
      current_step: @user.onboarding_step,
      percentage: completion_percentage,
      time_remaining_minutes: estimated_time_remaining,
      achievements: @user.achievements.order(:unlocked_at).map { |a| achievement_json(a) },
      milestones: milestones
    }
  end

  def completion_percentage
    steps = %w[welcome assessment documents scheduling complete]
    current_index = steps.index(@user.onboarding_step) || 0
    ((current_index.to_f / (steps.length - 1)) * 100).round
  end

  def estimated_time_remaining
    steps = %w[welcome assessment documents scheduling complete]
    current_index = steps.index(@user.onboarding_step) || 0
    remaining_steps = steps[(current_index + 1)..]
    remaining_steps.sum { |s| TIME_ESTIMATES[s] || 0 }
  end

  def check_and_award_achievements
    Achievement::TYPES.each do |type, _info|
      next if @user.achievements.exists?(achievement_type: type.to_s)
      award(type) if earned?(type)
    end
  end

  def award(achievement_type)
    type_key = achievement_type.to_s
    info = Achievement::TYPES[achievement_type.to_sym]
    return unless info

    achievement = @user.achievements.create!(
      achievement_type: type_key,
      title: info[:title],
      description: info[:description],
      unlocked_at: Time.current
    )

    EventBus.publish("user.achievement_unlocked", {
      user_id: @user.id,
      achievement_type: type_key,
      title: info[:title]
    })

    achievement
  rescue ActiveRecord::RecordNotUnique
    nil
  end

  private

  def earned?(type)
    case type
    when :first_login
      true
    when :profile_complete
      @user.assessment? || @user.documents? || @user.scheduling? || @user.complete?
    when :first_document
      @user.documents.exists?
    when :all_documents
      @user.documents.where(status: :confirmed).count >= 1
    when :appointment_booked
      @user.appointments.exists?
    when :speed_demon
      @user.complete? && @user.created_at > 10.minutes.ago
    when :checklist_hero
      total = ChecklistItem.count
      completed = @user.user_checklist_items.where(completed: true).count
      total > 0 && completed >= total
    when :chat_explorer
      Message.joins(:conversation).where(conversations: { user_id: @user.id }, role: :user).count >= 10
    when :onboarding_complete
      @user.complete?
    else
      false
    end
  end

  def milestones
    steps = %w[welcome assessment documents scheduling complete]
    current_index = steps.index(@user.onboarding_step) || 0

    steps.map.with_index do |step, i|
      {
        step: step,
        label: step.titleize,
        status: i < current_index ? "completed" : (i == current_index ? "current" : "upcoming"),
        time_estimate: TIME_ESTIMATES[step]
      }
    end
  end

  def achievement_json(a)
    {
      id: a.id,
      achievement_type: a.achievement_type,
      title: a.title,
      description: a.description,
      unlocked_at: a.unlocked_at
    }
  end
end
