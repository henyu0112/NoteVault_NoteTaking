import { ref, watch } from 'vue'

const STORAGE_KEY = 'nodevault-volume'

// ─── Shared singleton state ────────────────────────────────────────────────────
const volume = ref(parseFloat(localStorage.getItem(STORAGE_KEY) ?? '0.55'))

watch(volume, (v) => localStorage.setItem(STORAGE_KEY, String(v)))

let audioCtx = null

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

/**
 * Play a single oscillator tone.
 * @param {object} opts
 * @param {number}  opts.freq     - Frequency in Hz
 * @param {string}  opts.type     - Oscillator type: 'sine' | 'triangle' | 'square' | 'sawtooth'
 * @param {number}  opts.gain     - Peak gain (0–1, scaled by master volume)
 * @param {number}  opts.delay    - Start delay in seconds
 * @param {number}  opts.duration - Duration in seconds
 * @param {number}  opts.attack   - Attack ramp time in seconds
 */
function playTone({ freq = 440, type = 'sine', gain = 0.3, delay = 0, duration = 0.15, attack = 0.012 } = {}) {
  if (volume.value === 0) return
  try {
    const ctx   = getCtx()
    const osc   = ctx.createOscillator()
    const gNode = ctx.createGain()

    osc.connect(gNode)
    gNode.connect(ctx.destination)

    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)

    const peak = gain * volume.value
    gNode.gain.setValueAtTime(0.0001, ctx.currentTime + delay)
    gNode.gain.linearRampToValueAtTime(peak, ctx.currentTime + delay + attack)
    gNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration)

    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + duration + 0.05)
  } catch (err) {
    console.warn('Sound error:', err)
  }
}

// ─── Sound Presets ─────────────────────────────────────────────────────────────
const sounds = {
  /** Ascending 3-note arpeggio — satisfying "note created" chime */
  create() {
    playTone({ freq: 523.25, gain: 0.28, duration: 0.13 })
    playTone({ freq: 659.25, gain: 0.24, delay: 0.09, duration: 0.13 })
    playTone({ freq: 783.99, gain: 0.20, delay: 0.18, duration: 0.22 })
  },

  /** Quick two-note confirm chime — "saved!" */
  save() {
    playTone({ freq: 659.25, gain: 0.22, duration: 0.11 })
    playTone({ freq: 880.00, gain: 0.19, delay: 0.10, duration: 0.20 })
  },

  /** Descending triangle pop — "deleted" */
  delete() {
    playTone({ freq: 380, type: 'triangle', gain: 0.30, duration: 0.09 })
    playTone({ freq: 220, type: 'triangle', gain: 0.20, delay: 0.08, duration: 0.16 })
  },

  /** Upward tick — pin enabled */
  pinOn() {
    playTone({ freq: 880,  gain: 0.18, duration: 0.07 })
    playTone({ freq: 1174, gain: 0.14, delay: 0.07, duration: 0.11 })
  },

  /** Downward tick — pin disabled */
  pinOff() {
    playTone({ freq: 660, gain: 0.16, duration: 0.07 })
    playTone({ freq: 494, gain: 0.12, delay: 0.07, duration: 0.11 })
  },

  /** Soft ascending swoosh — modal open */
  open() {
    playTone({ freq: 380, gain: 0.12, duration: 0.16, attack: 0.02 })
    playTone({ freq: 560, gain: 0.10, delay: 0.10, duration: 0.18, attack: 0.02 })
  },

  /** Soft descending swoosh — modal close */
  close() {
    playTone({ freq: 520, gain: 0.10, duration: 0.12 })
    playTone({ freq: 370, gain: 0.07, delay: 0.09, duration: 0.14 })
  },

  /** Subtle UI click — generic button */
  click() {
    playTone({ freq: 700, type: 'sine', gain: 0.12, duration: 0.06 })
  },
}

export function useSound() {
  return { volume, sounds }
}
