# UserPersonas — Product Requirements Document

## Overview

UserPersonas is an AI-powered persona simulator that helps product teams generate evidence-aware user personas and have structured conversations with them. Instead of relying on static personas, teams can ask their personas questions and get grounded, in-character responses that cite behavioral motivations and produce actionable product recommendations.

---

## Problem

Product teams make decisions based on assumptions about users. Traditional personas are:
- Created once and forgotten
- Filled with made-up statistics and vague archetypes
- Impossible to interrogate or stress-test
- Disconnected from real product decisions

---

## Solution

UserPersonas generates 2–4 AI personas from a product description, then lets teams chat with each persona. Every response is grounded in the persona's stated goals, fears, and constraints — and includes a product action recommendation.

---

## User Stories

### Project Creation
- As a PM, I can describe my product in plain text so the system generates relevant user segments
- As a PM, I can optionally specify geography, user type, key workflows, and known constraints to improve persona quality
- As a PM, I can name my project and note known team assumptions before generating

### Persona Generation
- As a PM, I can see 2–4 personas with names, roles, goals, pain points, fears, and design implications
- As a PM, I can see a confidence level (grounded / inferred / assumption) for each persona so I know what's evidence-based vs. extrapolated
- As a PM, I can navigate between personas in a carousel
- As a PM, I can regenerate personas if the output isn't useful
- As a PM, I can update the product context and regenerate to refine personas over time

### Chat (Persona Simulation)
- As a PM, I can chat with any persona and get first-person in-character responses
- As a PM, I can see why the persona responded that way (linked to their goals/fears)
- As a PM, I can see a concrete product action for each response
- As a PM, I can use suggested prompts to get started quickly

### Authentication
- As a user, I can sign up and log in with email/password or Google OAuth
- As a user, my projects and personas are private to my account

---

## Core Features

| Feature | Description |
|--------|-------------|
| 3-step questionnaire | Collects product context, market options, and assumptions |
| AI segmentation | Gemini identifies 2–4 distinct behavioral user segments |
| Persona generation | Each segment becomes a detailed persona with 15+ fields |
| Confidence tagging | Every attribute tagged: grounded / inferred / assumption |
| Persona carousel | Navigate between personas with keyboard/touch support |
| Chat simulation | Ask the persona anything; get structured in-character responses |
| Suggested prompts | One-click prompts to start the conversation |
| Regenerate | Refresh all personas; optionally update context first |
| Auth | Email/password + Google OAuth via Supabase |

---

## Out of Scope (MVP)

- Team collaboration / multi-user access
- PDF or JSON persona export
- Custom avatar uploads
- Persona version history
- Research artifact linking
- Custom AI model selection

---

## Success Metrics

- User can generate a full set of personas in under 5 minutes
- Chat responses are specific, grounded, and actionable
- Confidence tagging is accurate and builds trust
- Product teams use personas in actual design and roadmap decisions

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Next.js API Routes (server-side) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth (email + Google OAuth) |
| AI | Google Gemini 2.5 Flash |
| Deployment | Vercel |
| Testing | Vitest |
