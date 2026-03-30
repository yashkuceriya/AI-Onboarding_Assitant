module Api
  module V1
    class BaseController < ApplicationController
      before_action :authenticate_user!

      rescue_from StandardError do |e|
        Rails.logger.error("Unhandled error: #{e.class} - #{e.message}\n#{e.backtrace&.first(5)&.join("\n")}")
        render json: { error: "Something went wrong. Please try again." }, status: :internal_server_error
      end

      rescue_from ActiveRecord::RecordNotFound do |e|
        render json: { error: "Record not found" }, status: :not_found
      end

      private

      def authenticate_user!
        token = request.headers["Authorization"]&.split(" ")&.last
        payload = JwtService.decode(token)

        if payload
          @current_user = User.find_by(id: payload["user_id"])
        end

        render json: { error: "Unauthorized" }, status: :unauthorized unless @current_user
      end

      def current_user
        @current_user
      end
    end
  end
end
