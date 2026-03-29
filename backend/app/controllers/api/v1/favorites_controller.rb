module Api
  module V1
    class FavoritesController < BaseController
      def index
        favorites = current_user.favorites.includes(:vehicle).order(created_at: :desc)
        vehicles = favorites.map { |f| f.vehicle.as_listing(current_user) }
        render json: { vehicles: vehicles }
      end

      def create
        vehicle = Vehicle.find(params[:vehicle_id])
        favorite = current_user.favorites.find_or_create_by!(vehicle: vehicle)
        render json: { favorited: true, vehicle_id: vehicle.id }, status: :created
      end

      def destroy
        favorite = current_user.favorites.find_by!(vehicle_id: params[:id])
        favorite.destroy!
        render json: { favorited: false, vehicle_id: params[:id].to_i }
      end
    end
  end
end
