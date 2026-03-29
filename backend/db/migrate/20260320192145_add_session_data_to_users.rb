class AddSessionDataToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :session_data, :jsonb, default: {}
  end
end
