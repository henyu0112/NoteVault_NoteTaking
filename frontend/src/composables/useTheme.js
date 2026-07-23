import { ref } from 'vue'

const STORAGE_KEY = 'nodevault-theme'

/** All available themes, grouped into dark/light pairs per color family. */
export const THEMES = [
  // Purple
  { id: 'dark-purple',  label: 'Dark Purple',  dark: true,  accent: '#7c3aed', bg: '#0d0d1a', family: 'Purple'  },
  { id: 'light-purple', label: 'Light Purple', dark: false, accent: '#7c3aed', bg: '#f3f0ff', family: 'Purple'  },
  // Blue
  { id: 'dark-blue',    label: 'Dark Blue',    dark: true,  accent: '#3b82f6', bg: '#050d1f', family: 'Blue'    },
  { id: 'light-blue',   label: 'Light Blue',   dark: false, accent: '#2563eb', bg: '#eff6ff', family: 'Blue'    },
  // Pink
  { id: 'dark-pink',    label: 'Dark Pink',    dark: true,  accent: '#ec4899', bg: '#1a050e', family: 'Pink'    },
  { id: 'light-pink',   label: 'Light Pink',   dark: false, accent: '#db2777', bg: '#fff0f7', family: 'Pink'    },
  // Green
  { id: 'dark-green',   label: 'Dark Green',   dark: true,  accent: '#10b981', bg: '#031a0d', family: 'Green'   },
  { id: 'light-green',  label: 'Light Green',  dark: false, accent: '#059669', bg: '#f0fff8', family: 'Green'   },
  // Amber
  { id: 'dark-amber',   label: 'Dark Amber',   dark: true,  accent: '#f59e0b', bg: '#1a1000', family: 'Amber'   },
  { id: 'light-amber',  label: 'Light Amber',  dark: false, accent: '#d97706', bg: '#fffbeb', family: 'Amber'   },
  // Red
  { id: 'dark-red',     label: 'Dark Red',     dark: true,  accent: '#ef4444', bg: '#1a0505', family: 'Red'     },
  { id: 'light-red',    label: 'Light Red',    dark: false, accent: '#dc2626', bg: '#fff5f5', family: 'Red'     },
]

// Unique color families for grouping in the UI
export const THEME_FAMILIES = [...new Set(THEMES.map(t => t.family))]

// Reactive current theme ID — shared across all composable calls (module-level singleton)
const currentThemeId = ref(localStorage.getItem(STORAGE_KEY) || 'dark-purple')

/**
 * Apply a theme by setting the data-theme attribute on <html>
 * and persisting the choice to localStorage.
 */
function applyTheme(themeId) {
  document.documentElement.setAttribute('data-theme', themeId)
  currentThemeId.value = themeId
  localStorage.setItem(STORAGE_KEY, themeId)
}

// Apply saved theme immediately on composable import
applyTheme(currentThemeId.value)

export function useTheme() {
  const currentTheme = THEMES.find(t => t.id === currentThemeId.value) || THEMES[0]

  return {
    currentThemeId,
    currentTheme,
    themes: THEMES,
    families: THEME_FAMILIES,
    applyTheme,
  }
}
