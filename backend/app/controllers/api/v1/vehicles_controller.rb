module Api
  module V1
    class VehiclesController < BaseController
      def index
        vehicles = Vehicle.available
        vehicles = vehicles.search(params[:q]) if params[:q].present?
        vehicles = vehicles.by_make(params[:make]) if params[:make].present?
        vehicles = vehicles.by_type(params[:body_type]) if params[:body_type].present?
        vehicles = vehicles.by_year_min(params[:year_min]) if params[:year_min].present?
        vehicles = vehicles.by_year_max(params[:year_max]) if params[:year_max].present?
        vehicles = vehicles.by_price_min(params[:price_min]) if params[:price_min].present?
        vehicles = vehicles.by_price_max(params[:price_max]) if params[:price_max].present?
        vehicles = vehicles.by_mileage_max(params[:mileage_max]) if params[:mileage_max].present?

        case params[:sort]
        when "newest" then vehicles = vehicles.order(created_at: :desc)
        when "price_asc" then vehicles = vehicles.order(price: :asc)
        when "price_desc" then vehicles = vehicles.order(price: :desc)
        when "year_desc" then vehicles = vehicles.order(year: :desc)
        when "mileage_asc" then vehicles = vehicles.order(mileage: :asc)
        else vehicles = vehicles.order(created_at: :desc)
        end

        page = (params[:page] || 1).to_i
        per_page = (params[:per_page] || 20).to_i.clamp(1, 50)
        total = vehicles.count
        vehicles = vehicles.offset((page - 1) * per_page).limit(per_page)

        fav_ids = current_user ? current_user.favorites.where(vehicle_id: vehicles.map(&:id)).pluck(:vehicle_id).to_set : Set.new

        render json: {
          vehicles: vehicles.map { |v| v.as_listing(current_user, fav_ids: fav_ids) },
          meta: {
            total: total,
            page: page,
            per_page: per_page,
            total_pages: (total.to_f / per_page).ceil,
            makes: Vehicle.available.distinct.pluck(:make).sort,
            body_types: Vehicle.available.distinct.pluck(:body_type).sort
          }
        }
      end

      def show
        vehicle = Vehicle.find(params[:id])
        similar = Vehicle.available
                         .where(body_type: vehicle.body_type)
                         .where.not(id: vehicle.id)
                         .order("ABS(price - #{vehicle.price.to_f})")
                         .limit(4)

        render json: {
          vehicle: vehicle.as_listing(current_user),
          similar: similar.map { |v| v.as_listing(current_user) }
        }
      end

      def compare
        ids = Array(params[:ids]).map(&:to_i).first(3)
        vehicles = Vehicle.where(id: ids)
        render json: { vehicles: vehicles.map { |v| v.as_listing(current_user) } }
      end

      def recommend
        recommender = VehicleRecommender.new

        if params[:message]
          result = recommender.conversational_recommend(params[:message], current_user)
          render json: result
        else
          preferences = {
            budget: params[:budget],
            type: params[:type],
            priorities: params[:priorities],
            min_mpg: params[:min_mpg],
            min_safety: params[:min_safety],
            features: params[:features]
          }.compact

          recommendations = recommender.recommend(preferences)
          render json: recommendations
        end
      end
    end
  end
end
