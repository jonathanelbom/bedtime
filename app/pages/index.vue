<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { useSessionStore } from '~/composables/useSessionStore'

definePageMeta({ pageIndex: 0 })

const router = useRouter()
const { preferences, generatedSystemPrompt, hasResponse, preferencesChanged, buildMessage, commit, clearResponse } = useSessionStore()

const isSubmitting = ref(false)
const submitError = ref<string | null>(null)

const timeOptions = ['Small Hours', 'Dawn', 'Morning', 'Brunch', 'Afternoon', 'Golden Hour', 'Sunset', 'Night', 'Late Night']
const movementOptions = ['Drift', 'Head-nod', 'Shoulder roll', 'Body-sway', 'Slow dance', 'Bounce', 'Step', 'Go off']
const moodOptions = ['Confident', 'Cool', 'Reflective', 'Melancholic', 'Nostalgic', 'Wistful', 'Tender', 'Romantic', 'Sultry', 'Euphoric', 'Restless', 'Driven', 'Charged', 'Feverish']

const showCustomMood = ref(false)
const customMoodText = ref('')

const toggleCustomMood = () => {
  showCustomMood.value = !showCustomMood.value
  if (!showCustomMood.value) customMoodText.value = ''
}
const genreOptions = ['R&B', 'Neo-Soul', 'Funk', 'Disco', 'Boogie', 'Soft Rock', 'Yacht Rock', 'Blue-Eyed Soul', 'Hip-Hop', 'Trip-Hop', 'Lo-fi', 'House', 'Techno', 'Electronica', 'Synthwave', 'Synth Pop', 'Vaporwave', 'Dubstep', 'Ambient', 'Indie Pop', 'Dream Pop', 'City Pop', 'Bedroom Pop', 'Indie Rock', 'Shoegaze', 'Afrobeats', 'Bossa Nova']

const savedGenre = preferences.value.genres
const selectedGenre = ref(genreOptions.includes(savedGenre) ? savedGenre : '')
const showCustomGenre = ref(!!savedGenre && !genreOptions.includes(savedGenre))
const customGenreText = ref(genreOptions.includes(savedGenre) ? '' : savedGenre)

const selectGenre = (genre: string) => {
  selectedGenre.value = selectedGenre.value === genre ? '' : genre
}

const toggleCustomGenre = () => {
  showCustomGenre.value = !showCustomGenre.value
  if (!showCustomGenre.value) customGenreText.value = ''
}

const dawOptions = ['Ableton', 'Logic Pro', 'FL Studio', 'GarageBand', 'Reason', 'Cubase', 'Other']
const instrumentOptions = ['Electric Guitar', 'Bass', 'Piano/Keys', 'Synths', 'Drum Machine', 'Vocals']

const toggleInstrument = (instrument: string) => {
  const idx = preferences.value.instruments.indexOf(instrument)
  if (idx === -1) {
    preferences.value.instruments = [...preferences.value.instruments, instrument]
  } else {
    preferences.value.instruments = preferences.value.instruments.filter(i => i !== instrument)
  }
}

const toggleMood = (mood: string) => {
  const idx = preferences.value.mood.indexOf(mood)
  if (idx === -1) {
    preferences.value.mood = [...preferences.value.mood, mood]
  } else {
    preferences.value.mood = preferences.value.mood.filter(m => m !== mood)
  }
}

const canSubmit = computed(() =>
  preferences.value.vibe.trim() !== '' &&
  preferences.value.timeOfDay !== '' &&
  preferences.value.movement !== '' &&
  (preferences.value.mood.length > 0 || customMoodText.value.trim() !== '') &&
  (selectedGenre.value !== '' || (showCustomGenre.value && customGenreText.value.trim() !== '')) &&
  (preferences.value.instruments.length > 0) &&
  preferences.value.daw !== ''
)

const submitLabel = computed(() => {
  if (isSubmitting.value) return 'Building your assistant…'
  if (hasResponse.value && !preferencesChanged.value) return 'View My Rhythm Section'
  return 'Create Rhythm Section'
})

const handleSubmit = async () => {
  if (!canSubmit.value || isSubmitting.value) return
  isSubmitting.value = true
  submitError.value = null

  if (hasResponse.value && !preferencesChanged.value) {
    router.push('/sections')
    return
  }

  if (customMoodText.value.trim() && !preferences.value.mood.includes(customMoodText.value.trim())) {
    preferences.value.mood = [...preferences.value.mood, customMoodText.value.trim()]
  }

  preferences.value.genres = selectedGenre.value || customGenreText.value.trim()

  console.log('[preferences]', JSON.parse(JSON.stringify(preferences.value)))
  console.log('[initial-message]', buildMessage(preferences.value))

  clearResponse()

  try {
    const result = await $fetch<{ prompt: string }>('/api/generate-prompt', {
      method: 'POST',
      body: { preferences: preferences.value },
    })
    generatedSystemPrompt.value = result.prompt
    console.log('[system-prompt]', result.prompt)
  } catch {
    submitError.value = 'Something went wrong building your assistant. Please try again.'
    isSubmitting.value = false
    return
  }

  commit()
  useState('initialMessage', () => buildMessage(preferences.value)).value = buildMessage(preferences.value)
  router.push('/sections')
}
</script>

