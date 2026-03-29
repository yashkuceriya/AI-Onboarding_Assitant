class NudgeCheckJob < ApplicationJob
  queue_as :low

  def perform
    # Check all active users who haven't completed onboarding
    User.where.not(onboarding_step: :complete).find_each do |user|
      engine = NudgeEngine.new(user)
      engine.check_and_fire
    end
  end
end
