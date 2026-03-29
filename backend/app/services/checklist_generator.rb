class ChecklistGenerator
  STATE_SPECIFIC_ITEMS = {
    "CA" => [
      "Smog check certification required",
      "California use tax applies on out-of-state purchases"
    ],
    "TX" => [
      "Vehicle inspection required within 30 days",
      "No state income tax — total cost may be lower"
    ],
    "FL" => [
      "No state income tax",
      "Hurricane season: consider comprehensive insurance"
    ],
    "NY" => [
      "NYS inspection required",
      "Additional MTA surcharge in NYC area"
    ]
  }.freeze

  FINANCING_ITEMS = {
    "finance" => [
      "Review and accept loan terms",
      "Set up autopay for monthly payments",
      "Provide proof of income (pay stubs or bank statements)",
      "Review GAP coverage options"
    ],
    "cash" => [
      "Prepare payment method (wire transfer or cashier's check)",
      "Confirm total out-the-door price"
    ],
    "lease" => [
      "Review lease terms and mileage allowance",
      "Understand lease-end options",
      "Set up monthly lease payments"
    ]
  }.freeze

  TRADE_IN_ITEMS = [
    "Provide trade-in vehicle title (must be in your name)",
    "Remove all personal belongings from trade-in",
    "Have trade-in vehicle present at delivery"
  ].freeze

  BASE_ITEMS = [
    { title: "Valid driver's license", category: "documents", time_estimate: 2 },
    { title: "Proof of auto insurance", category: "documents", time_estimate: 5 },
    { title: "Review vehicle history report", category: "review", time_estimate: 3 },
    { title: "Schedule delivery or pickup", category: "scheduling", time_estimate: 2 },
    { title: "Understand 7-day return policy", category: "review", time_estimate: 1 },
    { title: "Confirm delivery address", category: "scheduling", time_estimate: 1 }
  ].freeze

  def initialize(user)
    @user = user
    @ai = AiService.new
  end

  def generate
    items = BASE_ITEMS.dup

    # Add financing-specific items
    financing_type = @user.profile_data&.dig("financing_preference") || "finance"
    if FINANCING_ITEMS[financing_type]
      FINANCING_ITEMS[financing_type].each do |title|
        items << { title: title, category: "financing", time_estimate: 3 }
      end
    end

    # Add state-specific items
    state = @user.profile_data&.dig("location")&.upcase&.strip
    state = state[0..1] if state && state.length > 2
    if STATE_SPECIFIC_ITEMS[state]
      STATE_SPECIFIC_ITEMS[state].each do |title|
        items << { title: title, category: "state_specific", time_estimate: 2 }
      end
    end

    # Add trade-in items
    has_trade_in = @user.profile_data&.dig("trade_in")
    if has_trade_in.to_s.downcase == "yes"
      TRADE_IN_ITEMS.each do |title|
        items << { title: title, category: "trade_in", time_estimate: 3 }
      end
    end

    total_time = items.sum { |i| i[:time_estimate] }

    {
      items: items,
      total_estimated_minutes: total_time,
      categories: items.map { |i| i[:category] }.uniq,
      personalized: state.present? || financing_type != "finance" || has_trade_in.present?
    }
  end
end
