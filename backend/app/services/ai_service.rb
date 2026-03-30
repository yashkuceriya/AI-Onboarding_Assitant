require "net/http"
require "json"
require "uri"

class AiService
  OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

  MODELS = {
    fast: "anthropic/claude-haiku-4-5",          # Triage, quick replies, classification
    main: "openai/gpt-4o",                       # Main chat, general reasoning
    reasoning: "anthropic/claude-sonnet-4-6",    # Long doc reasoning, complex extraction
    vision: "openai/gpt-4o"                      # Vision tasks (non-ID docs)
  }.freeze

  MODEL_COSTS = {
    "anthropic/claude-haiku-4-5" => { input: 0.80, output: 4.00 },
    "openai/gpt-4o" => { input: 2.50, output: 10.00 },
    "anthropic/claude-sonnet-4-6" => { input: 3.00, output: 15.00 }
  }.freeze

  class Result
    attr_reader :content, :raw, :model, :usage

    def initialize(content:, raw:, model:, usage: {})
      @content = content
      @raw = raw
      @model = model
      @usage = usage
    end

    def input_tokens
      usage.dig("prompt_tokens") || 0
    end

    def output_tokens
      usage.dig("completion_tokens") || 0
    end

    def estimated_cost
      costs = MODEL_COSTS[model] || { input: 0, output: 0 }
      (input_tokens * costs[:input] / 1_000_000.0) + (output_tokens * costs[:output] / 1_000_000.0)
    end
  end

  def chat(messages:, system: nil, model: :main, max_tokens: 1024, temperature: 0.7)
    model_id = resolve_model(model)
    api_messages = build_messages(messages, system)
    result = call_openrouter(model_id, api_messages, max_tokens, temperature:)
    parse_result(result, model_id)
  end

  def extract(text:, schema_description:, model: :fast, max_tokens: 1024)
    system = "Extract structured data from the following text. #{schema_description} Return ONLY valid JSON."
    chat(
      messages: [{ role: "user", content: text }],
      system: system,
      model: model,
      max_tokens: max_tokens,
      temperature: 0.1
    )
  end

  def classify(text:, categories:, model: :fast, max_tokens: 256)
    system = <<~PROMPT
      Classify the following text into exactly one of these categories: #{categories.join(', ')}.
      Return ONLY a JSON object: {"category": "chosen_category", "confidence": 0.95}
    PROMPT
    chat(
      messages: [{ role: "user", content: text }],
      system: system,
      model: model,
      max_tokens: max_tokens,
      temperature: 0.1
    )
  end

  def embed(text:)
    # Use OpenRouter embedding endpoint or fall back to generating embeddings
    # For now, use a simple embedding via the chat API that returns a vector
    uri = URI("https://openrouter.ai/api/v1/embeddings")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = 30

    request = Net::HTTP::Post.new(uri)
    request["Authorization"] = "Bearer #{api_key}"
    request["Content-Type"] = "application/json"
    request.body = {
      model: "openai/text-embedding-3-small",
      input: text
    }.to_json

    response = http.request(request)
    result = JSON.parse(response.body)
    result.dig("data", 0, "embedding")
  end

  def vision(image_data:, media_type:, prompt:, model: :vision, max_tokens: 1024)
    model_id = resolve_model(model)
    messages = [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: "data:#{media_type};base64,#{image_data}" }
          },
          { type: "text", text: prompt }
        ]
      }
    ]
    result = call_openrouter(model_id, messages, max_tokens, temperature: 0.1)
    parse_result(result, model_id)
  end

  private

  def resolve_model(model)
    return model if model.is_a?(String) && model.include?("/")
    MODELS[model.to_sym] || MODELS[:main]
  end

  def build_messages(messages, system)
    api_messages = []
    api_messages << { role: "system", content: system } if system
    messages.each do |msg|
      role = msg[:role].to_s
      role = "user" if role == "system"
      api_messages << { role: role, content: msg[:content] }
    end
    api_messages
  end

  def call_openrouter(model, messages, max_tokens, temperature: 0.7)
    uri = URI(OPENROUTER_URL)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = 60

    request = Net::HTTP::Post.new(uri)
    request["Authorization"] = "Bearer #{api_key}"
    request["Content-Type"] = "application/json"

    body = {
      model: model,
      max_tokens: max_tokens,
      temperature: temperature,
      messages: messages
    }

    request.body = body.to_json
    response = http.request(request)
    result = JSON.parse(response.body)

    unless response.is_a?(Net::HTTPSuccess)
      error_message = result["error"].is_a?(Hash) ? result["error"]["message"] : result["error"]
      raise "OpenRouter request failed (#{response.code}): #{error_message || response.body}"
    end

    if result["choices"].blank?
      error_message = result["error"].is_a?(Hash) ? result["error"]["message"] : result["error"]
      raise "OpenRouter returned no choices: #{error_message || result.inspect}"
    end

    result
  end

  def parse_result(result, model_id)
    content = result.dig("choices", 0, "message", "content") || ""
    usage = result["usage"] || {}

    Result.new(
      content: content,
      raw: result,
      model: model_id,
      usage: usage
    )
  end

  def api_key
    key = ENV["OPENROUTER_API_KEY"].presence || ENV["ANTHROPIC_API_KEY"].presence
    raise "Missing OPENROUTER_API_KEY (or ANTHROPIC_API_KEY fallback) in environment" if key.blank?
    key
  end
end
