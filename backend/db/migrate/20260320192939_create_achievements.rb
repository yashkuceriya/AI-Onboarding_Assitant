class CreateAchievements < ActiveRecord::Migration[7.2]
  def change
    create_table :achievements do |t|
      t.references :user, null: false, foreign_key: true
      t.string :achievement_type, null: false
      t.string :title, null: false
      t.text :description
      t.datetime :unlocked_at, null: false

      t.timestamps
    end

    add_index :achievements, [:user_id, :achievement_type], unique: true
  end
end
