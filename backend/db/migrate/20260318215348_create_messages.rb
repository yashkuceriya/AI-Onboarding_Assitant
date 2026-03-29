class CreateMessages < ActiveRecord::Migration[7.2]
  def change
    create_table :messages do |t|
      t.references :conversation, null: false, foreign_key: true
      t.integer :role
      t.text :content
      t.jsonb :quick_replies

      t.timestamps
    end
  end
end
