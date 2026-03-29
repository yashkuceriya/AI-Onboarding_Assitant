class CreateDeliveries < ActiveRecord::Migration[7.2]
  def change
    create_table :deliveries do |t|
      t.references :user, null: false, foreign_key: true
      t.references :vehicle, null: false, foreign_key: true
      t.integer :status, default: 0, null: false
      t.string :tracking_number
      t.date :estimated_delivery_date
      t.date :actual_delivery_date
      t.string :delivery_address
      t.string :driver_name
      t.string :driver_phone
      t.jsonb :timeline, default: []
      t.text :notes
      t.timestamps
    end

    add_index :deliveries, :status
    add_index :deliveries, :tracking_number, unique: true
  end
end
