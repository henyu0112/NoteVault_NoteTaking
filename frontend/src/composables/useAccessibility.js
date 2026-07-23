import { ref } from 'vue'

// ─── Storage keys ──────────────────────────────────────────────────────────────
const KEYS = {
  motion:   'nodevault-reduced-motion',
  lineH:    'nodevault-line-height',
  letterS:  'nodevault-letter-spacing',
  density:  'nodevault-density',
}

// ─── Option catalogues ─────────────────────────────────────────────────────────
export const LINE_HEIGHTS = [
  { id: 'normal',  label: 'Normal',  value: '1.55' },
  { id: 'relaxed', label: 'Relaxed', value: '1.80' },
  { id: 'wide',    label: 'Wide',    value: '2.10' },
]

export const LETTER_SPACINGS = [
  { id: 'normal', label: 'Normal', value: '0'      },
  { id: 'loose',  label: 'Loose',  value: '0.04em' },
  { id: 'wide',   label: 'Wide',   value: '0.09em' },
]

// ─── Singleton reactive state ──────────────────────────────────────────────────
const reducedMotion   = ref(localStorage.getItem(KEYS.motion)  === 'true')
const lineHeightId    = ref(localStorage.getItem(KEYS.lineH)   || 'normal')
const letterSpacingId = ref(localStorage.getItem(KEYS.letterS) || 'normal')
const density         = ref(Number(localStorage.getItem(KEYS.density) ?? 50))

// ─── Apply functions ───────────────────────────────────────────────────────────

export function applyReducedMotion(val) {
  reducedMotion.value = val
  // data attribute is picked up by a global CSS rule in main.css
  document.documentElement.dataset.reducedMotion = val ? 'true' : 'false'
  localStorage.setItem(KEYS.motion, val)
}

export function applyLineHeight(id) {
  const lh = LINE_HEIGHTS.find(l => l.id === id) || LINE_HEIGHTS[0]
  document.documentElement.style.setProperty('--line-height-base', lh.value)
  lineHeightId.value = id
  localStorage.setItem(KEYS.lineH, id)
}

export function applyLetterSpacing(id) {
  const ls = LETTER_SPACINGS.find(l => l.id === id) || LETTER_SPACINGS[0]
  document.documentElement.style.setProperty('--letter-spacing-base', ls.value)
  letterSpacingId.value = id
  localStorage.setItem(KEYS.letterS, id)
}

// Density: slider 0-100
//   gap:     8px  → 36px  (at 50 ≈ 22px, close to default 20px)
//   padding: 12px → 28px  (at 50 ≈ 20px, matches default)
export function applyDensity(val) {
  const v       = Number(val)
  const gap     = Math.round(8  + (v / 100) * 28)
  const padding = Math.round(12 + (v / 100) * 16)
  document.documentElement.style.setProperty('--density-gap',     `${gap}px`)
  document.documentElement.style.setProperty('--density-padding', `${padding}px`)
  density.value = v
  localStorage.setItem(KEYS.density, v)
}

// ─── Initialise on module load (restores saved preferences) ───────────────────
applyReducedMotion(reducedMotion.value)
applyLineHeight(lineHeightId.value)
applyLetterSpacing(letterSpacingId.value)
applyDensity(density.value)

// ─── Composable export ─────────────────────────────────────────────────────────
export function useAccessibility() {
  return {
    reducedMotion,
    lineHeightId,
    letterSpacingId,
    density,
    lineHeights:    LINE_HEIGHTS,
    letterSpacings: LETTER_SPACINGS,
    applyReducedMotion,
    applyLineHeight,
    applyLetterSpacing,
    applyDensity,
  }
}
