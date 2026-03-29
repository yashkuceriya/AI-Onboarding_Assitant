require "rails_helper"

RSpec.describe DropoutPredictor do
  let(:user) { create(:user, onboarding_step: :documents, session_data: {}) }
  subject(:predictor) { described_class.new(user) }

  describe "#risk_score" do
    it "returns a score between 0 and 1" do
      score = predictor.risk_score
      expect(score).to be_between(0.0, 1.0)
    end

    it "returns low risk for a fresh user" do
      expect(predictor.risk_score).to be < 0.3
    end
  end

  describe "#risk_assessment" do
    it "returns a complete assessment" do
      result = predictor.risk_assessment
      expect(result).to have_key(:score)
      expect(result).to have_key(:level)
      expect(result).to have_key(:signals)
      expect(result).to have_key(:recommended_actions)
      expect(%w[low medium high critical]).to include(result[:level])
    end

    it "includes all signal types" do
      signals = predictor.risk_assessment[:signals]
      expect(signals.keys).to contain_exactly(
        :idle_time, :failed_uploads, :financing_time,
        :negative_sentiment, :incomplete_profile, :session_anomaly
      )
    end
  end
end
