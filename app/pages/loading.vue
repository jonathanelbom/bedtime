<script setup lang="ts">
import { useSessionStore } from '~/composables/useSessionStore'
import { parseStructuredResponse, isSectionsResponse } from '~/utils/parseResponse'

definePageMeta({ pageIndex: 0.5 })

const router = useRouter()
const { preferences, generatedSystemPrompt, structuredResponse, buildMessage, commit, clearResponse } = useSessionStore()
const loadingMessage = useState<string>('loadingMessage', () => 'building')
const error = ref<string | null>(null)
const textActive = ref(false)

const messageChars = loadingMessage.value.split('')
const letterDelays = messageChars.map(() => Math.random() * 1000)

onMounted(async () => {
  setTimeout(() => { textActive.value = true }, 80)

  if (!preferences.value.vibe.trim()) return

  clearResponse()

  // Step 1 — generate personalized system prompt
  try {
    const result = await $fetch<{ prompt: string }>('/api/generate-prompt', {
      method: 'POST',
      body: { preferences: preferences.value },
    })
    generatedSystemPrompt.value = result.prompt
  } catch {
    error.value = 'Something went wrong. Please try again.'
    return
  }

  // Step 2 — stream structured sections response
  try {
    const initialMessage = buildMessage(preferences.value)
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: initialMessage }],
        systemPrompt: generatedSystemPrompt.value ?? undefined,
      }),
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    if (!response.body) throw new Error('No response body')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let accumulatedContent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6)
        if (data === '[DONE]') continue
        try {
          const parsed = JSON.parse(data)
          if (parsed.content) accumulatedContent += parsed.content
        } catch {}
      }
    }

    const parsed = parseStructuredResponse(accumulatedContent)
    if (parsed && isSectionsResponse(parsed)) {
      structuredResponse.value = parsed
    } else {
      error.value = 'Failed to parse response. Please try again.'
      return
    }
  } catch {
    error.value = 'Something went wrong. Please try again.'
    return
  }

  commit()
  router.push('/sections')
})
</script>

<template>
  <div class="absolute inset-0 bg-page text-white overflow-hidden">
    <GradientRain />

    <!-- Error state -->
    <div v-if="error" class="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8 z-10">
      <p class="text-white/60 text-center text-sm">{{ error }}</p>
      <button
        class="text-xs text-white/40 underline underline-offset-4"
        @click="router.push('/')"
      >go back</button>
    </div>

    <!-- Loading state -->
    <div v-else class="absolute inset-0 flex items-center justify-center gap-5 z-10">
      <BedtimeLogo class="size-8 opacity-50 text-white logo-pulse" />
      <div class="message-clip">
        <div class="message" :class="{ 'message--active': textActive }">
          <span
            v-for="(char, i) in messageChars"
            :key="i"
            :class="char === ' ' ? 'letter-space' : 'letter'"
            :style="char !== ' ' ? { animationDelay: letterDelays[i] + 'ms' } : {}"
          >{{ char === ' ' ? ' ' : char }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Logo ─────────────────────────────────────────── */

@keyframes logoPulse {
  0%, 100% { opacity: 1; transform: translateY(-140px) scaleY(1.1)}
  50%       { opacity: 1; transform: translateY(-46px) scaleY(.6)}
}

.logo-pulse {
  transform: translateY(-50px);
  transform-origin: center;
  animation: logoPulse 1.2s ease-in-out infinite;
}

/* ── Message letters ──────────────────────────────── */

.message-clip {
  overflow: hidden;
  height: 1.6em;
  display: flex;
  align-items: flex-end;
  transform: translateY(-50px);
}

.message {
  display: flex;
  align-items: flex-end;
  position: relative;
  transform: translateY(10px)
}

.letter {
  display: inline-block;
  transform: translateY(100%);
  font-size: 1.5rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.letter-space {
  display: inline-block;
  width: 0.35em;
}

.message--active .letter {
  /* animation: mole 2.8s ease-in-out infinite; */
  animation: mole 5s ease-in-out infinite;
}

/* @keyframes mole {
  0%   { transform: translateY(110%); }
  15%  { transform: translateY(0); }
  40%  { transform: translateY(0); }
  55%  { transform: translateY(110%); }
  100% { transform: translateY(110%); }
} */
@keyframes mole {
  0%   { transform: translateY(100%); opacity: 0}
  25%  { transform: translateY(0); opacity: 1}
  75%  { transform: translateY(0); opacity: 1}
  100% { transform: translateY(100%); opacity: 0}
}
</style>
