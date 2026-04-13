class SentimentAnalyzer
  CATEGORIES = %w[neutral frustrated confused anxious price_concerned excited positive].freeze

  ADAPTIVE_RESPONSES = {
    "frustrated" => {
      tone: "empathetic and simple",
      additions: [
        "I understand this can be frustrating. Let me simplify things.",
        "Would you prefer to speak with a specialist? I can arrange a callback."
      ]
    },
    "confused" => {
      tone: "clear and step-by-step",
      additions: [
        "Let me break that down step by step.",
        "Here's a simple guide that might help."
      ]
    },
    "anxious" => {
      tone: "reassuring and supportive",
      additions: [
        "Remember, the platform has a 7-day money-back guarantee — no risk involved.",
        "Over 10,000 cars are delivered successfully every month."
      ]
    },
    "price_concerned" => {
      tone: "transparent and value-focused",
      additions: [
        "Let me show you the full cost breakdown so there are no surprises.",
        "Would you like to compare different financing options?"
      ]
    }
  }.freeze

  def initialize
    @ai = AiService.new
  end

  def analyze(text)
    result = @ai.classify(
      text: text,
      categories: CATEGORIES,
      model: :fast,
      max_tokens: 128
    )

    parsed = JSON.parse(result.content)
    {
      category: parsed["category"] || "neutral",
      confidence: parsed["confidence"] || 0.5
    }
  rescue JSON::ParserError
    { category: "neutral", confidence: 0.5 }
  end

  def adaptive_context(sentiment)
    config = ADAPTIVE_RESPONSES[sentiment]
    return nil unless config

    {
      tone_instruction: "Respond in a #{config[:tone]} tone.",
      suggested_additions: config[:additions]
    }
  end

  def analyze_and_store(message)
    return unless message.role == "user"

    result = analyze(message.content)
    message.update_column(:sentiment, result[:category])
    result
  end
end
