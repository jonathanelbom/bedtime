<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { useSessionStore } from '~/composables/useSessionStore'

definePageMeta({ pageIndex: 0 })

const router = useRouter()
const { preferences, hasResponse, preferencesChanged, buildMessage, commit, clearResponse } = useSessionStore()

const isSubmitting = ref(false)

const timeOptions = ['Dawn', 'Morning', 'Afternoon', 'Golden Hour', 'Sunset', 'Night', 'Late Night']
const movementOptions = ['Head-nod', 'Body-sway']
const moodOptions = ['Confident', 'Reflective', 'Romantic', 'Cool']

const canSubmit = computed(() =>
  preferences.value.vibe.trim() !== '' &&
  preferences.value.timeOfDay !== '' &&
  preferences.value.movement !== '' &&
  preferences.value.mood !== ''
)

const submitLabel = computed(() => {
  if (isSubmitting.value) return 'Creating...'
  if (hasResponse.value && !preferencesChanged.value) return 'View My Rhythm Section'
  return 'Create Rhythm Section'
})

const handleSubmit = async () => {
  if (!canSubmit.value || isSubmitting.value) return
  isSubmitting.value = true

  if (hasResponse.value && !preferencesChanged.value) {
    router.push('/sections')
    return
  }

  clearResponse()
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
      <h1 class="text-2xl font-bold mb-10 text-center">Neiliyo Rhythm Section</h1>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-8">
        <!-- Vibe -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-white/50">
            What's the vibe or emotion for this track?
          </label>
          <Input
            v-model="preferences.vibe"
            placeholder="e.g., sunsets and neon screams, late night drives..."
            class="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-white/20"
          />
        </div>

        <!-- Time of Day -->
        <div class="flex flex-col gap-3">
          <label class="text-sm font-medium text-white/50">
            What time of day does this song live in?
          </label>
          <div class="flex flex-wrap gap-2">
            <Button
              v-for="option in timeOptions"
              :key="option"
              type="button"
              :variant="preferences.timeOfDay === option ? 'default' : 'outline'"
              size="sm"
              class="rounded-full"
              @click="preferences.timeOfDay = option"
            >
              {{ option }}
            </Button>
          </div>
        </div>

        <!-- Movement -->
        <div class="flex flex-col gap-3">
          <label class="text-sm font-medium text-white/50">
            More head-nod or body-sway?
          </label>
          <div class="flex gap-3">
            <Button
              v-for="option in movementOptions"
              :key="option"
              type="button"
              :variant="preferences.movement === option ? 'default' : 'outline'"
              class="flex-1"
              @click="preferences.movement = option"
            >
              {{ option }}
            </Button>
          </div>
        </div>

        <!-- Mood -->
        <div class="flex flex-col gap-3">
          <label class="text-sm font-medium text-white/50">
            What's the mood?
          </label>
          <div class="grid grid-cols-2 gap-3">
            <Button
              v-for="option in moodOptions"
              :key="option"
              type="button"
              :variant="preferences.mood === option ? 'default' : 'outline'"
              @click="preferences.mood = option"
            >
              {{ option }}
            </Button>
          </div>
        </div>
      </form>
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
