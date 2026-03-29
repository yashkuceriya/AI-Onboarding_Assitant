class NudgeEngine
  RULES = [
    {
      trigger: "idle_on_financing",
      condition: ->(user) {
        user.onboarding_step == "documents" &&
          user.idle_duration&.> (300) # 5 min idle
      },
      message: "Need help understanding the financing terms? I can break it down for you!",
      channel: :in_app
    },
    {
      trigger: "failed_upload",
      condition: ->(user) {
        counters = user.session_data&.dig("counters") || {}
        (counters["document_upload_failures"] || 0) >= 2
      },
      message: "Having trouble with your upload? Try our guided camera mode — it helps get the perfect shot!",
      channel: :in_app
    },
    {
      trigger: "incomplete_after_day",
      condition: ->(user) {
        !user.complete? && user.created_at < 24.hours.ago
      },
      message: "You're almost done! Just a few more steps to complete your Carvana purchase.",
      channel: :email
    },
    {
      trigger: "no_document_after_assessment",
      condition: ->(user) {
        user.onboarding_step == "documents" &&
          user.documents.empty? &&
          user.updated_at < 1.hour.ago
      },
      message: "Ready to upload your documents? We just need a driver's license to get started.",
      channel: :in_app
    },
    {
      trigger: "no_appointment_after_docs",
      condition: ->(user) {
        user.onboarding_step == "scheduling" &&
          user.appointments.empty? &&
          user.updated_at < 2.hours.ago
      },
      message: "Your documents look great! Let's schedule your delivery — it only takes a minute.",
      channel: :in_app
    }
  ].freeze

  def initialize(user)
    @user = user
  end

  def check_and_fire
    triggered = []

    RULES.each do |rule|
      next unless rule[:condition].call(@user)
      next if recently_nudged?(rule[:trigger])

      nudge = fire_nudge(rule)
      triggered << nudge if nudge
    end

    triggered
  end

  def pending_nudges
    check_and_fire.select { |n| n[:channel] == :in_app }
  end

  private

  def fire_nudge(rule)
    record_nudge(rule[:trigger])

    EventBus.publish("user.nudge_sent", {
      user_id: @user.id,
      trigger: rule[:trigger],
      channel: rule[:channel].to_s,
      message: rule[:message]
    })

    case rule[:channel]
    when :email
      NudgeEmailJob.perform_later(@user.id, rule[:message]) if defined?(NudgeEmailJob)
    end

    {
      trigger: rule[:trigger],
      message: rule[:message],
      channel: rule[:channel]
    }
  end

  def recently_nudged?(trigger)
    nudges = @user.session_data&.dig("nudges") || {}
    last_nudge = nudges[trigger]
    return false unless last_nudge

    Time.parse(last_nudge) > 1.hour.ago
  rescue
    false
  end

  def record_nudge(trigger)
    current_session = @user.session_data || {}
    nudges = current_session["nudges"] || {}
    nudges[trigger] = Time.current.iso8601

    @user.update_column(:session_data, current_session.merge("nudges" => nudges))
  end
end
