Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins *(ENV.fetch("ALLOWED_ORIGINS", "http://localhost:4200,http://localhost:5173").split(",").map(&:strip))
    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      expose: ["Authorization"]
  end
end
