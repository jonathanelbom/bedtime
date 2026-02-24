# Decisions

Key architectural and design decisions made in this project.

---

## 2026-02-23 — Strict JSON-only AI responses

**Decision:** System prompt enforces JSON-only output — no markdown, no prose.
**Why:** Enables the UI to render each section independently with structured components (cards, labels, Ableton tips). Freeform text would require fragile parsing.
**Trade-off:** Requires `jsonrepair` fallback for slightly malformed output; AI occasionally breaks schema under ambiguous prompts.

---

## 2026-02-23 — SSE streaming over request/response

**Decision:** Stream AI responses via Server-Sent Events using Nuxt's `sendStream()` and the OpenAI SDK's async iterator.
**Why:** Streaming gives real-time feedback during the ~5–15s generation window. Without it, the user stares at a blank screen.
**Trade-off:** More complex client-side parsing (SSE line format, `[DONE]` signal, partial JSON accumulation); no AbortController yet so stop() is cosmetic only.

---

## 2026-02-23 — Session state via useState (no persistence)

**Decision:** All state (preferences, structured response) lives in Nuxt `useState()` — cleared on page reload.
**Why:** Keeps the app stateless and simple. Each session is intentionally ephemeral — the user starts fresh each time.
**Trade-off:** Reload loses progress; acceptable for current use case.

---

## 2026-02-23 — Sections page owns its own streaming logic

**Decision:** `pages/sections/index.vue` calls `/api/chat` directly and manages its own streaming/parsing, rather than using `useChat`.
**Why:** The sections page has different post-stream behavior (parse structured JSON → store in session) that doesn't fit the generic `useChat` composable model.
**Trade-off:** Some duplication of SSE reading logic between `useChat` and the sections page.

---

## 2026-02-23 — shadcn-nuxt as UI component library (over PrimeVue)

**Decision:** Use shadcn-nuxt + reka-ui as the component foundation instead of PrimeVue or building from scratch.
**Why:** Wanted an existing component set to avoid hand-rolling primitives. Between PrimeVue and shadcn-vue, shadcn-vue won primarily because of better MCP tooling support — meaning AI/NLP-driven UI building workflows are more mature and reliable with it. The setup also felt more extensible: components are copied into the project and fully owned, rather than being a black-box dependency.
**Trade-off:** Not heavily used yet — the setup cost is paid upfront for future leverage. shadcn-nuxt required Tailwind v4, which drove the Tailwind upgrade (see below).

---

## 2026-02-23 — Tailwind CSS v4 (driven by shadcn-nuxt)

**Decision:** Use Tailwind CSS v4 via `@tailwindcss/vite` plugin (replacing `@nuxtjs/tailwindcss` module and `tailwind.config.js`).
**Why:** shadcn-nuxt requires Tailwind v4. The upgrade also eliminates the config file in favor of CSS-first configuration, which is simpler for this project's needs.
**Trade-off:** Tailwind v4 is newer and some community resources/plugins still assume v3 patterns.

---

## 2026-02-23 — Restructured into app/ source directory

**Decision:** Moved all client-side code (`pages/`, `composables/`, `components/`, etc.) into the `app/` directory.
**Why:** This is the Nuxt 4 recommended convention for the source directory — keeps server/ and app/ cleanly separated and matches the framework's intended structure.
**Trade-off:** Slightly unfamiliar if you're used to Nuxt 3's flat layout.

---

## 2026-02-23 — Mock API via server-side env flag

**Decision:** Mock mode is implemented as a branch in the server route (`NUXT_MOCK_AI=true`), not as a client-side stub.
**Why:** Keeps the full streaming pipeline exercised (SSE chunking, delays, JSON parsing) so the UI behaves identically in dev and prod.
**Trade-off:** Requires a server restart to toggle; slightly more overhead than a client-side mock, but much more realistic.
