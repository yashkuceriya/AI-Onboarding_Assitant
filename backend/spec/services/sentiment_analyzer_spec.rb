require "rails_helper"

RSpec.describe SentimentAnalyzer do
  subject(:analyzer) { described_class.new }

  describe "#adaptive_context" do
    it "returns tone instructions for frustrated users" do
      result = analyzer.adaptive_context("frustrated")
      expect(result[:tone_instruction]).to include("empathetic")
      expect(result[:suggested_additions]).to be_an(Array)
    end

    it "returns tone instructions for confused users" do
      result = analyzer.adaptive_context("confused")
      expect(result[:tone_instruction]).to include("step-by-step")
    end

    it "returns tone instructions for anxious users" do
      result = analyzer.adaptive_context("anxious")
      expect(result[:tone_instruction]).to include("reassuring")
    end

    it "returns tone instructions for price-concerned users" do
      result = analyzer.adaptive_context("price_concerned")
      expect(result[:tone_instruction]).to include("transparent")
    end

    it "returns nil for neutral sentiment" do
      expect(analyzer.adaptive_context("neutral")).to be_nil
    end
  end
end
