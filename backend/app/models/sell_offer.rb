class SellOffer < ApplicationRecord
  belongs_to :user
  has_many_attached :photos

  enum :status, {
    draft: 0,
    quoted: 1,
    photos_uploaded: 2,
    accepted: 3,
    pickup_scheduled: 4,
    inspecting: 5,
    completed: 6,
    expired: 7
  }

  validates :make, :model, :year, :mileage, :condition, presence: true

  CONDITION_MULTIPLIERS = {
    "excellent" => 1.05,
    "good" => 1.0,
    "fair" => 0.88,
    "rough" => 0.72
  }.freeze

  def calculate_offer!
    base = estimate_base_value
    age_factor = [1.0 - ((Date.today.year - year) * 0.08), 0.25].max
    mileage_factor = [1.0 - ((mileage - 12000.0 * (Date.today.year - year)).clamp(0, Float::INFINITY) / 200_000.0), 0.7].max
    condition_factor = CONDITION_MULTIPLIERS[condition] || 1.0

    estimated = (base * age_factor * mileage_factor * condition_factor).round(0)
    low = (estimated * 0.92).round(0)
    high = (estimated * 1.08).round(0)

    update!(
      offer_amount: estimated,
      range_low: low,
      range_high: high,
      offer_breakdown: {
        base_value: base,
        age_years: Date.today.year - year,
        age_factor: age_factor.round(3),
        mileage: mileage,
        mileage_factor: mileage_factor.round(3),
        condition: condition,
        condition_factor: condition_factor,
        estimated_value: estimated
      },
      status: :quoted
    )
  end

  def as_detail
    {
      id: id,
      make: make,
      model: model,
      year: year,
      mileage: mileage,
      condition: condition,
      vin: vin,
      color: color,
      trim: trim,
      description: description,
      offer_amount: offer_amount&.to_f,
      range_low: range_low&.to_f,
      range_high: range_high&.to_f,
      offer_breakdown: offer_breakdown,
      status: status,
      pickup_date: pickup_date,
      pickup_address: pickup_address,
      pickup_time_slot: pickup_time_slot,
      photo_count: photos.count,
      created_at: created_at,
      timeline: build_timeline
    }
  end

  private

  def estimate_base_value
    # Rough MSRP estimates by segment
    msrp_table = {
      "Toyota" => 32000, "Honda" => 30000, "Ford" => 35000, "Chevrolet" => 33000,
      "Hyundai" => 29000, "Kia" => 28000, "Nissan" => 28000, "Subaru" => 32000,
      "Mazda" => 30000, "Volkswagen" => 32000, "BMW" => 48000, "Mercedes-Benz" => 50000,
      "Audi" => 46000, "Lexus" => 45000, "Tesla" => 42000, "Jeep" => 38000,
      "Ram" => 40000, "GMC" => 42000, "Porsche" => 65000, "Rivian" => 75000
    }
    msrp_table[make] || 30000
  end

  def build_timeline
    steps = [
      { key: "draft", label: "Vehicle Details", description: "Tell us about your car" },
      { key: "quoted", label: "Instant Offer", description: "Review your guaranteed offer" },
      { key: "photos_uploaded", label: "Photos Uploaded", description: "We've received your photos" },
      { key: "accepted", label: "Offer Accepted", description: "You've accepted the offer" },
      { key: "pickup_scheduled", label: "Pickup Scheduled", description: "We'll come to you" },
      { key: "inspecting", label: "Final Inspection", description: "Quick verification in person" },
      { key: "completed", label: "Payment Sent", description: "Money in your account!" }
    ]

    status_index = self.class.statuses[status] || 0

    steps.each_with_index.map do |step, i|
      {
        key: step[:key],
        label: step[:label],
        description: step[:description],
        completed: i <= status_index,
        current: i == status_index
      }
    end
  end
end
