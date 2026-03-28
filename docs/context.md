# UserPersonas — Technical Context

## Architecture Overview

UserPersonas is a Next.js 16 App Router application with server-side rendering, Supabase for auth and data, and Google Gemini 2.5 Flash for AI persona generation and chat.

```
Browser
  └─ Next.js App (Vercel)
       ├─ Server Components (data fetching, auth checks)
       ├─ Client Components (carousel, chat, forms)
       └─ API Routes (protected server endpoints)
            ├─ Supabase (PostgreSQL + Auth)
            └─ Google Gemini API
```

---

## Directory Structure

```
mvp/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Root: redirects to /dashboard or /auth/login
│   ├── layout.tsx                # Root layout
│   ├── auth/
│   │   ├── login/page.tsx        # Login + signup (email/password + Google)
│   │   ├── callback/route.ts     # OAuth callback: exchanges code for session
│   │   └── signout/route.ts      # Clears session, redirects to login
│   ├── dashboard/page.tsx        # Project list
│   ├── projects/
│   │   ├── new/page.tsx          # 3-step project creation questionnaire
│   │   └── [id]/
│   │       ├── page.tsx          # Project detail + persona carousel
│   │       ├── PersonaCarouselClient.tsx
│   │       ├── RegenerateClient.tsx
│   │       └── chat/[personaId]/
│   │           ├── page.tsx      # Chat page (server: fetches context)
│   │           └── ChatClient.tsx # Chat UI (client: handles messages)
│   └── api/
│       ├── projects/route.ts           # GET/POST projects
│       ├── projects/[id]/regenerate/   # POST regenerate personas
│       ├── generate/route.ts           # POST generate personas (Gemini)
│       └── chat/route.ts               # GET/POST chat messages
├── components/
│   ├── ui/                       # Base components: Button, Input, Badge, etc.
│   ├── personas/                 # PersonaCarousel, PersonaCard, PersonaTabs, etc.
│   ├── chat/                     # ChatMessages, ChatInput, PersonaSidebar, etc.
│   ├── questionnaire/            # Step1Context, Step2Options, Step3Assumptions
│   └── shared/                   # PillSelector, ProgressBar
├── lib/
│   ├── db/queries.ts             # All Supabase database queries (centralized)
│   ├── gemini/
│   │   ├── client.ts             # Gemini model setup
│   │   ├── generatePersonas.ts   # Two-stage persona generation pipeline
│   │   ├── chat.ts               # Chat response generation
│   │   └── prompts.ts            # Prompt templates for segmentation + personas
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client (client components)
│   │   └── server.ts             # Server-side Supabase client (API routes, RSC)
│   ├── personas/
│   │   ├── types.ts              # TypeScript interfaces (Project, Persona, ChatMessage)
│   │   └── avatar.ts             # Deterministic avatar URL generation
│   └── utils.ts                  # cn() classname helper
├── supabase/migrations/
│   └── 001_initial.sql           # Full database schema + RLS policies
├── __tests__/
│   ├── avatar.test.ts
│   └── prompts.test.ts
├── proxy.ts                      # Next.js 16 proxy (was middleware.ts) — auth + route protection
├── next.config.ts
├── vitest.config.ts
└── .env.local                    # Local environment variables (not committed)
```

---

## Database Schema

### `projects`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK) | References auth.users |
| name | text | Project name |
| product_context | text | Product description (main AI input) |
| category | text | e.g. Banking, Healthcare |
| geography | text | e.g. Canada |
| user_type | text | Primary user type |
| key_workflows | text[] | Workflows the product supports |
| constraints | text[] | Known limitations |
| known_assumptions | text | Team's existing assumptions |
| created_at / updated_at | timestamptz | Timestamps |

### `personas`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| project_id | UUID (FK) | References projects |
| name | text | Persona name |
| label | text | Short descriptor (e.g. "The Overwhelmed Organizer") |
| summary | text | One-sentence summary |
| avatar_url | text | randomuser.me portrait URL |
| quote | text | First-person quote |
| core_job | text | What they're trying to accomplish |
| context | text | Situation they're in |
| behaviors | text[] | Observable behaviors |
| goals | text[] | What they want to achieve |
| pain_points | text[] | Current frustrations |
| motivations | text[] | What drives them |
| fears | text[] | What they're afraid of |
| constraints | text[] | Limitations they operate under |
| product_expectations | text[] | What they expect from the product |
| abandonment_triggers | text[] | What would make them leave |
| design_implications | text[] | UX recommendations |
| traits | jsonb | Array of `{ label, variant }` pills (neutral/risk/caution/positive/urgent) |
| confidence_overall | text | grounded / inferred / assumption |
| confidence_note | text | Explanation of confidence rating |

