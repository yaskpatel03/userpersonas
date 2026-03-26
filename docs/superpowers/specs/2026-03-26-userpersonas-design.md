# UserPersonas MVP — Design Document
**Date:** 2026-03-26
**Status:** Approved for implementation

---

## 1. Product Statement

> Create evidence-aware personas from product context, then let teams test product decisions by talking to them.

The product is **not** a persona card generator. It is an **evidence-aware persona simulator** that helps solo founders, PMs, designers, and UX researchers turn product context into actionable personas, then interrogate those personas with practical product questions.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Frontend + Backend | Next.js 14 (App Router) + TypeScript |
| UI Components | shadcn/ui + Tailwind CSS |
| AI | Claude API (Anthropic) — claude-sonnet-4-6 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Deployment | Vercel |
| Avatars | randomuser.me API |

---

## 3. Architecture

### AI Pipeline (two-stage streaming)

**Stage 1 — Parse & Segment** (Next.js API route → Claude)
- Input: raw product context + optional fields
- Output: structured JSON — product domain, user segments, key risks, trust level, emotional pressures
- Streams progress to client

**Stage 2 — Build Personas** (Next.js API route → Claude)
- Input: Stage 1 output + full context
- Output: 2–4 persona objects matching the persona schema
- Each attribute tagged: `grounded | inferred | assumption`
- Streams persona cards one by one as they complete

**Chat** (Next.js API route → Claude, streaming)
- System prompt includes full persona object + product context
- Each response structured in 4 layers: persona voice → why → product action → confidence
- Intent classified internally: reaction / objection / needs / improvement mode

### Data Model (Supabase / PostgreSQL)

```
users
  id, email, created_at

projects
  id, user_id, name, product_context, category, geography,
  user_type, key_workflows, constraints, known_assumptions,
  created_at, updated_at

personas
  id, project_id, name, label, summary, avatar_url,
  core_job, context, behaviors[], goals[], pain_points[],
  motivations[], fears[], constraints[], product_expectations[],
  abandonment_triggers[], design_implications[],
  confidence_overall (grounded|inferred|assumption),
  confidence_metadata (JSON per field),
  created_at

chat_messages
  id, persona_id, project_id, role (user|assistant),
  content, persona_voice, reasoning, product_action,
  confidence_level, created_at
```

---

## 4. User Flow

### Step 1 — Auth
- Sign up / log in via Supabase Auth (email + Google OAuth)
- Redirects to dashboard on success

### Step 2 — Create Project (50/50 split-screen questionnaire)
Three-step questionnaire with progress bar. Left side = form. Right side = static persona preview panel showing 2–3 placeholder persona cards (blurred, low opacity) that sharpen and gain detail as the user fills in more context — a visual hint of what's coming.

**Step 1 of 3 — Product context**
- Large textarea: what the product is, who it's for, what problem it solves, key user actions
- Product category pills (Banking, Healthcare, SaaS, Marketplace, Education, Enterprise, Other)

**Step 2 of 3 — Optional context**
- Geography / market (pill selection)
- User type (pill selection)
- Key workflows (pill selection: signup, verification, checkout, etc.)
- Constraints (pill selection: low trust, mobile-first, compliance-heavy, etc.)

**Step 3 of 3 — Known assumptions**
- Free text: "What do you already believe about your users?"
- Labelled as assumptions in output — not facts

### Step 3 — Persona Generation
- Full-screen loading state with streaming progress
- "Analysing your product context..." → "Detecting user segments..." → "Building personas..."
- Personas appear one by one as they stream in

### Step 4 — Persona Carousel (Screen 2)
- One persona at a time, full card view
- Left/right arrows + swipe + keyboard navigation
- Progress dots
- Each card has:
  - **Hero section** — gradient header, randomuser.me avatar, name, label, age/context, first-person quote, confidence badge
  - **Trait pills** — color-coded (red = risk, yellow = caution, green = positive, blue = urgency)
  - **Tabbed content** — Goals & Context / Pain Points & Fears / Behaviors / Design Implications
  - **Confidence bar** — visual meter with explanatory note (grounded vs inferred)
  - **Chat button** — "Chat with [name] →"
