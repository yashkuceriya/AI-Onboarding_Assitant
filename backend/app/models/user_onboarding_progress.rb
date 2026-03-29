class UserOnboardingProgress < ApplicationRecord
  belongs_to :user
  belongs_to :onboarding_step

  enum :status, { not_started: 0, in_progress: 1, completed: 2 }
end
