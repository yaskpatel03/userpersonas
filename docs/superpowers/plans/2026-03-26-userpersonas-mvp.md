# UserPersonas MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack web app that generates evidence-aware AI personas from product context and lets teams chat with those personas to pressure-test product decisions.

**Architecture:** Next.js 14 App Router + TypeScript frontend/backend. Two-stage Gemini Flash streaming pipeline generates 2–4 personas. Supabase handles PostgreSQL storage and auth. Three main views: 50/50 split questionnaire → persona carousel → persona chat.

**Tech Stack:** Next.js 14, TypeScript, shadcn/ui, Tailwind CSS, Supabase (auth + PostgreSQL), Google Gemini Flash 2.0 (`@google/generative-ai`), Vitest, randomuser.me avatars, Vercel deployment.

---

## File Map

```
userpersonas/
├── app/
│   ├── layout.tsx                         # Root layout, font, global styles
│   ├── page.tsx                           # Root redirect → /dashboard or /login
│   ├── auth/
│   │   ├── login/page.tsx                 # Login/signup page
│   │   └── callback/route.ts             # Supabase OAuth redirect handler
│   ├── dashboard/page.tsx                 # Projects list
│   ├── projects/
│   │   ├── new/page.tsx                   # 3-step questionnaire
│   │   └── [id]/
│   │       ├── page.tsx                   # Persona carousel
│   │       └── chat/[personaId]/page.tsx  # Chat view
│   └── api/
│       ├── projects/route.ts              # POST create project, GET list
│       ├── generate/route.ts              # POST streaming persona generation
│       └── chat/route.ts                  # POST streaming persona chat
├── components/
│   ├── questionnaire/
│   │   ├── QuestionnaireLayout.tsx        # 50/50 split wrapper
│   │   ├── Step1Context.tsx               # Textarea + category pills
│   │   ├── Step2Options.tsx               # Geography, user type, constraints pills
│   │   ├── Step3Assumptions.tsx           # Known assumptions textarea
│   │   └── PersonaPreviewPanel.tsx        # Right panel with blurred previews
│   ├── personas/
│   │   ├── PersonaCarousel.tsx            # Carousel + arrow/dot/swipe nav
│   │   ├── PersonaCard.tsx                # Full persona card (composes below)
│   │   ├── PersonaHero.tsx                # Gradient header with avatar + quote
│   │   ├── TraitPills.tsx                 # Color-coded trait chips
│   │   ├── PersonaTabs.tsx                # Tabs + tab panel content
│   │   └── ConfidenceBar.tsx              # Confidence meter + note
│   ├── chat/
│   │   ├── ChatLayout.tsx                 # Split layout (sidebar + main)
│   │   ├── PersonaSidebar.tsx             # Left: avatar, goal, blocker, badge
│   │   ├── ChatMessages.tsx               # Scrollable message list
│   │   ├── ChatMessage.tsx                # 4-layer structured message
│   │   ├── ChatInput.tsx                  # Textarea + send button
│   │   └── SuggestedPrompts.tsx           # Prompt chips below input
│   └── shared/
│       ├── ProgressBar.tsx                # Step progress bar (questionnaire)
│       └── GeneratingScreen.tsx           # Full-screen streaming progress
├── lib/
│   ├── supabase/
│   │   ├── client.ts                      # Browser Supabase client (singleton)
│   │   └── server.ts                      # Server Supabase client (per-request)
│   ├── gemini/
│   │   ├── client.ts                      # Gemini GenerativeModel instance
│   │   ├── prompts.ts                     # All prompt templates
│   │   ├── generatePersonas.ts            # Stage 1+2 pipeline, returns stream
│   │   └── chat.ts                        # Chat turn, returns stream
│   ├── personas/
│   │   ├── types.ts                       # All TypeScript types (Persona, Project, ChatMessage)
│   │   └── avatar.ts                      # Deterministic avatar URL from name
│   └── db/
│       └── queries.ts                     # All Supabase DB calls (no SQL in components)
├── middleware.ts                          # Supabase auth session refresh
├── supabase/migrations/001_initial.sql    # Full DB schema + RLS policies
└── __tests__/
    ├── avatar.test.ts                     # Avatar URL generation
    ├── prompts.test.ts                    # Prompt builders
    └── queries.test.ts                    # DB query shape tests (mocked)
```

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`
- Create: `.env.local.example`
- Create: `app/layout.tsx`, `app/globals.css`

- [ ] **Step 1: Scaffold Next.js project**

```bash
cd /Users/yaspatel/projects/userpersonas
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=no --import-alias="@/*" --yes
```

Expected: Next.js 14 project created with TypeScript and Tailwind.

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr @google/generative-ai
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Install shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted: style = Default, base color = Zinc, CSS variables = yes.

Then add the components we need:

```bash
npx shadcn@latest add button input textarea badge tabs progress card
```

- [ ] **Step 4: Configure Vitest**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

Create `vitest.setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

Add to `package.json` scripts:

```json
"test": "vitest",
"test:ui": "vitest --ui"
```

- [ ] **Step 5: Create .env.local.example**

```bash
cat > .env.local.example << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EOF
```

Copy it to `.env.local` and fill in real values from Supabase dashboard and Google AI Studio (aistudio.google.com — free API key).

- [ ] **Step 6: Create .gitignore entry**

```bash
echo ".env.local" >> .gitignore
echo ".superpowers/" >> .gitignore
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 14 project with shadcn/ui, Supabase, Vitest"
```

---

## Task 2: Types

**Files:**
- Create: `lib/personas/types.ts`

- [ ] **Step 1: Write types**

Create `lib/personas/types.ts`:

```typescript
export type ConfidenceLevel = 'grounded' | 'inferred' | 'assumption'

export interface Trait {
  label: string
  variant: 'neutral' | 'risk' | 'caution' | 'positive' | 'urgent'
}

export interface Persona {
  id: string
  project_id: string
  name: string
  label: string
  summary: string
  avatar_url: string
  quote: string
  core_job: string
  context: string
  behaviors: string[]
  goals: string[]
  pain_points: string[]
  motivations: string[]
  fears: string[]
  constraints: string[]
  product_expectations: string[]
  abandonment_triggers: string[]
  design_implications: string[]
  traits: Trait[]
  confidence_overall: ConfidenceLevel
  confidence_note: string
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  product_context: string
  category: string | null
  geography: string | null
  user_type: string | null
  key_workflows: string[]
  constraints: string[]
  known_assumptions: string | null
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  persona_id: string
  project_id: string
  role: 'user' | 'assistant'
  content: string
  persona_voice: string | null
  reasoning: string | null
  product_action: string | null
  confidence_level: string | null
  created_at: string
}

// The raw shape Gemini returns for a persona (before DB insert)
export type PersonaPayload = Omit<Persona, 'id' | 'project_id' | 'created_at'>
```

- [ ] **Step 2: Commit**

```bash
git add lib/personas/types.ts
git commit -m "feat: add shared TypeScript types"
```

---

## Task 3: Avatar Utility

**Files:**
- Create: `lib/personas/avatar.ts`
- Create: `__tests__/avatar.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/avatar.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { getAvatarUrl } from '@/lib/personas/avatar'

describe('getAvatarUrl', () => {
  it('returns a randomuser.me URL', () => {
    const url = getAvatarUrl('Riya', 'female')
    expect(url).toMatch(/^https:\/\/randomuser\.me\/api\/portraits\//)
  })

  it('returns consistent URL for same name', () => {
    const url1 = getAvatarUrl('Riya', 'female')
    const url2 = getAvatarUrl('Riya', 'female')
    expect(url1).toBe(url2)
  })

  it('returns different URLs for different names', () => {
    const url1 = getAvatarUrl('Riya', 'female')
    const url2 = getAvatarUrl('James', 'male')
    expect(url1).not.toBe(url2)
  })

  it('portrait number is between 1 and 99', () => {
    const url = getAvatarUrl('Amara', 'female')
    const match = url.match(/\/(\d+)\.jpg$/)
    expect(match).not.toBeNull()
    const num = parseInt(match![1])
    expect(num).toBeGreaterThanOrEqual(1)
    expect(num).toBeLessThanOrEqual(99)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- avatar.test.ts
```

Expected: FAIL with "Cannot find module '@/lib/personas/avatar'"

