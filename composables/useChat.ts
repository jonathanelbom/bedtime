import { ref, computed } from 'vue'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}

export interface UseChatOptions {
  api?: string
  onError?: (error: Error) => void
  onFinish?: (message: Message) => void
}

export function useChat(options: UseChatOptions = {}) {
  const { api = '/api/chat', onError, onFinish } = options

  const messages = ref<Message[]>([])
  const input = ref('')
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }

  const append = async (message: Omit<Message, 'id' | 'createdAt'>) => {
    const userMessage: Message = {
      id: generateId(),
      role: message.role,
      content: message.content,
      createdAt: new Date(),
    }

    messages.value = [...messages.value, userMessage]

    if (message.role === 'user') {
      await fetchChatCompletion()
    }
  }

  const fetchChatCompletion = async () => {
    isLoading.value = true
    error.value = null

    // Create assistant message placeholder
    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      createdAt: new Date(),
    }
    messages.value = [...messages.value, assistantMessage]

    try {
      const response = await fetch(api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.value.slice(0, -1).map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      let accumulatedContent = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)

            if (data === '[DONE]') {
              continue
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                accumulatedContent += parsed.content

                // Update the assistant message reactively
                messages.value = messages.value.map((msg) =>
                  msg.id === assistantMessage.id
                    ? { ...msg, content: accumulatedContent }
                    : msg
                )
              }
            } catch {
              // Skip invalid JSON lines
            }
          }
        }
      }

      const finalMessage = messages.value.find((m) => m.id === assistantMessage.id)
      if (finalMessage && onFinish) {
        onFinish(finalMessage)
      }
    } catch (err) {
      const errorInstance = err instanceof Error ? err : new Error(String(err))
      error.value = errorInstance

      // Remove the empty assistant message on error
      messages.value = messages.value.filter((m) => m.id !== assistantMessage.id)

      if (onError) {
        onError(errorInstance)
      }
    } finally {
      isLoading.value = false
    }
  }

  const handleSubmit = async (e?: Event) => {
    e?.preventDefault()

    const trimmedInput = input.value.trim()
    if (!trimmedInput || isLoading.value) {
      return
    }

    const userInput = trimmedInput
    input.value = ''

    await append({
      role: 'user',
      content: userInput,
    })
  }

  const setInput = (value: string) => {
    input.value = value
  }

  const clearMessages = () => {
    messages.value = []
  }

  const reload = async () => {
    if (messages.value.length === 0) return

    // Find the last user message
    const lastUserMessageIndex = messages.value.findLastIndex(
      (m) => m.role === 'user'
    )

    if (lastUserMessageIndex === -1) return

    // Remove all messages after and including the last assistant response
    messages.value = messages.value.slice(0, lastUserMessageIndex + 1)

    await fetchChatCompletion()
  }

  const stop = () => {
    // Note: Stopping a streaming request would require AbortController
    // This is a simplified implementation
    isLoading.value = false
  }

  return {
    messages: computed(() => messages.value),
    input,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    handleSubmit,
    setInput,
    append,
    clearMessages,
    reload,
    stop,
  }
}
