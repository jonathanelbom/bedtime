# Structured Response Plan — AI Output Design

*Retroactively documented from the codebase and system prompt. Captures the decisions around how the AI formats its output and why.*

---

## The Core Problem: Chat Is Hard to Scan

The initial scaffold was a standard chat interface — user types a vibe, AI responds with guidance. The problem: **production guidance in a chat format is dense and hard to use in practice.**

When you're sitting in Ableton about to lay down a bass line, you don't want to scroll through a paragraph to find the tempo. You want to quickly find the section that matters to you right now.

This drove the central design decision: **structure the AI's output into discrete, scannable sections** rather than free prose.

---

## The Solution: Structured JSON Sections

The AI is instructed to respond with JSON only — never markdown, never prose. The output is always one of two shapes.

### Shape 1: Questions (when context is insufficient)
```json
{
  "type": "questions",
  "questions": [
    "What time of day does this song live in?",
    "More head-nod or body-sway?",
    "Confident, reflective, romantic, or cool?"
  ]
}
```
If the AI decides it doesn't have enough to go on, it responds with clarifying questions instead of guessing. In practice, the setup form collects enough that this path is rarely hit — but it's there as a graceful fallback.

### Shape 2: Full guidance (the main path)
```json
{
  "type": "response",
  "sections": {
    "tempo": { "title": "...", "feel": "...", "ableton_tip": "...", "reference": "..." },
    "drums": { ... },
    ...
  }
}
```

This discriminated union (`type: 'questions' | 'response'`) makes parsing and routing straightforward — one check on `type` and the UI knows exactly what to render.

---

## The 7 Sections

The sections map to the actual decisions a producer makes when building a rhythm section:

| Section | What it answers |
|---|---|
| **Tempo** | How fast, and how does it feel in the body? |
| **Drums** | Pattern, weight, feel — head-nod vs sway |
| **Bass** | Role and relationship to the groove |
| **Chords** | Harmonic color and movement |
| **Keys & Scales** | Mood palette, emotional range |
| **Guitar** | How the live electric guitar fits in |
| **What to Avoid** | Guardrails — what would break the vibe |

The order is fixed (`SECTION_ORDER` in `types/chat.ts`) and maps directly to the URL structure (`/sections/tempo`, `/sections/drums`, etc.). This fixed order creates a consistent mental model: tempo is always first, avoid is always last.

### Why "What to Avoid" as the last section?
Negative guidance is as important as positive guidance when chasing a specific sound. Knowing what to *not* do (e.g., don't quantize the snare too tightly, don't add a third bass voice) is practical creative guardrails. It's last because it's more useful after you've understood what you *are* going for.

---

## Section Schema

Each section has four fields:
```ts
interface SectionContent {
  title: string       // A phrase that captures the essence — e.g., "The Pace of Confidence"
  feel: string        // Feel-based direction using metaphor and body language
  ableton_tip: string // Concrete, tool-specific implementation guidance
  reference?: string | null  // Optional song reference from the Neiliyo universe
}
```

### Why `title`?
Gives each section a personality. "Body Language, Not Energy" tells you more about the drum feel than "Drums" does. Titles also serve as scannable anchors in the overview grid.

### Why separate `feel` and `ableton_tip`?
They serve different modes of use:
- **Feel** is for the creative mind — what am I going for?
- **Ableton tip** is for the hands — what do I actually click or turn?

Keeping them separate prevents the AI from mixing metaphor with instructions in ways that obscure one or the other.

### Why optional `reference`?
References to real songs reduce ambiguity faster than any description — "like the kick in Jai Paul's 'BTSTU'" is immediately understood. But references are optional because forcing them can lead to bad fits. The system prompt instructs the AI to include references only when they genuinely reduce ambiguity, not as filler.

---

## The AI Persona

**Neiliyo Rhythm Section GPT** — a rhythm-section consultant, not a teacher.

Key voice constraints (from the system prompt):
- Speak in **feel, metaphor, movement, confidence**
- Give **practical guardrails**, not rules
- **No lecturing. No over-explaining.**
- **No music theory terms** (chord names, scale names, roman numerals) unless the user explicitly asks

### Why no music theory?
The user thinks in texture and feel, not theory. Saying "use a minor 7 chord" is less useful than "something that feels like late afternoon light coming through venetian blinds." The constraint also keeps the guidance accessible to producers of any theory background.

### Operating assumptions baked into the prompt
- User is in **Ableton Live 11 Suite** — all tips are specific to this tool
- Has **one live electric guitar** — guitar section accounts for a real instrument, not a plugin
- Uses **stock Ableton instruments + drum machines** — no assumptions about third-party gear

---

## JSON Parsing Robustness

Streaming JSON is messy — the AI sometimes wraps output in markdown code blocks, sometimes has minor syntax errors, and the stream may be cut mid-token. Three-pass parsing strategy in `app/utils/parseResponse.ts`:

1. **Direct parse** — `JSON.parse()` on the raw string
2. **jsonrepair** — library that fixes common LLM JSON errors (trailing commas, missing quotes, etc.)
3. **Markdown extraction** — strips ` ```json ``` ` wrappers, then retries passes 1 and 2
4. **Brace extraction** — finds the outermost `{...}` in the string, retries passes 1 and 2

If all four fail, an error state is shown with the raw response visible for debugging.

---

## Setup Form Design

The setup form (`/`) collects four inputs that map directly to the clarifying questions the AI would otherwise ask:

| Input | Type | Options |
|---|---|---|
| Vibe | Free text | "e.g., sunsets and neon screams, late night drives..." |
| Time of day | Single select | Dawn, Morning, Afternoon, Golden Hour, Sunset, Night, Late Night |
| Movement | Binary | Head-nod, Body-sway |
| Mood | Single select | Confident, Reflective, Romantic, Cool |

These four inputs were reverse-engineered from the AI's own `questions` response — when given minimal input, these are what it asks. Pre-collecting them means the main path skips the questions phase entirely and goes straight to sections.

The four inputs are combined into a single natural-language user message:
```
I want a song about: [vibe]. Time of day: [timeOfDay]. Movement: [movement]. Mood: [mood].
```

---

## Connection to Chat (What Comes Next)

The structured sections phase is intentionally a **one-shot output** — the user gets the full picture upfront without going back and forth. But after reviewing the sections, users often have follow-up questions: "what does that bass feel actually sound like?", "can I make the drums more minimal?"

This is where the continuing chat feature picks up — see `CHAT_MVP_PLAN.md`. The structured response becomes context for a conversational follow-up, giving the best of both: scannable structure first, open conversation after.
