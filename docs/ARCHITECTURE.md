# AI-Powered Onboarding Assistant — Architecture & Decision Log

## Project Overview
An AI-powered onboarding assistant that guides users through a complex signup process using conversational AI, automated document processing, intelligent scheduling, and emotional support content.

---

## Technical Decisions & Reasoning

### 1. Architecture: Rails API + React/TypeScript SPA

**Decision:** Separate Rails API backend + React TypeScript frontend (monorepo)

**Why not full-stack Rails (Hotwire/Turbo)?**
- The UI requires heavy real-time interactivity: live chat bubbles, document scanning animations, interactive calendar grid, quick-reply buttons
- Hotwire is great for CRUD apps but fighting it for chat UIs and complex state management adds friction
- React's component model maps perfectly to our UI: ChatWindow, DocumentScanner, CalendarPicker, AffirmationCard
- TypeScript gives us type safety on the complex state (conversation history, extracted document fields, appointment slots)

**Why not Next.js or separate deployment?**
- Monorepo keeps it simple — one repo, one deployment context
- Rails serves the React build in production (no CORS headaches)
- We don't need SSR/SSG — this is an authenticated app, not a content site

**Structure:**
```
the platform/
├── backend/          # Rails API
├── frontend/         # React + TypeScript (Vite)
└── docs/             # Architecture, decisions, flow docs
```

---

### 2. LLM Provider: Claude API (Anthropic)

**Decision:** Use Claude (claude-sonnet-4-6) for both the chatbot AND document OCR

**Why Claude over OpenAI?**
- **Vision capabilities** — Claude can process images directly, so we use ONE API for both the conversational chatbot AND document text extraction. No separate OCR service needed.
- **Stronger reasoning** — Claude excels at nuanced, empathetic conversation which is critical for an onboarding flow targeting stressed users
- **Longer context window** — Can maintain richer conversation history without truncation
- **Cost** — Sonnet is cost-effective for production use

**Why NOT a separate OCR service (AWS Textract, Google Vision)?**
- Extra service = extra cost, extra API key, extra failure point
- Claude Vision is accurate enough for structured documents (IDs, forms)
- We can prompt Claude to return structured JSON from document images, which is actually MORE flexible than traditional OCR template matching
- If accuracy isn't sufficient in testing, we can swap in Textract later — the service layer abstracts this

**Model selection:**
- Chat: `claude-sonnet-4-6` (fast, empathetic, cost-effective)
- OCR: `claude-sonnet-4-6` (vision + structured extraction)
- We avoid Opus for latency reasons in a real-time chat — Sonnet is the sweet spot

---

### 3. Database: PostgreSQL

**Decision:** PostgreSQL

**Why not SQLite?**
- SQLite is single-writer — breaks with ActionCable/WebSocket connections
- No concurrent access support for a multi-user app
- PostgreSQL is the Rails community standard and what every deployment platform expects

**Why not MySQL?**
- PostgreSQL has better JSON support (we store LLM responses, extracted document fields as JSONB)
- Better full-text search if we need it for support content
- Array columns useful for storing tags, available time slots

---

### 4. Real-time Chat: ActionCable (WebSockets)

**Decision:** ActionCable for real-time chat delivery

**Why ActionCable?**
- Built into Rails — zero extra dependencies
- Native WebSocket support in React via `@rails/actioncable` npm package
- Handles the streaming pattern well: user sends message → Rails calls Claude API → streams response back via WebSocket
- Redis as the ActionCable adapter for production (in-memory for dev)

**Why not polling/SSE?**
- Polling wastes bandwidth and adds latency
- SSE is one-directional — we need bidirectional (user sends + receives)
- WebSockets are the right tool for chat

---

### 5. Frontend: React + TypeScript + Vite

**Decision:** React 18 + TypeScript + Vite + TailwindCSS

**Why React?**
- Component model maps 1:1 to our UI modules (Chat, Document, Calendar, Support)
- Rich ecosystem for calendar components, file upload, animations
- TypeScript enforces contracts between frontend and API

**Why Vite over Webpack/CRA?**
- 10-50x faster HMR (hot module replacement)
- CRA is deprecated
- Simpler config, native TypeScript support

**Why TailwindCSS?**
- Rapid prototyping — utility classes are faster than writing CSS files
- Consistent design system out of the box
- Easy responsive design for the multi-step onboarding flow

---

### 6. Key Libraries

