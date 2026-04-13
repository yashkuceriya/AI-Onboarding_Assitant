class DropoutPredictor
  RISK_WEIGHTS = {
    idle_time: 0.25,
    failed_uploads: 0.20,
    financing_time: 0.20,
    negative_sentiment: 0.15,
    incomplete_profile: 0.10,
    session_anomaly: 0.10
  }.freeze

  def initialize(user)
    @user = user
  end

  def risk_score
    signals = calculate_signals
    score = signals.sum { |key, value| RISK_WEIGHTS[key] * value }
    score.clamp(0.0, 1.0).round(3)
  end

  def risk_assessment
    score = risk_score
    signals = calculate_signals

    {
      score: score,
      level: risk_level(score),
      signals: signals,
      recommended_actions: recommended_actions(score, signals)
    }
  end

  private

  def calculate_signals
    {
      idle_time: idle_signal,
      failed_uploads: upload_failure_signal,
      financing_time: financing_time_signal,
      negative_sentiment: sentiment_signal,
      incomplete_profile: profile_signal,
      session_anomaly: session_anomaly_signal
    }
  end

  def idle_signal
    idle = @user.idle_duration
    return 0.0 unless idle

    case idle
    when 0..300 then 0.0       # < 5 min
    when 300..600 then 0.3     # 5-10 min
    when 600..1800 then 0.6    # 10-30 min
    else 1.0                   # > 30 min
    end
  end

  def upload_failure_signal
    counters = @user.session_data&.dig("counters") || {}
    attempts = counters["document_upload_attempts"] || 0
    successes = @user.documents.count

    return 0.0 if attempts <= 1
    failure_rate = 1.0 - (successes.to_f / attempts)
    failure_rate.clamp(0.0, 1.0)
  end

  def financing_time_signal
    events = @user.session_data&.dig("pages_visited") || []
    financing_pages = events.select { |e| e["page"]&.include?("financ") }

    return 0.0 if financing_pages.empty?

    total_time = if financing_pages.length >= 2
      first = Time.parse(financing_pages.first["at"])
      last = Time.parse(financing_pages.last["at"])
      (last - first).abs
    else
      0
    end

    case total_time
    when 0..120 then 0.0       # < 2 min
    when 120..300 then 0.3     # 2-5 min
    when 300..600 then 0.6     # 5-10 min
    else 1.0                   # > 10 min
    end
  rescue
    0.0
  end

  def sentiment_signal
    recent_messages = Message.joins(:conversation)
      .where(conversations: { user_id: @user.id })
      .where(role: :user)
      .where.not(sentiment: nil)
      .order(created_at: :desc)
      .limit(5)

    return 0.0 if recent_messages.empty?

    negative = recent_messages.count { |m| %w[frustrated anxious price_concerned].include?(m.sentiment) }
    (negative.to_f / recent_messages.length).round(2)
  end

  def profile_signal
    profile = @user.profile_data || {}
    expected_fields = %w[service_interest needs preferred_contact location]
    filled = expected_fields.count { |f| profile[f].present? }

    1.0 - (filled.to_f / expected_fields.length)
  end

  def session_anomaly_signal
    # Detect unusual patterns: very short sessions, rapid page changes
    events = @user.session_data&.dig("events") || []
    return 0.0 if events.length < 3

    recent = events.last(10)
    timestamps = recent.filter_map { |e| Time.parse(e["at"]) rescue nil }

    return 0.0 if timestamps.length < 2

    gaps = timestamps.each_cons(2).map { |a, b| (b - a).abs }
    avg_gap = gaps.sum / gaps.length

    # Very rapid actions (< 2 sec avg) or very long gaps both indicate issues
    if avg_gap < 2
      0.7  # Bot-like behavior or frustration clicking
    elsif avg_gap > 300
      0.5  # Long idle periods between actions
    else
      0.0
    end
  rescue
    0.0
  end

  def risk_level(score)
    case score
    when 0.0..0.3 then "low"
    when 0.3..0.6 then "medium"
    when 0.6..0.8 then "high"
    else "critical"
    end
  end

  def recommended_actions(score, signals)
    actions = []

    if signals[:idle_time] > 0.5
      actions << { type: "nudge", message: "Need help? Our AI assistant is ready to answer any questions!" }
    end

    if signals[:failed_uploads] > 0.5
      actions << { type: "nudge", message: "Having trouble uploading? Try our guided camera mode for better results." }
    end

    if signals[:financing_time] > 0.5
      actions << { type: "nudge", message: "Need help understanding financing terms? Check out our payment calculator!" }
    end

    if signals[:negative_sentiment] > 0.5
      actions << { type: "escalate", message: "Would you like to speak with a specialist? We can arrange a callback." }
    end

    actions
  end
end
