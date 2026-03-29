class AddUniqueIndexToAvailableSlots < ActiveRecord::Migration[7.2]
  def change
    add_index :available_slots, [:date, :time], unique: true, name: "index_available_slots_on_date_and_time"
  end
end
