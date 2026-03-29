module Api
  module V1
    class NotificationsController < BaseController
      def index
        notifications = current_user.notifications.recent
        unread_count = current_user.notifications.unread.count
        render json: {
          notifications: notifications.map(&:as_json_detail),
          unread_count: unread_count
        }
      end

      def mark_read
        notification = current_user.notifications.find(params[:id])
        notification.update!(read: true, read_at: Time.current)
        render json: notification.as_json_detail
      end

      def mark_all_read
        current_user.notifications.unread.update_all(read: true, read_at: Time.current)
        render json: { unread_count: 0 }
      end
    end
  end
end
