require "rails_helper"

RSpec.describe "Onboarding API", type: :request do
  let(:user) { create(:user) }
  let(:token) { JwtService.encode(user.id) }
  let(:headers) { { "Authorization" => "Bearer #{token}", "Content-Type" => "application/json" } }

  before do
    # Seed required data
    step = OnboardingStep.create!(title: "Welcome", color: "blue", position: 1)
    step.onboarding_items.create!(title: "Say hi", emoji: "wave", position: 1)
    ChecklistItem.create!(title: "Upload ID", position: 1)
    ChecklistItem.create!(title: "Book delivery", position: 2)
  end

  describe "GET /api/v1/onboarding/dashboard" do
    it "returns steps, checklist, and progress" do
      get "/api/v1/onboarding/dashboard", headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["steps"]).to be_an(Array)
      expect(json["checklist"]).to be_an(Array)
      expect(json["progress"]["steps_total"]).to eq(1)
      expect(json["progress"]["checklist_total"]).to eq(2)
    end
  end

  describe "GET /api/v1/onboarding/progress" do
    it "returns progress with achievements and milestones" do
      get "/api/v1/onboarding/progress", headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json).to have_key("current_step")
      expect(json).to have_key("percentage")
      expect(json).to have_key("achievements")
      expect(json).to have_key("milestones")
    end
  end

  describe "POST /api/v1/onboarding/checklist/:id/toggle" do
    it "toggles a checklist item" do
      item = ChecklistItem.first
      post "/api/v1/onboarding/checklist/#{item.id}/toggle", headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["completed"]).to be true

      # Toggle again
      post "/api/v1/onboarding/checklist/#{item.id}/toggle", headers: headers
      json = JSON.parse(response.body)
      expect(json["completed"]).to be false
    end
  end
end
