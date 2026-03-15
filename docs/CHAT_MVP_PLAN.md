# Chat MVP Plan — Continuing Chat Feature

## Overview

After the structured sections are generated, users need a way to keep exploring ideas conversationally — asking follow-ups, requesting variations, or digging into feel. This document captures the plan for the continuing chat feature, the key decisions made, and how everything fits together.

---

## User Flow

1. **Setup page** (`/`) — user fills in preferences (vibe, time of day, movement, mood) and submits
2. **Sections overview** (`/sections`) — structured rhythm section is generated and displayed as section cards
3. **Section detail** (`/sections/[key]`) — user can drill into each of the 7 sections (tempo, drums, bass, chords, keys, guitar, avoid)
4. **Chat** (`/chat`) — from any section page, user taps "Chat" in the bottom bar to open a conversational interface with full context from the generated sections

---

## Key Design Decision: Route vs. Bottom Sheet

**We chose a route (`/chat`) instead of a bottom sheet overlay.**

### Why a route?
- Reuses the existing push/pop page transition system — zero new animation code
- Naturally inaccessible from the setup screen (no session = redirect to `/`)
- Works identically on mobile and desktop without z-index or overlay complexity
- `← Back` navigates to wherever the user came from via `router.back()`
- Full-screen real estate for the chat interface without squeezing it into a partial overlay

### How the transition system works
The app uses a `pageIndex` system to determine transition direction:
| Route | pageIndex |
|---|---|
| Setup (`/`) | 0 |
| Sections overview (`/sections`) | 1 |
| Section detail (`/sections/tempo`) | 2 |
| Section detail (`/sections/drums`) | 3 |
| ... | ... |
| Section detail (`/sections/avoid`) | 8 |
| **Chat (`/chat`)** | **9** |

Navigating to a higher index = push (slide in from right). Navigating to a lower index = pop (slide out to right). Chat always pushes in from any section page, and `← Back` always pops back naturally.

---

## Key Design Decision: Conversational vs. Structured Response Mode

**The initial sections generation uses a structured JSON response format.** The AI returns a JSON object with 7 sections, each with `title`, `feel`, `ableton_tip`, and `reference`. This structure is ideal for the visual section cards UI.

**The continuing chat uses plain conversational text.** Once the user is in the chat, the AI should speak naturally — not return JSON. This requires a different system prompt.

### How mode-switching works
The `/api/chat` endpoint accepts an optional `mode` parameter:
- `mode: 'structured'` (default) — uses the structured JSON system prompt, AI returns section cards format
- `mode: 'chat'` — uses the conversational system prompt, AI responds in plain text

The chat composable always sends `mode: 'chat'` so the AI knows to stay conversational.

---

## Key Design Decision: Silent Context Injection

**The structured sections data is passed to the AI as a hidden context message, not shown in the chat UI.**

When the user first opens `/chat`, the composable formats all 7 sections into readable text and prepends it as a hidden user message in the messages array. This message is:
- Included in every API call (so the AI has full context)
- Filtered out of the rendered chat UI (user only sees their actual messages)

Context format:
```
Here is the rhythm section I received:

TEMPO — [title]
Feel: [feel]
Ableton tip: [ableton_tip]
Reference: [reference]

DRUMS — [title]
...etc for all 7 sections...
```

This approach is simpler than modifying the server to accept section data separately, and reuses the existing messages array pattern.

---

## State Persistence

Chat history persists across route navigations using Nuxt's `useState()` — the same pattern used for session state throughout the app.

- Navigate `/chat` → `/sections/tempo` → `/chat` — history is still there
- Go back to setup and generate a new response — `clearResponse()` in the session store also calls `clearChat()`, resetting history and re-injecting fresh context on next chat open

---

## Files Created / Modified

### New files
| File | Purpose |
|---|---|
| `app/pages/chat.vue` | Chat page UI — message list, input, back button |
| `app/composables/useContinuingChat.ts` | Persistent chat state — messages, streaming, context injection |
| `server/utils/chatSystemPrompt.ts` | Plain-text conversational system prompt for chat mode |

### Modified files
| File | Change |
|---|---|
| `server/api/chat.post.ts` | Accept `mode` param, swap system prompt for chat mode |
| `app/utils/pageColors.ts` | Add `chat` color to palettes, handle `/chat` route in `getRouteColor()` |
| `app/pages/sections/index.vue` | Add "Chat" button to bottom bar |
| `app/pages/sections/[key].vue` | Add "Chat" button to bottom bar |
| `app/composables/useSessionStore.ts` | Call `clearChat()` inside `clearResponse()` |

---

## Chat Page UX

- **Top**: back button (`← Back`) + "Chat" label
- **Middle**: scrollable message list, auto-scrolls to bottom on new message; hidden context message is not rendered
- **Bottom**: sticky input + send button, disabled while streaming
- **Messages**: user messages right-aligned, assistant messages left-aligned
- **Access guard**: if no session exists, redirects to `/`
