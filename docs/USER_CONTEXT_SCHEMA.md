# Normalized User Context Schema (v1)

## Purpose

This document defines the **normalized user context object** used to structure a single-session user's preferences for the meta-prompt generator.

All form inputs from the UI are converted into this schema **before prompt generation** to ensure consistency and completeness.

The meta-prompt generator receives a normalized context and synthesizes it into a personalized system prompt for that session.

This schema acts as the **contract between the form layer and the prompt generation system**.

---

## Schema Definition

~~~json
{
  "profile": {
    "creative_goal": null
  },
  "sound_profile": {
    "primary_genres": [],
    "secondary_genres": [],
    "genre_notes": null,
    "emotional_tone": [],
    "energy_profile": null,
    "time_of_day_feel": null,
    "movement_feel": null,
    "sound_identity_summary": null
  },
  "tools": {
    "daw": null,
    "experience_level": null,
    "instruments": [],
    "primary_expressive_instrument": null,
    "production_setup_notes": null
  },
  "guidance_preferences": {
    "tone": null,
    "technical_depth": null,
    "guidance_style": [],
    "likes_brief_opening_questions": true,
    "additional_guidance_notes": null
  },
  "references": {
    "artists": [],
    "songs": [],
    "genres_or_scenes": [],
    "reference_notes": null
  },
  "constraints": {
    "hard_constraints": [],
    "soft_constraints": [],
    "avoidances": [],
    "limitations_notes": null
  },
  "system_metadata": {
    "schema_version": "1.0",
    "context_ready": false
  }
}
~~~

---

## Field Definitions

### profile

Describes the user's creative goal for this session.

| Field | Description |
| --- | --- |
| creative_goal | The user's stated vibe or creative intention for this session |

### sound_profile

Defines the musical identity the assistant should support.

| Field | Description |
| --- | --- |
| primary_genres | Primary genres selected by the user |
| secondary_genres | Supporting genre influences |
| genre_notes | Free-text nuance around genre or style |
| emotional_tone | Emotional descriptors of the music |
| energy_profile | Overall energy or pacing feel |
| time_of_day_feel | Time-of-day vibe, such as late night or sunrise |
| movement_feel | Physical groove feel, such as head nod or body sway |
| sound_identity_summary | Optional interpreted summary of the sound |

### tools

Defines the production environment.

| Field | Description |
| --- | --- |
| daw | Primary DAW for this session |
| experience_level | Reserved for future use; currently always `null` |
| instruments | Instruments the user works with in this session |
| primary_expressive_instrument | Instrument most likely to fill section 6 (inferred from instruments list if possible) |
| production_setup_notes | Reserved for future use; currently always `null` |

### guidance_preferences

Defines how the assistant should communicate.

| Field | Description |
| --- | --- |
| tone | Preferred communication tone |
| technical_depth | Desired technical depth |
| guidance_style | Preferred guidance style signals |
| likes_brief_opening_questions | Whether the assistant should ask opening questions |
| additional_guidance_notes | Optional notes about guidance style |

### references

Signals musical taste and influences.

| Field | Description |
| --- | --- |
| artists | Artist references |
| songs | Song references |
| genres_or_scenes | Scene, era, or movement references |
| reference_notes | Free-text explanation of taste |

### constraints

Defines boundaries for recommendations.

| Field | Description |
| --- | --- |
| hard_constraints | Absolute restrictions |
| soft_constraints | Preferred limits |
| avoidances | Things the assistant should avoid |
| limitations_notes | Optional explanation of limitations |

### system_metadata

Internal fields used by the system.

| Field | Description |
| --- | --- |
| schema_version | Current schema version |
| context_ready | Indicates whether the context is sufficient for prompt generation |

---

## Normalization Rules

The normalization layer converts raw onboarding input into this schema.

### Empty values

Empty strings must be converted to `null`.

Example:

~~~txt
"" -> null
~~~

### Array deduplication

Arrays must remove duplicates.

Example:

~~~txt
["indie pop", "indie pop"] -> ["indie pop"]
~~~

### String cleanup

Strings must be trimmed of leading and trailing whitespace.

### DAW normalization

DAW names should be normalized when possible.

| Input | Normalized |
| --- | --- |
| ableton | Ableton Live 11 Suite |
| ableton live | Ableton Live 11 Suite |
| ableton live 11 | Ableton Live 11 Suite |
| logic | Logic Pro |
| logic pro | Logic Pro |
| fl | FL Studio |
| fl studio | FL Studio |
| pro tools | Pro Tools |
| garage band | GarageBand |
| garageband | GarageBand |
| reaper | Reaper |
| bitwig | Bitwig Studio |
| bitwig studio | Bitwig Studio |

Unknown values should remain unchanged.

### Primary instrument inference

If the user lists instruments but does not specify a primary expressive instrument, attempt to infer one.

Suggested priority order:

1. electric guitar
2. acoustic guitar
3. guitar
4. piano
5. keys
6. synth lead
7. voice
8. bass
9. texture layers
10. first listed instrument

---

## Context Readiness

The `context_ready` flag indicates whether the context contains enough signal to generate a prompt.

It is set to `true` only if all of the following are present:

- at least one genre
- at least one of: an instrument listed OR a DAW specified
- at least one emotional/tonal signal (mood)

If any of these are missing, `context_ready` remains `false`. The app uses this to validate form completion before enabling the Generate & Stream call.

---

## Example Normalized Context

~~~json
{
  "profile": {
    "creative_goal": "sunsets and neon screams, late night drives"
  },
  "sound_profile": {
    "primary_genres": ["indie pop", "city pop"],
    "secondary_genres": [],
    "genre_notes": null,
    "emotional_tone": ["reflective", "nostalgic"],
    "energy_profile": null,
    "time_of_day_feel": "late night",
    "movement_feel": "body sway",
    "sound_identity_summary": null
  },
  "tools": {
    "daw": "Ableton Live 11 Suite",
    "experience_level": null,
    "instruments": ["electric guitar"],
    "primary_expressive_instrument": "electric guitar",
    "production_setup_notes": null
  },
  "guidance_preferences": {
    "tone": "calm collaborator",
    "technical_depth": "low",
    "guidance_style": ["metaphor-driven"],
    "likes_brief_opening_questions": true,
    "additional_guidance_notes": null
  },
  "references": {
    "artists": ["Steely Dan", "Sade"],
    "songs": [],
    "genres_or_scenes": [],
    "reference_notes": null
  },
  "constraints": {
    "hard_constraints": [],
    "soft_constraints": [],
    "avoidances": [],
    "limitations_notes": null
  },
  "system_metadata": {
    "schema_version": "1.0",
    "context_ready": true
  }
}
~~~

---

## Implementation Notes

The application should implement a function similar to:

~~~ts
normalizeUserContext(rawOnboardingInput)
~~~

This function should:

1. clean and normalize all values
2. infer missing fields where possible
3. validate the minimum context requirements
4. return a schema-compliant object
5. set `context_ready` appropriately

---

## Schema Versioning

`schema_version` is a static version marker (currently "1.0"). It is not a versioned record system — each session is ephemeral and produces a new normalized context from the form input, not retrieved from a versioned store.

