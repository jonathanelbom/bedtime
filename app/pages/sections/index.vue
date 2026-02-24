<script setup lang="ts">
import { SECTION_ORDER, SECTION_LABELS } from '~/types/chat'
import type { SectionKey } from '~/types/chat'
import { parseStructuredResponse, isSectionsResponse } from '~/utils/parseResponse'
import { Card, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { useSessionStore } from '~/composables/useSessionStore'

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
  <div class="flex flex-col absolute inset-0 overflow-hidden bg-slate-950 text-white">
    <!-- Scrollable content -->
    <div class="flex-1 overflow-y-auto px-6 pt-8 pb-4">
      <div class="max-w-2xl mx-auto w-full">
      <h1 class="text-2xl font-bold mb-4">Your Rhythm Section</h1>

      <!-- Preference chips -->
      <div v-if="prefChips.length" class="flex flex-wrap gap-2 mb-6">
        <Badge v-for="chip in prefChips" :key="chip" variant="secondary" class="text-xs">
          {{ chip }}
        </Badge>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="space-y-3">
        <div
          v-for="i in 7"
          :key="i"
          class="h-20 rounded-lg bg-slate-900 border border-slate-800 animate-pulse"
        />
        <p class="text-sm text-slate-500 text-center pt-2">Generating your rhythm section...</p>
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
          class="cursor-pointer bg-slate-900 border-slate-800 hover:bg-slate-800 transition-colors"
          @click="navigateToSection(key)"
        >
          <CardHeader class="pb-3">
            <CardTitle class="text-base">
              {{ structuredResponse.sections[key]?.title || SECTION_LABELS[key] }}
            </CardTitle>
            <CardDescription class="line-clamp-2 text-slate-400">
              {{ structuredResponse.sections[key]?.feel || '' }}
            </CardDescription>
          </CardHeader>
        </Card>

        <!-- Debug JSON -->
        <details class="mt-4">
          <summary class="text-slate-600 text-xs cursor-pointer">View Raw JSON</summary>
          <pre class="mt-2 text-xs text-slate-600 bg-slate-900 p-4 rounded-lg overflow-auto">{{ JSON.stringify(structuredResponse, null, 2) }}</pre>
        </details>
      </div>
      </div>
    </div>

    <!-- Sticky bottom bar -->
    <div class="shrink-0 px-6 py-4 border-t border-white/10 bg-slate-950">
      <div class="max-w-2xl mx-auto w-full">
        <Button variant="outline" class="w-full" @click="router.push('/')">
          ← Edit Preferences
        </Button>
      </div>
    </div>
  </div>
</template>
