<script setup lang="ts">
import { SECTION_ORDER, SECTION_LABELS } from '~/types/chat'
import type { SectionKey, SectionContent } from '~/types/chat'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { useSessionStore } from '~/composables/useSessionStore'

definePageMeta({ pageIndex: 2 })

const route = useRoute()
const router = useRouter()
const { structuredResponse } = useSessionStore()

const sectionKey = computed(() => route.params.key as SectionKey)

if (!structuredResponse.value) {
  navigateTo('/')
}

const sectionContent = computed<SectionContent | null>(() => {
  if (!structuredResponse.value?.sections) return null
  return structuredResponse.value.sections[sectionKey.value] || null
})

const currentIndex = computed(() => SECTION_ORDER.indexOf(sectionKey.value))
const prevSection = computed(() => currentIndex.value > 0 ? SECTION_ORDER[currentIndex.value - 1] : null)
const nextSection = computed(() => currentIndex.value < SECTION_ORDER.length - 1 ? SECTION_ORDER[currentIndex.value + 1] : null)
</script>

<template>
  <div class="flex flex-col absolute inset-0 overflow-hidden bg-stone-950 text-white">
    <!-- Mini section nav -->
    <div class="shrink-0 px-4 pt-4 pb-2">
      <div class="max-w-2xl mx-auto w-full">
        <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            v-for="key in SECTION_ORDER"
            :key="key"
            @click="router.push(`/sections/${key}`)"
            class="shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors"
            :class="key === sectionKey
              ? 'bg-white text-black font-medium'
              : 'bg-stone-800 text-stone-400 hover:bg-stone-700'"
          >
            {{ SECTION_LABELS[key] }}
          </button>
        </div>
      </div>
    </div>

    <!-- Scrollable content -->
    <div class="flex-1 overflow-y-auto px-6 py-4">
      <div class="max-w-2xl mx-auto w-full">
        <div v-if="sectionContent">
          <!-- Back to start + JSON debug -->
          <div class="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" class="text-stone-500 -ml-2" @click="router.push('/')">
              ← Start
            </Button>
            <Dialog>
              <DialogTrigger as-child>
                <Button variant="ghost" size="sm" class="text-stone-600 font-mono text-xs shrink-0">
                  { }
                </Button>
              </DialogTrigger>
              <DialogContent class="max-w-lg max-h-[80vh] overflow-auto bg-stone-950 border-stone-800">
                <DialogHeader>
                  <DialogTitle class="text-white">Raw JSON</DialogTitle>
                </DialogHeader>
                <pre class="text-xs text-stone-400 overflow-auto">{{ JSON.stringify(sectionContent, null, 2) }}</pre>
              </DialogContent>
            </Dialog>
          </div>

          <!-- Section title -->
          <div class="mb-6">
            <h1 class="text-2xl font-bold">
              {{ sectionContent.title || SECTION_LABELS[sectionKey] }}
            </h1>
            <p class="text-stone-500 text-sm mt-1">{{ SECTION_LABELS[sectionKey] }}</p>
          </div>

          <!-- Content cards -->
          <div class="space-y-4">
            <Card class="bg-stone-900 border-stone-800">
              <CardHeader class="pb-2">
                <CardTitle class="text-sm font-medium text-stone-400">Feel</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-stone-100 leading-relaxed">{{ sectionContent.feel }}</p>
              </CardContent>
            </Card>

            <Card class="bg-stone-900 border-stone-800">
              <CardHeader class="pb-2">
                <CardTitle class="text-sm font-medium text-stone-400">Ableton Tip</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-stone-100 leading-relaxed">{{ sectionContent.ableton_tip }}</p>
              </CardContent>
            </Card>

            <Card v-if="sectionContent.reference" class="bg-stone-900 border-stone-800">
              <CardHeader class="pb-2">
                <CardTitle class="text-sm font-medium text-stone-400">Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-stone-100">{{ sectionContent.reference }}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <!-- No content fallback -->
        <div v-else class="text-center py-12">
          <p class="text-stone-400">Section not found</p>
        </div>
      </div>
    </div>

    <!-- Sticky bottom nav -->
    <div class="shrink-0 px-6 py-4 border-t border-white/10 bg-stone-950">
      <div class="max-w-2xl mx-auto w-full flex gap-3">
        <Button
          v-if="prevSection"
          variant="outline"
          class="flex-1"
          @click="router.push(`/sections/${prevSection}`)"
        >
          ← {{ SECTION_LABELS[prevSection] }}
        </Button>
        <div v-else class="flex-1" />

        <Button
          v-if="nextSection"
          variant="outline"
          class="flex-1"
          @click="router.push(`/sections/${nextSection}`)"
        >
          {{ SECTION_LABELS[nextSection] }} →
        </Button>
        <div v-else class="flex-1" />
      </div>
    </div>
  </div>
</template>

<style>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
