require "rails_helper"

RSpec.describe FinancialCalculator do
  subject(:calculator) { described_class.new }

  describe "#monthly_payment" do
    it "calculates correct monthly payment" do
      payment = calculator.monthly_payment(principal: 25000, apr: 5.9, term_months: 60)
      expect(payment).to be_within(1.0).of(483.0)
    end

    it "returns 0 for zero principal" do
      expect(calculator.monthly_payment(principal: 0, apr: 5.0, term_months: 60)).to eq(0)
    end

    it "handles 0% APR" do
      payment = calculator.monthly_payment(principal: 12000, apr: 0, term_months: 60)
      expect(payment).to eq(200.0)
    end
  end

  describe "#total_cost" do
    it "calculates total cost correctly" do
      total = calculator.total_cost(principal: 25000, apr: 5.9, term_months: 60)
      expect(total).to be > 25000
    end
  end

  describe "#total_interest" do
    it "calculates interest paid" do
      interest = calculator.total_interest(principal: 25000, apr: 5.9, term_months: 60)
      expect(interest).to be > 0
      expect(interest).to be < 25000
    end

    it "returns ~0 interest for 0% APR" do
      interest = calculator.total_interest(principal: 25000, apr: 0, term_months: 60)
      expect(interest).to be_within(1.0).of(0)
    end
  end

  describe "#what_if" do
    it "compares scenarios" do
      result = calculator.what_if(
        base: { principal: 25000, apr: 5.9, term_months: 60 },
        scenarios: [
          { label: "Shorter term", principal: 25000, apr: 5.9, term_months: 36 }
        ]
      )

      expect(result[:base]).to have_key(:monthly_payment)
      expect(result[:scenarios].length).to eq(1)
      expect(result[:scenarios][0][:savings_vs_base]).to be > 0
    end
  end

  describe "#amortization_schedule" do
    it "generates schedule entries" do
      schedule = calculator.amortization_schedule(principal: 25000, apr: 5.9, term_months: 60, first_n: 3)
      expect(schedule.length).to eq(3)
      expect(schedule[0][:month]).to eq(1)
      expect(schedule[0][:balance]).to be < 25000
    end
  end
end
