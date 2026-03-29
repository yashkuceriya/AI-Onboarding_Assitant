module Api
  module V1
    class UsersController < BaseController
      def show
        render json: {
          id: current_user.id,
          name: current_user.name,
          email: current_user.email,
          phone: current_user.phone,
          preferred_contact: current_user.preferred_contact,
          onboarding_step: current_user.onboarding_step,
          profile_data: current_user.profile_data
        }
      end

      def update
        if current_user.update(user_params)
          render json: { user: current_user.as_json(except: [:password_digest]) }
        else
          render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def user_params
        params.permit(:name, :phone, :preferred_contact, :onboarding_step, profile_data: {})
      end
    end
  end
end
