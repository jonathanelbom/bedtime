# CLAUDE.md — Bedtime / Neiliyo Rhythm Section GPT

## Project Overview

A Nuxt 4 web app that acts as an AI rhythm-section consultant for the **Neiliyo Future Yacht** sound. Users describe a vibe; the app streams back structured production guidance (tempo, drums, bass, chords, keys, guitar, what to avoid) tailored to Ableton Live 11 Suite.

The AI persona is **Neiliyo Rhythm Section GPT** — speaks in feel and metaphor, never music theory jargon, always confident and restrained.

## Stack

- **Nuxt 4** (Vue 3, SSR) with TypeScript strict mode
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **shadcn-nuxt** + **reka-ui** for UI components
- **OpenAI SDK** (`gpt-4o`, SSE streaming)
- **@vueuse/core** for Vue utilities
- **jsonrepair** for robust JSON parsing of AI output

## Commands

```bash
npm run dev       # dev server (http://localhost:3000)
npm run build     # production build
npm run preview   # preview production build
```

## Project Structure

```
app/
  pages/
    index.vue               # Preferences form (vibe, time, movement, mood)
    sections/index.vue      # Section grid — triggers API call on mount
    sections/[key].vue      # Section detail (tempo | drums | bass | chords | keys_scales | guitar | avoid)
  composables/
    useChat.ts              # SSE streaming composable
    useSessionStore.ts      # Session state (preferences + structured response)
    useRouteTransitionState.ts
  components/ui/            # shadcn components (Button, Card, Dialog, Badge, Input)
  types/chat.ts             # Message, StructuredResponse, SectionKey types
  utils/parseResponse.ts    # JSON parsing with jsonrepair fallback
  assets/css/tailwind.css

server/
  api/chat.post.ts          # OpenAI streaming endpoint (POST /api/chat)
  utils/systemPrompt.ts     # Active system prompt (source of truth for AI behavior)
  utils/mockChat.ts         # Mock streaming fixtures for development

docs/
  system-prompt.md          # Full system prompt spec
  system-prompt-optimized.md # Condensed working version
  playlist.md               # Reference playlist + AI persona notes
```

## AI Response Schema

The AI always responds with JSON only — never markdown. Two shapes:

```ts
// When more info is needed:
{ type: "questions", questions: string[] }

// Full guidance:
{ type: "response", sections: { tempo, drums, bass, chords, keys_scales, guitar, avoid } }
// Each section: { title, feel, ableton_tip, reference?: string | null }
```

Parsing is in `app/utils/parseResponse.ts` with multiple fallbacks (direct parse → jsonrepair → extract from markdown blocks).

## SSE Streaming Pattern

Server emits: `data: {"content": "chunk"}\n\n`, closes with `data: [DONE]\n\n`

Client reads via `response.body.getReader()` in `useChat.ts`. The sections page (`pages/sections/index.vue`) has its own inline streaming logic — it does not use `useChat`.

## Session State

Uses Nuxt's `useState()` — client-side only, not persisted across page reloads. State lives in `useSessionStore`. If session is empty on `/sections`, the page redirects to `/`.

## Dev: Mock API

Set `NUXT_MOCK_AI=true` in `.env.local` to bypass OpenAI and stream pre-written fixtures:
- 1 user message → questions fixture
- 3+ messages → full sections fixture

See `server/utils/mockChat.ts`.

## Conventions

- Dark theme only — all pages use dark backgrounds (zinc/slate/stone-950)
- No music theory jargon in UI copy or AI output (unless user asks)
- Section order is fixed: `tempo → drums → bass → chords → keys_scales → guitar → avoid`
- All UI components go in `app/components/ui/` following shadcn patterns
- `cn()` utility (clsx + tailwind-merge) for conditional class merging
