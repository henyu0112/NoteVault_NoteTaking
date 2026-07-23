import { ref } from 'vue'

const FONT_STORAGE_KEY = 'nodevault-font'
const SIZE_STORAGE_KEY = 'nodevault-fontsize'

// ─── Font catalogue ────────────────────────────────────────────────────────────
export const FONTS = [
  {
    id:       'inter',
    label:    'Inter',
    family:   '"Inter", sans-serif',
    google:   'Inter:wght@400;500;600;700;800',
    category: 'Sans-serif',
  },
  {
    id:       'outfit',
    label:    'Outfit',
    family:   '"Outfit", sans-serif',
    google:   'Outfit:wght@400;500;600;700;800',
    category: 'Rounded',
  },
  {
    id:       'nunito',
    label:    'Nunito',
    family:   '"Nunito", sans-serif',
    google:   'Nunito:wght@400;500;600;700;800',
    category: 'Friendly',
  },
  {
    id:       'merriweather',
    label:    'Merriweather',
    family:   '"Merriweather", serif',
    google:   'Merriweather:wght@400;700',
    category: 'Serif',
  },
  {
    id:       'mono',
    label:    'JetBrains Mono',
    family:   '"JetBrains Mono", monospace',
    google:   'JetBrains+Mono:wght@400;500;700',
    category: 'Monospace',
  },
  {
    id:       'playfair',
    label:    'Playfair',
    family:   '"Playfair Display", serif',
    google:   'Playfair+Display:wght@400;600;700',
    category: 'Elegant',
  },
  {
    id:       'opendyslexic',
    label:    'OpenDyslexic',
    family:   '"OpenDyslexic", sans-serif',
    cssUrl:   'https://fonts.cdnfonts.com/css/opendyslexic',
    category: 'Dyslexia',
  },
]

// ─── Size catalogue ────────────────────────────────────────────────────────────
// Sets html font-size; all rem values in main.css scale automatically.
export const FONT_SIZES = [
  { id: 'sm',  label: 'S',  title: 'Small',       px: 14 },
  { id: 'md',  label: 'M',  title: 'Medium',      px: 16 },
  { id: 'lg',  label: 'L',  title: 'Large',       px: 18 },
  { id: 'xl',  label: 'XL', title: 'Extra Large', px: 20 },
]

// ─── Singleton reactive state ──────────────────────────────────────────────────
const currentFontId = ref(localStorage.getItem(FONT_STORAGE_KEY) || 'inter')
const currentSizeId = ref(localStorage.getItem(SIZE_STORAGE_KEY) || 'md')

const loadedFonts = new Set()

function loadGoogleFont(font) {
  if (loadedFonts.has(font.id)) return
  const href = font.cssUrl
    || `https://fonts.googleapis.com/css2?family=${font.google}&display=swap`
  const link  = document.createElement('link')
  link.rel    = 'stylesheet'
  link.href   = href
  document.head.appendChild(link)
  loadedFonts.add(font.id)
}

export function loadAllFonts() {
  FONTS.forEach(font => loadGoogleFont(font))
}

export function applyFont(fontId) {
  const font = FONTS.find(f => f.id === fontId) || FONTS[0]
  loadGoogleFont(font)
  document.documentElement.style.setProperty('--font-family', font.family)
  currentFontId.value = fontId
  localStorage.setItem(FONT_STORAGE_KEY, fontId)
}

export function applyFontSize(sizeId) {
  const size = FONT_SIZES.find(s => s.id === sizeId) || FONT_SIZES[1]
  document.documentElement.style.fontSize = `${size.px}px`
  currentSizeId.value = sizeId
  localStorage.setItem(SIZE_STORAGE_KEY, sizeId)
}

// ─── Initialise on module load (apply saved preferences immediately) ──────────
applyFont(currentFontId.value)
applyFontSize(currentSizeId.value)

// Preload all fonts in the background so the Settings panel previews render correctly
FONTS.forEach(loadGoogleFont)

// ─── Composable export ─────────────────────────────────────────────────────────
export function useFont() {
  return {
    currentFontId,
    currentSizeId,
    fonts:         FONTS,
    fontSizes:     FONT_SIZES,
    applyFont,
    applyFontSize,
    currentFont:  FONTS.find(f => f.id === currentFontId.value) || FONTS[0],
  }
}
