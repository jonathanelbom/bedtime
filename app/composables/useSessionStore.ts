import type { SectionsResponse } from '~/types/chat'
import { useContinuingChat } from '~/composables/useContinuingChat'

export interface Preferences {
  vibe: string
  timeOfDay: string
  movement: string
  mood: string[]
  genres: string
  instruments: string[]
  daw: string
  references: string
}

const emptyPreferences = (): Preferences => ({
  vibe: '',
  timeOfDay: '',
  movement: '',
  mood: [],
  genres: '',
  instruments: [],
  daw: '',
  references: '',
})

export const useSessionStore = () => {
  const preferences = useState<Preferences>('preferences', emptyPreferences)
  const committedPreferences = useState<Preferences | null>('committedPreferences', () => null)
  const structuredResponse = useState<SectionsResponse | null>('structuredResponse', () => null)
  const generatedSystemPrompt = useState<string | null>('generatedSystemPrompt', () => null)

  const hasResponse = computed(() => structuredResponse.value !== null)

  const preferencesChanged = computed(() => {
    if (!committedPreferences.value) return true
    const c = committedPreferences.value
    const p = preferences.value
    return (
      c.vibe !== p.vibe ||
      c.timeOfDay !== p.timeOfDay ||
      c.movement !== p.movement ||
      JSON.stringify(c.mood) !== JSON.stringify(p.mood) ||
      c.genres !== p.genres ||
      c.daw !== p.daw ||
      c.references !== p.references ||
      JSON.stringify(c.instruments) !== JSON.stringify(p.instruments)
    )
  })

  const buildMessage = (prefs: Preferences) => {
    const parts = [`I want a song about: ${prefs.vibe}.`]
    if (prefs.timeOfDay) parts.push(`Time of day: ${prefs.timeOfDay}.`)
    if (prefs.movement) parts.push(`Movement: ${prefs.movement}.`)
    if (prefs.mood.length) parts.push(`Mood: ${prefs.mood.join(', ')}.`)
    if (prefs.genres) parts.push(`Genres: ${prefs.genres}.`)
    if (prefs.instruments.length) parts.push(`Instruments: ${prefs.instruments.join(', ')}.`)
    if (prefs.daw) parts.push(`DAW: ${prefs.daw}.`)
    if (prefs.references) parts.push(`References: ${prefs.references}.`)
    return parts.join(' ')
  }

  const commit = () => {
    committedPreferences.value = {
      ...preferences.value,
      instruments: [...preferences.value.instruments],
      mood: [...preferences.value.mood],
    }
  }

  const clearResponse = () => {
    structuredResponse.value = null
    generatedSystemPrompt.value = null
    useContinuingChat().clearChat()
  }

  return {
    preferences,
    committedPreferences,
    structuredResponse,
    generatedSystemPrompt,
    hasResponse,
    preferencesChanged,
    buildMessage,
    commit,
    clearResponse,
  }
}
