<script setup lang="ts">
import { SECTION_ORDER, SECTION_LABELS } from '~/types/chat'
import type { SectionKey } from '~/types/chat'
import { Card, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { useSessionStore } from '~/composables/useSessionStore'
import { ArrowLeft, ArrowRight, MessageCircle } from 'lucide-vue-next'

definePageMeta({ pageIndex: 1 })

const router = useRouter()
const { structuredResponse } = useSessionStore()

if (!structuredResponse.value) {
  navigateTo('/')
}

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
      <PrefChips class="mb-6" />

      <!-- Section cards -->
      <div v-if="structuredResponse" class="space-y-3">
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
            <CardDescription class="line-clamp-2 text-white/70">
              {{ Array.isArray(structuredResponse.sections[key]?.feel) ? structuredResponse.sections[key].feel.join(' ') : (structuredResponse.sections[key]?.feel || '') }}
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
      <div class="max-w-2xl mx-auto w-full flex gap-3 @container">
        <Button variant="outline" class="flex-1" @click="router.push('/')">
          <ArrowLeft class="size-4 shrink-0" /><span class="hidden @[340px]:inline"> Setup</span>
        </Button>
        <Button variant="outline" class="flex-1 gap-2" @click="router.push('/chat')">
          <MessageCircle class="size-4" /> Vibesplain it
        </Button>
        <Button variant="outline" class="flex-1" @click="router.push(`/sections/${SECTION_ORDER.at(0)}`)">
          <span class="hidden @[340px]:inline">{{ SECTION_LABELS[SECTION_ORDER.at(0)!] }}</span> <ArrowRight class="size-4 shrink-0" />
        </Button>
      </div>
    </div>
  </div>
</template>
