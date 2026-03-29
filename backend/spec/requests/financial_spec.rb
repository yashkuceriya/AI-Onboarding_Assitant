require "rails_helper"

RSpec.describe "Financial API", type: :request do
  let(:user) { create(:user) }
  let(:token) { JwtService.encode(user.id) }
  let(:headers) { { "Authorization" => "Bearer #{token}", "Content-Type" => "application/json" } }

  describe "POST /api/v1/financial/explain" do
    it "returns calculation and explanation" do
      post "/api/v1/financial/explain",
        params: { principal: 25000, apr: 5.9, term_months: 60 }.to_json,
        headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["calculation"]["monthly_payment"]).to be > 0
      expect(json["calculation"]["total_cost"]).to be > 25000
    end

    it "rejects invalid params" do
      post "/api/v1/financial/explain",
        params: { principal: 0, apr: 5.9, term_months: 60 }.to_json,
        headers: headers

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "POST /api/v1/financial/what_if" do
    it "returns base and scenarios" do
      post "/api/v1/financial/what_if",
        params: { principal: 25000, apr: 5.9, term_months: 60 }.to_json,
        headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["base"]).to be_present
      expect(json["scenarios"]).to be_an(Array)
    end
  end
end
