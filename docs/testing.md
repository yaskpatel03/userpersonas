# UserPersonas — Testing & Setup Guide

## Local Installation

### Prerequisites
- Node.js 20+
- npm or pnpm
- A Supabase account
- A Google Gemini API key

### 1. Clone the repo

```bash
git clone https://github.com/yaskpatel03/userpersonas.git
cd userpersonas
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once the project is ready, go to **Settings → API Keys**
3. Copy the **Project URL** and **anon public** key

### 3. Run the database migration

1. Go to your Supabase project → **SQL Editor**
2. Paste and run the contents of `supabase/migrations/001_initial.sql`
3. Confirm: "Success. No rows returned"

### 4. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Where to get each:**
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase dashboard → Settings → API Keys → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase dashboard → Settings → API Keys → anon public
- `GEMINI_API_KEY` — [Google AI Studio](https://aistudio.google.com) → Get API key
- `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` for local dev

### 5. Configure Supabase Auth (for email signup)

Go to Supabase → **Authentication → Settings**:
- Disable **Confirm email** (for local dev without SMTP set up)
- This allows instant signup without needing to verify email

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Running Tests

```bash
# Run all tests (headless)
npm test

# Run tests with interactive UI
npm run test:ui
```

### Test files

| File | What it tests |
|------|--------------|
| `__tests__/avatar.test.ts` | Avatar URL generation — deterministic hashing of persona name to portrait index |
| `__tests__/prompts.test.ts` | Prompt template generation — correct fields are included based on input |

---

## Manual Testing Workflows

### Auth

| Scenario | Steps | Expected |
|----------|-------|----------|
| Sign up with email | Go to `/auth/login` → switch to Sign up → enter email + password → submit | Redirected to `/dashboard` |
| Log in with email | Go to `/auth/login` → enter credentials → submit | Redirected to `/dashboard` |
| Google OAuth | Click "Continue with Google" → complete OAuth | Redirected to `/dashboard` |
| Log out | Click sign out in dashboard | Redirected to `/auth/login` |
| Protected route | Visit `/dashboard` while logged out | Redirected to `/auth/login` |

### Project Creation

| Scenario | Steps | Expected |
|----------|-------|----------|
| Create project (minimal) | Dashboard → New project → Enter product description → Next → Next → Enter project name → Submit | Redirected to project page with 2–4 personas |
| Create project (full) | Fill all optional fields (category, geography, user type, workflows, constraints, assumptions) | Personas reflect the additional context |
| Missing required fields | Try to submit with no product context | Form validation prevents submission |
| Persona generation failure | Use an invalid Gemini API key | Error message shown on the questionnaire page |

### Persona Display

| Scenario | Steps | Expected |
|----------|-------|----------|
| Navigate carousel | Click arrows or dot indicators | Switches between personas smoothly |
| Keyboard navigation | Use arrow keys on the persona carousel | Navigates between personas |
| View persona tabs | Click Goals / Pain Points / Design / etc. tabs | Tab content switches correctly |
| Confidence indicator | Look at the confidence bar | Shows grounded / inferred / assumption |
| Trait pills | Check trait pills on each persona | Colored pills (neutral, risk, caution, positive, urgent) |

### Regenerate

| Scenario | Steps | Expected |
|----------|-------|----------|
| Regenerate personas | On project page → click Regenerate | New set of personas generated and displayed |
| Edit context + regenerate | Click "Edit context" → update description → regenerate | New personas reflect updated context |

### Chat

| Scenario | Steps | Expected |
|----------|-------|----------|
| Open chat | Click "Chat" on a persona | Chat page opens with persona sidebar |
| Use suggested prompt | Click a suggested prompt chip | Prompt appears in input and sends |
| Send a message | Type a message and press Enter or click Send | Persona responds in character |
| View persona reasoning | Read the "Why" section under assistant message | Reasoning cites persona's goals/fears |
| View product action | Read the "Product action" callout | Concrete recommendation shown |
| Chat history persists | Close and reopen chat | Previous messages still visible |

---

## API Endpoint Testing

All API routes require an authenticated session cookie. The easiest way to test them is via the browser (logged in) or with a tool like Bruno/Postman using the session cookie.

### `GET /api/projects`
Returns all projects for the current user.

```
Response 200:
{
  "projects": [
    {
      "id": "uuid",
      "name": "My App",
      "product_context": "...",
      "created_at": "2026-03-27T..."
    }
  ]
}
```

### `POST /api/projects`
Creates a new project.

```json
Request body:
{
  "name": "My App",
  "product_context": "A subscription tracker that...",
  "category": "Finance",
  "geography": "Canada",
  "user_type": "Consumer",
  "key_workflows": ["Adding a subscription", "Viewing total spend"],
  "constraints": ["Mobile only"],
  "known_assumptions": "We assume users are 25-40"
}
```

```
Response 201:
{ "project": { "id": "uuid", ... } }

