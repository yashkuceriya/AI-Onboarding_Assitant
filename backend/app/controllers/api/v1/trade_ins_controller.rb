module Api
  module V1
    class TradeInsController < BaseController
      def estimate
        unless params[:make].present? && params[:model].present? && params[:year].present? && params[:mileage].present?
          return render json: { error: "make, model, year, and mileage are required" }, status: :unprocessable_entity
        end

        estimator = TradeInEstimator.new
        result = estimator.estimate(
          make: params[:make],
          model: params[:model],
          year: params[:year].to_i,
          mileage: params[:mileage].to_i,
          condition: params[:condition] || "good"
        )

        render json: result
      end
    end
  end
end
