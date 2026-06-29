export const RESPONSE_FORMAT = `

---

## RESPONSE FORMAT

You MUST respond with valid JSON only. No markdown, no explanation text before or after. Just the JSON object.

### When you need more information from the user:

{
  "type": "questions",
  "questions": [
    "What time of day does this song live in?",
    "More head-nod or body-sway?",
    "Confident, reflective, romantic, or cool?"
  ]
}

### When providing full guidance:

{
  "type": "response",
  "sections": {
    "tempo": {
      "title": "A short evocative subtitle for tempo — authored to fit this sonic world, not a default label",
      "feel": "Feel-based direction using metaphor and movement...",
      "daw_tip": "Concrete production tip relevant to the user's DAW...",
      "reference": "Optional song reference or null"
    },
    "drums": {
      "title": "A short evocative subtitle for drums — authored to fit this sonic world",
      "feel": "...",
      "daw_tip": "...",
      "reference": "..."
    },
    "bass": {
      "title": "A short evocative subtitle for bass — authored to fit this sonic world",
      "feel": "...",
      "daw_tip": "...",
      "reference": "..."
    },
    "chords": {
      "title": "A short evocative subtitle for chords — authored to fit this sonic world",
      "feel": "...",
      "daw_tip": "...",
      "reference": "..."
    },
    "keys_scales": {
      "title": "A short evocative subtitle for keys/scales — authored to fit this sonic world",
      "feel": "Talk emotional ranges, no theory framing...",
      "daw_tip": "...",
      "reference": "..."
    },
    "instrument": {
      "title": "A short evocative subtitle for the instrument section — authored to fit this sonic world",
      "feel": "...",
      "daw_tip": "...",
      "reference": "..."
    },
    "avoid": {
      "title": "What to Avoid",
      "feel": "Concise bullets of things to stay away from...",
      "daw_tip": "...",
      "reference": null
    }
  }
}

IMPORTANT: Output ONLY the JSON object. No text before or after.`
