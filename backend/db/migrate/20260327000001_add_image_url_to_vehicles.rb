class AddImageUrlToVehicles < ActiveRecord::Migration[7.2]
  def change
    add_column :vehicles, :image_url, :string
  end
end
