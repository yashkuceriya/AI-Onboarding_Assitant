class EventBus
  EVENTS = %w[
    user.message_sent
    user.registered
    user.idle
    user.abandoned
    user.step_completed
    document.uploaded
    document.processed
    document.confirmed
    appointment.booked
    appointment.cancelled
    onboarding.step_changed
    checklist.item_toggled
  ].freeze

  class << self
    def publish(event, payload = {})
      unless EVENTS.include?(event)
        Rails.logger.warn("[EventBus] Unknown event: #{event}")
      end

      full_payload = payload.merge(
        event: event,
        timestamp: Time.current.iso8601,
        event_id: SecureRandom.uuid
      )

      Rails.logger.info("[EventBus] #{event} #{full_payload.except(:event).to_json}")

      ActiveSupport::Notifications.instrument("carvana.#{event}", full_payload)
    end

    def subscribe(event, &block)
      ActiveSupport::Notifications.subscribe("carvana.#{event}") do |_name, _start, _finish, _id, payload|
        block.call(payload)
      end
    end

    def subscribe_all(&block)
      ActiveSupport::Notifications.subscribe(/^carvana\./) do |name, _start, _finish, _id, payload|
        block.call(name.sub("carvana.", ""), payload)
      end
    end
  end
end