- [ ] **Step 3: Implement avatar utility**

Create `lib/personas/avatar.ts`:

```typescript
// Deterministically maps a persona name to a randomuser.me portrait number (1–99)
// so the same persona always gets the same avatar across page loads.

function hashName(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff
  }
  return Math.abs(hash)
}

export function getAvatarUrl(name: string, gender: 'male' | 'female'): string {
  const portraitNumber = (hashName(name) % 99) + 1
  const genderPath = gender === 'female' ? 'women' : 'men'
  return `https://randomuser.me/api/portraits/${genderPath}/${portraitNumber}.jpg`
}

// Infer gender from persona context heuristic — falls back to alternating
export function inferGender(name: string): 'male' | 'female' {
  const feminineNames = ['riya', 'amara', 'sarah', 'emma', 'aisha', 'priya', 'sofia', 'anna', 'lisa', 'maya']
  const lower = name.toLowerCase().split(' ')[0]
  return feminineNames.includes(lower) ? 'female' : 'male'
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- avatar.test.ts
```

Expected: PASS — 4 tests pass

- [ ] **Step 5: Commit**

```bash
git add lib/personas/avatar.ts __tests__/avatar.test.ts
git commit -m "feat: add deterministic avatar URL utility"
```

---

## Task 4: Database Schema

**Files:**
- Create: `supabase/migrations/001_initial.sql`

- [ ] **Step 1: Create migration file**

Create `supabase/migrations/001_initial.sql`:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Projects table
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  product_context text not null,
  category text,
  geography text,
  user_type text,
  key_workflows text[] default '{}',
  constraints text[] default '{}',
  known_assumptions text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Personas table
create table public.personas (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  label text not null,
  summary text not null,
  avatar_url text not null,
  quote text not null,
  core_job text not null,
  context text not null,
  behaviors text[] default '{}',
  goals text[] default '{}',
  pain_points text[] default '{}',
  motivations text[] default '{}',
  fears text[] default '{}',
  constraints text[] default '{}',
  product_expectations text[] default '{}',
  abandonment_triggers text[] default '{}',
  design_implications text[] default '{}',
  traits jsonb default '[]',
  confidence_overall text not null check (confidence_overall in ('grounded', 'inferred', 'assumption')),
  confidence_note text not null,
  created_at timestamptz default now()
);

-- Chat messages table
create table public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  persona_id uuid references public.personas(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  persona_voice text,
  reasoning text,
  product_action text,
  confidence_level text,
  created_at timestamptz default now()
);

-- Row Level Security: users can only access their own data
alter table public.projects enable row level security;
alter table public.personas enable row level security;
alter table public.chat_messages enable row level security;

create policy "Users own their projects"
  on public.projects for all
  using (auth.uid() = user_id);

create policy "Users access personas via their projects"
  on public.personas for all
  using (
    exists (
      select 1 from public.projects
      where projects.id = personas.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users access messages via their projects"
  on public.chat_messages for all
  using (
    exists (
      select 1 from public.projects
      where projects.id = chat_messages.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Auto-update updated_at on projects
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on public.projects
  for each row execute function update_updated_at();
```

- [ ] **Step 2: Apply migration to Supabase**

In the Supabase dashboard → SQL Editor → paste the contents of `001_initial.sql` and run it.

Or if you have the Supabase CLI installed:
```bash
supabase db push
```

- [ ] **Step 3: Commit**

```bash
git add supabase/
git commit -m "feat: add database schema with RLS policies"
```

---

## Task 5: Supabase Clients + Middleware

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Create browser client**

Create `lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Create server client**

Create `lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component — middleware handles refresh
          }
        },
      },
    }
  )
}
```

- [ ] **Step 3: Create middleware**

Create `middleware.ts` at project root:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  const isProtected = !isAuthRoute && !isApiRoute && request.nextUrl.pathname !== '/'

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/ middleware.ts
git commit -m "feat: add Supabase clients and auth middleware"
```

---

## Task 6: Auth Pages

**Files:**
- Create: `app/auth/login/page.tsx`
- Create: `app/auth/callback/route.ts`
- Create: `app/page.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create root page (redirect)**

Create `app/page.tsx`:

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')
  redirect('/auth/login')
}
```

- [ ] **Step 2: Create login page**

Create `app/auth/login/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else window.location.href = '/dashboard'
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) setError(error.message)
      else setMessage('Check your email to confirm your account.')
    }
    setLoading(false)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-sm border border-zinc-100">
        <h1 className="text-2xl font-bold text-zinc-900 mb-1">UserPersonas</h1>
        <p className="text-sm text-zinc-500 mb-6">
          {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
        </p>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        {message && <p className="text-sm text-green-600 mb-4">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : mode === 'login' ? 'Sign in' : 'Sign up'}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-100" />
          </div>
          <div className="relative text-center text-xs text-zinc-400 bg-white px-2 w-fit mx-auto">or</div>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogle}>
          Continue with Google
        </Button>

        <p className="text-center text-sm text-zinc-500 mt-4">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            className="text-zinc-900 font-medium underline"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create OAuth callback route**

Create `app/auth/callback/route.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL(next, request.url))
}
```

- [ ] **Step 4: Update root layout**

Replace contents of `app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'UserPersonas',
  description: 'Evidence-aware AI personas for product teams',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-50 text-zinc-900 antialiased`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 5: Verify auth works**

```bash
npm run dev
```

Open http://localhost:3000 — should redirect to /auth/login. Sign up with an email, check inbox for confirmation, confirm, and verify redirect to /dashboard (will 404 for now — that's fine).

- [ ] **Step 6: Commit**

```bash
git add app/
git commit -m "feat: add auth pages (login, signup, Google OAuth, callback)"
```

---

## Task 7: DB Queries

**Files:**
- Create: `lib/db/queries.ts`

- [ ] **Step 1: Create queries file**

Create `lib/db/queries.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'
import type { Project, Persona, ChatMessage, PersonaPayload } from '@/lib/personas/types'

