class AddSentimentToMessages < ActiveRecord::Migration[7.2]
  def change
    add_column :messages, :sentiment, :string
  end
end
