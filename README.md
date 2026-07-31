# Claire 🤖✨ - Autonomous AI Social Media Manager Platform

Claire is a production-ready, autonomous multi-agent AI Social Media Manager platform designed for creators, founders, agency owners, and growth teams. Claire orchestrates specialized AI agents (Strategist, Researcher, Copywriter, Optimizer) using **Groq Llama 3.3 70B** to generate viral posts, channel diagnoses, visual content calendars, and image prompts with voice-first interaction and Supabase persistence.

---

## 🌟 Features & Capabilities

1. **Supabase Auth & Multi-User Isolation**
   - Email/Password authentication & Guest/Demo mode.
   - User-scoped brand profiles, conversation state, and message memory.
   - Bearer JWT token verification across protected `/api/v1/*` endpoints.

2. **Audience-Targeted High-Converting Landing Page (`/`)**
   - **Optimize Existing Accounts**: Paste drafts or upload files to refine hooks, virality, and formatting.
   - **Full AI Manager**: Complete autonomous 5-agent team managing X, LinkedIn, Instagram, TikTok, and Threads.
   - **Start From Zero**: Brand voice editor, niche positioning, and multi-week initial content schedules.

3. **Safety, Reliability & Cold-Start Resilience**
   - Sliding-window rate limiting on Chat (30 req/min), Voice (10 req/min), and Image (10 req/min) endpoints.
   - Connection indicator with real-time latency (ms) and automatic Render cold-start detection ("Waking up server...").
   - Strict Pydantic v2 input validation and audio file content-type verification.

4. **Free-Tier Survival & Performance**
   - Ultra-fast responses powered by Groq Llama 3.3 70B and Groq Whisper.
   - In-memory 5-minute TTL caching for brand profiles and conversation histories.
   - Render keep-alive worker script (`backend/keep_alive.py`) targeting `/api/v1/keep-alive`.

5. **Deployment Ready**
   - Dockerized FastAPI backend ready for Render / Fly.io.
   - Next.js 15 App Router frontend optimized for Vercel deployment.

---

## 🗄️ Supabase Database Schema

To set up user persistence and multi-user isolation in Supabase, run the following SQL queries in your Supabase SQL Editor:

```sql
-- 1. Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Conversation',
    brand_id TEXT DEFAULT 'default',
    mode TEXT DEFAULT 'auto',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create brand_profiles table
CREATE TABLE IF NOT EXISTS brand_profiles (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    tagline TEXT,
    tone_of_voice TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    content_pillars JSONB DEFAULT '[]'::jsonb,
    style_guidelines TEXT,
    visual_style TEXT,
    do_not_use JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    agent_name TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_user ON brand_profiles(user_id);
```

---

## 📁 Repository Structure

```
.
├── frontend/                 # Next.js 15 App Router Frontend
│   ├── app/                  # App router routes (Landing & Workspace)
│   ├── components/
│   │   ├── auth/             # Supabase Auth modal & controls
│   │   ├── chat/             # Chat interface, voice button, cards, calendar
│   │   ├── landing/          # High-converting 3-audience landing page
│   │   └── ui/               # Tailored dark-mode UI components
│   ├── context/              # Auth & Chat global contexts
│   ├── hooks/                # Backend connection & latency monitoring
│   ├── lib/                  # Supabase client & prompt starters
│   ├── types/                # TypeScript type definitions
│   └── vercel.json           # Vercel deployment configuration
│
├── backend/                  # FastAPI Backend Service
│   ├── app/
│   │   ├── agents/           # Supervisor, Strategist, Researcher, Writer, Optimizer, Editor
│   │   ├── core/             # Auth JWT verification, Rate limiter, Validation, Config
│   │   ├── memory/           # Supabase & in-memory TTL memory manager
│   │   ├── routers/          # Chat, Voice, Images, Brands, Conversations, Health
│   │   ├── services/         # Groq AI & Cloudflare Workers AI clients
│   │   └── tools/            # Tavily search tool
│   ├── keep_alive.py         # Lightweight Render keep-alive worker
│   ├── main.py               # FastAPI entry point
│   ├── Dockerfile            # Container deployment image
│   └── requirements.txt      # Python dependencies
│
├── render.yaml               # Render Blueprint deployment definition
├── .env.example              # Consolidated environment configuration
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Add your GROQ_API_KEY and Supabase keys to .env
uvicorn main:app --reload --port 8000
```
API Documentation will be available at `http://localhost:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install # or pnpm install
cp .env.example .env.local
# Add NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 and Supabase keys
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🌍 Deployment Guide

### Deploying Backend to Render
1. Push this repository to GitHub.
2. Log into [Render.com](https://render.com) and create a **New Web Service** linked to your repository.
3. Select **Docker** or **Python 3.11** environment.
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Configure Environment Variables in Render Dashboard:
   - `GROQ_API_KEY`: Your Groq API key
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `TAVILY_API_KEY`: Optional Tavily search key
   - `CORS_ORIGIN_REGEX`: `https://.*\.vercel\.app`
5. Note your Render backend URL (e.g., `https://claire-ai-backend.onrender.com`).

### Deploying Frontend to Vercel
1. Log into [Vercel.com](https://vercel.com) and click **Add New -> Project**.
2. Import your GitHub repository and set Root Directory to `frontend`.
3. Set Framework Preset to **Next.js**.
4. Configure Environment Variables in Vercel Dashboard:
   - `NEXT_PUBLIC_API_BASE_URL`: Your Render backend URL (e.g., `https://claire-ai-backend.onrender.com`)
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
5. Click **Deploy**.

---

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).


