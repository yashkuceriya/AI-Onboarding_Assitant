class UserEvent < ApplicationRecord
  belongs_to :user

  scope :recent, -> { order(created_at: :desc) }
  scope :of_type, ->(type) { where(event_type: type) }
end