// ── Projects ──────────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getProject(id: string): Promise<Project> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createProject(input: {
  name: string
  product_context: string
  category?: string
  geography?: string
  user_type?: string
  key_workflows?: string[]
  constraints?: string[]
  known_assumptions?: string
}): Promise<Project> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('projects')
    .insert({ ...input, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProjectContext(id: string, product_context: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('projects')
    .update({ product_context })
    .eq('id', id)
  if (error) throw error
}

// ── Personas ──────────────────────────────────────────────────────────────────

export async function getPersonasForProject(project_id: string): Promise<Persona[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .eq('project_id', project_id)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function savePersonas(project_id: string, personas: PersonaPayload[]): Promise<Persona[]> {
  const supabase = await createClient()
  const rows = personas.map(p => ({ ...p, project_id }))
  const { data, error } = await supabase
    .from('personas')
    .insert(rows)
    .select()
  if (error) throw error
  return data
}

export async function deletePersonasForProject(project_id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('personas')
    .delete()
    .eq('project_id', project_id)
  if (error) throw error
}

// ── Chat Messages ─────────────────────────────────────────────────────────────

export async function getChatMessages(persona_id: string): Promise<ChatMessage[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('persona_id', persona_id)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function saveChatMessage(msg: Omit<ChatMessage, 'id' | 'created_at'>): Promise<ChatMessage> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chat_messages')
    .insert(msg)
    .select()
    .single()
  if (error) throw error
  return data
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/db/queries.ts
git commit -m "feat: add Supabase DB query helpers"
```

---

## Task 8: Gemini Client + Prompts

**Files:**
- Create: `lib/gemini/client.ts`
- Create: `lib/gemini/prompts.ts`
- Create: `__tests__/prompts.test.ts`

- [ ] **Step 1: Create Gemini client**

Create `lib/gemini/client.ts`:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const flashModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 8192,
  },
})
```

- [ ] **Step 2: Write failing prompt tests**

Create `__tests__/prompts.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { buildSegmentationPrompt, buildPersonaPrompt, buildChatPrompt } from '@/lib/gemini/prompts'

describe('buildSegmentationPrompt', () => {
  it('includes product context in prompt', () => {
    const prompt = buildSegmentationPrompt({
      product_context: 'A banking app for newcomers',
      category: 'Banking',
      geography: 'Canada',
      user_type: null,
      key_workflows: [],
      constraints: [],
      known_assumptions: null,
    })
    expect(prompt).toContain('A banking app for newcomers')
    expect(prompt).toContain('Banking')
    expect(prompt).toContain('Canada')
  })

  it('requests JSON output', () => {
    const prompt = buildSegmentationPrompt({
      product_context: 'test',
      category: null,
      geography: null,
      user_type: null,
      key_workflows: [],
      constraints: [],
      known_assumptions: null,
    })
    expect(prompt.toLowerCase()).toContain('json')
  })
})

describe('buildChatPrompt', () => {
  it('includes persona name in system prompt', () => {
    const prompt = buildChatPrompt('Riya', 'Banking app', 'Newcomer user', 'What confuses you?')
    expect(prompt).toContain('Riya')
    expect(prompt).toContain('What confuses you?')
  })

  it('requests 4-layer response structure', () => {
    const prompt = buildChatPrompt('Riya', 'context', 'label', 'question')
    expect(prompt).toContain('PERSONA_VOICE')
    expect(prompt).toContain('WHY')
    expect(prompt).toContain('PRODUCT_ACTION')
    expect(prompt).toContain('CONFIDENCE')
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npm test -- prompts.test.ts
```

Expected: FAIL — "Cannot find module '@/lib/gemini/prompts'"

- [ ] **Step 4: Implement prompts**

Create `lib/gemini/prompts.ts`:

```typescript
import type { Project } from '@/lib/personas/types'

type ProjectInput = Pick<Project, 'product_context' | 'category' | 'geography' | 'user_type' | 'key_workflows' | 'constraints' | 'known_assumptions'>

export function buildSegmentationPrompt(project: ProjectInput): string {
  const optional = [
    project.category && `Product category: ${project.category}`,
    project.geography && `Geography/market: ${project.geography}`,
    project.user_type && `Primary user type: ${project.user_type}`,
    project.key_workflows?.length && `Key workflows: ${project.key_workflows.join(', ')}`,
    project.constraints?.length && `Known constraints: ${project.constraints.join(', ')}`,
    project.known_assumptions && `Team's known assumptions: ${project.known_assumptions}`,
  ].filter(Boolean).join('\n')

  return `You are analyzing a product to identify distinct user segments for persona generation.

PRODUCT CONTEXT:
${project.product_context}

${optional ? `ADDITIONAL CONTEXT:\n${optional}` : ''}

Identify 2–4 meaningfully distinct user segments. Focus on differences that actually affect product behavior — trust level, urgency, digital confidence, goal type, emotional state, constraints. Do NOT create segments based on demographics alone.

Respond with valid JSON only, no markdown, no explanation:

{
  "product_domain": "string",
  "target_environment": "string",
  "key_risks": ["string"],
  "trust_level": "low|medium|high",
  "emotional_pressure": "string",
  "segments": [
    {
      "segment_id": "string",
      "label": "string",
      "key_differentiator": "string",
      "suggested_name": "string",
      "suggested_gender": "male|female",
      "priority": "primary|secondary"
    }
  ]
}`
}

export function buildPersonaPrompt(segmentationResult: string, project: ProjectInput): string {
  return `You are building evidence-aware user personas for a product team. These are not decorative profiles — they must be actionable for design and PM decisions.

PRODUCT CONTEXT:
${project.product_context}

SEGMENTATION ANALYSIS:
${segmentationResult}

${project.known_assumptions ? `TEAM'S KNOWN ASSUMPTIONS (label these as assumptions, not facts):\n${project.known_assumptions}` : ''}

Rules:
- Create exactly one persona per segment
- Every attribute must be tagged: "grounded" (directly from input), "inferred" (reasonable from context), or "assumption" (speculative)
- Personas must be distinct — if two are too similar, merge them
- Focus on goals, behaviors, fears, and constraints — not demographics
- Include a realistic first-person quote that reveals their emotional state
- Never invent statistics or precise percentages

Respond with valid JSON only, no markdown:

{
  "personas": [
    {
      "name": "string (realistic first name + last name)",
      "label": "string (short descriptor e.g. 'First-time newcomer banking user')",
      "summary": "string (one sentence — who they are and what they need)",
      "quote": "string (first-person, reveals emotional state, max 20 words)",
      "core_job": "string",
      "context": "string (situation they are in)",
      "behaviors": ["string"],
      "goals": ["string"],
      "pain_points": ["string"],
      "motivations": ["string"],
      "fears": ["string"],
      "constraints": ["string"],
      "product_expectations": ["string"],
      "abandonment_triggers": ["string"],
      "design_implications": ["string"],
      "traits": [
        { "label": "string", "variant": "neutral|risk|caution|positive|urgent" }
      ],
      "confidence_overall": "grounded|inferred|assumption",
      "confidence_note": "string (explain what is grounded vs inferred)"
    }
  ]
}`
}

export function buildChatPrompt(
  personaName: string,
  productContext: string,
  personaLabel: string,
  userQuestion: string
): string {
  return `You are ${personaName}, a user persona — ${personaLabel}.

Product context: ${productContext}

The product team is asking you a question. Respond as this persona, grounded in their goals, fears, constraints and context. Do not pretend to have conducted real research. Be specific, not generic.

Structure your response as valid JSON with exactly these four keys:

{
  "PERSONA_VOICE": "First-person answer from the persona's viewpoint (2-4 sentences, emotionally honest)",
  "WHY": "Explain the reasoning: which specific goals, fears or constraints drive this reaction (1-3 sentences)",
  "PRODUCT_ACTION": "Concrete recommendation for the product team based on this reaction (1-3 actionable sentences)",
  "CONFIDENCE": "grounded|inferred|assumption — plus one sentence explaining what is certain vs assumed"
}

Question from the team: ${userQuestion}`
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- prompts.test.ts
```

Expected: PASS — 4 tests pass

- [ ] **Step 6: Commit**

```bash
git add lib/gemini/ __tests__/prompts.test.ts
git commit -m "feat: add Gemini client and prompt builders"
```

---

## Task 9: Persona Generation Pipeline + API Route

**Files:**
- Create: `lib/gemini/generatePersonas.ts`
- Create: `app/api/generate/route.ts`

- [ ] **Step 1: Create generation pipeline**

Create `lib/gemini/generatePersonas.ts`:

```typescript
import { flashModel } from './client'
import { buildSegmentationPrompt, buildPersonaPrompt } from './prompts'
import { getAvatarUrl, inferGender } from '@/lib/personas/avatar'
import type { Project, PersonaPayload } from '@/lib/personas/types'

type ProjectInput = Pick<Project, 'product_context' | 'category' | 'geography' | 'user_type' | 'key_workflows' | 'constraints' | 'known_assumptions'>

export async function generatePersonas(project: ProjectInput): Promise<PersonaPayload[]> {
  // Stage 1: Segmentation
  const segPrompt = buildSegmentationPrompt(project)
  const segResult = await flashModel.generateContent(segPrompt)
  const segText = segResult.response.text().trim()

  let segmentation: { segments: Array<{ suggested_name: string; suggested_gender: string }> }
  try {
    segmentation = JSON.parse(segText)
  } catch {
    throw new Error(`Segmentation JSON parse failed: ${segText.slice(0, 200)}`)
  }

  // Stage 2: Build personas
  const personaPrompt = buildPersonaPrompt(segText, project)
  const personaResult = await flashModel.generateContent(personaPrompt)
  const personaText = personaResult.response.text().trim()

  let parsed: { personas: PersonaPayload[] }
  try {
    parsed = JSON.parse(personaText)
  } catch {
    throw new Error(`Persona JSON parse failed: ${personaText.slice(0, 200)}`)
  }

  // Attach avatar URLs
  return parsed.personas.map((p, i) => {
    const segHint = segmentation.segments[i]
    const gender = (segHint?.suggested_gender === 'female' ? 'female' : null)
      ?? inferGender(p.name)
    return { ...p, avatar_url: getAvatarUrl(p.name, gender) }
  })
}
```

- [ ] **Step 2: Create generate API route**

Create `app/api/generate/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { generatePersonas } from '@/lib/gemini/generatePersonas'
import { savePersonas, deletePersonasForProject, getProject } from '@/lib/db/queries'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { project_id } = await request.json()
  if (!project_id) return NextResponse.json({ error: 'project_id required' }, { status: 400 })

  const project = await getProject(project_id)

  // Delete existing personas before regenerating
  await deletePersonasForProject(project_id)

  const personas = await generatePersonas(project)
  const saved = await savePersonas(project_id, personas)

  return NextResponse.json({ personas: saved })
}
```

- [ ] **Step 3: Create projects API route**

Create `app/api/projects/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createProject, getProjects } from '@/lib/db/queries'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projects = await getProjects()
  return NextResponse.json({ projects })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const project = await createProject(body)
  return NextResponse.json({ project }, { status: 201 })
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/gemini/generatePersonas.ts app/api/
git commit -m "feat: add persona generation pipeline and API routes"
```

---

## Task 10: Chat API Route

**Files:**
- Create: `app/api/chat/route.ts`
- Create: `lib/gemini/chat.ts`

- [ ] **Step 1: Create chat streaming helper**

Create `lib/gemini/chat.ts`:

```typescript
import { flashModel } from './client'
import { buildChatPrompt } from './prompts'
import type { Persona } from '@/lib/personas/types'

export async function getChatResponse(
  persona: Persona,
  productContext: string,
  userQuestion: string
): Promise<{
  persona_voice: string
  reasoning: string
  product_action: string
  confidence_level: string
  content: string
}> {
  const prompt = buildChatPrompt(
    persona.name,
    productContext,
    persona.label,
    userQuestion
  )

  const result = await flashModel.generateContent(prompt)
  const text = result.response.text().trim()

  let parsed: {
    PERSONA_VOICE: string
    WHY: string
    PRODUCT_ACTION: string
    CONFIDENCE: string
  }

  try {
    parsed = JSON.parse(text)
  } catch {
    // Fallback if Gemini wraps in markdown
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Chat response not parseable')
    parsed = JSON.parse(jsonMatch[0])
  }

  return {
    persona_voice: parsed.PERSONA_VOICE,
    reasoning: parsed.WHY,
    product_action: parsed.PRODUCT_ACTION,
    confidence_level: parsed.CONFIDENCE,
    content: parsed.PERSONA_VOICE, // top-level content for message list
  }
}
```

- [ ] **Step 2: Create chat API route**

Create `app/api/chat/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getChatResponse } from '@/lib/gemini/chat'
import { saveChatMessage, getChatMessages } from '@/lib/db/queries'
import { createClient } from '@/lib/supabase/server'
import { getPersonasForProject, getProject } from '@/lib/db/queries'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { persona_id, project_id, message } = await request.json()
  if (!persona_id || !project_id || !message) {
    return NextResponse.json({ error: 'persona_id, project_id, and message required' }, { status: 400 })
  }

  // Save user message
  await saveChatMessage({
    persona_id,
    project_id,
    role: 'user',
    content: message,
    persona_voice: null,
    reasoning: null,
    product_action: null,
    confidence_level: null,
  })

  // Get persona + project for context
  const personas = await getPersonasForProject(project_id)
  const persona = personas.find(p => p.id === persona_id)
  if (!persona) return NextResponse.json({ error: 'Persona not found' }, { status: 404 })

  const project = await getProject(project_id)

  // Get AI response
  const response = await getChatResponse(persona, project.product_context, message)

  // Save assistant message
  const saved = await saveChatMessage({
    persona_id,
    project_id,
    role: 'assistant',
    ...response,
  })

  return NextResponse.json({ message: saved })
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const persona_id = searchParams.get('persona_id')
  if (!persona_id) return NextResponse.json({ error: 'persona_id required' }, { status: 400 })

  const messages = await getChatMessages(persona_id)
  return NextResponse.json({ messages })
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/gemini/chat.ts app/api/chat/route.ts
git commit -m "feat: add chat API with 4-layer Gemini response"
```

---

## Task 11: Questionnaire UI

**Files:**
- Create: `components/shared/ProgressBar.tsx`
- Create: `components/questionnaire/QuestionnaireLayout.tsx`
- Create: `components/questionnaire/Step1Context.tsx`
- Create: `components/questionnaire/Step2Options.tsx`
- Create: `components/questionnaire/Step3Assumptions.tsx`
- Create: `components/questionnaire/PersonaPreviewPanel.tsx`
- Create: `app/projects/new/page.tsx`

- [ ] **Step 1: Create ProgressBar**

Create `components/shared/ProgressBar.tsx`:

```typescript
interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div className="flex gap-1.5 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-0.5 rounded-full transition-colors duration-300 ${
            i < current ? 'bg-zinc-900' : 'bg-zinc-200'
          }`}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create PillSelector (shared sub-component)**

Create `components/shared/PillSelector.tsx`:

```typescript
interface PillSelectorProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  multiSelect?: boolean
}

export function PillSelector({ options, selected, onChange, multiSelect = false }: PillSelectorProps) {
  function toggle(option: string) {
    if (multiSelect) {
      onChange(selected.includes(option) ? selected.filter(o => o !== option) : [...selected, option])
    } else {
      onChange(selected.includes(option) ? [] : [option])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(option => (
        <button
          key={option}
          onClick={() => toggle(option)}
          className={`px-4 py-1.5 rounded-full text-sm border transition-all duration-150 ${
            selected.includes(option)
              ? 'border-zinc-900 bg-zinc-900 text-white font-medium'
              : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create PersonaPreviewPanel**

Create `components/questionnaire/PersonaPreviewPanel.tsx`:

```typescript
interface PersonaPreviewPanelProps {
  contextLength: number // chars typed so far
}

const PREVIEW_PERSONAS = [
  { name: 'Alex', label: 'Primary user', avatar: 'https://randomuser.me/api/portraits/men/45.jpg' },
  { name: 'Maya', label: 'Secondary user', avatar: 'https://randomuser.me/api/portraits/women/32.jpg' },
  { name: 'Jordan', label: 'Edge case user', avatar: 'https://randomuser.me/api/portraits/men/67.jpg' },
]

export function PersonaPreviewPanel({ contextLength }: PersonaPreviewPanelProps) {
  // Reveal cards progressively as user types more context
  const revealed = contextLength > 200 ? 3 : contextLength > 80 ? 2 : contextLength > 20 ? 1 : 0

  return (
    <div className="flex flex-col items-center justify-center h-full px-10 gap-4">
      <p className="text-xs text-zinc-400 uppercase tracking-widest mb-2">Preview — personas you'll get</p>
      {PREVIEW_PERSONAS.map((p, i) => (
        <div
          key={p.name}
          className="w-full max-w-xs bg-white rounded-2xl p-4 shadow-sm border border-zinc-100 transition-all duration-500"
          style={{ opacity: i < revealed ? 1 : 0.15, filter: i < revealed ? 'none' : 'blur(4px)' }}
        >
          <div className="flex items-center gap-3">
            <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <div className="text-sm font-semibold text-zinc-900">{p.name}</div>
              <div className="text-xs text-zinc-400">{p.label}</div>
            </div>
            {i < revealed && (
              <div className="ml-auto text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-medium">Inferred</div>
            )}
          </div>
          {i < revealed && (
            <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
              Will be generated from your product context...
            </p>
          )}
        </div>
      ))}
      <p className="text-xs text-zinc-400 text-center mt-2">
        {contextLength < 20 ? 'Start typing to preview...' : 'Personas revealed as you add more context'}
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Create Step1Context**

Create `components/questionnaire/Step1Context.tsx`:

```typescript
'use client'

import { ProgressBar } from '@/components/shared/ProgressBar'
import { PillSelector } from '@/components/shared/PillSelector'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const CATEGORIES = ['Banking', 'Healthcare', 'SaaS', 'Marketplace', 'Education', 'Enterprise', 'Other']
const MAX_CONTEXT = 500

interface Step1Props {
  productContext: string
  category: string
  onContextChange: (v: string) => void
  onCategoryChange: (v: string) => void
  onNext: () => void
}

export function Step1Context({ productContext, category, onContextChange, onCategoryChange, onNext }: Step1Props) {
  const canContinue = productContext.trim().length > 30 && category !== ''

  return (
    <div className="flex flex-col h-full px-11 py-10">
      <ProgressBar current={1} total={3} />
      <p className="text-xs text-zinc-400 uppercase tracking-widest mb-2">Step 1 of 3 — Product context</p>
      <h2 className="text-2xl font-bold text-zinc-900 mb-1">What are you building?</h2>
      <p className="text-sm text-zinc-500 mb-6">Describe your product, who it's for, and what problem it solves.</p>

      <Textarea
        value={productContext}
        onChange={e => onContextChange(e.target.value.slice(0, MAX_CONTEXT))}
        placeholder="e.g. We are building a mobile banking app for newcomers in Canada. Users need to open an account quickly, verify identity, understand fees, and feel safe using the app..."
        className="resize-none min-h-[120px] mb-1 text-sm"
      />
      <p className="text-xs text-zinc-400 text-right mb-6">{productContext.length} / {MAX_CONTEXT}</p>

      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Product category</p>
      <PillSelector
        options={CATEGORIES}
        selected={category ? [category] : []}
        onChange={sel => onCategoryChange(sel[0] ?? '')}
        multiSelect={false}
      />

      <div className="mt-auto pt-8">
        <Button onClick={onNext} disabled={!canContinue} className="w-full sm:w-auto">
          Continue →
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create Step2Options**

Create `components/questionnaire/Step2Options.tsx`:

```typescript
'use client'

import { ProgressBar } from '@/components/shared/ProgressBar'
import { PillSelector } from '@/components/shared/PillSelector'
import { Button } from '@/components/ui/button'

const GEOGRAPHIES = ['Canada', 'USA', 'Europe', 'UK', 'Australia', 'Global', 'Other']
const USER_TYPES = ['Consumers', 'Small businesses', 'Enterprises', 'Students', 'Patients', 'Immigrants', 'Operations teams']
const WORKFLOWS = ['Signup', 'Identity verification', 'Document upload', 'Checkout', 'Onboarding', 'Dashboard', 'Search', 'Booking']
const CONSTRAINTS = ['Low trust', 'Low digital literacy', 'Mobile-first', 'Compliance-heavy', 'High urgency', 'Language barriers', 'Low income']

interface Step2Props {
  geography: string
  userType: string
  workflows: string[]
  constraints: string[]
  onGeographyChange: (v: string) => void
  onUserTypeChange: (v: string) => void
  onWorkflowsChange: (v: string[]) => void
  onConstraintsChange: (v: string[]) => void
  onNext: () => void
  onBack: () => void
}

export function Step2Options({
  geography, userType, workflows, constraints,
  onGeographyChange, onUserTypeChange, onWorkflowsChange, onConstraintsChange,
  onNext, onBack,
}: Step2Props) {
  return (
    <div className="flex flex-col h-full px-11 py-10 overflow-y-auto">
      <ProgressBar current={2} total={3} />
      <p className="text-xs text-zinc-400 uppercase tracking-widest mb-2">Step 2 of 3 — Optional context</p>
      <h2 className="text-2xl font-bold text-zinc-900 mb-1">Tell us more</h2>
      <p className="text-sm text-zinc-500 mb-6">Optional — but better context means better personas.</p>

      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Geography</p>
          <PillSelector options={GEOGRAPHIES} selected={geography ? [geography] : []} onChange={sel => onGeographyChange(sel[0] ?? '')} />
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Primary user type</p>
          <PillSelector options={USER_TYPES} selected={userType ? [userType] : []} onChange={sel => onUserTypeChange(sel[0] ?? '')} />
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Key workflows</p>
          <PillSelector options={WORKFLOWS} selected={workflows} onChange={onWorkflowsChange} multiSelect />
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Known constraints</p>
          <PillSelector options={CONSTRAINTS} selected={constraints} onChange={onConstraintsChange} multiSelect />
        </div>
      </div>

      <div className="flex gap-3 mt-8 pt-4">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={onNext}>Continue →</Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create Step3Assumptions**

Create `components/questionnaire/Step3Assumptions.tsx`:

```typescript
'use client'

import { ProgressBar } from '@/components/shared/ProgressBar'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface Step3Props {
  assumptions: string
  projectName: string
  onAssumptionsChange: (v: string) => void
  onProjectNameChange: (v: string) => void
  onSubmit: () => void
  onBack: () => void
  loading: boolean
}

export function Step3Assumptions({
  assumptions, projectName,
  onAssumptionsChange, onProjectNameChange,
  onSubmit, onBack, loading,
}: Step3Props) {
  return (
    <div className="flex flex-col h-full px-11 py-10">
      <ProgressBar current={3} total={3} />
      <p className="text-xs text-zinc-400 uppercase tracking-widest mb-2">Step 3 of 3 — Final details</p>
      <h2 className="text-2xl font-bold text-zinc-900 mb-1">What do you already believe?</h2>
      <p className="text-sm text-zinc-500 mb-6">
        These will be labeled as <strong>assumptions</strong> in the output — not facts. Very useful for surfacing blind spots.
      </p>

      <div className="space-y-4 mb-6">
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Project name</p>
          <input
            value={projectName}
            onChange={e => onProjectNameChange(e.target.value)}
            placeholder="e.g. Banking App for Newcomers"
            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Known assumptions (optional)</p>
          <Textarea
            value={assumptions}
            onChange={e => onAssumptionsChange(e.target.value)}
            placeholder="e.g. Users are comfortable with mobile apps. Most will be between 25–40. They will have a smartphone but may not have a laptop..."
            className="resize-none min-h-[100px] text-sm"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-auto">
        <Button variant="outline" onClick={onBack} disabled={loading}>← Back</Button>
        <Button onClick={onSubmit} disabled={loading || !projectName.trim()}>
          {loading ? 'Generating personas...' : 'Generate personas →'}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Create questionnaire page**

Create `app/projects/new/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Step1Context } from '@/components/questionnaire/Step1Context'
import { Step2Options } from '@/components/questionnaire/Step2Options'
import { Step3Assumptions } from '@/components/questionnaire/Step3Assumptions'
import { PersonaPreviewPanel } from '@/components/questionnaire/PersonaPreviewPanel'

export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Form state
  const [productContext, setProductContext] = useState('')
  const [category, setCategory] = useState('')
  const [geography, setGeography] = useState('')
  const [userType, setUserType] = useState('')
  const [workflows, setWorkflows] = useState<string[]>([])
  const [constraints, setConstraints] = useState<string[]>([])
  const [assumptions, setAssumptions] = useState('')
  const [projectName, setProjectName] = useState('')

  async function handleSubmit() {
    setLoading(true)
    try {
      // Create project
      const projectRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          product_context: productContext,
          category: category || null,
          geography: geography || null,
          user_type: userType || null,
          key_workflows: workflows,
          constraints,
          known_assumptions: assumptions || null,
        }),
      })
      const { project } = await projectRes.json()

      // Generate personas
      await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: project.id }),
      })

      router.push(`/projects/${project.id}`)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: form (50%) */}
      <div className="w-1/2 flex flex-col border-r border-zinc-100 bg-white min-h-screen">
        {step === 1 && (
          <Step1Context
            productContext={productContext}
            category={category}
            onContextChange={setProductContext}
            onCategoryChange={setCategory}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <Step2Options
            geography={geography}
            userType={userType}
            workflows={workflows}
            constraints={constraints}
            onGeographyChange={setGeography}
            onUserTypeChange={setUserType}
            onWorkflowsChange={setWorkflows}
            onConstraintsChange={setConstraints}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <Step3Assumptions
            assumptions={assumptions}
            projectName={projectName}
            onAssumptionsChange={setAssumptions}
            onProjectNameChange={setProjectName}
            onSubmit={handleSubmit}
            onBack={() => setStep(2)}
            loading={loading}
          />
        )}
      </div>

      {/* Right: preview panel (50%) */}
      <div className="w-1/2 bg-zinc-50 min-h-screen">
        <PersonaPreviewPanel contextLength={productContext.length} />
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Commit**

```bash
git add components/questionnaire/ components/shared/ app/projects/new/
git commit -m "feat: add 3-step questionnaire with 50/50 split layout"
```

---

## Task 12: Persona Carousel UI

**Files:**
- Create: `components/personas/ConfidenceBar.tsx`
- Create: `components/personas/TraitPills.tsx`
- Create: `components/personas/PersonaHero.tsx`
- Create: `components/personas/PersonaTabs.tsx`
- Create: `components/personas/PersonaCard.tsx`
- Create: `components/personas/PersonaCarousel.tsx`
- Create: `app/projects/[id]/page.tsx`

- [ ] **Step 1: Create ConfidenceBar**

Create `components/personas/ConfidenceBar.tsx`:

```typescript
import type { ConfidenceLevel } from '@/lib/personas/types'

interface ConfidenceBarProps {
  level: ConfidenceLevel
  note: string
}

const LEVELS: Record<ConfidenceLevel, { width: string; color: string; label: string }> = {
  grounded: { width: 'w-3/4', color: 'bg-green-500', label: 'Mostly Grounded' },
  inferred: { width: 'w-5/12', color: 'bg-amber-400', label: 'Mostly Inferred' },
  assumption: { width: 'w-1/4', color: 'bg-red-400', label: 'Assumption-Heavy' },
}

export function ConfidenceBar({ level, note }: ConfidenceBarProps) {
  const cfg = LEVELS[level]
  return (
    <div className="px-8 py-4 border-t border-zinc-100 flex items-center gap-4">
      <span className="text-xs font-semibold text-zinc-500 whitespace-nowrap">Confidence</span>
      <div className="w-28 h-1 bg-zinc-100 rounded-full shrink-0">
        <div className={`h-full rounded-full ${cfg.width} ${cfg.color} transition-all`} />
      </div>
      <span className="text-xs text-zinc-400 leading-relaxed">{note}</span>
    </div>
  )
}
```

- [ ] **Step 2: Create TraitPills**

Create `components/personas/TraitPills.tsx`:

```typescript
import type { Trait } from '@/lib/personas/types'

const VARIANT_CLASSES: Record<Trait['variant'], string> = {
  neutral: 'bg-zinc-100 text-zinc-600',
  risk: 'bg-red-50 text-red-600',
  caution: 'bg-yellow-50 text-yellow-700',
  positive: 'bg-green-50 text-green-700',
  urgent: 'bg-blue-50 text-blue-700',
}

export function TraitPills({ traits }: { traits: Trait[] }) {
  return (
    <div className="flex flex-wrap gap-2 px-8 py-4 border-b border-zinc-100 bg-zinc-50/50">
      {traits.map(t => (
        <span key={t.label} className={`text-xs font-medium px-3 py-1 rounded-full ${VARIANT_CLASSES[t.variant]}`}>
          {t.label}
        </span>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create PersonaHero**

Create `components/personas/PersonaHero.tsx`:

```typescript
import type { Persona } from '@/lib/personas/types'

const GRADIENTS = [
  'from-indigo-950 to-indigo-800',
  'from-emerald-950 to-emerald-800',
  'from-orange-950 to-orange-800',
  'from-violet-950 to-violet-800',
]

const BADGE_CLASSES = {
  grounded: 'bg-green-100 text-green-800',
  inferred: 'bg-yellow-100 text-yellow-800',
  assumption: 'bg-red-100 text-red-800',
}

const BADGE_LABELS = {
  grounded: '✓ Mostly Grounded',
  inferred: '⚠ Mostly Inferred',
  assumption: '⚠ Assumption-Heavy',
}

interface PersonaHeroProps {
  persona: Persona
  index: number
  onChat: () => void
}

export function PersonaHero({ persona, index, onChat }: PersonaHeroProps) {
  const gradient = GRADIENTS[index % GRADIENTS.length]
  return (
    <div className={`bg-gradient-to-br ${gradient} px-8 py-6 flex items-start justify-between gap-6`}>
      <div className="flex items-start gap-5">
        <img
          src={persona.avatar_url}
          alt={persona.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-white/20 shrink-0"
        />
        <div>
          <h2 className="text-2xl font-bold text-white">{persona.name}</h2>
          <p className="text-sm text-white/70 mt-0.5">{persona.label}</p>
          <p className="text-sm text-white/80 mt-3 italic border-l-2 border-white/30 pl-3 leading-relaxed max-w-lg">
            "{persona.quote}"
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-3 shrink-0">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${BADGE_CLASSES[persona.confidence_overall]}`}>
          {BADGE_LABELS[persona.confidence_overall]}
        </span>
        <button
          onClick={onChat}
          className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-lg border border-white/20 transition-colors"
        >
          Chat with {persona.name.split(' ')[0]} →
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create PersonaTabs**

Create `components/personas/PersonaTabs.tsx`:

```typescript
'use client'

import { useState } from 'react'
import type { Persona } from '@/lib/personas/types'

const TABS = [
  { id: 'goals', label: 'Goals & Context' },
  { id: 'painpoints', label: 'Pain Points & Fears' },
  { id: 'behaviors', label: 'Behaviors' },
  { id: 'design', label: 'Design Implications' },
]

function Section({ label, items, variant = 'default' }: { label: string; items: string[]; variant?: 'default' | 'red' | 'green' }) {
  const labelClass = variant === 'red' ? 'text-red-600' : variant === 'green' ? 'text-green-700' : 'text-zinc-500'
  return (
    <div>
      <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${labelClass}`}>{label}</p>
      <ul className="space-y-1.5 pl-4 list-disc">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-zinc-600 leading-relaxed">{item}</li>
        ))}
      </ul>
    </div>
  )
}

function ImplicationItem({ text }: { text: string }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-6 h-6 rounded bg-zinc-100 flex items-center justify-center text-xs shrink-0 mt-0.5">→</div>
      <p className="text-sm text-zinc-600 leading-relaxed">{text}</p>
    </div>
  )
}

export function PersonaTabs({ persona }: { persona: Persona }) {
  const [activeTab, setActiveTab] = useState('goals')

  return (
    <div>
      {/* Tab nav */}
      <div className="flex border-b border-zinc-100 px-8">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-8 py-6">
        {activeTab === 'goals' && (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <Section label="Core Job to Be Done" items={[persona.core_job]} variant="green" />
              <Section label="Context" items={[persona.context]} />
            </div>
            <div className="space-y-6">
              <Section label="Goals" items={persona.goals} variant="green" />
              <Section label="Motivations" items={persona.motivations} />
            </div>
          </div>
        )}
        {activeTab === 'painpoints' && (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <Section label="Pain Points" items={persona.pain_points} variant="red" />
              <Section label="Abandonment Triggers" items={persona.abandonment_triggers} variant="red" />
            </div>
            <div className="space-y-6">
              <Section label="Fears & Objections" items={persona.fears} variant="red" />
              <Section label="Constraints" items={persona.constraints} />
            </div>
          </div>
        )}
        {activeTab === 'behaviors' && (
          <div className="grid grid-cols-2 gap-8">
            <Section label="Typical Behaviors" items={persona.behaviors} />
            <Section label="Product Expectations" items={persona.product_expectations} />
          </div>
        )}
        {activeTab === 'design' && (
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Design & PM Implications</p>
            {persona.design_implications.map((item, i) => (
              <ImplicationItem key={i} text={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create PersonaCard**

Create `components/personas/PersonaCard.tsx`:

```typescript
import type { Persona } from '@/lib/personas/types'
import { PersonaHero } from './PersonaHero'
import { TraitPills } from './TraitPills'
import { PersonaTabs } from './PersonaTabs'
import { ConfidenceBar } from './ConfidenceBar'

interface PersonaCardProps {
  persona: Persona
  index: number
  onChat: (personaId: string) => void
}

export function PersonaCard({ persona, index, onChat }: PersonaCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
      <PersonaHero persona={persona} index={index} onChat={() => onChat(persona.id)} />
      <TraitPills traits={persona.traits} />
      <PersonaTabs persona={persona} />
      <ConfidenceBar level={persona.confidence_overall} note={persona.confidence_note} />
    </div>
  )
}
```

- [ ] **Step 6: Create PersonaCarousel**

Create `components/personas/PersonaCarousel.tsx`:

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Persona } from '@/lib/personas/types'
import { PersonaCard } from './PersonaCard'

interface PersonaCarouselProps {
  personas: Persona[]
  onChat: (personaId: string) => void
}

export function PersonaCarousel({ personas, onChat }: PersonaCarouselProps) {
  const [current, setCurrent] = useState(0)

  const prev = useCallback(() => setCurrent(c => (c - 1 + personas.length) % personas.length), [personas.length])
  const next = useCallback(() => setCurrent(c => (c + 1) % personas.length), [personas.length])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next])

  // Touch swipe
  let touchStart = 0
  function onTouchStart(e: React.TouchEvent) { touchStart = e.touches[0].clientX }
  function onTouchEnd(e: React.TouchEvent) {
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
  }

  return (
    <div className="relative">
      {/* Dots */}
      <div className="flex justify-center gap-2 mb-4">
        {personas.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-200 ${
              i === current ? 'w-6 bg-zinc-900' : 'w-2 bg-zinc-300'
            }`}
          />
        ))}
      </div>

      {/* Arrows */}
      {personas.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 w-10 h-10 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center text-zinc-700 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 w-10 h-10 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center text-zinc-700 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            ›
          </button>
        </>
      )}

      {/* Card */}
      <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {personas[current] && (
          <PersonaCard persona={personas[current]} index={current} onChat={onChat} />
        )}
      </div>

      <p className="text-center text-xs text-zinc-400 mt-3">
        Persona {current + 1} of {personas.length} · use arrows or swipe to navigate
      </p>
    </div>
  )
}
```

- [ ] **Step 7: Create project page**

Create `app/projects/[id]/page.tsx`:

```typescript
import { redirect } from 'next/navigation'
import { getProject, getPersonasForProject } from '@/lib/db/queries'
import { PersonaCarouselClient } from './PersonaCarouselClient'

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const [project, personas] = await Promise.all([
    getProject(params.id),
    getPersonasForProject(params.id),
  ])

  if (!project) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-baseline justify-between mb-2">
          <h1 className="text-2xl font-bold text-zinc-900">{project.name}</h1>
          <div className="flex gap-2">
            <a href="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-600">← Dashboard</a>
          </div>
        </div>
        <p className="text-sm text-zinc-500 mb-8">
          {personas.length} persona{personas.length !== 1 ? 's' : ''} generated ·{' '}
          {project.category && `${project.category} · `}
          <span className="text-amber-600">Some traits may be inferred</span>
        </p>
        <PersonaCarouselClient personas={personas} projectId={params.id} />
      </div>
    </div>
  )
}
```

Create `app/projects/[id]/PersonaCarouselClient.tsx`:

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { PersonaCarousel } from '@/components/personas/PersonaCarousel'
import type { Persona } from '@/lib/personas/types'

export function PersonaCarouselClient({ personas, projectId }: { personas: Persona[]; projectId: string }) {
  const router = useRouter()
  function handleChat(personaId: string) {
    router.push(`/projects/${projectId}/chat/${personaId}`)
  }
  return <PersonaCarousel personas={personas} onChat={handleChat} />
}
```

- [ ] **Step 8: Commit**

```bash
git add components/personas/ app/projects/
git commit -m "feat: add persona carousel with tabs, trait pills, confidence bar"
```

---

## Task 13: Chat UI

**Files:**
- Create: `components/chat/PersonaSidebar.tsx`
- Create: `components/chat/ChatMessage.tsx`
- Create: `components/chat/ChatMessages.tsx`
- Create: `components/chat/SuggestedPrompts.tsx`
- Create: `components/chat/ChatInput.tsx`
- Create: `app/projects/[id]/chat/[personaId]/page.tsx`

- [ ] **Step 1: Create PersonaSidebar**

Create `components/chat/PersonaSidebar.tsx`:

```typescript
import type { Persona } from '@/lib/personas/types'

const BADGE_CLASSES = {
  grounded: 'bg-green-50 text-green-700',
  inferred: 'bg-yellow-50 text-yellow-700',
  assumption: 'bg-red-50 text-red-700',
}

export function PersonaSidebar({ persona, projectId }: { persona: Persona; projectId: string }) {
  return (
    <div className="w-64 shrink-0 bg-zinc-50 border-r border-zinc-100 p-6 flex flex-col gap-4">
      <a href={`/projects/${projectId}`} className="text-xs text-zinc-400 hover:text-zinc-600">← Back to personas</a>
      <div className="flex items-center gap-3">
        <img src={persona.avatar_url} alt={persona.name} className="w-11 h-11 rounded-full object-cover" />
        <div>
          <p className="font-bold text-zinc-900">{persona.name}</p>
          <p className="text-xs text-zinc-500">{persona.label}</p>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Primary goal</p>
        <p className="text-sm text-zinc-700 leading-relaxed">{persona.core_job}</p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Main blocker</p>
        <p className="text-sm text-zinc-700 leading-relaxed">{persona.pain_points[0]}</p>
      </div>
      <div className={`text-xs rounded-lg px-3 py-2 leading-relaxed ${BADGE_CLASSES[persona.confidence_overall]}`}>
        ⚠ {persona.confidence_note}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create ChatMessage**

Create `components/chat/ChatMessage.tsx`:

```typescript
import type { ChatMessage as ChatMessageType } from '@/lib/personas/types'

export function ChatMessage({ message, avatarUrl }: { message: ChatMessageType; avatarUrl: string }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-zinc-900 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[70%] text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 items-start">
      <img src={avatarUrl} alt="persona" className="w-7 h-7 rounded-full object-cover shrink-0 mt-1" />
      <div className="flex flex-col gap-2 max-w-[85%]">
        {/* Persona voice */}
        <div className="bg-zinc-100 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-zinc-900 leading-relaxed">
          {message.persona_voice}
        </div>
        {/* Why */}
        {message.reasoning && (
          <div className="bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-600 leading-relaxed">
            <span className="font-semibold text-zinc-700">Why: </span>{message.reasoning}
          </div>
        )}
        {/* Product action */}
        {message.product_action && (
          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 text-xs text-green-800 leading-relaxed">
            <span className="font-semibold">Product action: </span>{message.product_action}
          </div>
        )}
        {/* Confidence */}
        {message.confidence_level && (
          <p className="text-xs text-zinc-400 pl-1">{message.confidence_level}</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create ChatMessages**

Create `components/chat/ChatMessages.tsx`:

```typescript
'use client'

import { useEffect, useRef } from 'react'
import type { ChatMessage as ChatMessageType } from '@/lib/personas/types'
import { ChatMessage } from './ChatMessage'

interface ChatMessagesProps {
  messages: ChatMessageType[]
  avatarUrl: string
  loading: boolean
}

export function ChatMessages({ messages, avatarUrl, loading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
      {messages.length === 0 && (
        <p className="text-center text-sm text-zinc-400 mt-12">
          Ask this persona a question about your product.
        </p>
      )}
      {messages.map(msg => (
        <ChatMessage key={msg.id} message={msg} avatarUrl={avatarUrl} />
      ))}
      {loading && (
        <div className="flex gap-3 items-center">
          <img src={avatarUrl} alt="persona" className="w-7 h-7 rounded-full object-cover" />
          <div className="bg-zinc-100 rounded-2xl px-4 py-2.5 text-sm text-zinc-400 animate-pulse">
            Thinking...
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
```

- [ ] **Step 4: Create SuggestedPrompts**

Create `components/chat/SuggestedPrompts.tsx`:

```typescript
const DEFAULT_PROMPTS = [
  'What would confuse you in this onboarding?',
  'Would you trust this product?',
  'Why would you abandon this flow?',
  'What do you need to know before continuing?',
  'What would make you feel more comfortable?',
]

export function SuggestedPrompts({ onSelect, disabled }: { onSelect: (p: string) => void; disabled: boolean }) {
  return (
    <div className="px-4 pb-3 flex gap-2 flex-wrap">
      {DEFAULT_PROMPTS.map(p => (
        <button
          key={p}
          onClick={() => onSelect(p)}
          disabled={disabled}
          className="text-xs text-zinc-500 border border-zinc-200 rounded-full px-3 py-1.5 hover:border-zinc-400 hover:text-zinc-700 transition-colors disabled:opacity-40"
        >
          {p}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Create ChatInput**

Create `components/chat/ChatInput.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ChatInputProps {
  onSend: (message: string) => void
  loading: boolean
}

export function ChatInput({ onSend, loading }: ChatInputProps) {
  const [value, setValue] = useState('')

  function handleSend() {
    if (!value.trim() || loading) return
    onSend(value.trim())
    setValue('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-zinc-100 px-4 py-3 flex gap-3 items-end">
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question..."
        rows={1}
        className="flex-1 resize-none border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 max-h-32 leading-relaxed"
      />
      <Button onClick={handleSend} disabled={!value.trim() || loading} size="sm">
        Send
      </Button>
    </div>
  )
}
```

- [ ] **Step 6: Create chat page**

Create `app/projects/[id]/chat/[personaId]/page.tsx`:

```typescript
import { redirect } from 'next/navigation'
import { getProject, getPersonasForProject, getChatMessages } from '@/lib/db/queries'
import { PersonaSidebar } from '@/components/chat/PersonaSidebar'
import { ChatClient } from './ChatClient'

export default async function ChatPage({ params }: { params: { id: string; personaId: string } }) {
  const [project, personas, initialMessages] = await Promise.all([
    getProject(params.id),
    getPersonasForProject(params.id),
    getChatMessages(params.personaId),
  ])

  const persona = personas.find(p => p.id === params.personaId)
  if (!persona || !project) redirect(`/projects/${params.id}`)

  return (
    <div className="h-screen flex">
      <PersonaSidebar persona={persona} projectId={params.id} />
      <div className="flex-1 flex flex-col">
        <ChatClient
          persona={persona}
          projectId={params.id}
          initialMessages={initialMessages}
        />
      </div>
    </div>
  )
}
```

Create `app/projects/[id]/chat/[personaId]/ChatClient.tsx`:

```typescript
'use client'

import { useState } from 'react'
import type { Persona, ChatMessage } from '@/lib/personas/types'
import { ChatMessages } from '@/components/chat/ChatMessages'
import { ChatInput } from '@/components/chat/ChatInput'
import { SuggestedPrompts } from '@/components/chat/SuggestedPrompts'

interface ChatClientProps {
  persona: Persona
  projectId: string
  initialMessages: ChatMessage[]
}

export function ChatClient({ persona, projectId, initialMessages }: ChatClientProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [loading, setLoading] = useState(false)

  async function handleSend(text: string) {
    setLoading(true)

    // Optimistic user message
    const tempUser: ChatMessage = {
      id: `temp-${Date.now()}`,
      persona_id: persona.id,
      project_id: projectId,
      role: 'user',
      content: text,
      persona_voice: null,
      reasoning: null,
      product_action: null,
      confidence_level: null,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUser])

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persona_id: persona.id, project_id: projectId, message: text }),
    })
    const { message: assistantMsg } = await res.json()
    setMessages(prev => [...prev.filter(m => m.id !== tempUser.id), tempUser, assistantMsg])
    setLoading(false)
  }

  return (
    <>
      <ChatMessages messages={messages} avatarUrl={persona.avatar_url} loading={loading} />
      <SuggestedPrompts onSelect={handleSend} disabled={loading} />
      <ChatInput onSend={handleSend} loading={loading} />
    </>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add components/chat/ app/projects/
git commit -m "feat: add persona chat with 4-layer structured responses"
```

---

## Task 14: Dashboard

**Files:**
- Create: `app/dashboard/page.tsx`

- [ ] **Step 1: Create dashboard**

Create `app/dashboard/page.tsx`:

```typescript
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProjects } from '@/lib/db/queries'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const projects = await getProjects()

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">UserPersonas</h1>
            <p className="text-sm text-zinc-500 mt-1">{user.email}</p>
          </div>
          <div className="flex gap-3 items-center">
            <Link href="/projects/new">
              <Button>+ New project</Button>
            </Link>
            <form action="/auth/signout" method="post">
              <button className="text-sm text-zinc-400 hover:text-zinc-600">Sign out</button>
            </form>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-zinc-200 rounded-2xl">
            <p className="text-zinc-400 text-sm mb-4">No projects yet</p>
            <Link href="/projects/new">
              <Button variant="outline">Create your first project →</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map(project => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div className="bg-white rounded-2xl border border-zinc-100 p-5 hover:border-zinc-300 transition-colors cursor-pointer">
                  <div className="flex items-baseline justify-between">
                    <h2 className="font-semibold text-zinc-900">{project.name}</h2>
                    <span className="text-xs text-zinc-400">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {project.category && (
                    <span className="inline-block mt-2 text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded">
                      {project.category}
                    </span>
                  )}
                  <p className="text-sm text-zinc-500 mt-2 line-clamp-2">{project.product_context}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

Add sign-out route. Create `app/auth/signout/route.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_SITE_URL!))
}
```

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/ app/auth/signout/
git commit -m "feat: add dashboard with project list"
```

---

## Task 15: Deploy to Vercel

- [ ] **Step 1: Push to GitHub**

```bash
git remote add origin https://github.com/yaskpatel03/userpersonas.git
git push -u origin main
```

- [ ] **Step 2: Import project in Vercel**

1. Go to vercel.com → Add New Project → Import from GitHub → select `userpersonas`
2. Framework: Next.js (auto-detected)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project settings
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings
   - `GEMINI_API_KEY` — from aistudio.google.com
   - `NEXT_PUBLIC_SITE_URL` — your Vercel deployment URL (add after first deploy)

- [ ] **Step 3: Configure Supabase Auth redirect URLs**

In Supabase dashboard → Authentication → URL Configuration:
- Site URL: `https://your-vercel-url.vercel.app`
- Redirect URLs: `https://your-vercel-url.vercel.app/auth/callback`

- [ ] **Step 4: Verify deployment**

Visit your Vercel URL → sign up → create a project → generate personas → chat.

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete MVP — questionnaire, personas, chat, auth, deployed"
git push
```

---

## Self-Review Checklist

### Spec coverage

| Spec requirement | Covered in task |
|---|---|
| Auth (email + Google OAuth) | Task 6 |
| 3-step questionnaire (50/50 split) | Task 11 |
| Product context + category pills | Task 11 Step 4 |
| Optional fields (geography, user type, workflows, constraints) | Task 11 Step 5 |
| Known assumptions field | Task 11 Step 6 |
| Two-stage Gemini pipeline | Task 9 |
| 2–4 personas with confidence tagging | Task 8 (prompts) + Task 9 |
| Persona carousel (swipe, arrows, keyboard) | Task 12 Step 6 |
| Persona hero with gradient + avatar + quote | Task 12 Step 3 |
| Trait pills color-coded | Task 12 Step 2 |
| Tabbed content (goals, pain points, behaviors, design) | Task 12 Step 4 |
| Confidence bar | Task 12 Step 1 |
| Chat with 4-layer structured responses | Task 13 Step 2 |
| Suggested prompts | Task 13 Step 4 |
| Persona sidebar in chat | Task 13 Step 1 |
| Dashboard (project list) | Task 14 |
| Supabase DB schema + RLS | Task 4 |
| randomuser.me deterministic avatars | Task 3 |
| Vercel deployment | Task 15 |
| Edit context + regenerate | ⚠ Not yet — add Task 16 |

### Missing: Edit context + Regenerate

---

## Task 16: Edit Context + Regenerate

**Files:**
- Modify: `app/projects/[id]/page.tsx`
- Create: `app/projects/[id]/regenerate/route.ts`

- [ ] **Step 1: Add regenerate API route**

Create `app/api/projects/[id]/regenerate/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { generatePersonas } from '@/lib/gemini/generatePersonas'
import { savePersonas, deletePersonasForProject, getProject, updateProjectContext } from '@/lib/db/queries'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  if (body.product_context) {
    await updateProjectContext(params.id, body.product_context)
  }

  const project = await getProject(params.id)
  await deletePersonasForProject(params.id)
  const personas = await generatePersonas(project)
  const saved = await savePersonas(params.id, personas)

  return NextResponse.json({ personas: saved })
}
```

- [ ] **Step 2: Add regenerate button to project page**

Add a `RegenerateClient` component at `app/projects/[id]/RegenerateClient.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function RegenerateClient({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleRegenerate() {
    setLoading(true)
    await fetch(`/api/projects/${projectId}/regenerate`, { method: 'POST' })
    router.refresh()
    setLoading(false)
  }

  return (
    <Button variant="outline" onClick={handleRegenerate} disabled={loading} size="sm">
      {loading ? 'Regenerating...' : 'Regenerate'}
    </Button>
  )
}
```

Import and add `<RegenerateClient projectId={params.id} />` next to the back link in `app/projects/[id]/page.tsx`.

- [ ] **Step 3: Commit**

```bash
git add app/api/projects/ app/projects/
git commit -m "feat: add regenerate personas endpoint and button"
git push
```
