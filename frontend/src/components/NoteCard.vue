<template>
  <div class="note-card glass" :style="{ '--note-color': note.color }" @click="$emit('edit', note)">
    <!-- Pin indicator -->
    <div v-if="note.pinned" class="pin-badge" title="Pinned">
      <span>📌</span>
    </div>

    <!-- Color accent bar -->
    <div class="accent-bar"></div>

    <!-- Card body -->
    <div class="card-body">
      <h3 class="note-title">{{ note.title }}</h3>
      <p class="note-content">{{ note.content || 'No content…' }}</p>
    </div>

    <!-- Card footer -->
    <div class="card-footer">
      <!-- Date chip with tooltip trigger -->
      <span
        class="note-date"
        @mouseenter="showTooltip"
        @mouseleave="hideTooltip"
        @click.stop
      >🕐 {{ formatDate(note.updated_at) }}</span>

      <div class="card-actions" @click.stop>
        <button
          class="btn-icon action-pin"
          :class="{ active: note.pinned }"
          :title="note.pinned ? 'Unpin' : 'Pin'"
          @click="handlePin"
        >
          {{ note.pinned ? '📌' : '📍' }}
        </button>
        <button class="btn-icon action-edit" title="Edit note" @click="$emit('edit', note)">
          ✏️
        </button>
        <button class="btn-icon action-delete" title="Delete note" @click="handleDelete">
          🗑️
        </button>
      </div>
    </div>

    <!-- ── Date tooltip — Teleported to body to escape overflow:hidden ── -->
    <Teleport to="body">
      <div
        v-if="tooltip.visible"
        class="date-tooltip"
        :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }"
      >
        <div class="tooltip-row">
          <span class="tooltip-label">Created</span>
          <span class="tooltip-value">{{ formatExact(note.created_at) }}</span>
        </div>
        <template v-if="note.updated_at !== note.created_at">
          <hr class="tooltip-divider" />
          <div class="tooltip-row">
            <span class="tooltip-label">Edited</span>
            <span class="tooltip-value">{{ formatExact(note.updated_at) }}</span>
          </div>
        </template>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useSound } from '../composables/useSound.js'

const props = defineProps({
  note: { type: Object, required: true },
})

const emit = defineEmits(['edit', 'delete', 'pin'])

const { sounds } = useSound()

// ─── Tooltip state ────────────────────────────────────────────────────────────
const tooltip = reactive({ visible: false, x: 0, y: 0 })

function showTooltip(e) {
  const rect = e.target.getBoundingClientRect()
  // Position above the element; clamp to left edge of viewport with padding
  tooltip.x = Math.max(8, rect.left)
  tooltip.y = rect.top
  tooltip.visible = true
}

function hideTooltip() {
  tooltip.visible = false
}

// ─── Date formatters ─────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d    = new Date(dateStr.replace(' ', 'T') + 'Z')
  const now  = new Date()
  const diff = now - d
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)

  if (mins  < 1)  return 'Just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 7)  return `${days}d ago`

  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatExact(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr.replace(' ', 'T') + 'Z')
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
    year:    'numeric',
    hour:    '2-digit',
    minute:  '2-digit',
  })
}

// ─── Sound-enhanced actions ───────────────────────────────────────────────────
function handlePin() {
  props.note.pinned ? sounds.pinOff() : sounds.pinOn()
  emit('pin', props.note)
}

function handleDelete() {
  sounds.delete()
  emit('delete', props.note)
}
</script>

<style scoped>
.note-card {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition:
    transform var(--t-base) var(--ease-spring),
    box-shadow var(--t-base) var(--ease-smooth),
    border-color var(--t-base) var(--ease-smooth),
    background var(--t-base) var(--ease-smooth);
  box-shadow: var(--shadow-card);
}

.note-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 20px 50px rgba(0,0,0,0.5),
              0 0 30px color-mix(in srgb, var(--note-color) 20%, transparent);
  border-color: var(--border-hover);
  background: var(--bg-card-hover);
}

/* Color accent bar at top */
.accent-bar {
  height: 8px;
  background: var(--note-color);
  flex-shrink: 0;
  transition: height var(--t-base) var(--ease-smooth);
}
.note-card:hover .accent-bar { height: 10px; }

/* Pin badge */
.pin-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 0.85rem;
  opacity: 0.75;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
  animation: pinBounce 0.5s var(--ease-spring);
}
@keyframes pinBounce {
  from { transform: scale(0) rotate(-20deg); }
  to   { transform: scale(1) rotate(0); }
}

/* Card body */
.card-body {
  padding: var(--density-padding, 18px) var(--density-padding, 18px) calc(var(--density-padding, 18px) * 0.65);
  flex: 1;
  min-height: 0;
}

.note-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-content {
  font-size: 0.845rem;
  color: var(--text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Card footer */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(var(--density-padding, 14px) * 0.6) var(--density-padding, 14px) var(--density-padding, 14px);
  border-top: 1px solid var(--border-glass);
  margin-top: auto;
}

/* Date chip */
.note-date {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 500;
  cursor: default;
  padding: 3px 7px;
  border-radius: 99px;
  transition: all var(--t-fast) var(--ease-smooth);
  border: 1px solid transparent;
  user-select: none;
}

.note-date:hover {
  color: var(--accent-main);
  background: color-mix(in srgb, var(--accent-main) 10%, transparent);
  border-color: color-mix(in srgb, var(--accent-main) 25%, transparent);
}

/* Card actions */
.card-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transform: translateX(6px);
  transition: all var(--t-base) var(--ease-smooth);
}
.note-card:hover .card-actions {
  opacity: 1;
  transform: translateX(0);
}

.action-pin.active {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.3);
}
.action-delete:hover {
  background: rgba(244, 63, 94, 0.15) !important;
  border-color: rgba(244, 63, 94, 0.3) !important;
  transform: scale(1.15) !important;
}
.action-edit:hover {
  background: color-mix(in srgb, var(--accent-main) 15%, transparent) !important;
  border-color: color-mix(in srgb, var(--accent-main) 30%, transparent) !important;
}
</style>
