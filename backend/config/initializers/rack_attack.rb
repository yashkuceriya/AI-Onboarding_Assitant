class Rack::Attack
  # Throttle all requests by IP (300 requests per 5 minutes)
  throttle("req/ip", limit: 300, period: 5.minutes) do |req|
    req.ip
  end

  # Throttle login attempts by IP (5 attempts per 20 seconds)
  throttle("logins/ip", limit: 5, period: 20.seconds) do |req|
    req.ip if req.path == "/api/v1/auth/login" && req.post?
  end

  # Throttle login attempts by email (5 attempts per minute)
  throttle("logins/email", limit: 5, period: 1.minute) do |req|
    if req.path == "/api/v1/auth/login" && req.post?
      req.params["email"].to_s.downcase.strip
    end
  end

  # Throttle registration by IP (3 per hour)
  throttle("registrations/ip", limit: 3, period: 1.hour) do |req|
    req.ip if req.path == "/api/v1/auth/register" && req.post?
  end

  # Throttle password reset requests (3 per hour per IP)
  throttle("password_resets/ip", limit: 3, period: 1.hour) do |req|
    req.ip if req.path == "/api/v1/auth/forgot_password" && req.post?
  end

  # Throttle AI/LLM endpoints (20 per minute — these cost money)
  throttle("ai/ip", limit: 20, period: 1.minute) do |req|
    if req.post? && (req.path.include?("/messages") || req.path.include?("/financial/explain") || req.path.include?("/vehicles/recommend"))
      req.ip
    end
  end

  # Custom response for throttled requests
  self.throttled_responder = lambda do |req|
    retry_after = (req.env["rack.attack.match_data"] || {})[:period]
    [
      429,
      { "Content-Type" => "application/json", "Retry-After" => retry_after.to_s },
      [{ error: "Too many requests. Please try again later.", retry_after: retry_after }.to_json]
    ]
  end
end
