class CreateAvailableSlots < ActiveRecord::Migration[7.2]
  def change
    create_table :available_slots do |t|
      t.date :date
      t.time :time
      t.boolean :is_booked, default: false

      t.timestamps
    end
  end
end
