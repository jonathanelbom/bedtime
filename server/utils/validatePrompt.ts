// Required section keywords that must appear in the generated prompt, in order.
// Section 6 is flexible (guitar / synth leads / piano / texture layers / etc.)
// so we check for its core role keywords instead of a fixed title.
const REQUIRED_SECTIONS = [
  'TEMPO',
  'DRUMS',
  'BASS',
  'CHORDS',
  'KEYS',
  'WHAT TO AVOID',
]

// Section 6 may use any of these titles
const SECTION_6_VARIANTS = [
  'GUITAR',
  'SYNTH',
  'PIANO',
  'TEXTURE',
  'KEYS &',
  'EXPRESSIVE',
]

export function validatePrompt(prompt: string): boolean {
  if (!prompt || prompt.trim().length === 0) return false

  // No leftover template placeholders
  if (prompt.includes('{{USER_CONTEXT') || prompt.includes('USER_CONTEXT_JSON')) return false

  const upper = prompt.toUpperCase()

  // Check all required sections are present
  for (const section of REQUIRED_SECTIONS) {
    if (!upper.includes(section)) return false
  }

  // Check section 6 variant exists
  const hasSection6 = SECTION_6_VARIANTS.some(v => upper.includes(v))
  if (!hasSection6) return false

  // Check sections appear roughly in order (TEMPO before DRUMS before BASS... before WHAT TO AVOID)
  const positions = [
    upper.indexOf('TEMPO'),
    upper.indexOf('DRUMS'),
    upper.indexOf('BASS'),
    upper.indexOf('CHORDS'),
    upper.indexOf('KEYS'),
    upper.lastIndexOf('WHAT TO AVOID'),
  ]

  for (let i = 1; i < positions.length; i++) {
    if (positions[i] <= positions[i - 1]) return false
  }

  return true
}