| Layer | Library | Why |
|-------|---------|-----|
| Backend | `anthropic` gem | Official Ruby SDK for Claude API |
| Backend | `pg` | PostgreSQL adapter |
| Backend | `redis` | ActionCable adapter for WebSockets |
| Backend | `rack-cors` | Allow frontend to talk to API in dev |
| Backend | `active_storage` | Secure document upload handling |
| Backend | `jwt` or `devise-jwt` | Stateless auth for API |
| Frontend | `react-router-dom` | Multi-step navigation |
| Frontend | `@rails/actioncable` | WebSocket client |
| Frontend | `react-dropzone` | Document upload UX |
| Frontend | `date-fns` | Date manipulation for calendar |
| Frontend | `framer-motion` | Smooth animations (scanning overlay, transitions) |
| Frontend | `lucide-react` | Icons |

---

## Application Flow

```
┌─────────────────────────────────────────────────────┐
│                    USER JOURNEY                       │
│                                                       │
│  Step 1: Welcome & Quick Setup                        │
│    → Name, preferred contact method                   │
│    → Set expectations for the process                 │
│                                                       │
│  Step 2: AI Chat Assessment                           │
│    → LLM-powered conversational intake                │
│    → Quick-reply buttons + free text                  │
│    → Dynamically builds user profile                  │
│    → Empathetic, validating tone throughout           │
│                                                       │
│  Step 3: Document Upload & OCR                        │
│    → Drag-and-drop or file select                     │
│    → Claude Vision extracts fields                    │
│    → Shows confidence scores                          │
│    → User reviews and corrects                        │
│                                                       │
│  Step 4: Schedule Appointment                         │
│    → Calendar grid (available dates highlighted)      │
│    → Time slot selection (morning/afternoon)          │
│    → Booking confirmation + reminder setup            │
│                                                       │
│  Step 5: Support & Completion                         │
│    → Daily affirmation                                │
│    → Resource links (peer support, crisis, articles)  │
│    → Celebration / confirmation summary               │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

## Data Model

```
Users
  - id, name, email, phone, preferred_contact, priority_level
  - profile_data (JSONB — dynamic fields from chat)
  - onboarding_step (enum: welcome, assessment, documents, scheduling, complete)
  - created_at, updated_at

Conversations
  - id, user_id, status (active/complete)
  - summary (JSONB — extracted insights from chat)
  - created_at, updated_at

Messages
  - id, conversation_id, role (user/assistant/system)
  - content (text)
  - quick_replies (JSONB — suggested responses)
  - created_at

Documents
  - id, user_id, document_type (id/form/other)
  - extracted_data (JSONB — OCR results)
  - confidence_scores (JSONB — per-field confidence)
  - status (uploaded/processing/reviewed/confirmed)
  - file (ActiveStorage attachment)
  - created_at, updated_at

Appointments
  - id, user_id
  - scheduled_date, scheduled_time
  - status (pending/confirmed/cancelled)
  - reminder_sent (boolean)
  - notes (text)
  - created_at, updated_at

Affirmations
  - id, content, category
  - active (boolean)
  - created_at

AvailableSlots
  - id, date, time, is_booked (boolean)
  - created_at, updated_at
```

---

## API Endpoints

```
POST   /api/v1/users                    # Create user / start onboarding
PATCH  /api/v1/users/:id                # Update user profile
GET    /api/v1/users/:id                # Get user + onboarding state

POST   /api/v1/conversations            # Start new conversation
POST   /api/v1/conversations/:id/messages  # Send message (triggers LLM)
GET    /api/v1/conversations/:id/messages  # Get message history
WS     /cable                           # ActionCable WebSocket endpoint

POST   /api/v1/documents                # Upload document
GET    /api/v1/documents/:id            # Get extraction results
PATCH  /api/v1/documents/:id            # Confirm/correct extracted data

GET    /api/v1/appointments/available_slots  # Get available dates/times
POST   /api/v1/appointments             # Book appointment
PATCH  /api/v1/appointments/:id         # Update/cancel appointment

