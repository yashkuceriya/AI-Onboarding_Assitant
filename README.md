# Carvana AI-Powered Onboarding Assistant

Rails 7 API + React 19 SPA.

## Setup

### Backend

```bash
cd backend
cp .env.example .env  # add ANTHROPIC_API_KEY
bundle install
rails db:create db:migrate db:seed
bin/rails server -p 3100   # matches Vite proxy in frontend/vite.config.ts
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:4200` (see `frontend/vite.config.ts`).

## Demo Flow

Register → AI chat (2+ messages) → View matches → Upload document or skip → Schedule delivery → Dashboard
