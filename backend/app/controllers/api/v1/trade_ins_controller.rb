module Api
  module V1
    class TradeInsController < BaseController
      def estimate
        estimator = TradeInEstimator.new
        result = estimator.estimate(
          make: params[:make],
          model: params[:model],
          year: params[:year],
          mileage: params[:mileage],
          condition: params[:condition] || "good"
        )

        render json: result
      end
    end
  end
end
