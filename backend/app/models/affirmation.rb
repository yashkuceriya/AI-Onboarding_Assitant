class Affirmation < ApplicationRecord
  scope :active, -> { where(active: true) }

  def self.random
    active.order("RANDOM()").first
  end
end
