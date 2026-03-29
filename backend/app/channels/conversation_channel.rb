class ConversationChannel < ApplicationCable::Channel
  def subscribed
    stream_from "conversation_#{params[:conversation_id]}"
  end

  def unsubscribed
    stop_all_streams
  end
end
