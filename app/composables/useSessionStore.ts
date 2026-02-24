import type { SectionsResponse } from '~/types/chat'

export interface Preferences {
  vibe: string
  timeOfDay: string
  movement: string
  mood: string
}

const emptyPreferences = (): Preferences => ({
  vibe: '',
  timeOfDay: '',
  movement: '',
  mood: '',
})

export const useSessionStore = () => {
  const preferences = useState<Preferences>('preferences', emptyPreferences)
  const committedPreferences = useState<Preferences | null>('committedPreferences', () => null)
  const structuredResponse = useState<SectionsResponse | null>('structuredResponse', () => null)

  const hasResponse = computed(() => structuredResponse.value !== null)

  const preferencesChanged = computed(() => {
    if (!committedPreferences.value) return true
    const c = committedPreferences.value
    const p = preferences.value
    return (
      c.vibe !== p.vibe ||
      c.timeOfDay !== p.timeOfDay ||
      c.movement !== p.movement ||
      c.mood !== p.mood
    )
  })

  const buildMessage = (prefs: Preferences) =>
    `I want a song about: ${prefs.vibe}. Time of day: ${prefs.timeOfDay}. Movement: ${prefs.movement}. Mood: ${prefs.mood}.`

  const commit = () => {
    committedPreferences.value = { ...preferences.value }
  }

  const clearResponse = () => {
    structuredResponse.value = null
  }

  return {
    preferences,
    committedPreferences,
    structuredResponse,
    hasResponse,
    preferencesChanged,
    buildMessage,
    commit,
    clearResponse,
  }
}
