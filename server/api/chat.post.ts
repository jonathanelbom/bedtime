import OpenAI from 'openai'
import { systemPrompt } from '../utils/systemPrompt'
import { chatSystemPrompt } from '../utils/chatSystemPrompt'
import { createMockStream } from '../utils/mockChat'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequestBody {
  messages: Message[]
  mode?: 'structured' | 'chat'
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const body = await readBody<ChatRequestBody>(event)

  if (!body.messages || !Array.isArray(body.messages)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Messages array is required',
    })
  }

  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })

  if (config.mockAi === 'true') {
    return sendStream(event, createMockStream(body.messages.length))
  }

  if (!config.openaiApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'OpenAI API key is not configured',
    })
  }

  const openai = new OpenAI({
    apiKey: config.openaiApiKey,
  })

  const activeSystemPrompt = body.mode === 'chat' ? chatSystemPrompt : systemPrompt

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: activeSystemPrompt },
      ...body.messages,
    ],
    stream: true,
  })

  const encoder = new TextEncoder()

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || ''
          if (content) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })

  return sendStream(event, readableStream)
})
