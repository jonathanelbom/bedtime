<script setup lang="ts">
const { messages, input, isLoading, error, handleSubmit } = useChat({
  onError: (err) => {
    console.error('Chat error:', err)
  },
})

const scrollContainer = ref<HTMLElement | null>(null)

// Auto-scroll to bottom when new messages arrive
watch(
  () => messages.value,
  () => {
    nextTick(() => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
      }
    })
  },
  { deep: true }
)
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-4 py-3">
      <h1 class="text-xl font-semibold text-gray-800">Bedtime</h1>
    </header>

    <!-- Messages Container -->
    <div ref="scrollContainer" class="flex-1 overflow-y-auto px-4 py-6">
      <div class="max-w-3xl mx-auto space-y-4">
        <!-- Empty state -->
        <div
          v-if="messages.length === 0"
          class="text-center text-gray-500 py-12"
        >
          <p class="text-lg">A creative rhythm section consultant</p>
          <p class="text-sm mt-2">for your bedtime tinkering</p>
        </div>

        <!-- Messages -->
        <div
          v-for="message in messages"
          :key="message.id"
          class="flex"
          :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[80%] rounded-lg px-4 py-2"
            :class="
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-800'
            "
          >
            <p class="whitespace-pre-wrap">{{ message.content }}</p>
            <span
              class="text-xs mt-1 block"
              :class="message.role === 'user' ? 'text-blue-200' : 'text-gray-400'"
            >
              {{ message.createdAt.toLocaleTimeString() }}
            </span>
          </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="isLoading && messages[messages.length - 1]?.content === ''" class="flex justify-start">
          <div class="bg-white border border-gray-200 rounded-lg px-4 py-2">
            <div class="flex space-x-2">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
            </div>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="error" class="text-center">
          <div class="inline-block bg-red-100 text-red-700 px-4 py-2 rounded-lg">
            <p class="text-sm">{{ error.message }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Form -->
    <div class="border-t border-gray-200 bg-white px-4 py-4">
      <form @submit="handleSubmit" class="max-w-3xl mx-auto">
        <div class="flex space-x-4">
          <input
            v-model="input"
            type="text"
            placeholder="Use your day, mood, or desires as an inspiration for your song..."
            :disabled="isLoading"
            class="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            :disabled="isLoading || !input.trim()"
            class="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="isLoading">Sending...</span>
            <span v-else>Send</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
