import { jsonrepair } from 'jsonrepair'
import type { StructuredResponse } from '~/types/chat'

function tryParse(str: string): StructuredResponse | null {
  // Try strict parse first, then repair
  for (const candidate of [str, jsonrepair(str)]) {
    try {
      const parsed = JSON.parse(candidate)
      if (isValidStructuredResponse(parsed)) return parsed
    } catch {
      // Continue
    }
  }
  return null
}

/**
 * Attempts to parse a structured JSON response from the GPT output.
 * Returns null if parsing fails or the response is invalid.
 */
export function parseStructuredResponse(content: string): StructuredResponse | null {
  const trimmed = content.trim()

  // Try direct parse (with repair fallback)
  const direct = tryParse(trimmed)
  if (direct) return direct

  // Try extracting JSON from markdown code blocks
  const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (jsonMatch) {
    const fromBlock = tryParse(jsonMatch[1])
    if (fromBlock) return fromBlock
  }

  // Try finding JSON object boundaries
  const firstBrace = trimmed.indexOf('{')
  const lastBrace = trimmed.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const extracted = tryParse(trimmed.slice(firstBrace, lastBrace + 1))
    if (extracted) return extracted
  }

  return null
}

/**
 * Type guard to validate the structure of a parsed response.
 */
function isValidStructuredResponse(obj: unknown): obj is StructuredResponse {
  if (typeof obj !== 'object' || obj === null) {
    return false
  }

  const typed = obj as Record<string, unknown>

  if (typed.type === 'questions') {
    return Array.isArray(typed.questions) && typed.questions.every((q) => typeof q === 'string')
  }

  if (typed.type === 'response') {
    return typeof typed.sections === 'object' && typed.sections !== null
  }

  return false
}

/**
 * Check if a response is a questions type
 */
export function isQuestionsResponse(
  response: StructuredResponse
): response is { type: 'questions'; questions: string[] } {
  return response.type === 'questions'
}

/**
 * Check if a response is a sections type
 */
export function isSectionsResponse(
  response: StructuredResponse
): response is import('~/types/chat').SectionsResponse {
  return response.type === 'response'
}
