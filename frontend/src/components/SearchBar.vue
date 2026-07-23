<template>
  <div class="search-wrap">
    <div class="search-input-row glass">
      <span class="search-icon">🔍</span>
      <input
        id="search-notes"
        :value="modelValue"
        type="search"
        class="search-input"
        placeholder="Search notes by title or content…"
        autocomplete="off"
        @input="onInput"
        @keydown.escape="clear"
      />
      <Transition name="fade">
        <button v-if="modelValue" class="clear-btn btn-icon" title="Clear search" @click="clear">
          ✕
        </button>
      </Transition>
    </div>

    <!-- Stats row -->
    <div class="stats-row">
      <span class="stat-chip glass">
        📋 {{ total }} {{ total === 1 ? 'note' : 'notes' }}
      </span>
      <span v-if="pinned > 0" class="stat-chip glass pinned-chip">
        📌 {{ pinned }} pinned
      </span>
      <span v-if="modelValue" class="stat-chip glass search-chip">
        🔎 "{{ modelValue }}"
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: String,  default: '' },
  total:      { type: Number,  default: 0  },
  pinned:     { type: Number,  default: 0  },
})

const emit = defineEmits(['update:modelValue'])

let debounceTimer = null

function onInput(e) {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('update:modelValue', e.target.value)
  }, 300)
}

function clear() {
  emit('update:modelValue', '')
}
</script>

<style scoped>
.search-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  transition: all var(--t-base) var(--ease-spring);
  transform-origin: center;
}

.search-input-row:focus-within {
  border-color: var(--accent-main);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--accent-main) 20%, transparent);
  transform: scale(1.015);
}

.search-icon { font-size: 1rem; flex-shrink: 0; }

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.9375rem;
}

.search-input::placeholder { color: var(--text-muted); }
.search-input::-webkit-search-cancel-button { display: none; }

.clear-btn {
  font-size: 0.8rem;
  color: var(--text-muted);
  padding: 4px 7px;
}

/* Stats chips */
.stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.pinned-chip  { color: #f59e0b; border-color: rgba(245,158,11,0.25); }
.search-chip  { color: var(--accent-cyan); border-color: rgba(6,182,212,0.25); }
</style>
