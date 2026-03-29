require "net/http"
require "json"

class VoiceService
  DEEPGRAM_URL = "https://api.deepgram.com/v1/listen"

  def transcribe(audio_data, language: "en")
    uri = URI(DEEPGRAM_URL)
    uri.query = URI.encode_www_form(
      model: "nova-3",
      language: language,
      smart_format: true,
      punctuate: true
    )

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = 30

    request = Net::HTTP::Post.new(uri)
    request["Authorization"] = "Token #{ENV['DEEPGRAM_API_KEY']}"
    request["Content-Type"] = "audio/wav"
    request.body = audio_data

    response = http.request(request)
    result = JSON.parse(response.body)

    transcript = result.dig("results", "channels", 0, "alternatives", 0, "transcript") || ""
    confidence = result.dig("results", "channels", 0, "alternatives", 0, "confidence") || 0

    {
      transcript: transcript,
      confidence: confidence,
      language: language
    }
  rescue => e
    Rails.logger.error("[VoiceService] Transcription failed: #{e.message}")
    { transcript: "", confidence: 0, error: e.message }
  end
end
