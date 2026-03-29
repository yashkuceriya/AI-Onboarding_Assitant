module Api
  module V1
    class SupportController < BaseController
      skip_before_action :authenticate_user!, only: [:resources]

      def affirmation
        affirmation = Affirmation.random
        if affirmation
          render json: { content: affirmation.content, category: affirmation.category }
        else
          render json: { content: "You're all set! Your account is ready to go.", category: "general" }
        end
      end

      def resources
        render json: {
          resources: [
            {
              title: "Talk to a Real Person",
              description: "If you'd rather speak with someone, our team is here to help — no pressure, no scripts.",
              type: "community",
              links: [
                { name: "Call Us", url: "tel:+18005551234" },
                { name: "Live Chat", url: "/help/chat" }
              ]
            },
            {
              title: "Buyer's Guide",
              description: "A straightforward guide to the process, so you always know what's coming next.",
              type: "education",
              links: [
                { name: "Read the Guide", url: "/resources/buyers-guide" }
              ]
            },
            {
              title: "Your Rights & Guarantees",
              description: "7-day money-back guarantee, 100-day warranty, free delivery. Know what you're protected by.",
              type: "education",
              links: [
                { name: "View Guarantees", url: "/resources/guarantees" }
              ]
            }
          ]
        }
      end
    end
  end
end
