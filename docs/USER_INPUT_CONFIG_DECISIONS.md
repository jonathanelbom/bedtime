# User Input Configuration — Design Decisions

This document captures all decisions made about the user configuration/input page: what fields exist, how they behave, what options are available, and why.

---

## Design Conventions

Two pill styles are used consistently to communicate selection behavior at a glance:

| Type | Style | Label hint |
|---|---|---|
| Single-select | Squarer pill (`rounded-lg`) | "Select one" |
| Multi-select | Full rounded pill (`rounded-full`) | "Select one or more" |

---

## Fields

### 1. What's the vibe or emotion for this track?
- **Type:** Free text input
- **Required:** Yes
- **Rationale:** Open-ended by design. This is the most personal, expressive field — no presets could cover the range of what a user might mean.

---

### 2. What genres or sounds describe your music?
- **Type:** Single-select chips + "Other" free text input
- **Required:** Yes
- **Style:** `rounded-lg` (single-select convention)

**Why single-select:**
Genre is the anchor the AI orients from — not a texture or modifier. Multi-select risks incoherent combos (e.g. "space-rock + bluegrass + swing rap") that confuse the AI rather than enrich it. Moods layer; genres usually don't. Users with genuine hybrid sounds can describe the blend themselves via the "Other" input (e.g. "trip-hop meets city pop"), which is more useful to the AI than two separate chips anyway.

The `references` field (artists) also handles a lot of genre-context for users who have taste but not vocabulary.

**Why keep `genres` as a string in the API:**
Changing `genres: string` to `string[]` in the Preferences schema would require changes throughout the API layer. Since the AI receives a natural language message either way, the genre chip selection is joined to a comma-separated string at submit time — identical output, no schema change.

**Options (27):**

| Category | Options |
|---|---|
| Soul / R&B core | R&B, Neo-Soul, Funk, Disco, Boogie |
| Yacht rock / Soft | Soft Rock, Yacht Rock, Blue-Eyed Soul |
| Hip-hop adjacent | Hip-Hop, Trip-Hop, Lo-fi |
| Electronic / Dance | House, Techno, Electronica, Synthwave, Synth Pop, Vaporwave, Dubstep, Ambient |
| Indie / Alt | Indie Pop, Dream Pop, City Pop, Bedroom Pop, Indie Rock, Shoegaze |
| Global | Afrobeats, Bossa Nova |

---

### 3. What do you play or use?
- **Type:** Multi-select chips
- **Required:** Yes
- **Style:** `rounded-full` (multi-select convention)

**Options (6):** Electric Guitar, Bass, Piano/Keys, Synths, Drum Machine, Vocals

---

### 4. What DAW do you use?
- **Type:** Single-select chips
- **Required:** Yes
- **Style:** `rounded-lg` (single-select convention)

**Options (7):** Ableton, Logic Pro, FL Studio, GarageBand, Reason, Cubase, Other

---

### 5. What time of day does this song live in?
- **Type:** Single-select chips
- **Required:** Yes
- **Style:** `rounded-lg` (single-select convention)

**Options (9), ordered chronologically:**

| Option | Feel |
|---|---|
| Small Hours | 3–5am pre-dawn; post-rave chillout; the night isn't over but you can feel it ending |
| Dawn | First light |
| Morning | Early day |
| Brunch | Late morning / early afternoon; lazy, warm, social |
| Afternoon | Midday |
| Golden Hour | Late afternoon warmth |
| Sunset | Day into night |
| Night | After dark |
| Late Night | Deep into the night |

---

### 6. How does this make you move?
- **Type:** Single-select chips
- **Required:** Yes
- **Style:** `rounded-lg` (single-select convention)

**Options (8), ordered loosest → most energetic:**

| Option | Feel |
|---|---|
| Drift | Passive, barely moving, sink into it |
| Head-nod | Locked in, internal groove |
| Shoulder roll | Smooth, effortless |
| Body-sway | Full-torso, oceanic |
| Slow dance | Two-step, intimate |
| Bounce | Chest-up, light on feet |
| Step | Walking groove, subtle footwork |
| Go off | Full-body, uninhibited |

---

### 7. What's the mood?
- **Type:** Multi-select chips + "Other" free text input
- **Required:** Yes (at least one)
- **Style:** `rounded-full` (multi-select convention)

**Why multi-select:**
Moods layer naturally and additively — "Confident + Romantic" or "Reflective + Cool" tells the AI something richer than either alone. Unlike genres, mood combinations rarely cancel each other out; they produce depth and complexity.

**Options (14), ordered from detached → expansive:**

| Option | Feel |
|---|---|
| Confident | Assured, unhurried |
| Cool | Detached, effortless |
| Reflective | Inward, still |
| Melancholic | Heavy but beautiful |
| Nostalgic | Warm haze, looking back |
| Wistful | Gentle ache, not quite sad |
| Tender | Soft, unguarded |
| Romantic | Charged, intimate |
| Sultry | Slow heat, loaded |
| Euphoric | Peak feeling, weightless |
| Restless | Nervous energy, something building |
| Driven | Forward momentum, purposeful |
| Charged | Electric tension about to release |
| Feverish | Hot, urgent, can't slow down |

**Other:** Reveals a text input for a custom mood description, appended to the mood list at submit time.

---

### 8. Any artists that capture your sound?
- **Type:** Free text input
- **Required:** No (optional)
- **Rationale:** Artist references carry dense genre, production, and aesthetic information in a single word. "Kaytranada" tells the AI more than most genre labels. Optional because not everyone thinks in reference terms.

---

## Input Configuration Schema

The `Preferences` object sent to the API:

```ts
interface Preferences {
  vibe: string           // Free text — vibe/emotion description
  genres: string         // Comma-separated genre string (built from chip selection or "Other" text at submit)
  instruments: string[]  // Multi-select — ['Electric Guitar', 'Bass', ...]
  daw: string            // Single selection — e.g. 'Ableton'
  timeOfDay: string      // Single selection — e.g. 'Golden Hour'
  movement: string       // Single selection — e.g. 'Body-sway'
  mood: string[]         // Multi-select — ['Reflective', 'Cool', ...] (custom mood appended at submit if provided)
  references: string     // Free text — optional artist references
}
```

**Notes:**
- `genres` stays as `string` (not `string[]`) intentionally to avoid changes to the API layer. The chip selection is joined with `", "` at submit time.
- `mood` is `string[]` — a custom "Other" value is pushed into this array at submit time if provided.
- All fields except `references` are required for form submission.
