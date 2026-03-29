require "rails_helper"

RSpec.describe VehicleRecommender do
  subject(:recommender) { described_class.new }

  describe "#recommend" do
    it "returns vehicles within budget" do
      results = recommender.recommend(budget: 30000)
      expect(results).to all(satisfy { |v| v[:price] <= 30000 })
    end

    it "prioritizes matching vehicle type" do
      results = recommender.recommend(budget: 50000, type: "suv")
      suv_scores = results.select { |v| v[:type] == "suv" }.map { |v| v[:match_score] }
      non_suv_scores = results.reject { |v| v[:type] == "suv" }.map { |v| v[:match_score] }

      if suv_scores.any? && non_suv_scores.any?
        expect(suv_scores.max).to be >= non_suv_scores.max
      end
    end

    it "returns max 5 results" do
      results = recommender.recommend(budget: 100000)
      expect(results.length).to be <= 5
    end

    it "includes match_score and match_reasons" do
      results = recommender.recommend(budget: 30000)
      results.each do |v|
        expect(v).to have_key(:match_score)
        expect(v).to have_key(:match_reasons)
      end
    end
  end
end
