Rails.application.config.after_initialize do
  # Log all events for analytics pipeline
  EventBus.subscribe_all do |event, payload|
    if defined?(UserEvent) && payload[:user_id]
      UserEvent.create(
        user_id: payload[:user_id],
        event_type: event,
        metadata: payload.except(:user_id, :event, :timestamp, :event_id)
      )
    end
  rescue => e
    Rails.logger.error("[EventBus] Failed to persist event #{event}: #{e.message}")
  end
end
