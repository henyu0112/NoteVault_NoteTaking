<template>
  <Teleport to="body">
    <!-- Backdrop (click outside to close) -->
    <Transition name="fade">
      <div v-if="modelValue" class="theme-backdrop" @click.self="close" />
    </Transition>

    <!-- Side panel -->
    <Transition name="slide-right">
      <div v-if="modelValue" class="theme-panel glass" role="dialog" aria-label="Theme selector">

        <!-- Header -->
        <div class="panel-header">
          <div class="panel-title-row">
            <span class="panel-icon">⚙️</span>
            <h2 class="panel-title">Settings</h2>
          </div>
          <button class="btn-icon" @click="close" aria-label="Close theme panel">✕</button>
        </div>

        <!-- Mode quick-toggle -->
        <div class="mode-toggle-row">
          <button
            class="mode-btn"
            :class="{ active: isDarkMode }"
            @click="setMode('dark')"
          >
            🌙 Dark
          </button>
          <button
            class="mode-btn"
            :class="{ active: !isDarkMode }"
            @click="setMode('light')"
          >
            ☀️ Light
          </button>
        </div>

        <!-- Scrollable content area -->
        <div class="panel-body">

          <!-- ── Typography ──────────────────────────────── -->
          <div class="typo-section">

          <!-- Font family -->
          <div class="typo-group">
            <span class="typo-label">🔤 Font Family</span>
            <div class="font-grid">
              <button
                v-for="font in fonts"
                :key="font.id"
                class="font-btn"
                :class="{ active: currentFontId === font.id }"
                :title="font.category"
                @click="selectFont(font.id)"
              >
                <span class="font-btn-name" :style="{ fontFamily: font.family }">{{ font.label }}</span>
                <span class="font-btn-cat">{{ font.category }}</span>
                <span class="font-btn-sample" :style="{ fontFamily: font.family }">Aa</span>
              </button>
            </div>
          </div>

          <!-- Font size -->
          <div class="typo-group">
            <span class="typo-label">🔍 Text Size</span>
            <div class="size-row">
              <button
                v-for="(size, i) in fontSizes"
                :key="size.id"
                class="size-btn"
                :class="{ active: currentSizeId === size.id }"
                :title="size.title"
                @click="selectSize(size.id)"
              >
                <span class="size-letter" :style="{ fontSize: `${0.75 + i * 0.2}rem` }">A</span>
                <span class="size-tag">{{ size.label }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ── Accessibility ──────────────────────────────── -->
        <div class="a11y-section">

          <!-- Reduced Motion toggle -->
          <div class="a11y-row">
            <div class="a11y-row-label">
              <span class="a11y-icon">🎞️</span>
              <div>
                <span class="a11y-name">Reduce Motion</span>
                <span class="a11y-desc">Disable all animations</span>
              </div>
            </div>
            <button
              class="toggle-switch"
              :class="{ on: reducedMotion }"
              :aria-pressed="reducedMotion"
              aria-label="Toggle reduced motion"
              @click="toggleMotion"
            >
              <span class="toggle-thumb" />
            </button>
          </div>

          <!-- Line Height -->
          <div class="typo-group">
            <span class="typo-label">↕ Line Height</span>
            <div class="a11y-btn-row">
              <button
                v-for="lh in lineHeights"
                :key="lh.id"
                class="a11y-opt-btn"
                :class="{ active: lineHeightId === lh.id }"
                @click="selectLineHeight(lh.id)"
              >{{ lh.label }}</button>
            </div>
          </div>

          <!-- Letter Spacing -->
          <div class="typo-group">
            <span class="typo-label">↔ Letter Spacing</span>
            <div class="a11y-btn-row">
              <button
                v-for="ls in letterSpacings"
                :key="ls.id"
                class="a11y-opt-btn"
                :class="{ active: letterSpacingId === ls.id }"
                @click="selectLetterSpacing(ls.id)"
              >{{ ls.label }}</button>
            </div>
          </div>

          <!-- Layout Density -->
          <div class="typo-group">
            <div class="sound-header">
              <span class="sound-icon">🪟</span>
              <span class="sound-label">Layout Density</span>
              <span class="sound-pct density-word">{{ densityLabel }}</span>
            </div>
            <input
              type="range"
              class="volume-slider"
              min="0"
              max="100"
              step="1"
              :value="density"
              :style="{ '--vol': `${density}%` }"
              @input="onDensityInput"
            />
            <div class="volume-labels">
              <span>📦 Compact</span>
              <span>Spacious 🌿</span>
            </div>
          </div>

        </div>

        <!-- Theme families grid -->
        <div class="themes-section">
          <div
            v-for="family in families"
            :key="family"
            class="family-group"
          >
            <span class="family-label">{{ family }}</span>
            <div class="swatches-row">
              <button
                v-for="theme in getFamily(family)"
                :key="theme.id"
                class="swatch-btn"
                :class="{ active: currentThemeId === theme.id }"
                :title="theme.label"
                @click="select(theme.id)"
              >
                <!-- Mini preview card -->
                <div class="swatch-preview" :style="{ background: theme.bg }">
                  <div class="swatch-bar"     :style="{ background: theme.accent }"></div>
                  <div class="swatch-line lg" :style="{ background: theme.dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)' }"></div>
                  <div class="swatch-line sm" :style="{ background: theme.dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.30)' }"></div>
                  <div class="swatch-dot"     :style="{ background: theme.accent }"></div>
                </div>
                <!-- Label row -->
                <div class="swatch-footer">
                  <span class="swatch-mode">{{ theme.dark ? '🌙' : '☀️' }}</span>
                  <span class="swatch-name">{{ theme.dark ? 'Dark' : 'Light' }}</span>
                  <span v-if="currentThemeId === theme.id" class="swatch-check">✓</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        </div> <!-- close panel-body -->

        <!-- Sound & Volume -->
        <div class="panel-footer">
          <div class="sound-section">
            <div class="sound-header">
              <span class="sound-icon">
                {{ volume === 0 ? '🔇' : volume < 0.35 ? '🔈' : volume < 0.70 ? '🔉' : '🔊' }}
              </span>
              <span class="sound-label">Sound Effects</span>
              <span class="sound-pct">{{ Math.round(volume * 100) }}%</span>
            </div>
            <input
              type="range"
              class="volume-slider"
              min="0"
              max="1"
              step="0.01"
              :value="volume"
              :style="{ '--vol': `${volume * 100}%` }"
              @input="onVolumeInput"
              @change="previewVolume"
            />
            <div class="volume-labels">
              <span>🔇 Off</span>
              <span>🔊 Full</span>
            </div>
          </div>

          <div class="current-theme-chip">
            <div class="chip-dot" :style="{ background: activeTheme.accent }"></div>
            {{ activeTheme.label }}
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useTheme } from '../composables/useTheme.js'
import { useSound }       from '../composables/useSound.js'
import { useFont, loadAllFonts } from '../composables/useFont.js'
import { useAccessibility } from '../composables/useAccessibility.js'