<template>
  <div class="flex flex-col absolute inset-0 overflow-hidden bg-page text-white">
    <!-- Scrollable content -->
    <div class="flex-1 overflow-y-auto px-6 pt-10 pb-4">
      <div class="max-w-2xl mx-auto w-full">
        <div class="flex items-center gap-3 mb-10">
          <BedtimeLogo class="size-7 opacity-60 text-white" />
          <span class="text-3xl font-medium tracking-wide">Bedtime</span>
        </div>

        <form @submit.prevent="handleSubmit" class="flex flex-col gap-8">
          <!-- Moment -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-white/50">
              What's the moment for this track?
            </label>
            <Input
              v-model="preferences.vibe"
              placeholder="e.g., sunsets and neon screams, late night drives..."
              class="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-white/20"
            />
          </div>
          
          <!-- DAW -->
          <div class="flex flex-col gap-3">
            <label class="text-sm font-medium text-white/50">
              What DAW do you use? <span class="text-white/30 font-normal">Select one</span>
            </label>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="option in dawOptions"
                :key="option"
                type="button"
                :variant="preferences.daw === option ? 'default' : 'outline'"
                size="sm"
                class="rounded-lg"
                @click="preferences.daw = option"
              >
                {{ option }}
              </Button>
            </div>
          </div>

          <!-- Time of Day -->
          <div class="flex flex-col gap-3">
            <label class="text-sm font-medium text-white/50">
              What time of day does this song live in? <span class="text-white/30 font-normal">Select one</span>
            </label>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="option in timeOptions"
                :key="option"
                type="button"
                :variant="preferences.timeOfDay === option ? 'default' : 'outline'"
                size="sm"
                class="rounded-lg"
                @click="preferences.timeOfDay = option"
              >
                {{ option }}
              </Button>
            </div>
          </div>

          <!-- Movement -->
          <div class="flex flex-col gap-3">
            <label class="text-sm font-medium text-white/50">
              How does this make you move? <span class="text-white/30 font-normal">Select one</span>
            </label>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="option in movementOptions"
                :key="option"
                type="button"
                :variant="preferences.movement === option ? 'default' : 'outline'"
                size="sm"
                class="rounded-lg"
                @click="preferences.movement = option"
              >
                {{ option }}
              </Button>
            </div>
          </div>

          <!-- Mood -->
          <div class="flex flex-col gap-3">
            <label class="text-sm font-medium text-white/50">
              What's the mood? <span class="text-white/30 font-normal">Select one or more</span>
            </label>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="option in moodOptions"
                :key="option"
                type="button"
                :variant="preferences.mood.includes(option) ? 'default' : 'outline'"
                size="sm"
                class="rounded-full"
                @click="toggleMood(option)"
              >
                {{ option }}
              </Button>
              <Button
                type="button"
                :variant="showCustomMood ? 'default' : 'outline'"
                size="sm"
                class="rounded-full"
                @click="toggleCustomMood"
              >
                Other
              </Button>
            </div>
            <Input
              v-if="showCustomMood"
              v-model="customMoodText"
              placeholder="Describe the mood…"
              class="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-white/20"
            />
          </div>

          <!-- Genres -->
          <div class="flex flex-col gap-3">
            <label class="text-sm font-medium text-white/50">
              What genre or sound describe your music? <span class="text-white/30 font-normal">Select one</span>
            </label>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="option in genreOptions"
                :key="option"
                type="button"
                :variant="selectedGenre === option ? 'default' : 'outline'"
                size="sm"
                class="rounded-lg"
                @click="selectGenre(option)"
              >
                {{ option }}
              </Button>
              <Button
                type="button"
                :variant="showCustomGenre ? 'default' : 'outline'"
                size="sm"
                class="rounded-lg"
                @click="toggleCustomGenre"
              >
                Other
              </Button>
            </div>
            <Input
              v-if="showCustomGenre"
              v-model="customGenreText"
              placeholder="Describe your sound…"
              class="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-white/20"
            />
          </div>
          
          <!-- Instruments -->
          <div class="flex flex-col gap-3">
            <label class="text-sm font-medium text-white/50">
              What do you play or use? <span class="text-white/30 font-normal">Select one or more</span>
            </label>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="option in instrumentOptions"
                :key="option"
                type="button"
                :variant="preferences.instruments.includes(option) ? 'default' : 'outline'"
                size="sm"
                class="rounded-full"
                @click="toggleInstrument(option)"
              >
                {{ option }}
              </Button>
            </div>
          </div>

          <!-- References (optional) -->
          <!-- <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-white/50">
              Any artists that capture your sound? <span class="text-white/30">(optional)</span>
            </label>
            <Input
              v-model="preferences.references"
              placeholder="e.g., Kaytranada, Sade, Steely Dan..."
              class="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-white/20"
            />
          </div> -->
        </form>

        <p v-if="submitError" class="mt-4 text-sm text-red-400">{{ submitError }}</p>
      </div>
    </div>

    <!-- Sticky bottom bar -->
    <div class="shrink-0 px-6 py-4 border-t border-white/10 bg-page">
      <div class="max-w-2xl mx-auto w-full">
        <Button
          class="w-full"
          :disabled="!canSubmit || isSubmitting"
          @click="handleSubmit"
        >
          {{ submitLabel }}
        </Button>
      </div>
    </div>
  </div>
</template>
