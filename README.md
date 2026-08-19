# manageme — Executive Career & Finance Intelligence Workspace

A comprehensive career accelerator, financial intelligence hub, and universal productivity platform tailored for postgraduate finance students and early-career analysts.

---

## 🚨 CRITICAL SECURITY & SECRET ROTATION NOTICE

> [!WARNING]
> **IMMEDIATE ACTION REQUIRED BEFORE PRODUCTION DEPLOYMENT**
> If any API keys, tokens, or database credentials were hardcoded or committed to git history previously (e.g. Supabase Anon Key, Firebase Web API Key, or Google Developer Keys), **you must rotate and revoke those keys immediately** in their respective provider consoles:
> 1. **Supabase Console**: Settings -> API -> Rotate Project API Keys (`anon` / `service_role`).
> 2. **Firebase / Google Cloud Console**: APIs & Services -> Credentials -> Regenerate Web API Keys & restrict HTTP Referrers / IP addresses.
> 3. **AI Providers (Gemini, OpenAI, Anthropic, DeepSeek)**: Revoke and regenerate active secret keys.
> 4. **Financial APIs (Finnhub, Marketaux, Alpha Vantage, The Guardian, RapidAPI)**: Regenerate access tokens.

---

## 🔒 Secret Safety & Environment Configuration

All application secrets and credentials must be supplied via environment variables. Sensitive keys are kept server-side only and never exposed to the client bundle.

### Environment Setup

1. Copy `.env.example` to `.env.local` (or `.env`):
   ```bash
   cp .env.example .env.local
   ```
2. Populate the required environment variables with your active keys.

### Key Classification & Security Rules

| Variable | Scope | Purpose | Security Rule |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Server | Google Gemini Multi-Model AI Engine | Kept server-side in Node/Express |
| `OPENAI_API_KEY` | Server | OpenAI ChatGPT (GPT-4o, o3-mini) | Server-side only; never client-exposed |
| `ANTHROPIC_API_KEY` | Server | Anthropic Claude 3.5 Sonnet / Haiku | Server-side only; never client-exposed |
| `DEEPSEEK_API_KEY` | Server | DeepSeek V3 & DeepSeek R1 Reasoning | Server-side only; never client-exposed |
| `FINNHUB_API_KEY` | Server | Live US Equities News Stream | Ingested via `/api/news/live` proxy |
| `MARKETAUX_API_KEY` | Server | Real-Time News & Market Sentiment | Ingested via `/api/news/live` proxy |
| `ALPHA_VANTAGE_API_KEY` | Server | Macro & Market Intelligence | Ingested via `/api/news/live` proxy |
| `GUARDIAN_API_KEY` | Server | Business News Feed | Ingested via `/api/news/live` proxy |
| `VITE_SUPABASE_URL` | Client | Supabase Project Endpoint | Public client URL |
| `VITE_SUPABASE_ANON_KEY` | Client | Supabase Anon Key | **Public-safe ONLY with Row Level Security (RLS) enabled on all tables** |
| `VITE_FIREBASE_API_KEY` | Client | Firebase Web Client Key | Public client identifier secured by Firestore Rules |
| `VITE_MASTER_PIN` | Client / Env | Workspace Master Access PIN | Used for local administrative action authorization |

---

## 🛡️ Database Security (Row Level Security & Firestore Rules)

### Supabase Row Level Security (RLS)
When using Supabase, **Row Level Security (RLS) must be enabled on every table** (`job_applications`, `study_documents`, `flashcards`, `subscriptions`, `vehicle_costs`, `watchlists`, `timetables`, `profiles`).
Example policy:
```sql
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own applications"
  ON job_applications
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Cloud Firestore Rules
Cloud Firestore security rules are defined in [`firestore.rules`](./firestore.rules) enforcing strict user-isolated document access (`request.auth.uid == resource.data.userId`).

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm or bun

### Installation
```bash
npm install
```

### Development
Start the local full-stack development server (Express backend + Vite frontend on port 3000):
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run start
```

---

## 📦 Deployment (Vercel & Node Servers)
- When deploying to **Vercel**, add all required environment variables in **Project Settings -> Environment Variables**.
- Ensure `.env` and `.env.local` are listed in `.gitignore` (already configured).
