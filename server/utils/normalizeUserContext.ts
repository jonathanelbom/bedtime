export interface NormalizedUserContext {
  profile: {
    assistant_name: string | null
    creator_type: string | null
    creative_goal: string | null
  }
  sound_profile: {
    primary_genres: string[]
    secondary_genres: string[]
    genre_notes: string | null
    emotional_tone: string[]
    energy_profile: string | null
    time_of_day_feel: string | null
    movement_feel: string | null
    sound_identity_summary: string | null
  }
  tools: {
    daw: string | null
    experience_level: string | null
    instruments: string[]
    primary_expressive_instrument: string | null
    production_setup_notes: string | null
  }
  guidance_preferences: {
    tone: string | null
    technical_depth: string | null
    guidance_style: string[]
    likes_brief_opening_questions: boolean
    additional_guidance_notes: string | null
  }
  references: {
    artists: string[]
    songs: string[]
    genres_or_scenes: string[]
    reference_notes: string | null
  }
  constraints: {
    hard_constraints: string[]
    soft_constraints: string[]
    avoidances: string[]
    limitations_notes: string | null
  }
  system_metadata: {
    schema_version: string
    context_ready: boolean
  }
}

export interface RawFormInput {
  vibe: string
  timeOfDay: string
  movement: string
  mood: string[]
  genres: string
  instrument: string | null
  daw: string
  references: string
}

const DAW_MAP: Record<string, string> = {
  ableton: 'Ableton Live 11 Suite',
  'ableton live': 'Ableton Live 11 Suite',
  'ableton live 11': 'Ableton Live 11 Suite',
  'ableton live 11 suite': 'Ableton Live 11 Suite',
  logic: 'Logic Pro',
  'logic pro': 'Logic Pro',
  'logic pro x': 'Logic Pro',
  fl: 'FL Studio',
  'fl studio': 'FL Studio',
  'pro tools': 'Pro Tools',
  'garage band': 'GarageBand',
  garageband: 'GarageBand',
  reaper: 'Reaper',
  bitwig: 'Bitwig Studio',
  'bitwig studio': 'Bitwig Studio',
}

const INSTRUMENT_PRIORITY = [
  'electric guitar',
  'acoustic guitar',
  'guitar',
  'piano',
  'keys',
  'synth lead',
  'synths',
  'voice',
  'vocals',
  'bass',
  'texture layers',
]

function normStr(s: string): string | null {
  const trimmed = s.trim()
  return trimmed === '' ? null : trimmed
}

function splitAndClean(s: string): string[] {
  return [...new Set(s.split(',').map(v => v.trim()).filter(v => v !== ''))]
}

function normalizeDaw(raw: string): string | null {
  if (!raw.trim()) return null
  const lower = raw.trim().toLowerCase()
  return DAW_MAP[lower] ?? raw.trim()
}

function inferPrimaryInstrument(instruments: string[]): string | null {
  if (instruments.length === 0) return null
  const lower = instruments.map(i => i.toLowerCase())
  for (const candidate of INSTRUMENT_PRIORITY) {
    if (lower.some(i => i.includes(candidate))) {
      return instruments[lower.findIndex(i => i.includes(candidate))] ?? null
    }
  }
  return instruments[0] ?? null
}

export function normalizeUserContext(raw: RawFormInput): NormalizedUserContext {
  const genres = splitAndClean(raw.genres)
  const instruments = raw.instrument ? [raw.instrument.trim()] : []
  const artists = splitAndClean(raw.references)
  const daw = normalizeDaw(raw.daw)

  const hasGenre = genres.length > 0 || !!normStr(raw.genres)
  const hasInstrument = instruments.length > 0
  const hasDaw = !!daw
  const hasEmotionalSignal = raw.mood.length > 0

  const context_ready = hasGenre && (hasInstrument || hasDaw) && hasEmotionalSignal

  return {
    profile: {
      assistant_name: null,
      creator_type: null,
      creative_goal: normStr(raw.vibe),
    },
    sound_profile: {
      primary_genres: genres,
      secondary_genres: [],
      genre_notes: null,
      emotional_tone: raw.mood,
      energy_profile: null,
      time_of_day_feel: normStr(raw.timeOfDay),
      movement_feel: normStr(raw.movement),
      sound_identity_summary: normStr(raw.vibe),
    },
    tools: {
      daw,
      experience_level: null,
      instruments,
      primary_expressive_instrument: inferPrimaryInstrument(instruments),
      production_setup_notes: null,
    },
    guidance_preferences: {
      tone: 'calm collaborator',
      technical_depth: 'low',
      guidance_style: ['metaphor-driven'],
      likes_brief_opening_questions: true,
      additional_guidance_notes: null,
    },
    references: {
      artists,
      songs: [],
      genres_or_scenes: [],
      reference_notes: null,
    },
    constraints: {
      hard_constraints: [],
      soft_constraints: [],
      avoidances: [],
      limitations_notes: null,
    },
    system_metadata: {
      schema_version: '1.0',
      context_ready,
    },
  }
}
