class User < ApplicationRecord
  include Trackable

  has_secure_password

  has_many :conversations, dependent: :destroy
  has_many :documents, dependent: :destroy
  has_many :appointments, dependent: :destroy
  has_many :user_checklist_items, dependent: :destroy
  has_many :checklist_items, through: :user_checklist_items
  has_many :user_onboarding_progresses, dependent: :destroy
  has_many :achievements, dependent: :destroy
  has_many :user_events, dependent: :destroy
  has_many :favorites, dependent: :destroy
  has_many :favorite_vehicles, through: :favorites, source: :vehicle
  has_many :deliveries, dependent: :destroy
  has_many :notifications, dependent: :destroy
  has_many :sell_offers, dependent: :destroy

  enum :onboarding_step, {
    welcome: 0,
    assessment: 1,
    documents: 2,
    scheduling: 3,
    complete: 4
  }

  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :name, presence: true
  validates :password, length: { minimum: 6 }, if: -> { new_record? || !password.nil? }
end
