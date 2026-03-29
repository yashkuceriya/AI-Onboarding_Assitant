class TradeInEstimator
  # Simplified KBB-style valuation based on make/model/year/mileage/condition
  DEPRECIATION_RATES = {
    1 => 0.80,  # 1 year old: 80% of MSRP
    2 => 0.72,
    3 => 0.65,
    4 => 0.58,
    5 => 0.52,
    6 => 0.46,
    7 => 0.41,
    8 => 0.36,
    9 => 0.32,
    10 => 0.28
  }.freeze

  CONDITION_MULTIPLIERS = {
    "excellent" => 1.10,
    "good" => 1.00,
    "fair" => 0.88,
    "poor" => 0.72
  }.freeze

  BASE_MSRPS = {
    "toyota_camry" => 28000, "toyota_rav4" => 31000, "toyota_corolla" => 22000,
    "toyota_highlander" => 38000, "toyota_tacoma" => 35000, "toyota_tundra" => 42000,
    "honda_civic" => 24000, "honda_cr-v" => 32000, "honda_accord" => 28000,
    "ford_f-150" => 38000, "ford_escape" => 30000, "ford_bronco" => 34000, "ford_maverick" => 25000,
    "chevrolet_silverado" => 40000, "chevrolet_equinox" => 28000, "chevrolet_malibu" => 25000,
    "hyundai_tucson" => 29000, "hyundai_sonata" => 26000, "hyundai_elantra" => 22000,
    "kia_telluride" => 38000, "kia_sportage" => 30000, "kia_k5" => 27000,
    "subaru_outback" => 32000, "subaru_forester" => 30000,
    "mazda_cx-5" => 29000, "mazda_mazda3" => 24000,
    "nissan_altima" => 26000, "nissan_rogue" => 30000,
    "tesla_model_3" => 40000, "tesla_model_y" => 45000,
    "bmw_3_series" => 43000, "mercedes-benz_c-class" => 45000,
    "jeep_grand_cherokee" => 40000, "jeep_wrangler" => 35000,
    "ram_1500" => 40000, "gmc_sierra" => 42000
  }.freeze

  MILEAGE_PENALTY_PER_1K = 150  # $150 deduction per 1000 miles over average

  def estimate(make:, model:, year:, mileage:, condition: "good")
    key = "#{make}_#{model}".downcase.gsub(/\s+/, "_")
    base_msrp = BASE_MSRPS[key] || 28000

    current_year = Date.today.year
    age = [current_year - year.to_i, 1].max
    age = [age, 10].min

    depreciation = DEPRECIATION_RATES[age] || 0.25
    condition_mult = CONDITION_MULTIPLIERS[condition.to_s.downcase] || 1.0

    base_value = base_msrp * depreciation * condition_mult

    # Mileage adjustment (average 12k/year)
    expected_miles = age * 12000
    excess_miles = [mileage.to_i - expected_miles, 0].max
    mileage_penalty = (excess_miles / 1000.0) * MILEAGE_PENALTY_PER_1K

    estimated_value = [(base_value - mileage_penalty).round(-2), 500].max

    {
      estimated_value: estimated_value,
      range_low: (estimated_value * 0.90).round(-2),
      range_high: (estimated_value * 1.10).round(-2),
      factors: {
        base_msrp: base_msrp,
        age_years: age,
        depreciation_pct: (depreciation * 100).round,
        condition: condition,
        condition_adjustment: "#{((condition_mult - 1) * 100).round(0)}%",
        mileage: mileage.to_i,
        expected_mileage: expected_miles,
        mileage_penalty: mileage_penalty.round
      }
    }
  end
end
