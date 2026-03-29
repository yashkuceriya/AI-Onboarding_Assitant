class AvailableSlot < ApplicationRecord
  scope :open, -> { where(is_booked: false) }
  scope :on_date, ->(date) { where(date: date) }

  def book!
    update!(is_booked: true)
  end
end
