begin
  require "sidekiq/web"
rescue LoadError
  # Sidekiq not available
end

Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  # Sidekiq dashboard (protect in production)
  mount Sidekiq::Web => "/sidekiq" if Rails.env.development? && defined?(Sidekiq::Web)

  namespace :api do
    namespace :v1 do
      # Auth
      post "auth/register", to: "auth#register"
      post "auth/login", to: "auth#login"
      post "auth/forgot_password", to: "auth#forgot_password"
      post "auth/reset_password", to: "auth#reset_password"

      # User profile
      resource :user, only: [:show, :update]

      # Chat assessment
      resources :conversations, only: [:create, :show] do
        resources :messages, only: [:create]
        post :complete, to: "messages#complete"
      end

      # Document OCR
      resources :documents, only: [:create, :show, :update]

      # Scheduling
      get "appointments/available_slots", to: "appointments#available_slots"
      resources :appointments, only: [:create]

      # Onboarding dashboard
      get "onboarding/dashboard", to: "onboarding#dashboard"
      get "onboarding/progress", to: "onboarding#progress"
      post "onboarding/steps/:step_id/progress", to: "onboarding#update_step_progress"
      post "onboarding/checklist/:checklist_item_id/toggle", to: "onboarding#toggle_checklist"

      # Financial explainer
      post "financial/explain", to: "financial#explain"
      post "financial/what_if", to: "financial#what_if"

      # Vehicle inventory + recommendations
      resources :vehicles, only: [:index, :show]
      post "vehicles/recommend", to: "vehicles#recommend"

      # Favorites
      resources :favorites, only: [:index, :create, :destroy]

      # Delivery tracking
      resources :deliveries, only: [:index, :show]

      # Trade-in estimator
      post "trade_ins/estimate", to: "trade_ins#estimate"

      # User profile
      get "profile", to: "users#show"
      patch "profile", to: "users#update"

      # Notifications
      resources :notifications, only: [:index] do
        member do
          post :mark_read
        end
        collection do
          post :mark_all_read
        end
      end

      # Sell your car
      resources :sell_offers, only: [:index, :show, :create] do
        member do
          post :upload_photos
          post :accept
          post :schedule_pickup
        end
      end

      # Vehicle comparison
      post "vehicles/compare", to: "vehicles#compare"

      # Support content
      get "support/affirmation", to: "support#affirmation"
      get "support/resources", to: "support#resources"
    end
  end

  mount ActionCable.server => "/cable"
end
