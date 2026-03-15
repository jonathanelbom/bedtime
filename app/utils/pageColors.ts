import type { SectionKey } from '~/types/chat'

// Calibration: at 390px (typical mobile) the transition should feel like ~350ms.
// All other widths scale proportionally, clamped to a sensible range.
const TRANSITION_REF_WIDTH = 390
const TRANSITION_REF_MS   = 350
const TRANSITION_SPEED     = TRANSITION_REF_WIDTH / TRANSITION_REF_MS // px/ms

/**
 * Returns a transition duration (ms) that maintains consistent perceived speed
 * as the viewport widens — wider screens get proportionally more time.
 * Clamped to [400, 800] so it never feels too snappy or too sluggish.
 */
export function getTransitionDuration(viewportWidth: number): number {
  return Math.round(Math.min(Math.max(viewportWidth / TRANSITION_SPEED, 400), 800))
}

// Calibration: at 844px (typical mobile height) the sheet transition should feel like ~480ms.
const SHEET_REF_HEIGHT = 844
const SHEET_REF_MS     = 480
const SHEET_SPEED      = SHEET_REF_HEIGHT / SHEET_REF_MS // px/ms

/**
 * Returns a sheet transition duration (ms) proportional to viewport height —
 * the sheet slides a full viewport-height, so taller screens need more time.
 * Clamped to [350, 750] so it never feels too snappy or too sluggish.
 */
export function getSheetTransitionDuration(viewportHeight: number): number {
  return Math.round(Math.min(Math.max(viewportHeight / SHEET_SPEED, 350), 750))
}

const PALETTES = {
  // A: very dark, minimal tint
  original: {
    setup:       '#1e1a30', // deep velvet purple
    overview:    '#1e2438', // deep navy
    tempo:       '#152530', // dark navy-teal
    drums:       '#142218', // dark forest
    bass:        '#1d1a2e', // deep indigo-plum
    chords:      '#1b1a24', // cool charcoal-violet
    keys_scales: '#162030', // dark slate-teal
    guitar:      '#20191e', // dark rose-gray
    avoid:       '#14102a', // near-black purple
    chat:        '#101820', // deep cool-dark
    tealDark:    '#1a2a30',
    mauveDark:   '#231f30',
  },
  // B: same darkness, clearly tinted
  medium: {
    setup:       '#1c1038', // vivid deep purple
    overview:    '#0e1a36', // rich navy
    tempo:       '#0c1e2a', // rich teal-blue
    drums:       '#0c1e12', // rich forest green
    bass:        '#150a30', // vivid indigo
    chords:      '#14102a', // deep violet
    keys_scales: '#0a1828', // deep slate
    guitar:      '#241020', // vivid rose-plum
    avoid:       '#100628', // near-black violet
    chat:        '#0a1020', // deep near-black blue
    tealDark:    '#0a1e28',
    mauveDark:   '#180830',
  },
  // C: unmistakably tinted
  high: {
    setup:       '#190a38', // bold purple
    overview:    '#081433', // bold navy
    tempo:       '#081c28', // bold teal
    drums:       '#091c0e', // bold forest
    bass:        '#110830', // bold indigo
    chords:      '#100830', // dark violet
    keys_scales: '#081422', // bold slate
    guitar:      '#220e1e', // bold rose
    avoid:       '#0c0522', // deep black-purple
    chat:        '#080e1c', // deep near-black blue
    tealDark:    '#081e28',
    mauveDark:   '#180630',
  },
  // D: jewel-toned, warm/cool alternating — every adjacent page is a jolt, not a spectrum step
  //    nav order: setup(pink) → overview(cobalt) → tempo(orange) → drums(emerald) → bass(crimson) → chords(teal) → keys(violet) → guitar(amber) → avoid(indigo)
  vivid: {
    setup:       '#36042e', // vivid hot pink       H~310  warm
    overview:    '#031e44', // vivid cobalt         H~220  cool  (+90°)
    tempo:       '#3c1404', // vivid orange         H~25   warm  (+165°)
    drums:       '#043814', // vivid emerald        H~138  cool  (+113°)
    bass:        '#3c0408', // vivid crimson        H~358  warm  (+140°)
    chords:      '#032e2a', // vivid teal           H~185  cool  (+187°)
    keys_scales: '#1a0440', // vivid violet         H~268  cool  (+83°)
    guitar:      '#341a04', // vivid amber          H~35   warm  (+127°)
    avoid:       '#080440', // vivid indigo         H~252  cool  (+143°)
    chat:        '#04081e', // vivid midnight       H~232  cool
    tealDark:    '#032e2a',
    mauveDark:   '#36042e',
  },
} as const

// ← change 'original' / 'medium' / 'high' / 'vivid' to compare
export const PAGE_COLORS = PALETTES.vivid

export const SECTION_COLORS: Record<SectionKey, string> = {
  tempo:       PAGE_COLORS.tempo,
  drums:       PAGE_COLORS.drums,
  bass:        PAGE_COLORS.bass,
  chords:      PAGE_COLORS.chords,
  keys_scales: PAGE_COLORS.keys_scales,
  guitar:      PAGE_COLORS.guitar,
  avoid:       PAGE_COLORS.avoid,
}

export function getRouteColor(name: string, params: Record<string, string | string[]>): string {
  if (name === 'sections-key') {
    const key = params.key as SectionKey
    return SECTION_COLORS[key] ?? PAGE_COLORS.overview
  }
  if (name === 'sections') return PAGE_COLORS.overview
  if (name === 'chat') return PAGE_COLORS.chat
  return PAGE_COLORS.setup
}
