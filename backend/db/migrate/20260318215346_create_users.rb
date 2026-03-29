class CreateUsers < ActiveRecord::Migration[7.2]
  def change
    create_table :users do |t|
      t.string :name
      t.string :email
      t.string :phone
      t.string :preferred_contact
      t.integer :priority_level, default: 0
      t.jsonb :profile_data, default: {}
      t.integer :onboarding_step, default: 0
      t.string :password_digest

      t.timestamps
    end
  end
end
