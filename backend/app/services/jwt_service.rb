class JwtService
  SECRET = Rails.application.credentials.secret_key_base || ENV.fetch("SECRET_KEY_BASE") {
    raise "SECRET_KEY_BASE must be set" unless Rails.env.test?
    "test-only-secret-key"
  }

  def self.encode(user_id)
    payload = {
      user_id: user_id,
      exp: 24.hours.from_now.to_i
    }
    JWT.encode(payload, SECRET, "HS256")
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET, true, algorithm: "HS256")
    decoded.first
  rescue JWT::DecodeError
    nil
  end
end
