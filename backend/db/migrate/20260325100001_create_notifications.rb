class CreateNotifications < ActiveRecord::Migration[7.2]
  def change
    create_table :notifications do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title, null: false
      t.text :body
      t.string :notification_type, null: false
      t.string :icon
      t.string :action_url
      t.boolean :read, default: false
      t.datetime :read_at
      t.timestamps
    end

    add_index :notifications, [:user_id, :read]
    add_index :notifications, :created_at
  end
end
