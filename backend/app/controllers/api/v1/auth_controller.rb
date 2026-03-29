module Api
  module V1
    class AuthController < ApplicationController
      def register
        user = User.new(register_params)
        if user.save
          token = JwtService.encode(user.id)
          UserMailer.welcome(user).deliver_later
          render json: { user: user_json(user), token: token }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def login
        user = User.find_by(email: params[:email])
        if user&.authenticate(params[:password])
          token = JwtService.encode(user.id)
          render json: { user: user_json(user), token: token }
        else
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end
      end

      def forgot_password
        user = User.find_by(email: params[:email])
        if user
          token = SecureRandom.urlsafe_base64(32)
          user.update!(password_reset_token: token, password_reset_sent_at: Time.current)
          UserMailer.password_reset(user, token).deliver_later
        end
        # Always return success to prevent email enumeration
        render json: { message: "If that email exists, we've sent a reset link." }
      end

      def reset_password
        user = User.find_by(password_reset_token: params[:token])
        if user && user.password_reset_sent_at.present? && user.password_reset_sent_at > 2.hours.ago
          if user.update(
            password: params[:password],
            password_confirmation: params[:password_confirmation],
            password_reset_token: nil,
            password_reset_sent_at: nil
          )
            render json: { message: "Password updated successfully." }
          else
            render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
          end
        else
          render json: { error: "Invalid or expired reset link." }, status: :unprocessable_entity
        end
      end

      private

      def register_params
        params.permit(:name, :email, :password, :password_confirmation, :phone, :preferred_contact)
      end

      def user_json(user)
        {
          id: user.id,
          name: user.name,
          email: user.email,
          onboarding_step: user.onboarding_step,
          profile_data: user.profile_data
        }
      end
    end
  end
end
