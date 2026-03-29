class Notification < ApplicationRecord
  belongs_to :user

  scope :unread, -> { where(read: false) }
  scope :recent, -> { order(created_at: :desc).limit(20) }

  def as_json_detail
    {
      id: id,
      title: title,
      body: body,
      notification_type: notification_type,
      icon: icon,
      action_url: action_url,
      read: read,
      read_at: read_at,
      created_at: created_at
    }
  end
end