### `chat_messages`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| persona_id | UUID (FK) | References personas |
| project_id | UUID (FK) | References projects |
| role | text | "user" or "assistant" |
| content | text | Message text |
| persona_voice | text | How the persona responded (assistant only) |
| reasoning | text | Why the persona responded this way |
| product_action | text | Concrete product recommendation |
| confidence_level | text | Confidence rating for the response |

**All tables have Row Level Security (RLS) enabled.** Users can only read/write their own data.

---

## API Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/projects` | GET | Required | Returns all projects for the current user |
| `/api/projects` | POST | Required | Creates a new project |
| `/api/generate` | POST | Required | Generates personas for a project using Gemini |
| `/api/projects/[id]/regenerate` | POST | Required | Deletes existing personas and regenerates |
| `/api/chat` | GET | Required | Returns chat history for a persona (`?persona_id=`) |
| `/api/chat` | POST | Required | Sends a message and returns the persona's AI response |

All API routes check authentication. Unauthorized requests get a `401` response.

---

## AI Pipeline

### Persona Generation (2 stages)

**Stage 1 — Segmentation**
- Input: product context + optional fields (category, geography, user_type, workflows, constraints)
- Prompt: asks Gemini to identify 2–4 behaviorally distinct user segments
- Output: JSON array of segments with `segment_id`, `label`, `key_differentiator`, `suggested_name`, `suggested_gender`, `priority`

**Stage 2 — Persona Generation**
- Input: segmentation output + product context
- Prompt: generate one full persona per segment with all 15+ fields
- Rules enforced in prompt:
  - Every attribute tagged grounded / inferred / assumption
  - No made-up statistics
  - Merge if personas are too similar
  - Realistic first-person quote
- Output: JSON array of full personas

**Gemini response parsing**: Responses are stripped of markdown code fences before JSON parsing (Gemini sometimes wraps JSON in ` ```json ``` ` blocks).

### Chat Response

- Input: full persona profile + product context + conversation history + user question
- Output: JSON with four fields:
  - `PERSONA_VOICE` — first-person in-character response (2–4 sentences)
  - `WHY` — reasoning grounded in persona's goals/fears/constraints
  - `PRODUCT_ACTION` — concrete product/design recommendation
  - `CONFIDENCE` — confidence level + brief explanation

---

## Auth Flow

```
/ (root)
  → supabase.auth.getUser()
  → user exists? → /dashboard
  → no user?    → /auth/login

/auth/login
  → email/password: signInWithPassword() → /dashboard
  → sign up:        signUp() → /dashboard (if session) or confirm email
  → Google:         signInWithOAuth() → /auth/callback → /dashboard

/auth/callback
  → exchangeCodeForSession(code)
  → redirect to `next` param or /dashboard

proxy.ts (route protection)
  → runs on every request except _next/static, _next/image, favicon
  → if no session and route is protected → redirect /auth/login
```

---

## Key Design Decisions

**Next.js 16 proxy.ts**: Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts` with `export async function proxy()`. The proxy runtime is Node.js only (not edge).

**Server Components for data fetching**: All pages use server components to fetch data before render. Client components handle interactivity only.

**Centralized DB queries**: All Supabase queries live in `lib/db/queries.ts`. No direct Supabase calls in components or pages.

**Deterministic avatars**: Avatar URLs are generated by hashing the persona name to a consistent index into the randomuser.me portrait library (99 per gender). Same name = same avatar every time.

**force-dynamic on auth pages**: Auth pages use `export const dynamic = 'force-dynamic'` to prevent Next.js from prerendering them at build time, which would fail because `supabase.auth.getUser()` requires a live request context.

**Supabase client initialization inside handlers**: `createClient()` is called inside event handlers (not at component level) to avoid prerender errors.

---

## Environment Variables

| Variable | Where used | Notes |
|----------|-----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server | Public — safe to expose |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + server | Public — safe to expose (RLS enforces access) |
| `GEMINI_API_KEY` | Server only (API routes) | Never exposed to browser |
| `NEXT_PUBLIC_SITE_URL` | Client (OAuth redirects) | Set to deployed URL in production |

---

## Deployment

- **Platform**: Vercel
- **Repository**: `https://github.com/yaskpatel03/userpersonas`
- **Branch**: `main` (auto-deploys on push)
- **Production URL**: `https://userpersonas.vercel.app`
- **Supabase Project**: `wlkkozoxzqrhtfatfklo`

### Supabase Configuration Required
- Auth → URL Configuration → Site URL: `https://userpersonas.vercel.app`
- Auth → URL Configuration → Redirect URLs: `https://userpersonas.vercel.app/**`
- Auth → Providers → Google OAuth credentials (if using Google login)
