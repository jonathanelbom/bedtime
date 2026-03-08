<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { X } from 'lucide-vue-next'
import { useSessionStore } from '~/composables/useSessionStore'
import { useContinuingChat } from '~/composables/useContinuingChat'

definePageMeta({ pageIndex: 9 })

const router = useRouter()
const { structuredResponse, hasResponse } = useSessionStore()
const { visibleMessages, isLoading, initContext, sendMessage } = useContinuingChat()

if (!hasResponse.value) {
  navigateTo('/')
}

const input = ref('')
const messagesEl = ref<HTMLElement | null>(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  })
}

onMounted(() => {
  if (structuredResponse.value) {
    initContext(structuredResponse.value)
  }
  scrollToBottom()
})

watch(visibleMessages, scrollToBottom, { deep: true })

const handleSubmit = async () => {
  const text = input.value.trim()
  if (!text || isLoading.value) return
  input.value = ''
  await sendMessage(text)
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSubmit()
  }
}

const autoResize = (e: Event) => {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}
</script>

<template>
  <div class="flex flex-col absolute inset-0 overflow-hidden bg-page text-white">
    <!-- Top bar -->
    <div class="shrink-0 px-4 pt-4 pb-3 border-b border-white/10">
      <div class="max-w-2xl mx-auto w-full flex items-center justify-between">
        <span class="text-base font-semibold text-white">Let's talk about it</span>
        <Button variant="ghost" size="sm" class="text-white/60 hover:text-white gap-1.5 -mr-2" @click="router.back()">
          <X class="size-4" /> Close
        </Button>
      </div>
    </div>

    <!-- Messages -->
    <div ref="messagesEl" class="flex-1 overflow-y-auto px-4 py-4">
      <div class="max-w-2xl mx-auto w-full space-y-4">
        <!-- Empty state -->
        <div v-if="visibleMessages.length === 0" class="py-12 text-center">
          <p class="text-white/30 text-sm">Ask anything about your rhythm section.</p>
        </div>

        <div
          v-for="message in visibleMessages"
          :key="message.id"
          class="flex"
          :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
            :class="message.role === 'user'
              ? 'bg-white/15 text-white rounded-br-sm'
              : 'bg-white/5 text-white/90 rounded-bl-sm border border-white/10'"
          >
            <span v-if="message.role === 'assistant' && !message.content && isLoading" class="text-white/30">
              ...
            </span>
            <span v-else>{{ message.content }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Input bar -->
    <div class="shrink-0 px-4 py-4 border-t border-white/10 bg-page">
      <div class="max-w-2xl mx-auto w-full flex gap-3 items-end">
        <textarea
          v-model="input"
          rows="1"
          placeholder="Ask about the vibe, a section, what to try next..."
          class="flex-1 resize-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors min-h-[44px] max-h-32"
          :disabled="isLoading"
          @keydown="handleKeydown"
          @input="autoResize"
        />
        <Button
          variant="outline"
          size="sm"
          class="shrink-0 h-11"
          :disabled="isLoading || !input.trim()"
          @click="handleSubmit"
        >
          Send
        </Button>
      </div>
    </div>
  </div>
</template>
