class UserMailer < ApplicationMailer
  def welcome(user)
    @user = user
    mail to: @user.email, subject: "Welcome, #{@user.name}!"
  end

  def booking_confirmation(user, appointment)
    @user = user
    @appointment = appointment
    mail to: @user.email, subject: "Delivery confirmed for #{@appointment.scheduled_date.strftime('%B %d, %Y')}"
  end

  def document_verified(user, document)
    @user = user
    @document = document
    mail to: @user.email, subject: "Your documents have been verified"
  end

  def password_reset(user, token)
    @user = user
    @token = token
    @reset_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:4200')}/reset-password?token=#{token}"
    mail to: @user.email, subject: "Reset your the platform password"
  end

  def delivery_reminder(user, appointment)
    @user = user
    @appointment = appointment
    mail to: @user.email, subject: "Your delivery is tomorrow!"
  end
end
