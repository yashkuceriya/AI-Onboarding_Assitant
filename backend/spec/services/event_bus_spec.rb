require "rails_helper"

RSpec.describe EventBus do
  describe ".publish" do
    it "publishes a known event" do
      received = nil
      EventBus.subscribe("user.message_sent") { |payload| received = payload }
      EventBus.publish("user.message_sent", { user_id: 1 })
      expect(received[:user_id]).to eq(1)
      expect(received[:event]).to eq("user.message_sent")
      expect(received[:timestamp]).to be_present
      expect(received[:event_id]).to be_present
    end

    it "logs a warning for unknown events" do
      expect(Rails.logger).to receive(:warn).with(/Unknown event/)
      EventBus.publish("unknown.event", {})
    end
  end

  describe ".subscribe_all" do
    it "receives all carvana events" do
      events = []
      EventBus.subscribe_all { |name, _| events << name }
      EventBus.publish("document.uploaded", {})
      EventBus.publish("appointment.booked", {})
      expect(events).to include("document.uploaded", "appointment.booked")
    end
  end
end
