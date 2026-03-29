class CreateUserEvents < ActiveRecord::Migration[7.2]
  def change
    create_table :user_events do |t|
      t.references :user, null: false, foreign_key: true
      t.string :event_type, null: false
      t.jsonb :metadata, default: {}

      t.timestamps
    end

    add_index :user_events, :event_type
    add_index :user_events, :created_at
  end
end
