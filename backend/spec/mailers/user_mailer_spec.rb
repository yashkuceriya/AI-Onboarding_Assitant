require "rails_helper"

RSpec.describe UserMailer, type: :mailer do
  let(:user) { create(:user, name: "Jane Doe", email: "jane@example.com") }

  describe "welcome" do
    let(:mail) { UserMailer.welcome(user) }

    it "sends to the user's email with correct subject" do
      expect(mail.subject).to include("Welcome")
      expect(mail.subject).to include("Jane Doe")
      expect(mail.to).to eq(["jane@example.com"])
      expect(mail.from).to eq(["noreply@carvana.com"])
    end

    it "includes the user's name in the body" do
      expect(mail.body.encoded).to include("Jane Doe")
    end

    it "includes Carvana branding" do
      expect(mail.body.encoded).to include("CARVANA")
      expect(mail.body.encoded).to include("Start Browsing")
    end
  end

  describe "booking_confirmation" do
    let(:appointment) do
      user.appointments.create!(
        scheduled_date: Date.new(2026, 4, 15),
        scheduled_time: Time.parse("10:00"),
        status: :confirmed
      )
    end
    let(:mail) { UserMailer.booking_confirmation(user, appointment) }

    it "sends confirmation with the delivery date" do
      expect(mail.subject).to include("April 15, 2026")
      expect(mail.to).to eq(["jane@example.com"])
    end

    it "includes confirmation number" do
      expect(mail.body.encoded).to include("CRV-")
    end

    it "includes preparation checklist" do
      expect(mail.body.encoded).to include("driver's license")
      expect(mail.body.encoded).to include("insurance")
    end
  end

  describe "document_verified" do
    let(:document) { user.documents.create!(document_type: :id_card, status: :confirmed) }
    let(:mail) { UserMailer.document_verified(user, document) }

    it "confirms verification" do
      expect(mail.subject).to include("verified")
      expect(mail.body.encoded).to include("Verified")
      expect(mail.body.encoded).to include("Schedule Your Delivery")
    end
  end

  describe "password_reset" do
    let(:token) { "abc123def456" }
    let(:mail) { UserMailer.password_reset(user, token) }

    it "includes reset link with token" do
      expect(mail.subject).to include("Reset")
      expect(mail.body.encoded).to include(token)
      expect(mail.body.encoded).to include("reset-password")
    end

    it "mentions expiration" do
      expect(mail.body.encoded).to include("2 hours")
    end
  end
end
