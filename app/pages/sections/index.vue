<script setup lang="ts">
import { SECTION_ORDER, SECTION_LABELS } from '~/types/chat'
import type { SectionKey } from '~/types/chat'
import { parseStructuredResponse, isSectionsResponse } from '~/utils/parseResponse'
import { Card, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { useSessionStore } from '~/composables/useSessionStore'
import { MessageCircle } from 'lucide-vue-next'

definePageMeta({ pageIndex: 1 })

const router = useRouter()
const { preferences, structuredResponse } = useSessionStore()
const initialMessage = useState<string>('initialMessage')

const isLoading = ref(!structuredResponse.value)
const error = ref<string | null>(null)
const rawContent = ref('')

// Redirect if no data on refresh
if (!structuredResponse.value && !initialMessage.value) {
  navigateTo('/')
}

// Preference chips for display
const prefChips = computed(() => {
  const p = preferences.value
  return [p.vibe, p.timeOfDay, p.movement, p.mood].filter(Boolean)
})

onMounted(async () => {
  if (structuredResponse.value) return

  if (!initialMessage.value) {
    navigateTo('/')
    return
  }

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: initialMessage.value }],
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
          if (parsed.content) {
            accumulatedContent += parsed.content
            rawContent.value = accumulatedContent
          }
        } catch {}
      }
    }

    console.log('Raw accumulated content:', accumulatedContent)
    const parsed = parseStructuredResponse(accumulatedContent)
    console.log('Parsed response:', parsed)

    if (parsed && isSectionsResponse(parsed)) {
      structuredResponse.value = parsed
    } else {
      error.value = 'Failed to parse response'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    isLoading.value = false
  }
})

const navigateToSection = (key: SectionKey) => router.push(`/sections/${key}`)
</script>

<template>
  <div class="flex flex-col absolute inset-0 overflow-hidden bg-page text-white">
    <!-- Scrollable content -->
    <div class="flex-1 overflow-y-auto px-6 pt-8 pb-4">
      <div class="max-w-2xl mx-auto w-full">
      <div class="flex items-center gap-3 mb-4">
        <BedtimeLogo class="size-7 opacity-60 text-white" />
        <h1 class="text-2xl font-bold">Your Rhythm Section</h1>
      </div>

      <!-- Preference chips -->
      <div v-if="prefChips.length" class="flex flex-wrap gap-2 mb-6">
        <Badge v-for="chip in prefChips" :key="chip" variant="secondary" class="text-xs border-0" style="background-color: #00000055">
          {{ chip }}
        </Badge>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="space-y-3">
        <p class="text-sm text-white/40 text-center pb-2">Generating your rhythm section...</p>
        <div
          v-for="i in 7"
          :key="i"
          class="h-20 rounded-lg bg-white/5 border border-white/10 animate-pulse"
        />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-900/20 border border-red-800 rounded-lg p-4">
        <p class="text-red-400 mb-2">{{ error }}</p>
        <details v-if="rawContent">
          <summary class="text-slate-500 text-xs cursor-pointer mb-2">View raw response</summary>
          <pre class="text-xs text-slate-500 overflow-auto max-h-40">{{ rawContent }}</pre>
        </details>
      </div>

      <!-- Section cards -->
      <div v-else-if="structuredResponse" class="space-y-3">
        <Card
          v-for="key in SECTION_ORDER"
          :key="key"
          class="cursor-pointer bg-white/5 border-white/10 hover:bg-white/10 transition-colors"
          @click="navigateToSection(key)"
        >
          <CardHeader class="pb-3">
            <CardTitle class="text-base">
              {{ structuredResponse.sections[key]?.title || SECTION_LABELS[key] }}
            </CardTitle>
            <CardDescription class="line-clamp-2 text-white/50">
              {{ structuredResponse.sections[key]?.feel || '' }}
            </CardDescription>
          </CardHeader>
        </Card>

        <!-- Debug JSON -->
        <details class="mt-4">
          <summary class="text-white/30 text-xs cursor-pointer">View Raw JSON</summary>
          <pre class="mt-2 text-xs text-white/30 bg-black/20 p-4 rounded-lg overflow-auto">{{ JSON.stringify(structuredResponse, null, 2) }}</pre>
        </details>
      </div>
      </div>
    </div>

    <!-- Sticky bottom bar -->
    <div class="shrink-0 px-6 py-4 border-t border-white/10 bg-page">
      <div class="max-w-2xl mx-auto w-full flex gap-3">
        <Button variant="outline" class="flex-1" @click="router.push('/')">
          ← Setup
        </Button>
        <Button variant="outline" class="flex-1 gap-2" :disabled="isLoading" @click="router.push('/chat')">
          <MessageCircle class="size-4" /> Chat
        </Button>
        <Button variant="outline" class="flex-1" :disabled="isLoading" @click="router.push(`/sections/${SECTION_ORDER.at(0)}`)">
          {{ SECTION_LABELS[SECTION_ORDER.at(0)!] }} →
        </Button>
      </div>
    </div>
  </div>
</template>
