class CreateAppointments < ActiveRecord::Migration[7.2]
  def change
    create_table :appointments do |t|
      t.references :user, null: false, foreign_key: true
      t.date :scheduled_date
      t.time :scheduled_time
      t.integer :status, default: 0
      t.boolean :reminder_sent, default: false
      t.text :notes

      t.timestamps
    end
  end
end
