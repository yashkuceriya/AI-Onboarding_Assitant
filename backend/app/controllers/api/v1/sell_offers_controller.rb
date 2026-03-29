module Api
  module V1
    class SellOffersController < BaseController
      def index
        offers = current_user.sell_offers.order(created_at: :desc)
        render json: { sell_offers: offers.map(&:as_detail) }
      end

      def show
        offer = current_user.sell_offers.find(params[:id])
        render json: offer.as_detail
      end

      def create
        offer = current_user.sell_offers.new(sell_offer_params)
        if offer.save
          offer.calculate_offer!
          render json: offer.as_detail, status: :created
        else
          render json: { errors: offer.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def upload_photos
        offer = current_user.sell_offers.find(params[:id])
        if params[:photos].present?
          Array(params[:photos]).each do |photo|
            offer.photos.attach(photo)
          end
          offer.update!(status: :photos_uploaded) if offer.quoted?
          render json: offer.as_detail
        else
          render json: { error: "No photos provided" }, status: :unprocessable_entity
        end
      end

      def accept
        offer = current_user.sell_offers.find(params[:id])
        offer.update!(status: :accepted)
        render json: offer.as_detail
      end

      def schedule_pickup
        offer = current_user.sell_offers.find(params[:id])
        offer.update!(
          pickup_date: params[:pickup_date],
          pickup_address: params[:pickup_address],
          pickup_time_slot: params[:pickup_time_slot],
          status: :pickup_scheduled
        )
        render json: offer.as_detail
      end

      private

      def sell_offer_params
        params.permit(:make, :model, :year, :mileage, :condition, :vin, :color, :trim, :description)
      end
    end
  end
end