defineProps({ modelValue: { type: Boolean, default: false } })
const emit = defineEmits(['update:modelValue'])

const { currentThemeId, themes, families, applyTheme } = useTheme()
const { volume, sounds }                               = useSound()
const { currentFontId, currentSizeId, fonts, fontSizes, applyFont, applyFontSize } = useFont()

onMounted(() => {
  loadAllFonts()
})
const {
  reducedMotion, lineHeightId, letterSpacingId, density,
  lineHeights, letterSpacings,
  applyReducedMotion, applyLineHeight, applyLetterSpacing, applyDensity
} = useAccessibility()

const activeTheme  = computed(() => themes.find(t => t.id === currentThemeId.value) || themes[0])
const isDarkMode   = computed(() => activeTheme.value.dark)

const densityLabel = computed(() => {
  if (density.value < 33) return 'Compact'
  if (density.value < 66) return 'Default'
  return 'Spacious'
})

function getFamily(family) {
  return themes.filter(t => t.family === family)
}

function select(themeId) {
  applyTheme(themeId)
}

function setMode(mode) {
  // Switch current color family to the requested dark/light variant
  const current = activeTheme.value
  const target  = themes.find(t => t.family === current.family && t.dark === (mode === 'dark'))
  if (target) applyTheme(target.id)
}

function close() {
  emit('update:modelValue', false)
}

