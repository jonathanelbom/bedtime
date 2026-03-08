# App Architecture Plan — Neiliyo Rhythm Section GPT

*Retroactively documented from the codebase. Captures the decisions made during initial scaffold and the Nuxt 4 rebuild.*

---

## What We're Building

A web app for a specific creative use case: helping a producer (Neiliyo) get rhythm section guidance for a specific sound — the **Neiliyo Future Yacht** style. The app takes a vibe description and turns it into structured, actionable production guidance tailored to Ableton Live 11 Suite.

The core challenge was **presentation**: raw AI chat output is hard to scan when you're looking for specific production decisions. This guided the entire architecture toward a structured, section-by-section output.

---

## Stack Decisions

### Nuxt 4 (Vue 3, TypeScript strict, SSR)
Chosen for:
- **File-based routing** — clean URL structure maps naturally to the app's linear flow
- **SSR capability** — future-proofs SEO and initial load if the app becomes more public-facing
- **`app/` directory structure** — Nuxt 4's new layout keeps pages, composables, components, and utils clearly separated
- **`useState()`** — built-in state that persists across route changes without requiring a full store library like Pinia

### Tailwind CSS v4 via `@tailwindcss/vite`
- v4's Vite plugin is faster and config-lighter than v3
- CSS custom properties (`--page-bg`, `--page-transition-ms`) make dynamic theming simple — page background colors are set via JS before each navigation to drive smooth transitions

### shadcn-nuxt + reka-ui
- Unstyled-first component library — gives good accessible primitives without fighting a design system
- Components live in `app/components/ui/` and can be customized freely
- Follows shadcn conventions: `cn()` (clsx + tailwind-merge) for conditional class merging

### OpenAI SDK (`gpt-4o`, SSE streaming)
- `gpt-4o` chosen for quality of creative/metaphorical output matching the persona
- SSE streaming (Server-Sent Events) chosen over WebSocket or polling because:
  - One-directional (server → client) which is all we need
  - Native browser support via `ReadableStream`
  - Simple server implementation — no persistent connection management
  - Streams JSON in real-time, letting the UI show progress during generation

---

## Page Structure

Three main views with a clear linear flow, plus chat:

```
/ (Setup)
  ↓ submit
/sections (Overview grid)
  ↓ tap a card
/sections/[key] (Section detail — 7 possible: tempo, drums, bass, chords, keys_scales, guitar, avoid)
  ↔ Chat button (any section page)
/chat (Continuing conversation)
```

### Why this structure instead of a single-page app?
- Each view has a distinct purpose and benefits from a dedicated URL (bookmarkable, back-navigable)
- The push/pop transition system makes the linear flow feel natural on mobile and desktop
- Separating setup from output keeps the generation moment clean — the user intentionally submits to move forward

---

## Page Transition System

Pages use a `pageIndex` to determine transition direction:
- Higher index → push (slide in from right, previous page slides left)
- Lower index → pop (slide out to right, previous page slides in from left)
- Equal index → fade (used for same-level changes)

| Route | pageIndex |
|---|---|
| Setup (`/`) | 0 |
| Sections overview (`/sections`) | 1 |
| Section detail (`/sections/[key]`) | 2–8 (index within SECTION_ORDER) |
| Chat (`/chat`) | 9 |

Transition duration scales with viewport width to maintain consistent perceived speed — wider screens get proportionally more time (clamped 250–650ms).

---

## State Management

Nuxt's `useState()` with named keys — no external store library needed:
- **`preferences`** — the form inputs (vibe, time, movement, mood)
- **`committedPreferences`** — snapshot at submit time, used to detect if the user changed inputs
- **`structuredResponse`** — the parsed AI response, drives all section pages
- **`initialMessage`** — the formatted user message passed from setup to sections page to kick off the API call
- **`chat:messages`**, **`chat:isLoading`**, **`chat:contextInjected`** — persistent chat state

Key behavior: state is **client-side only** and does not persist across page reloads. This keeps the app simple — the session is intentional and ephemeral.

---

## SSE Streaming Pattern

Server (`server/api/chat.post.ts`) emits:
```
data: {"content": "chunk"}\n\n
data: [DONE]\n\n
```

Client reads via `response.body.getReader()`, decodes chunks, accumulates content, and reactively updates UI. The sections overview page accumulates the full JSON before parsing. The chat page accumulates plain text directly.

### Mock API mode
`NUXT_MOCK_AI=true` in `.env.local` bypasses OpenAI and streams pre-written fixtures — enables full UI development without API costs. Logic lives in `server/utils/mockChat.ts`.

---

## Design Decisions

### Dark theme only
No light mode. The app is for a specific producer with a specific aesthetic — the dark palette with distinct per-page background colors is a deliberate design choice, not a theme toggle.

### Per-page background colors
Each route has a unique dark background color (set on `document.documentElement` as `--page-bg`). Colors are applied before navigation so the transition fades between page colors smoothly. Three palette options are defined (original, medium, high tint intensity) — switchable by changing one constant in `pageColors.ts`.

### No music theory jargon
Hard rule in the system prompt and the UI copy. The app is for producers who think in feel and texture, not theory. This constraint shapes both the AI persona and the UX writing throughout.

### Deployment
Vercel, using the `nuxtjs` framework preset. Nuxt's server routes (`server/api/`) deploy as Vercel serverless functions automatically.
