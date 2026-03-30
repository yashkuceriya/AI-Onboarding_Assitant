module Api
  module V1
    class MessagesController < BaseController
      def create
        conversation = current_user.conversations.find(params[:conversation_id])

        # Save user message
        user_msg = conversation.messages.create!(
          role: :user,
          content: params[:content]
        )

        # Get AI response — use conversational onboarding service
        begin
          service = ConversationalOnboardingService.new(current_user)
          result = service.respond(conversation)
        rescue => e
          Rails.logger.error("Chat service error: #{e.message}")
          result = {
            content: "I'm having trouble responding right now. Please try again in a moment.",
            quick_replies: ["Try again", "Skip this step"]
          }
        end

        # Save assistant message
        assistant_msg = conversation.messages.create!(
          role: :assistant,
          content: result[:content],
          quick_replies: result[:quick_replies]
        )

        # Broadcast via ActionCable
        ActionCable.server.broadcast(
          "conversation_#{conversation.id}",
          { message: message_json(assistant_msg) }
        )

        # Track for achievements
        current_user.increment_counter("chat_messages")

        render json: {
          user_message: message_json(user_msg),
          assistant_message: message_json(assistant_msg)
        }, status: :created
      end

      def complete
        conversation = current_user.conversations.find(params[:conversation_id])

        begin
          service = ConversationalOnboardingService.new(current_user)
          profile = service.extract_profile(conversation)
        rescue => e
          Rails.logger.error("Profile extraction error: #{e.message}")
          profile = {}
        end

        conversation.update!(status: :complete, summary: profile)
        current_user.update!(profile_data: (current_user.profile_data || {}).merge(profile), onboarding_step: :documents)

        EventBus.publish("onboarding.step_changed", {
          user_id: current_user.id,
          from: "assessment",
          to: "documents"
        })

        render json: {
          profile: profile,
          next_step: "documents"
        }
      end

      private

      def message_json(msg)
        {
          id: msg.id,
          role: msg.role,
          content: msg.content,
          quick_replies: msg.quick_replies,
          created_at: msg.created_at
        }
      end
    end
  end
end
