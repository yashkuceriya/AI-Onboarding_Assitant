class Vehicle < ApplicationRecord
  has_many :favorites, dependent: :destroy
  has_many :favorited_by_users, through: :favorites, source: :user
  has_many :deliveries, dependent: :destroy

  validates :make, :model, :year, :price, :body_type, :color, presence: true

  scope :available, -> { where(available: true) }
  scope :by_make, ->(make) { where("LOWER(make) = ?", make.downcase) if make.present? }
  scope :by_type, ->(type) { where("LOWER(body_type) = ?", type.downcase) if type.present? }
  scope :by_year_min, ->(year) { where("year >= ?", year) if year.present? }
  scope :by_year_max, ->(year) { where("year <= ?", year) if year.present? }
  scope :by_price_min, ->(price) { where("price >= ?", price) if price.present? }
  scope :by_price_max, ->(price) { where("price <= ?", price) if price.present? }
  scope :by_mileage_max, ->(mileage) { where("mileage <= ?", mileage) if mileage.present? }
  scope :search, ->(q) {
    where("LOWER(make) LIKE :q OR LOWER(model) LIKE :q OR LOWER(color) LIKE :q",
          q: "%#{q.downcase}%") if q.present?
  }

  def as_listing(current_user = nil, fav_ids: nil)
    {
      id: id,
      make: make,
      model: model,
      year: year,
      price: price.to_f,
      mileage: mileage,
      body_type: body_type,
      color: color,
      exterior_color: exterior_color || color,
      mpg: mpg,
      safety_rating: safety_rating&.to_f,
      description: description,
      vin: vin,
      engine: engine,
      transmission: transmission,
      drivetrain: drivetrain,
      features: features || [],
      image_gradient: image_gradient || ["#ccc", "#999"],
      image_url: image_url,
      available: available,
      location: location,
      favorited: if fav_ids
                   fav_ids.include?(id)
                 elsif current_user
                   favorites.exists?(user: current_user)
                 else
                   false
                 end
    }
  end
end
