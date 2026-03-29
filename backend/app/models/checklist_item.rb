class ChecklistItem < ApplicationRecord
  has_many :user_checklist_items, dependent: :destroy

  scope :ordered, -> { order(:position) }
end
