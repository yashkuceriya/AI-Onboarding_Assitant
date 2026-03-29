require "rails_helper"

RSpec.describe TradeInEstimator do
  subject(:estimator) { described_class.new }

  describe "#estimate" do
    it "returns a positive estimate for a common vehicle" do
      result = estimator.estimate(make: "Toyota", model: "Camry", year: 2021, mileage: 45000)
      expect(result[:estimated_value]).to be > 0
      expect(result[:range_low]).to be < result[:estimated_value]
      expect(result[:range_high]).to be > result[:estimated_value]
    end

    it "reduces value for higher mileage" do
      low_miles = estimator.estimate(make: "Honda", model: "Civic", year: 2021, mileage: 20000)
      high_miles = estimator.estimate(make: "Honda", model: "Civic", year: 2021, mileage: 80000)
      expect(low_miles[:estimated_value]).to be > high_miles[:estimated_value]
    end

    it "reduces value for older vehicles" do
      newer = estimator.estimate(make: "Toyota", model: "RAV4", year: 2023, mileage: 10000)
      older = estimator.estimate(make: "Toyota", model: "RAV4", year: 2018, mileage: 10000)
      expect(newer[:estimated_value]).to be > older[:estimated_value]
    end

    it "adjusts for condition" do
      excellent = estimator.estimate(make: "Ford", model: "F-150", year: 2021, mileage: 30000, condition: "excellent")
      poor = estimator.estimate(make: "Ford", model: "F-150", year: 2021, mileage: 30000, condition: "poor")
      expect(excellent[:estimated_value]).to be > poor[:estimated_value]
    end

    it "returns at least $500 for any vehicle" do
      result = estimator.estimate(make: "Unknown", model: "Car", year: 2010, mileage: 200000, condition: "poor")
      expect(result[:estimated_value]).to be >= 500
    end

    it "includes factor breakdown" do
      result = estimator.estimate(make: "Tesla", model: "Model 3", year: 2022, mileage: 25000)
      expect(result[:factors]).to have_key(:base_msrp)
      expect(result[:factors]).to have_key(:age_years)
      expect(result[:factors]).to have_key(:depreciation_pct)
      expect(result[:factors]).to have_key(:condition)
      expect(result[:factors]).to have_key(:mileage_penalty)
    end
  end
end
