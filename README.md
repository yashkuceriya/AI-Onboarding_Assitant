# AI-Powered Onboarding Assistant

Rails 7 API + React 19 SPA.

## Setup

Use **Ruby 3.3.x** (see [.ruby-version](.ruby-version)) via rbenv, asdf, or chruby — not the macOS system Ruby.

PostgreSQL must be running. Create DB user if needed (often your macOS username with no password for local dev).

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set OPENROUTER_API_KEY (required for chat + document OCR)
bundle install
bin/rails db:create db:migrate db:seed
bin/rails server
```

Rails listens on **port 3000** by default. [frontend/vite.config.ts](frontend/vite.config.ts) proxies `/api` and `/cable` to `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:4200**.

### If something still fails

| Symptom | Check |
|--------|--------|
| `bundle` / Gem errors | Ruby version; `gem install bundler` matching `Gemfile.lock` BUNDLED WITH |
| DB errors | Postgres up; `bin/rails db:create` |
| API 401 / network error in browser | Backend running on **3000**; frontend on **4200** (proxy only works in `npm run dev`, not `vite preview` alone) |
| Chat/OCR errors | `OPENROUTER_API_KEY` in `backend/.env` |
| Register used to 500 without Redis | Dev now uses `ActiveJob` **async** (no Redis required). For Sidekiq in dev, start Redis and run `bundle exec sidekiq` |

Production still uses Sidekiq when `RAILS_ENV=production` and Redis is configured.

## Deploy (Railway API + Vercel frontend)

1. **Railway — Postgres**  
   New project → add **PostgreSQL**. Note `DATABASE_URL`.

2. **Railway — Rails**  
   - New service from repo, root directory **`backend`**, or use [backend/Dockerfile](backend/Dockerfile).  
   - **Variables:** `DATABASE_URL` (from Railway Postgres), `RAILS_ENV=production`, `SECRET_KEY_BASE` (generate a long random string), `ANTHROPIC_API_KEY`, and **`ALLOWED_ORIGINS`** = your Vercel URL (e.g. `https://your-app.vercel.app`).  
   - **Start:** release command / post-deploy: `bin/rails db:migrate` (and `db:seed` if you want demo data).  
   - Expose the service URL (e.g. `https://xxx.up.railway.app`). Health: `GET /up`.

3. **Vercel — React**  
   - Import repo, **Root Directory** `frontend`, **Build** `npm run build`, **Output** `dist`.  
   - **Environment variable:** `VITE_API_BASE` = `https://xxx.up.railway.app/api/v1` (your Railway URL + `/api/v1`, no trailing slash). Redeploy after changing it.

4. **CORS**  
   Rails only allows origins listed in `ALLOWED_ORIGINS` ([backend/config/initializers/cors.rb](backend/config/initializers/cors.rb)). After you get a stable Vercel URL, set that exactly.

Local dev unchanged: leave `VITE_API_BASE` unset so the app keeps using `/api/v1` via the Vite proxy.

## Demo Flow

Register → AI chat (2+ messages) → View matches → Upload document or skip → Schedule delivery → Dashboard