Response 401: { "error": "Unauthorized" }
Response 400: { "error": "product_context is required" }
```

### `POST /api/generate`
Generates personas for a project. Calls Gemini (takes 5–15 seconds).

```json
Request body:
{ "project_id": "uuid" }
```

```
Response 200:
{ "personas": [ { "id": "uuid", "name": "Sarah Miller", ... } ] }

Response 401: { "error": "Unauthorized" }
Response 400: { "error": "project_id required" }
Response 500: { "error": "Generation failed: ..." }
```

### `POST /api/projects/[id]/regenerate`
Deletes existing personas and generates new ones. Optionally updates product context.

```json
Request body (optional):
{ "product_context": "Updated product description..." }
```

```
Response 200:
{ "personas": [ ... ] }
```

### `GET /api/chat?persona_id=uuid`
Returns the chat history for a persona.

```
Response 200:
{
  "messages": [
    { "id": "uuid", "role": "user", "content": "What do you think of X?", ... },
    { "id": "uuid", "role": "assistant", "content": "...", "reasoning": "...", "product_action": "...", ... }
  ]
}
```

### `POST /api/chat`
Sends a message and returns the persona's AI response.

```json
Request body:
{
  "persona_id": "uuid",
  "project_id": "uuid",
  "message": "What would make you abandon this product?"
}
```

```
Response 200:
{
  "message": {
    "id": "uuid",
    "role": "assistant",
    "content": "...",
    "persona_voice": "Honestly, if I had to...",
    "reasoning": "This aligns with her fear of...",
    "product_action": "Add a 30-day trial with clear cancellation...",
    "confidence_level": "high — directly tied to stated fears"
  }
}
```

---

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "Email rate limit exceeded" | Supabase limits auth emails | Disable email confirmation in Supabase Auth settings |
| "Check your email" shown after signup | Email confirmation is on | Disable it in Supabase Auth → Settings |
| Persona generation fails (500) | Gemini API key invalid or quota exceeded | Check your key at aistudio.google.com; try a different model if daily quota is hit |
| `MIDDLEWARE_INVOCATION_FAILED` on Vercel | Next.js 16 requires `proxy.ts` not `middleware.ts` | Already fixed — ensure `proxy.ts` exists with `export async function proxy()` |
| Build fails: prerender error on login page | Supabase client called at module level | Ensure `createClient()` is called inside event handlers, and `export const dynamic = 'force-dynamic'` is set |
| Google OAuth redirect fails | Redirect URL not in Supabase allowlist | Add `https://your-domain.com/**` to Supabase Auth → URL Configuration → Redirect URLs |

---

## Deployment Checklist (Vercel)

- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` in Vercel environment variables
- [ ] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel environment variables
- [ ] Set `GEMINI_API_KEY` in Vercel environment variables
- [ ] Set `NEXT_PUBLIC_SITE_URL` to your Vercel URL (e.g. `https://userpersonas.vercel.app`)
- [ ] Set Supabase Auth → Site URL to your Vercel URL
- [ ] Add `https://your-domain.vercel.app/**` to Supabase Auth → Redirect URLs
- [ ] Run DB migration (`001_initial.sql`) in Supabase SQL Editor
- [ ] Confirm deploy succeeds and root URL redirects to login
