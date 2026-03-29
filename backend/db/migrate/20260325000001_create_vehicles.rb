class CreateVehicles < ActiveRecord::Migration[7.2]
  def change
    create_table :vehicles do |t|
      t.string :make, null: false
      t.string :model, null: false
      t.integer :year, null: false
      t.decimal :price, precision: 10, scale: 2, null: false
      t.integer :mileage, null: false, default: 0
      t.string :body_type, null: false
      t.string :color, null: false
      t.string :exterior_color
      t.integer :mpg
      t.decimal :safety_rating, precision: 2, scale: 1
      t.text :description
      t.string :vin
      t.string :engine
      t.string :transmission, default: "Automatic"
      t.string :drivetrain
      t.jsonb :features, default: []
      t.jsonb :image_gradient, default: ["#cccccc", "#999999"]
      t.boolean :available, default: true
      t.string :location
      t.timestamps
    end

    add_index :vehicles, [:make, :model]
    add_index :vehicles, :body_type
    add_index :vehicles, :price
    add_index :vehicles, :year
    add_index :vehicles, :available
  end
end
