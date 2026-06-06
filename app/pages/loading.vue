<script setup lang="ts">
import { useSessionStore } from '~/composables/useSessionStore'
import { parseStructuredResponse, isSectionsResponse } from '~/utils/parseResponse'

definePageMeta({ pageIndex: 0.5 })

const router = useRouter()
const { preferences, generatedSystemPrompt, structuredResponse, buildMessage, commit, clearResponse } = useSessionStore()
const error = ref<string | null>(null)
const shuffle = (_a:Array<any>) => {
  const a = [..._a];
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]; // Swap elements
  }
  return a;
}
const messages = shuffle([
  'rhythm section compute',
  'calibrating the pocket',
  'dialing in the groove',
  'locking in the feel',
  'reading the room',
  'laying it down',
]);
const messageIndex = ref(0)
const currentMessage = computed(() => messages[messageIndex.value]!)
const onMessageComplete = () => {
  messageIndex.value = (messageIndex.value + 1) % messages.length
}

onMounted(async () => {
  if (!preferences.value.vibe.trim()) {
    router.replace('/')
    return
  }

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
    <div v-else class="absolute inset-0 flex flex-col items-center justify-center gap-5 z-10">
      <BedtimeLogo class="size-8 text-white/50"  style="transform: translateY(-100px)"/>
      <AnimatedMessage
        :message="currentMessage"
        :loop="false"
        size="1.5rem"
        :duration="4000"
        :delay="600"
        @complete="onMessageComplete"
        style="transform: translateY(-80px)"
      />
    </div>
  </div>
</template>

<style scoped>
/* @keyframes logoPulse {
  0%, 100% { opacity: 1; transform: translateY(-140px) scaleY(1.1)}
  50%       { opacity: 1; transform: translateY(-46px) scaleY(.6)}
} */

@keyframes logoPulse {
  0%, 100% { opacity: .6; }
  50%       { opacity: 0; }
}

.logo-pulse {
  transform: translateY(-50px);
  transform-origin: center;
  animation: logoPulse 3.2s ease-in-out infinite;
}
</style>