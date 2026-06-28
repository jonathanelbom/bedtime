# Bedtime

An AI-powered rhythm-section consultant for music producers. Built with Nuxt 4, GPT-4o streaming, and a strong opinionated persona.

---

## What It Is

**Bedtime** is a web app that generates a bespoke AI rhythm-section assistant calibrated to your exact sonic world. You describe a moment in your track—genre, mood, time of day, movement, DAW, and instrument—and the AI creates a custom assistant voice (with its own name, reference universe, and metaphor vocabulary), then streams back structured production guidance: tempo, drums, bass, chords, keys, the expressive texture layer (guitar / synths / piano / etc.), and what to avoid.

This is a portfolio piece showcasing a non-trivial AI product: a two-stage pipeline (personalized prompt generation + structured streaming), strong product design (opinionated voice, specific reference universe), and careful frontend architecture (progressive disclosure, session persistence, mock mode for testing).

---

## How It Works

1. **Form** (`/`) — You fill a series of chip-select fields one at a time. Each unlocks the next as you answer: Time of Day (9 options) → Movement (8) → Mood (14, multi-select) → Genre (27+, with free-text option) → Instrument (optional) → DAW (6+). This progressive disclosure keeps the form focused and the scope clear.

2. **Generate & Stream** (`/loading`) — Two async calls happen in sequence:
   - First, `POST /api/generate-prompt` synthesizes your preferences into a fully custom AI persona — a generated name, voice calibration (derived from genre + time + movement + mood), and inferred reference universe — then returns this as a personalized system prompt.
   - Then, `POST /api/chat` uses that persona as the system prompt and streams the AI response as raw JSON tokens while you watch rotating groove-flavored loading messages ("calibrating the pocket", "locking in the feel", etc.).

3. **Explore Results** (`/sections`) — A grid of 7 cards, one for each section (tempo, drums, bass, chords, keys_scales, guitar, avoid). Each shows the AI-generated title and a preview of the feel.

4. **Deep Dive** (`/sections/[key]`) — Full detail for each section: feel (movement language), Ableton tip (concrete DAW action), and optionally a song reference. Pill-based navigation lets you jump between sections.

---

## Technical Highlights

**Two-stage AI pipeline** — The form inputs alone aren't enough context for a custom, genre-aware AI voice. `POST /api/generate-prompt` sends the user's preferences (genre, mood, time, movement, DAW, instrument) to GPT-4o with a meta-prompt that instructs the model to author a complete system prompt from scratch. This generated persona is then passed to the chat API. This is a non-trivial prompt-engineering pattern that yields massively better quality than filling a template.

**Generated AI persona** — Every user gets a different AI. GPT-4o doesn't fill a template — it authors a complete system prompt from scratch for each session. The generated persona includes: a custom name and creative identity derived from the user's sonic world; voice calibration, where the assistant's tempo of language, metaphor vocabulary, and tonal register emerge from genre + time of day + movement + mood as a unified sonic moment (e.g., lo-fi + late night + drift + reflective → hazy, interior, few words carry weight; house + night + bounce + euphoric → kinetic, forward-leaning, pulse-driven); a synthesized genre ecosystem that synthesizes rather than parrots (e.g., "indie pop + funk + synthwave" becomes "a groove-aware pop environment with a nocturnal electronic edge"); an inferred reference universe, tastefully assembled rather than mirroring user inputs; and Section 6 adapted to the user's instrument (guitar → "Human Air in the Machine", synths → "Human Air in the Grid", piano → "Breath Between the Lines"). The underlying Neiliyo creative philosophy (feel over theory, restraint, metaphor, collaboration not instruction) is preserved as the DNA across all generated personas.

**Structured JSON streaming** — GPT-4o responds with raw JSON (never markdown). The client parses the stream in real time as tokens arrive, with a `jsonrepair` fallback for incomplete JSON. This is more complex than text streaming but yields better structured output.

**Progressive disclosure form** — Fields unlock sequentially via Vue `watch()` + `nextTick` scroll-into-view with CSS transitions. No form library—just declarative Vue. The UX keeps users focused and the scope feeling manageable.

**Session store** — `useSessionStore` (Nuxt `useState`) holds preferences + structured response across navigation. A `preferencesChanged` dirty-check prevents redundant API calls if you navigate back to the form without changing anything.

**Mock AI mode** — Set `MOCK_AI=true` in `.env` to stream pre-written fixtures instead of calling OpenAI. The full UI is testable without an API key, and development is fast.

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
    generate-prompt.post.ts # GPT-4o generates custom assistant persona
    chat.post.ts            # OpenAI SSE streaming endpoint
  utils/
    metaPrompt.ts           # Meta-prompt that instructs GPT-4o to generate custom persona
    normalizeUserContext.ts # Maps raw form input into structured context for meta-prompt
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