- Top controls: Regenerate, Edit context

### Step 5 — Persona Chat (Screen 3)
Split layout:
- **Left panel (fixed)** — persona avatar, name, label, primary goal, main blocker, confidence warning badge, "← Back to personas" link
- **Right panel** — chat interface with:
  - Structured responses: persona voice block → why block → product action block (green) → confidence note
  - Suggested prompt chips updated contextually after each response
  - Streaming responses

### Editing
- Edit product context → re-run generation (keeps chat history)
- Rename persona
- Pin / delete persona
- Progress always saved — resume across sessions

---

## 5. UI Design Language

- **Style:** Clean, minimal, professional. shadcn/ui components. Tailwind CSS.
- **Colors:** Black/white primary. Semantic badges — yellow (inferred), green (grounded), red (assumption-heavy). Gradient persona headers (distinct per persona).
- **Typography:** System UI. Bold section labels (10px uppercase). 13–14px body.
- **Layout:** 50/50 split for questionnaire. Full-width carousel for personas. Split (260px + flex) for chat.
- **Avatars:** randomuser.me API — portrait number deterministically selected by hashing persona name to a number 1–99, with gender inferred from persona context. Consistent across page loads.
- **Animations:** Personas stream in one by one. Subtle fade between carousel cards.

---

## 6. Persona Schema (full)

Each generated persona includes:

| Field | Type | Confidence-tagged |
|---|---|---|
| name | string | no |
| label | string | no |
| summary | string | yes |
| avatar_url | string | no |
| quote | string | yes |
| core_job | string | yes |
| context | string | yes |
| behaviors | string[] | yes |
| goals | string[] | yes |
| pain_points | string[] | yes |
| motivations | string[] | yes |
| fears | string[] | yes |
| constraints | string[] | yes |
| product_expectations | string[] | yes |
| abandonment_triggers | string[] | yes |
| design_implications | string[] | yes |
| confidence_overall | grounded \| inferred \| assumption | — |
| confidence_note | string | — |

---

## 7. Chat Response Structure

Every chat response returns 4 layers:

1. **Persona voice** — first-person answer from persona's POV
2. **Why** — reasoning grounded in persona's context, fears, goals
3. **Product action** — concrete team recommendation
4. **Confidence** — grounded / partly inferred / assumption-heavy

Intent is classified internally (reaction / objection / needs / improvement) and shapes the response framing.

---

## 8. Guardrails

- Never present personas as real people — always labelled "generated persona" or "inferred profile"
- Always show confidence level — no output without a confidence note
- No invented statistics or false precision
- No demographic filler not tied to product behavior
- Avoid harmful stereotypes — especially finance, immigration, healthcare
- If context is too vague: narrow intelligently and explain assumptions made
- 2–4 personas max — merge overlapping segments

---

## 9. Data Persistence

Per project, store:
- Original product context + optional inputs
- Generated personas (versioned)
- Chat history per persona
- Confidence/assumption metadata

---

## 10. MVP Scope (build this)

- Auth (email + Google OAuth)
- Project creation (3-step questionnaire)
- Two-stage streaming persona generation
- Persona carousel with full detail tabs
- Persona chat with structured 4-layer responses
- Suggested chat prompts
- Edit context + regenerate
- Save and resume

## Out of scope for MVP

- Team collaboration
- Export (PDF, Figma)
- Multiple persona versions / history
- Templates
- Integrations
- Billing / plans

---

## 11. Success Criteria

MVP is working when users say:
- "These personas are believable"
- "The chat helped me identify issues in my product flow"
- "The system exposed assumptions I hadn't noticed"
- "This was more useful than a static persona template"
