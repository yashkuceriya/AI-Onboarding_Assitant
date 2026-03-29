module Trackable
  extend ActiveSupport::Concern

  def track_event(event_type, data = {})
    current_session = session_data || {}
    events = current_session["events"] || []
    events << { type: event_type, data: data, at: Time.current.iso8601 }

    # Keep only last 100 events per user
    events = events.last(100)

    update_column(:session_data, current_session.merge(
      "events" => events,
      "last_active_at" => Time.current.iso8601
    ))
  end

  def track_page_visit(page)
    current_session = session_data || {}
    pages = current_session["pages_visited"] || []
    pages << { page: page, at: Time.current.iso8601 }

    update_column(:session_data, current_session.merge(
      "pages_visited" => pages.last(50),
      "last_active_at" => Time.current.iso8601
    ))
  end

  def increment_counter(key)
    current_session = session_data || {}
    counters = current_session["counters"] || {}
    counters[key] = (counters[key] || 0) + 1

    update_column(:session_data, current_session.merge("counters" => counters))
  end

  def idle_duration
    last_active = session_data&.dig("last_active_at")
    return nil unless last_active

    Time.current - Time.parse(last_active)
  end
end
