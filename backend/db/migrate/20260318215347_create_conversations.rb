class CreateConversations < ActiveRecord::Migration[7.2]
  def change
    create_table :conversations do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :status, default: 0
      t.jsonb :summary, default: {}

      t.timestamps
    end
  end
end
