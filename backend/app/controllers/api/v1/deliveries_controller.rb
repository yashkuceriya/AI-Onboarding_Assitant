module Api
  module V1
    class DeliveriesController < BaseController
      def index
        deliveries = current_user.deliveries.includes(:vehicle).order(created_at: :desc)
        render json: { deliveries: deliveries.map(&:as_detail) }
      end

      def show
        delivery = current_user.deliveries.includes(:vehicle).find(params[:id])
        render json: delivery.as_detail
      end
    end
  end
end
