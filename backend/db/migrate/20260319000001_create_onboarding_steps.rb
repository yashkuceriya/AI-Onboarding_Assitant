class CreateOnboardingSteps < ActiveRecord::Migration[7.2]
  def change
    create_table :onboarding_steps do |t|
      t.string :title, null: false
      t.string :color, null: false
      t.integer :position, null: false
      t.timestamps
    end

    create_table :onboarding_items do |t|
      t.references :onboarding_step, null: false, foreign_key: true
      t.string :title, null: false
      t.text :description
      t.string :emoji
      t.integer :position, null: false
      t.timestamps
    end

    create_table :checklist_items do |t|
      t.string :title, null: false
      t.text :description
      t.integer :position, null: false
      t.timestamps
    end

    create_table :user_checklist_items do |t|
      t.references :user, null: false, foreign_key: true
      t.references :checklist_item, null: false, foreign_key: true
      t.boolean :completed, default: false
      t.datetime :completed_at
      t.timestamps
    end

    add_index :user_checklist_items, [:user_id, :checklist_item_id], unique: true

    create_table :user_onboarding_progresses do |t|
      t.references :user, null: false, foreign_key: true
      t.references :onboarding_step, null: false, foreign_key: true
      t.integer :status, default: 0
      t.timestamps
    end

    add_index :user_onboarding_progresses, [:user_id, :onboarding_step_id], unique: true, name: "idx_user_onboarding_progress"
  end
end