function selectFont(fontId) {
  sounds.click()
  applyFont(fontId)
}

function selectSize(sizeId) {
  sounds.click()
  applyFontSize(sizeId)
}

function onVolumeInput(e) {
  volume.value = parseFloat(e.target.value)
}

function previewVolume() {
  sounds.click()
}

function toggleMotion() {
  sounds.click()
  applyReducedMotion(!reducedMotion.value)
}

function selectLineHeight(id) {
  sounds.click()
  applyLineHeight(id)
}

function selectLetterSpacing(id) {
  sounds.click()
  applyLetterSpacing(id)
}

function onDensityInput(e) {
  applyDensity(e.target.value)
}
</script>

<style scoped>
/* ── Backdrop ──────────────────────────────────────────────────────────────── */
.theme-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* ── Side panel ────────────────────────────────────────────────────────────── */
.theme-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100dvh;
  width: min(320px, 100vw);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-xl) 0 0 var(--radius-xl);
  border-right: none;
  overflow: hidden;
  box-shadow: -8px 0 48px rgba(0, 0, 0, 0.45);
}

/* ── Header ────────────────────────────────────────────────────────────────── */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--border-glass);
  background-color: var(--bg-deep); /* Force opaque background */
  flex-shrink: 0;
}
.panel-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.panel-icon  { font-size: 1.3rem; }
.panel-title { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); }

/* ── Mode quick toggle ─────────────────────────────────────────────────────── */
.mode-toggle-row {
  display: flex;
  gap: 8px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-glass);
  flex-shrink: 0;
}

.mode-btn {
  flex: 1;
  padding: 8px 0;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-glass);
  background: rgba(127, 127, 127, 0.08);
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--t-base) var(--ease-smooth);
}

.mode-btn:hover {
  background: rgba(127, 127, 127, 0.16);
  color: var(--text-primary);
}

.mode-btn.active {
  background: linear-gradient(135deg, var(--accent-main), var(--accent-secondary));
  color: #fff;
  border-color: transparent;
  box-shadow: 0 3px 12px color-mix(in srgb, var(--accent-main) 40%, transparent);
}

/* ── Typography section ─────────────────────────────────────────────────────── */
.typo-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-glass);
  flex-shrink: 0;
}

.typo-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.typo-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

/* ── Font family grid ───────────────────────────────────────────────────────── */
.font-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
}

.font-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 9px 10px 9px 11px;
  border: 1.5px solid var(--border-glass);
  border-radius: var(--radius-md);
  background: rgba(127, 127, 127, 0.05);
  cursor: pointer;
  transition: all var(--t-base) var(--ease-spring);
  text-align: left;
  overflow: hidden;
}

.font-btn:hover {
  border-color: var(--border-hover);
  background: rgba(127, 127, 127, 0.12);
  transform: translateY(-1px);
}

.font-btn.active {
  border-color: var(--accent-main);
  background: color-mix(in srgb, var(--accent-main) 10%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent-main) 25%, transparent),
              0 4px 12px rgba(0,0,0,0.15);
}

.font-btn-name {
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90px;
}

.font-btn-cat {
  font-size: 0.62rem;
  color: var(--text-muted);
  font-family: var(--font-family); /* always in UI font */
  line-height: 1;
}

.font-btn-sample {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1;
  color: var(--accent-main);
  opacity: 0.45;
  transition: opacity var(--t-fast);
}

.font-btn:hover .font-btn-sample,
.font-btn.active .font-btn-sample {
  opacity: 0.75;
}

/* ── Font size row ──────────────────────────────────────────────────────────── */
.size-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.size-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 10px 6px 8px;
  border: 1.5px solid var(--border-glass);
  border-radius: var(--radius-md);
  background: rgba(127, 127, 127, 0.05);
  cursor: pointer;
  transition: all var(--t-base) var(--ease-spring);
  color: var(--text-secondary);
}

.size-btn:hover {
  border-color: var(--border-hover);
  background: rgba(127, 127, 127, 0.12);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.size-btn.active {
  border-color: var(--accent-main);
  background: color-mix(in srgb, var(--accent-main) 10%, transparent);
  color: var(--accent-main);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent-main) 25%, transparent);
}

.size-letter {
  font-weight: 800;
  line-height: 1;
  transition: font-size var(--t-base) var(--ease-smooth);
}

