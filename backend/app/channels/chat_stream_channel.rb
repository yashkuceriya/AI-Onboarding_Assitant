class ChatStreamChannel < ApplicationCable::Channel
  def subscribed
    stream_from "chat_stream_#{params[:conversation_id]}"
  end

  def unsubscribed
    # Cleanup when channel is unsubscribed
  end
end