GET    /api/v1/support/affirmation      # Random affirmation
GET    /api/v1/support/resources        # Support resources list
```

---

## Security Considerations

- All PII stored encrypted at rest (Rails encrypted attributes)
- Document uploads processed then original deleted after confirmation
- HTTPS enforced in production
- JWT tokens for API auth (stateless, no cookies)
- Rate limiting on LLM endpoints to prevent abuse
- Input sanitization before sending to Claude (prevent prompt injection)
- CORS restricted to frontend origin only

---

## What We Tried / Alternatives Considered

| Decision | Alternative | Why We Rejected It |
|----------|------------|-------------------|
| React SPA | Hotwire/Turbo | Too much real-time interactivity for Turbo Frames |
| Claude Vision for OCR | AWS Textract | Extra dependency, extra cost, less flexible output format |
| Claude Sonnet | Claude Opus | Opus too slow for real-time chat; Sonnet balances speed + quality |
| Claude Sonnet | GPT-4 | Claude better at empathetic conversation; vision API handles OCR too |
| PostgreSQL | SQLite | No concurrent access; can't handle WebSocket connections |
| ActionCable | Pusher/Socket.io | ActionCable is built-in, no extra service needed |
| Vite | Webpack/CRA | Vite is faster, CRA is deprecated |
| TailwindCSS | Bootstrap/Material UI | Faster prototyping, more customizable, smaller bundle |
| Monorepo | Separate repos | Simpler development, single deployment |
| JWT auth | Session cookies | API-only backend needs stateless auth |

---

## Build Log

### Phase 1: Project Setup - COMPLETE
- [x] Install dependencies (Ruby 3.3.7 via rbenv, Rails 7.2.2, Node 25.1.0, PostgreSQL 17, Redis)
- [x] Scaffold Rails API (`rails new backend --api --database=postgresql`)
- [x] Scaffold React frontend with Vite (`npm create vite@latest frontend -- --template react-ts`)
- [x] Set up database schema (7 tables: users, conversations, messages, documents, appointments, affirmations, available_slots)
- [x] Configure ActionCable channel for real-time chat
- [x] Configure CORS for localhost:5173 → localhost:3000
- [x] Add gems: anthropic, jwt, bcrypt, redis, rack-cors
- [x] Add npm packages: tailwindcss, react-router-dom, framer-motion, react-dropzone, date-fns, lucide-react, @rails/actioncable

### Phase 2: AI Chat Assessment - COMPLETE
- [x] Claude API integration service (`ClaudeChatService`) — empathetic system prompt, quick reply extraction
- [x] Chat controller + ActionCable channel (`ConversationChannel`)
- [x] React chat UI (`AssessmentPage`) with animated messages, typing indicator, quick reply buttons
- [x] Conversation state management (create → exchange messages → complete)
- [x] Profile extraction from chat (`extract_profile` method) — saves to user profile_data

### Phase 3: Document Processing - COMPLETE
- [x] File upload endpoint with ActiveStorage
- [x] Claude Vision OCR service (`ClaudeOcrService`) — sends base64 image to Claude, gets structured JSON
- [x] Document review UI (`DocumentsPage`) with confidence scores, color-coded field borders
- [x] Field correction and confirmation flow — editable inputs, skip option

### Phase 4: Scheduling - COMPLETE
- [x] Available slots model with seed data (2 weeks of weekday slots, 13 time slots per day, ~20% pre-booked)
- [x] Calendar API endpoints (grouped by date, with morning/afternoon periods)
- [x] React calendar component (`SchedulingPage`) with date picker + time slot grid
- [x] Booking confirmation flow with animation

### Phase 5: Emotional Support - COMPLETE
- [x] Affirmations model with 15 seed entries across categories (encouragement, validation, courage, self-care, etc.)
- [x] Support resources endpoint with crisis, community, and education resources
- [x] Support UI components (`CompletePage`) with affirmation card, mindfulness prompt, resource cards
- [x] Completion celebration flow with spring animations

---

## Verified Working (API Tests)

```
POST /api/v1/auth/register     → Creates user, returns JWT token
GET  /api/v1/user               → Returns user profile with onboarding_step
POST /api/v1/conversations      → Creates conversation with greeting message + quick replies
GET  /api/v1/support/affirmation → Returns random affirmation
GET  /api/v1/support/resources   → Returns crisis, community, and education resources
GET  /api/v1/appointments/available_slots → Returns 2 weeks of grouped time slots
```

## Running the Application

```bash
# Terminal 1: Backend (Rails API on port 3000)
cd backend
export ANTHROPIC_API_KEY="your-key-here"
bin/rails server -p 3000

# Terminal 2: Frontend (Vite dev server on port 5173)
cd frontend
npm run dev

# Open http://localhost:5173
```
