class CreateSellOffers < ActiveRecord::Migration[7.2]
  def change
    create_table :sell_offers do |t|
      t.references :user, null: false, foreign_key: true
      t.string :make, null: false
      t.string :model, null: false
      t.integer :year, null: false
      t.integer :mileage, null: false
      t.string :condition, null: false, default: "good"
      t.string :vin
      t.string :color
      t.string :trim
      t.text :description
      t.decimal :offer_amount, precision: 10, scale: 2
      t.decimal :range_low, precision: 10, scale: 2
      t.decimal :range_high, precision: 10, scale: 2
      t.jsonb :offer_breakdown, default: {}
      t.integer :status, default: 0, null: false
      t.date :pickup_date
      t.string :pickup_address
      t.string :pickup_time_slot
      t.text :notes
      t.timestamps
    end

    add_index :sell_offers, :status
    add_index :sell_offers, [:user_id, :status]
  end
end
