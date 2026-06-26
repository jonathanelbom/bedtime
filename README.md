# Bedtime

An AI-powered rhythm-section consultant for music producers. Built with Nuxt 4, GPT-4o streaming, and a strong opinionated persona.

---

## What It Is

**Bedtime** is a web app that acts as an expert rhythm-section consultant for a specific sound: the **Neiliyo Future Yacht**. You describe a moment in your track—what time of day it feels like, the movement, the mood—and the AI streams back structured production guidance: tempo, drums, bass, chords, keys, guitar, and what to avoid. The persona is opinionated and restrained, speaking in feel and metaphor rather than music theory, and assumes you're working in **Ableton Live 11** with a live electric guitar.

This is a portfolio piece showcasing a non-trivial AI product: a two-stage pipeline (personalized prompt generation + structured streaming), strong product design (opinionated voice, specific reference universe), and careful frontend architecture (progressive disclosure, session persistence, mock mode for testing).

---

## How It Works

1. **Form** (`/`) — You fill 6 chip-select fields one at a time. Each unlocks the next as you answer: Time of Day → Movement → Mood → Genre → Instruments → DAW. This progressive disclosure keeps the form focused and the scope clear.

2. **Generate & Stream** (`/loading`) — Two async calls happen in sequence:
   - First, `POST /api/generate-prompt` builds a personalized system prompt from your preferences (form inputs + optional custom text fields).
   - Then, `POST /api/chat` streams the AI response as raw JSON tokens while you watch rotating groove-flavored loading messages ("calibrating the pocket", "locking in the feel", etc.).

3. **Explore Results** (`/sections`) — A grid of 7 cards, one for each section (tempo, drums, bass, chords, keys_scales, guitar, avoid). Each shows the AI-generated title and a preview of the feel.

4. **Deep Dive** (`/sections/[key]`) — Full detail for each section: feel (movement language), Ableton tip (concrete DAW action), and optionally a song reference. Pill-based navigation lets you jump between sections.

---

## Technical Highlights

**Two-stage AI pipeline** — The form inputs alone aren't enough context for the AI to sound like Neiliyo. `POST /api/generate-prompt` synthesizes them into a rich, personalized system prompt (e.g., "the user chose drift, so emphasize space and openness...") before the main generation call. This is a non-trivial prompt-engineering pattern that significantly improves response quality.

**Structured JSON streaming** — GPT-4o responds with raw JSON (never markdown). The client parses the stream in real time as tokens arrive, with a `jsonrepair` fallback for incomplete JSON. This is more complex than text streaming but yields better structured output.

**Progressive disclosure form** — 7 sections unlock sequentially via Vue `watch()` + `nextTick` scroll-into-view with CSS transitions. No form library—just declarative Vue. The UX keeps users focused and the scope feeling manageable.

**Session store** — `useSessionStore` (Nuxt `useState`) holds preferences + structured response across navigation. A `preferencesChanged` dirty-check prevents redundant API calls if you navigate back to the form without changing anything.

**Mock AI mode** — Set `MOCK_AI=true` in `.env` to stream pre-written fixtures instead of calling OpenAI. The full UI is testable without an API key, and development is fast.

**Opinionated persona** — Not a generic ChatGPT wrapper. The AI has a name (Neiliyo Rhythm Section GPT), a reference universe (specific artists), a defined voice (feel/metaphor, no theory jargon), and clear constraints (Ableton Live, one guitar, stock instruments, simplicity, space).

---

## Stack

- **Nuxt 4** (Vue 3, TypeScript strict mode)
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **shadcn-nuxt** + **reka-ui** for component library
- **OpenAI GPT-4o** with SSE streaming
- **@vueuse/core** for Vue utilities
- **jsonrepair** for robust JSON parsing
- **Vercel** for deployment

---

## Project Structure

```
app/
  pages/
    index.vue               # Preferences form (progressive disclosure)
    loading.vue             # Async pipeline + streaming
    sections/index.vue      # Section grid summary
    sections/[key].vue      # Section detail with pill nav
  components/
    SplashScreen.vue        # Entry animation
    PrefChips.vue           # Preference summary
    AnimatedMessage.vue     # Loading message carousel
    ui/                     # shadcn-nuxt components
  composables/
    useSessionStore.ts      # Session state (preferences + response)
    useChat.ts              # SSE streaming composable
  types/
    chat.ts                 # TypeScript types for AI response shape
  utils/
    parseResponse.ts        # JSON parsing with fallbacks
    pageColors.ts           # Section-specific color map

server/
  api/
    generate-prompt.post.ts # Build personalized system prompt
    chat.post.ts            # OpenAI SSE streaming endpoint
  utils/
    systemPrompt.ts         # Neiliyo persona definition
    mockChat.ts             # Mock streaming fixtures
    responseFormat.ts       # Response validation & shape

docs/
  APP_ARCHITECTURE_PLAN.md
  STRUCTURED_RESPONSE_PLAN.md
  CHAT_MVP_PLAN.md
  system-prompt.md          # Full persona spec
  playlist.md               # Reference tracks + notes
```

---

## Getting Started

### Prerequisites

Node.js 18+ and npm. An OpenAI API key (or use mock mode during development).

### Install & Run

```bash
# Clone the repo
git clone <repo>
cd bedtime

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your OPENAI_API_KEY to .env

# Start dev server
npm run dev
```

Open `http://localhost:3000` in your browser.

### Mock AI Mode

To test the full UI without an OpenAI API key:

```bash
# In .env, set:
MOCK_AI=true

# Then run:
npm run dev
```

The app will stream pre-written fixtures. Useful for rapid UI iteration and testing the streaming logic.

---

## Production Build

```bash
npm run build
npm run preview
```

---

## Deploy to Vercel

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Import the project in Vercel
3. Add environment variable: `OPENAI_API_KEY=<your-key>`
4. Deploy

The app will be live at your Vercel domain.

---

## Development Notes

- **Page Transitions** — `definePageMeta({ pageIndex })` on each page drives animated transitions via Nuxt's built-in page key.
- **Debug JSON Panels** — Two JSON viewers (in `/sections` and `/sections/[key]`) are gated with `v-if="import.meta.dev"` and tree-shaken from production.
- **Colors by Section** — `utils/pageColors.ts` maps each section to a Tailwind color (`bg-blue-950`, etc.) for visual continuity.
- **Streaming Response Parser** — `utils/parseResponse.ts` attempts direct JSON parse, falls back to `jsonrepair`, then tries extracting from markdown code blocks.

---

## License

MIT
