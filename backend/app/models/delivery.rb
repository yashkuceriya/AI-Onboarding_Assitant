class Delivery < ApplicationRecord
  belongs_to :user
  belongs_to :vehicle

  enum :status, {
    confirmed: 0,
    inspection: 1,
    transport: 2,
    out_for_delivery: 3,
    delivered: 4
  }

  def as_detail
    {
      id: id,
      status: status,
      tracking_number: tracking_number,
      estimated_delivery_date: estimated_delivery_date,
      actual_delivery_date: actual_delivery_date,
      delivery_address: delivery_address,
      driver_name: driver_name,
      driver_phone: driver_phone,
      notes: notes,
      vehicle: vehicle.as_listing,
      timeline: build_timeline
    }
  end

  private

  def build_timeline
    steps = [
      { key: "confirmed", label: "Order Confirmed", description: "Your purchase has been confirmed" },
      { key: "inspection", label: "150-Point Inspection", description: "Vehicle undergoing quality inspection" },
      { key: "transport", label: "In Transit", description: "Vehicle is on the way to your area" },
      { key: "out_for_delivery", label: "Out for Delivery", description: "Driver is heading to your address" },
      { key: "delivered", label: "Delivered", description: "Vehicle delivered! Your 7-day trial begins" }
    ]

    status_index = self.class.statuses[status]
    saved_timeline = self.timeline || []

    steps.each_with_index.map do |step, i|
      saved = saved_timeline.find { |t| t["key"] == step[:key] } || {}
      completed = i <= status_index
      current = i == status_index
      {
        key: step[:key],
        label: step[:label],
        description: step[:description],
        completed: completed,
        current: current,
        completed_at: saved["completed_at"]
      }
    end
  end
end
