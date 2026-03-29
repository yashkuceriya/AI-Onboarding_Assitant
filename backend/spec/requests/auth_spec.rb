require "rails_helper"

RSpec.describe "Auth API", type: :request do
  describe "POST /api/v1/auth/register" do
    it "creates a user and returns a token" do
      post "/api/v1/auth/register", params: {
        name: "John Doe", email: "john@example.com",
        password: "password123", password_confirmation: "password123"
      }.to_json, headers: { "Content-Type" => "application/json" }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["user"]["name"]).to eq("John Doe")
      expect(json["user"]["email"]).to eq("john@example.com")
      expect(json["token"]).to be_present
    end

    it "rejects short passwords" do
      post "/api/v1/auth/register", params: {
        name: "Jane", email: "jane@example.com",
        password: "short", password_confirmation: "short"
      }.to_json, headers: { "Content-Type" => "application/json" }

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "rejects duplicate emails" do
      create(:user, email: "taken@example.com")
      post "/api/v1/auth/register", params: {
        name: "Test", email: "taken@example.com",
        password: "password123", password_confirmation: "password123"
      }.to_json, headers: { "Content-Type" => "application/json" }

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "POST /api/v1/auth/login" do
    let!(:user) { create(:user, email: "test@example.com", password: "password123") }

    it "returns a token for valid credentials" do
      post "/api/v1/auth/login", params: {
        email: "test@example.com", password: "password123"
      }.to_json, headers: { "Content-Type" => "application/json" }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["token"]).to be_present
    end

    it "rejects invalid password" do
      post "/api/v1/auth/login", params: {
        email: "test@example.com", password: "wrong"
      }.to_json, headers: { "Content-Type" => "application/json" }

      expect(response).to have_http_status(:unauthorized)
    end
  end
end
