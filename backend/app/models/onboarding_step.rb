class OnboardingStep < ApplicationRecord
  has_many :onboarding_items, -> { order(:position) }, dependent: :destroy
  has_many :user_onboarding_progresses, dependent: :destroy

  scope :ordered, -> { order(:position) }
end
