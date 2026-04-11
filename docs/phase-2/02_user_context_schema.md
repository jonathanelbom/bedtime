# Normalized User Context Schema (v1)

## Purpose

This document defines the **normalized user context object** used to generate personalized music assistants.

All onboarding inputs from the UI must be converted into this schema **before prompt generation**.

The prompt generator must never receive raw UI payloads.

This schema acts as the **contract between the application and the prompt generation system**.

---

## Schema Definition

~~~json
{
  "profile": {
    "assistant_name": null,
    "creator_type": null,
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

Describes the creator identity and creative goal.

| Field | Description |
| --- | --- |
| assistant_name | Optional custom name for the assistant |
| creator_type | Description of the creator, such as songwriter or producer |
| creative_goal | Description of the music the user wants to create |

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
| daw | Primary DAW used by the creator |
| experience_level | Beginner, intermediate, or advanced |
| instruments | Instruments the user works with |
| primary_expressive_instrument | Instrument most likely to fill framework section 6 |
| production_setup_notes | Optional free-text description of the setup |

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

The `context_ready` flag should only be set to `true` if enough context exists to generate a prompt.

Minimum signals should include:

- at least one genre or genre note
- at least one tool or DAW signal
- at least one emotional or tonal signal
- at least one instrument signal

If these signals are missing, the system should request more information before prompt generation.

---

## Example Normalized Context

~~~json
{
  "profile": {
    "assistant_name": "Afterhours Pulse",
    "creator_type": "songwriter-producer",
    "creative_goal": "groove-forward late night pop"
  },
  "sound_profile": {
    "primary_genres": ["indie pop"],
    "secondary_genres": ["city pop"],
    "genre_notes": "modern and intimate",
    "emotional_tone": ["reflective"],
    "energy_profile": "mid-tempo",
    "time_of_day_feel": "late night",
    "movement_feel": "body sway",
    "sound_identity_summary": null
  },
  "tools": {
    "daw": "Ableton Live 11 Suite",
    "experience_level": "intermediate",
    "instruments": ["electric guitar", "soft synths"],
    "primary_expressive_instrument": "electric guitar",
    "production_setup_notes": "bedroom studio using mostly stock plugins"
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
    "genres_or_scenes": ["sophisti-pop"],
    "reference_notes": null
  },
  "constraints": {
    "hard_constraints": [],
    "soft_constraints": [],
    "avoidances": ["EDM builds"],
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

## Versioning

If the schema changes in the future:

- increment `schema_version`
- maintain backward compatibility where possible
- regenerate prompts when schema versions change

