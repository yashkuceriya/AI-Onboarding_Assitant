require "rails_helper"

RSpec.describe ProgressEngine do
  let(:user) { create(:user, onboarding_step: :assessment) }
  subject(:engine) { described_class.new(user) }

  describe "#completion_percentage" do
    it "returns 0 for welcome step" do
      user.update!(onboarding_step: :welcome)
      expect(engine.completion_percentage).to eq(0)
    end

    it "returns 25 for assessment step" do
      expect(engine.completion_percentage).to eq(25)
    end

    it "returns 100 for complete step" do
      user.update!(onboarding_step: :complete)
      expect(engine.completion_percentage).to eq(100)
    end
  end

  describe "#estimated_time_remaining" do
    it "estimates remaining time based on current step" do
      remaining = engine.estimated_time_remaining
      expect(remaining).to be > 0
    end

    it "returns 0 for complete" do
      user.update!(onboarding_step: :complete)
      expect(engine.estimated_time_remaining).to eq(0)
    end
  end

  describe "#check_and_award_achievements" do
    it "awards first_login achievement" do
      expect { engine.check_and_award_achievements }.to change { user.achievements.count }.by_at_least(1)
      expect(user.achievements.find_by(achievement_type: "first_login")).to be_present
    end

    it "does not duplicate achievements" do
      engine.check_and_award_achievements
      expect { engine.check_and_award_achievements }.not_to change { user.achievements.count }
    end
  end

  describe "#summary" do
    it "returns complete progress summary" do
      summary = engine.summary
      expect(summary).to have_key(:current_step)
      expect(summary).to have_key(:percentage)
      expect(summary).to have_key(:time_remaining_minutes)
      expect(summary).to have_key(:achievements)
      expect(summary).to have_key(:milestones)
    end
  end
end
