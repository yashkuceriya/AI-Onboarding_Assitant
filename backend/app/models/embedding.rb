class Embedding < ApplicationRecord
  has_neighbors :embedding

  scope :by_source, ->(source) { where(source: source) }
  scope :by_type, ->(type) { where(source_type: type) }
end