.size-tag {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1;
}

/* ── Accessibility section ──────────────────────────────────────────────────── */
.a11y-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-glass);
  flex-shrink: 0;
}

.a11y-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.a11y-row-label {
  display: flex;
  align-items: center;
  gap: 12px;
}

.a11y-icon {
  font-size: 1.2rem;
  opacity: 0.8;
}

.a11y-name {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
}

.a11y-desc {
  display: block;
  font-size: 0.65rem;
  color: var(--text-muted);
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 99px;
  background: rgba(127, 127, 127, 0.2);
  border: 1px solid var(--border-glass);
  cursor: pointer;
  transition: all var(--t-base) var(--ease-spring);
}

.toggle-switch.on {
  background: var(--accent-main);
  border-color: var(--accent-main);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: transform var(--t-base) var(--ease-spring);
}

.toggle-switch.on .toggle-thumb {
  transform: translateX(20px);
}

/* Button Row (Line Height / Letter Spacing) */
.a11y-btn-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.a11y-opt-btn {
  padding: 8px 4px;
  border: 1.5px solid var(--border-glass);
  border-radius: var(--radius-sm);
  background: rgba(127, 127, 127, 0.05);
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  transition: all var(--t-fast) var(--ease-smooth);
}

.a11y-opt-btn:hover {
  border-color: var(--border-hover);
  background: rgba(127, 127, 127, 0.12);
  color: var(--text-primary);
}

.a11y-opt-btn.active {
  border-color: var(--accent-main);
  background: color-mix(in srgb, var(--accent-main) 10%, transparent);
  color: var(--accent-main);
}

.density-word {
  font-weight: 700;
  color: var(--text-primary);
}

/* ── Body (scrollable wrapper) ─────────────────────────────────────────────── */
.panel-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.themes-section {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Family group ──────────────────────────────────────────────────────────── */
.family-group {}

.family-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 9px;
}

.swatches-row {
  display: flex;
  gap: 10px;
}

/* ── Individual swatch ─────────────────────────────────────────────────────── */
.swatch-btn {
  flex: 1;
  border: 2px solid var(--border-glass);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: transparent;
  cursor: pointer;
  transition: all var(--t-base) var(--ease-spring);
  padding: 0;
  display: flex;
  flex-direction: column;
}

.swatch-btn:hover {
  transform: translateY(-3px) scale(1.03);
  border-color: var(--border-hover);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.swatch-btn.active {
  border-color: var(--accent-main);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-main) 35%, transparent),
              0 8px 24px rgba(0, 0, 0, 0.25);
  transform: translateY(-2px);
}

/* Mini card preview */
.swatch-preview {
  height: 64px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: relative;
  border-radius: 0;
}

.swatch-bar {
  height: 8px;
  border-radius: 2px;
  width: 100%;
  flex-shrink: 0;
}

.swatch-line {
  border-radius: 2px;
  flex-shrink: 0;
}
.swatch-line.lg { height: 5px; width: 80%; }
.swatch-line.sm { height: 4px; width: 55%; }

.swatch-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-top: auto;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}

/* Footer below preview */
.swatch-footer {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  background: var(--bg-card);
  border-top: 1px solid var(--border-glass);
}

.swatch-mode { font-size: 0.7rem; }
.swatch-name { font-size: 0.72rem; font-weight: 600; color: var(--text-secondary); flex: 1; }

.swatch-check {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--accent-main);
}

/* ── Footer ────────────────────────────────────────────────────────────────── */
.panel-footer {
  padding: 14px 20px;
  border-top: 1px solid var(--border-glass);
  flex-shrink: 0;
}

.current-theme-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.chip-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 8px currentColor;
}

/* ── Sound section ──────────────────────────────────────────────────────────── */
.panel-footer {
  padding: 14px 20px 18px;
  border-top: 1px solid var(--border-glass);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sound-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sound-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sound-icon {
  font-size: 1rem;
  width: 22px;
  text-align: center;
}

.sound-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-secondary);
  flex: 1;
}

.sound-pct {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--accent-main);
  min-width: 32px;
  text-align: right;
}

.volume-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--text-muted);
  padding: 0 1px;
}
</style>
