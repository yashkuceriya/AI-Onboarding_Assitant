class ChatStreamChannel < ApplicationCable::Channel
  def subscribed
    conversation = current_user.conversations.find_by(id: params[:conversation_id])
    if conversation
      stream_from "chat_stream_#{conversation.id}"
    else
      reject
    end
  end

  def unsubscribed
    stop_all_streams
  end
end
