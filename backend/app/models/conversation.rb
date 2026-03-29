class Conversation < ApplicationRecord
  belongs_to :user
  has_many :messages, dependent: :destroy

  enum :status, { active: 0, complete: 1 }
end
