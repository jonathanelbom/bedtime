<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { useSessionStore } from '~/composables/useSessionStore'

definePageMeta({ pageIndex: 0 })

const router = useRouter()
const { preferences, hasResponse, preferencesChanged } = useSessionStore()

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
  if (hasResponse.value && !preferencesChanged.value) return 'View My Rhythm Section'
  return 'Create Rhythm Section'
})

const handleSubmit = () => {
  if (!canSubmit.value) return

  if (hasResponse.value && !preferencesChanged.value) {
    router.push('/sections')
    return
  }

  if (customMoodText.value.trim() && !preferences.value.mood.includes(customMoodText.value.trim())) {
    preferences.value.mood = [...preferences.value.mood, customMoodText.value.trim()]
  }

  preferences.value.genres = selectedGenre.value || customGenreText.value.trim()

  router.push('/loading')
}

// ── Progressive disclosure ─────────────────────────────────────────────────
// Sections: 0=Moment, 1=Time, 2=Movement, 3=Mood, 4=Genres, 5=Instruments, 6=DAW
// Initialised synchronously so returning users see all sections without animation.
const sectionVisible = ref([
  true,                                                              // 0: Moment — always visible
  !!preferences.value.vibe.trim(),                                   // 1: Time of Day
  !!preferences.value.timeOfDay,                                     // 2: Movement
  !!preferences.value.movement,                                      // 3: Mood
  preferences.value.mood.length > 0,                                 // 4: Genres
  !!(selectedGenre.value || customGenreText.value.trim()),           // 5: Instruments
  preferences.value.instruments.length > 0,                          // 6: DAW
])

const sectionRefs = ref<(HTMLElement | null)[]>(Array(7).fill(null))

function revealSection(index: number) {
  if (sectionVisible.value[index]) return
  sectionVisible.value[index] = true
  nextTick(() => {
    sectionRefs.value[index]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  })
}

watch(() => preferences.value.vibe, v => { if (v.trim()) revealSection(1) })
watch(() => preferences.value.timeOfDay, v => { if (v) revealSection(2) })
watch(() => preferences.value.movement, v => { if (v) revealSection(3) })
watch([() => preferences.value.mood, customMoodText], () => {
  if (preferences.value.mood.length > 0 || customMoodText.value.trim()) revealSection(4)
})
watch([selectedGenre, customGenreText], () => {
  if (selectedGenre.value || customGenreText.value.trim()) revealSection(5)
})
watch(() => preferences.value.instruments, v => { if (v.length > 0) revealSection(6) })
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

        <form @submit.prevent="handleSubmit" class="flex flex-col">

          <!-- 0: Moment — always visible -->
          <div class="flex flex-col gap-2 mb-8">
            <label class="text-sm font-medium text-white/70">
              What's the moment for this track?
            </label>
            <Input
              v-model="preferences.vibe"
              placeholder="e.g., sunsets and neon screams, late night drives..."
              class="bg-white/5 border-white/10 text-white placeholder:text-white/50 focus-visible:ring-white/20"
            />
          </div>

          <!-- 1: Time of Day -->
          <Transition name="section-reveal">
            <div
              v-if="sectionVisible[1]"
              :ref="el => sectionRefs[1] = el as HTMLElement | null"
              class="flex flex-col gap-3 mb-8"
            >
              <label class="text-sm font-medium text-white/70">
                What time of day does this song live in? <span class="text-white/50 font-normal">Select one</span>
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
          </Transition>

          <!-- 2: Movement -->
          <Transition name="section-reveal">
            <div
              v-if="sectionVisible[2]"
              :ref="el => sectionRefs[2] = el as HTMLElement | null"
              class="flex flex-col gap-3 mb-8"
            >
              <label class="text-sm font-medium text-white/70">
                How does this make you move? <span class="text-white/50 font-normal">Select one</span>
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
          </Transition>

          <!-- 3: Mood -->
          <Transition name="section-reveal">
            <div
              v-if="sectionVisible[3]"
              :ref="el => sectionRefs[3] = el as HTMLElement | null"
              class="flex flex-col gap-3 mb-8"
            >
              <label class="text-sm font-medium text-white/70">
                What's the mood? <span class="text-white/50 font-normal">Select one or more</span>
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
                class="bg-white/5 border-white/10 text-white placeholder:text-white/50 focus-visible:ring-white/20"
              />
            </div>
          </Transition>

          <!-- 4: Genres -->
          <Transition name="section-reveal">
            <div
              v-if="sectionVisible[4]"
              :ref="el => sectionRefs[4] = el as HTMLElement | null"
              class="flex flex-col gap-3 mb-8"
            >
              <label class="text-sm font-medium text-white/70">
                What genre or sound describe your music? <span class="text-white/50 font-normal">Select one</span>
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
                class="bg-white/5 border-white/10 text-white placeholder:text-white/50 focus-visible:ring-white/20"
              />
            </div>
          </Transition>

          <!-- 5: Instruments -->
          <Transition name="section-reveal">
            <div
              v-if="sectionVisible[5]"
              :ref="el => sectionRefs[5] = el as HTMLElement | null"
              class="flex flex-col gap-3 mb-8"
            >
              <label class="text-sm font-medium text-white/70">
                Got your hands on anything in particular? <span class="text-white/50 font-normal">Select one or more</span>
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
          </Transition>

          <!-- 6: DAW -->
          <Transition name="section-reveal">
            <div
              v-if="sectionVisible[6]"
              :ref="el => sectionRefs[6] = el as HTMLElement | null"
              class="flex flex-col gap-3 mb-8"
            >
              <label class="text-sm font-medium text-white/70">
                What DAW do you use? <span class="text-white/50 font-normal">Select one</span>
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
          </Transition>

        </form>

      </div>
    </div>

    <!-- Sticky bottom bar — reveals once the last section appears -->
    <Transition name="bottom-bar">
      <div v-if="sectionVisible[6]" class="shrink-0 px-6 py-4 border-t border-white/10 bg-page">
        <div class="max-w-2xl mx-auto w-full">
          <Button
            class="w-full"
            :disabled="!canSubmit"
            @click="handleSubmit"
          >
            {{ submitLabel }}
          </Button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.section-reveal-enter-active {
  transition: opacity 400ms ease, transform 400ms ease;
}
.section-reveal-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.bottom-bar-enter-active {
  transition: opacity 400ms ease, transform 400ms ease;
}
.bottom-bar-enter-from {
  opacity: 0;
  transform: translateY(100%);
}
</style>
