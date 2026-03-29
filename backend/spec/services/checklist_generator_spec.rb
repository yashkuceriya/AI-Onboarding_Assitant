require "rails_helper"

RSpec.describe ChecklistGenerator do
  let(:user) { create(:user, profile_data: {}) }
  subject(:generator) { described_class.new(user) }

  describe "#generate" do
    it "returns base checklist items for all users" do
      result = generator.generate
      expect(result[:items]).to be_an(Array)
      expect(result[:items].length).to be >= 6
      expect(result[:total_estimated_minutes]).to be > 0
    end

    it "adds financing items for finance users" do
      user.update!(profile_data: { "financing_preference" => "finance" })
      result = generator.generate
      titles = result[:items].map { |i| i[:title] }
      expect(titles).to include("Review and accept loan terms")
    end

    it "adds cash items for cash buyers" do
      user.update!(profile_data: { "financing_preference" => "cash" })
      result = generator.generate
      titles = result[:items].map { |i| i[:title] }
      expect(titles).to include("Confirm total out-the-door price")
    end

    it "adds state-specific items for California" do
      user.update!(profile_data: { "location" => "CA" })
      result = generator.generate
      titles = result[:items].map { |i| i[:title] }
      expect(titles).to include("Smog check certification required")
    end

    it "adds trade-in items when applicable" do
      user.update!(profile_data: { "trade_in" => "yes" })
      result = generator.generate
      titles = result[:items].map { |i| i[:title] }
      expect(titles).to include("Provide trade-in vehicle title (must be in your name)")
    end

    it "marks personalized when customized" do
      user.update!(profile_data: { "location" => "TX" })
      expect(generator.generate[:personalized]).to be true
    end
  end
end
