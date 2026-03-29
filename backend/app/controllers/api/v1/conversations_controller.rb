module Api
  module V1
    class ConversationsController < BaseController
      def create
        conversation = current_user.conversations.create!(status: :active)

        # Create initial system greeting
        greeting = conversation.messages.create!(
          role: :assistant,
          content: "Hey #{current_user.name}! I'm your Carvana assistant. Let's find you the perfect car. What type of vehicle are you looking for?",
          quick_replies: ["SUV or crossover", "Sedan", "Truck or pickup"]
        )

        render json: {
          conversation: { id: conversation.id, status: conversation.status },
          messages: [message_json(greeting)]
        }, status: :created
      end

      def show
        conversation = current_user.conversations.find(params[:id])
        messages = conversation.messages.order(:created_at).map { |m| message_json(m) }
        render json: { conversation: { id: conversation.id, status: conversation.status }, messages: messages }
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
