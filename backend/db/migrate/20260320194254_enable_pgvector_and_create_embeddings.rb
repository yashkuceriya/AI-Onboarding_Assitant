class EnablePgvectorAndCreateEmbeddings < ActiveRecord::Migration[7.2]
  def change
    enable_extension "vector"

    create_table :embeddings do |t|
      t.text :content, null: false
      t.column :embedding, :vector, limit: 1536
      t.string :source, null: false
      t.string :source_type
      t.jsonb :metadata, default: {}
      t.integer :token_count

      t.timestamps
    end

    add_index :embeddings, :source
    add_index :embeddings, :source_type
  end
end
