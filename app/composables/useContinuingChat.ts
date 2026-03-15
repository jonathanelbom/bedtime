import { SECTION_ORDER, SECTION_LABELS } from '~/types/chat'
import type { SectionsResponse } from '~/types/chat'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  hidden?: boolean
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

export const useContinuingChat = () => {
  const messages = useState<ChatMessage[]>('chat:messages', () => [])
  const isLoading = useState<boolean>('chat:isLoading', () => false)
  const contextInjected = useState<boolean>('chat:contextInjected', () => false)

  const visibleMessages = computed(() => messages.value.filter((m) => !m.hidden))

  const formatContext = (response: SectionsResponse): string => {
    const lines = ['Here is the rhythm section I received:']
    for (const key of SECTION_ORDER) {
      const section = response.sections[key]
      if (!section) continue
      lines.push('')
      lines.push(`${SECTION_LABELS[key].toUpperCase()} — ${section.title}`)
      lines.push(`Feel: ${section.feel}`)
      lines.push(`Ableton tip: ${section.ableton_tip}`)
      if (section.reference) lines.push(`Reference: ${section.reference}`)
    }
    return lines.join('\n')
  }

  const initContext = (response: SectionsResponse) => {
    if (contextInjected.value) return
    messages.value = [
      ...messages.value,
      {
        id: generateId(),
        role: 'user',
        content: formatContext(response),
        hidden: true,
      },
    ]
    contextInjected.value = true
  }

  const sendMessage = async (content: string) => {
    if (isLoading.value || !content.trim()) return

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
    }
    messages.value = [...messages.value, userMessage]

    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
    }
    messages.value = [...messages.value, assistantMessage]
    isLoading.value = true

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'chat',
          messages: messages.value
            .slice(0, -1) // exclude the empty assistant placeholder
            .map(({ role, content }) => ({ role, content })),
        }),
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

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
              accumulated += parsed.content
              messages.value = messages.value.map((m) =>
                m.id === assistantMessage.id ? { ...m, content: accumulated } : m
              )
            }
          } catch {}
        }
      }
    } catch {
      messages.value = messages.value.filter((m) => m.id !== assistantMessage.id)
    } finally {
      isLoading.value = false
    }
  }

  const clearChat = () => {
    messages.value = []
    contextInjected.value = false
    isLoading.value = false
  }

  return {
    messages,
    visibleMessages,
    isLoading,
    contextInjected,
    initContext,
    sendMessage,
    clearChat,
  }
}
