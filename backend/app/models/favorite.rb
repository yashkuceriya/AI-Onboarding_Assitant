class Favorite < ApplicationRecord
  belongs_to :user
  belongs_to :vehicle

  validates :vehicle_id, uniqueness: { scope: :user_id }
end
