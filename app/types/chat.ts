export interface SectionContent {
  title: string
  feel: string
  daw_tip: string
  reference?: string | null
}

export type SectionKey =
  | 'tempo'
  | 'drums'
  | 'bass'
  | 'chords'
  | 'keys_scales'
  | 'instrument'
  | 'avoid'

export interface StructuredSections {
  tempo?: SectionContent
  drums?: SectionContent
  bass?: SectionContent
  chords?: SectionContent
  keys_scales?: SectionContent
  instrument?: SectionContent
  avoid?: SectionContent
}

export interface QuestionsResponse {
  type: 'questions'
  questions: string[]
}

export interface SectionsResponse {
  type: 'response'
  sections: StructuredSections
}

export type StructuredResponse = QuestionsResponse | SectionsResponse

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
  structured?: StructuredResponse | null
  isStreaming?: boolean
}

// Section display metadata
export const SECTION_ORDER: SectionKey[] = [
  'tempo',
  'drums',
  'bass',
  'chords',
  'keys_scales',
  'instrument',
  'avoid',
]

export const SECTION_LABELS: Record<SectionKey, string> = {
  tempo: 'Tempo',
  drums: 'Drums',
  bass: 'Bass',
  chords: 'Chords',
  keys_scales: 'Keys & Scales',
  instrument: 'Hands-on',
  avoid: 'What to Avoid',
}
