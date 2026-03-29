class CreateDocuments < ActiveRecord::Migration[7.2]
  def change
    create_table :documents do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :document_type
      t.jsonb :extracted_data, default: {}
      t.jsonb :confidence_scores, default: {}
      t.integer :status, default: 0

      t.timestamps
    end
  end
end
