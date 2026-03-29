module Api
  module V1
    class AppointmentsController < BaseController
      def available_slots
        slots = AvailableSlot.open

        # Group by date
        grouped = slots.group_by(&:date).transform_values do |date_slots|
          date_slots.map do |s|
            { id: s.id, time: s.time.strftime("%H:%M"), period: s.time.hour < 12 ? "morning" : "afternoon" }
          end
        end

        render json: { slots: grouped }
      end

      def create
        slot = AvailableSlot.find(params[:slot_id])

        appointment = nil
        slot.with_lock do
          if slot.is_booked
            render json: { error: "This slot is no longer available" }, status: :conflict
            return
          end

          appointment = current_user.appointments.create!(
            scheduled_date: slot.date,
            scheduled_time: slot.time,
            status: :confirmed,
            notes: params[:notes]
          )
          slot.book!
        end

        current_user.update!(onboarding_step: :complete)
        UserMailer.booking_confirmation(current_user, appointment).deliver_later

        EventBus.publish("appointment.booked", {
          user_id: current_user.id,
          appointment_id: appointment.id,
          date: appointment.scheduled_date.to_s
        })

        render json: {
          id: appointment.id,
          scheduled_date: appointment.scheduled_date,
          scheduled_time: appointment.scheduled_time.strftime("%H:%M"),
          status: appointment.status
        }, status: :created
      end
    end
  end
end
