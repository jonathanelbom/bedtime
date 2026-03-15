<script setup lang="ts">
import { SECTION_ORDER, SECTION_LABELS } from '~/types/chat'
import type { SectionKey, SectionContent } from '~/types/chat'
import { Button } from '~/components/ui/button'
import { MessageCircle } from 'lucide-vue-next'
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

const navScrollRef = ref<HTMLDivElement | null>(null)
const activePillRef = ref<HTMLButtonElement | null>(null)

function scrollActivePillIntoView() {
  const container = navScrollRef.value
  const el = activePillRef.value
  if (!el || !container) return
  const center = el.offsetLeft - (container.offsetWidth - el.offsetWidth) / 2
  container.scrollLeft = Math.max(0, center)
}

onMounted(scrollActivePillIntoView)
watch(sectionKey, () => nextTick(scrollActivePillIntoView))
</script>

<template>
  <div class="flex flex-col absolute inset-0 overflow-hidden bg-page text-white">
    <!-- Mini section nav -->
    <div class="shrink-0 px-6 pt-4 pb-2">
      <div class="max-w-2xl mx-auto w-full flex items-center">
      <!-- Logo: pinned left, aligned with content left edge -->
      <button @click="router.push('/')" class="shrink-0 pr-3">
        <BedtimeLogo class="size-7 text-white/60 hover:text-white transition-colors" />
      </button>
      <!-- Section tabs: scroll freely to the right viewport edge -->
      <div ref="navScrollRef" class="flex gap-2 overflow-x-auto no-scrollbar pb-1 pr-4">
        <button
          v-for="key in SECTION_ORDER"
          :key="key"
          :ref="key === sectionKey ? (el) => { activePillRef = el as HTMLButtonElement } : undefined"
          @click="router.push(`/sections/${key}`)"
          class="shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors"
          :class="key === sectionKey
            ? 'bg-white text-black font-medium'
            : 'bg-white/10 text-white/50 hover:bg-white/20'"
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
          <!-- Section title -->
          <div class="mb-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-white/40 text-sm mb-1">{{ SECTION_LABELS[sectionKey] }}</p>
                <h1 class="text-2xl font-bold">
                  {{ sectionContent.title || SECTION_LABELS[sectionKey] }}
                </h1>
              </div>
              <Dialog>
                <DialogTrigger as-child>
                  <Button variant="ghost" size="sm" class="text-white/30 font-mono text-xs shrink-0 -mr-2">
                    { }
                  </Button>
                </DialogTrigger>
                <DialogContent class="max-w-lg max-h-[80vh] overflow-auto bg-stone-950 border-stone-800">
                  <DialogHeader>
                    <DialogTitle class="text-white">Raw JSON</DialogTitle>
                  </DialogHeader>
                  <pre class="text-xs text-white/50 overflow-auto">{{ JSON.stringify(sectionContent, null, 2) }}</pre>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <!-- Content cards -->
          <div class="space-y-4">
            <Card class="bg-white/5 border-white/10 gap-2">
              <CardHeader>
                <CardTitle class="text-base font-medium text-white/50">Feel</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-white/90 leading-relaxed">{{ sectionContent.feel }}</p>
              </CardContent>
            </Card>

            <Card class="bg-white/5 border-white/10 gap-2">
              <CardHeader>
                <CardTitle class="text-base font-medium text-white/50">Ableton Tip</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-white/90 leading-relaxed">{{ sectionContent.ableton_tip }}</p>
              </CardContent>
            </Card>

            <Card v-if="sectionContent.reference" class="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle class="text-base font-medium text-white/50">Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-white/90">{{ sectionContent.reference }}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <!-- No content fallback -->
        <div v-else class="text-center py-12">
          <p class="text-white/50">Section not found</p>
        </div>
      </div>
    </div>

    <!-- Sticky bottom nav -->
    <div class="shrink-0 px-6 py-4 border-t border-white/10 bg-page">
      <div class="max-w-2xl mx-auto w-full flex gap-3">
        <Button
          variant="outline"
          class="flex-1"
          @click="router.push(prevSection ? `/sections/${prevSection}` : '/sections')"
        >
          ← {{ prevSection ? SECTION_LABELS[prevSection] : 'Overview' }}
        </Button>

        <Button variant="outline" class="flex-1 gap-2" @click="router.push('/chat')">
          <MessageCircle class="size-4" /> Chat
        </Button>

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
