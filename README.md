# Claire 🤖✨ - AI Social Media Manager Platform

Claire is an autonomous, multi-agent AI Social Media Manager platform designed to help creators, startups, and social media managers plan, generate, schedule, and analyze content seamlessly across platforms using voice and text interactions.

---

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, Python 3.11+, Pydantic v2
- **LLM & AI**: Groq (Llama 3.3 70B), Groq Whisper (Voice processing)
- **Database & Auth**: Supabase (PostgreSQL, Auth, Realtime)
- **Deployment**: Vercel (Frontend), Render / Fly.io (Backend)

---

## 📁 Repository Structure

```
.
├── frontend/                 # Next.js 15 App Router Frontend
│   ├── app/                  # App router routes & pages
│   ├── components/           # UI components & chat interface
│   │   ├── chat/             # Premium chat components
│   │   └── ui/               # shadcn/ui components
│   ├── lib/                  # Utilities & API clients
│   ├── types/                # TypeScript interfaces
│   ├── public/               # Static assets
│   ├── tailwind.config.ts    # Tailwind styling config
│   └── package.json
│
├── backend/                  # FastAPI Backend Service
│   ├── app/
│   │   ├── agents/           # Specialized AI Agent modules
│   │   ├── tools/            # Agent tools & integrations
│   │   ├── memory/           # Conversation & Context management
│   │   ├── routers/          # API route handlers
│   │   └── core/             # App configs, database, security
│   ├── main.py               # FastAPI entry point
│   └── requirements.txt      # Python dependencies
│
├── .env.example              # Consolidated environment template
├── .gitignore
├── LICENSE                   # MIT License
└── README.md
```

---

## 🛠️ Quick Start

### Prerequisites
- Node.js >= 18.x
- Python >= 3.11
- pnpm / npm / yarn
- Groq API Key
- Supabase Project

### 1. Setup Backend
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```
Backend will be available at `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).

### 2. Setup Frontend
```bash
cd frontend
pnpm install # or npm install
cp .env.example .env.local
pnpm dev # or npm run dev
```
Frontend will be running at `http://localhost:3000`.

---

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).

