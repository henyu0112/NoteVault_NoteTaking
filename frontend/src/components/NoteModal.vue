<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="backdrop" @click.self="close" role="dialog" aria-modal="true" :aria-label="isEdit ? 'Edit note' : 'Create note'">
        <Transition name="slide-up">
          <div v-if="modelValue" class="modal glass">
            <!-- Header -->
            <div class="modal-header">
              <div class="modal-title-row">
                <div class="modal-icon">{{ isEdit ? '✏️' : '📝' }}</div>
                <h2 class="modal-title">{{ isEdit ? 'Edit Note' : 'New Note' }}</h2>
              </div>
              <button class="btn-icon close-btn" @click="close" aria-label="Close modal">✕</button>
            </div>

            <!-- Form -->
            <form class="modal-body" @submit.prevent="submit">
              <!-- Title -->
              <div class="field">
                <label class="field-label" for="note-title">Title <span class="required">*</span></label>
                <input
                  id="note-title"
                  ref="titleInput"
                  v-model="form.title"
                  class="input"
                  :class="{ error: errors.title }"
                  type="text"
                  placeholder="Give your note a title…"
                  maxlength="200"
                  autocomplete="off"
                />
                <span v-if="errors.title" class="field-error">{{ errors.title }}</span>
                <span class="char-count">{{ form.title.length }}/200</span>
              </div>

              <!-- Content -->
              <div class="field">
                <label class="field-label" for="note-content">Content</label>
                <textarea
                  id="note-content"
                  v-model="form.content"
                  class="textarea"
                  placeholder="Write your note here…"
                  rows="5"
                ></textarea>
              </div>

              <!-- Color picker -->
              <div class="field">
                <label class="field-label">Accent Color</label>
                <div class="color-row">
                  <button
                    v-for="c in colorOptions"
                    :key="c.value"
                    type="button"
                    class="color-swatch"
                    :style="{ background: c.value }"
                    :class="{ selected: form.color === c.value }"
                    :title="c.label"
                    @click="form.color = c.value"
                  >
                    <span v-if="form.color === c.value" class="check">✓</span>
                  </button>
                </div>
              </div>

              <!-- Pin toggle -->
              <div class="field pin-row">
                <label class="toggle-label" for="note-pinned">
                  <span>📌 Pin this note</span>
                  <span class="toggle-sub">Pinned notes appear at the top</span>
                </label>
                <button
                  id="note-pinned"
                  type="button"
                  class="toggle-btn"
                  :class="{ on: form.pinned }"
                  role="switch"
                  :aria-checked="form.pinned"
                  @click="form.pinned = !form.pinned"
                >
                  <span class="toggle-knob"></span>
                </button>
              </div>
            </form>

            <!-- Footer -->
            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" @click="close">Cancel</button>
              <button type="button" class="btn btn-primary" :disabled="loading" @click="submit">
                <span v-if="loading" class="btn-spinner"></span>
                {{ isEdit ? 'Save Changes' : 'Create Note' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch, nextTick, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  note:       { type: Object, default: null },
  loading:    { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'save'])

const titleInput = ref(null)

const colorOptions = [
  { value: '#7c3aed', label: 'Violet'  },
  { value: '#06b6d4', label: 'Cyan'    },
  { value: '#ec4899', label: 'Pink'    },
  { value: '#10b981', label: 'Emerald' },
  { value: '#f59e0b', label: 'Amber'   },
  { value: '#f43f5e', label: 'Rose'    },
]

const defaultForm = () => ({
  id:      null,
  title:   '',
  content: '',
  color:   '#7c3aed',
  pinned:  false,
})

const form   = reactive(defaultForm())
const errors = reactive({ title: '' })

const isEdit = computed(() => !!props.note?.id)

// Sync form when note prop or visibility changes
watch(
  () => [props.modelValue, props.note],
  ([open, note]) => {
    if (open) {
      Object.assign(form, note ? { ...note } : defaultForm())
      errors.title = ''
      nextTick(() => titleInput.value?.focus())
    }
  },
  { immediate: true }
)

function validate() {
  errors.title = ''
  if (!form.title.trim()) {
    errors.title = 'Title is required.'
    return false
  }
  if (form.title.trim().length > 200) {
    errors.title = 'Title must not exceed 200 characters.'
    return false
  }
  return true
}

function submit() {
  if (!validate()) return
  emit('save', { ...form, title: form.title.trim(), content: form.content.trim() })
}

function close() {
  emit('update:modelValue', false)
}

// Close on Escape key
function onKeydown(e) {
  if (e.key === 'Escape') close()
}
watch(() => props.modelValue, (open) => {
  if (open)  window.addEventListener('keydown', onKeydown)
  else       window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.modal {
  width: min(520px, calc(100vw - 32px));
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-modal);
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 24px 18px;
  border-bottom: 1px solid var(--border-glass);
  flex-shrink: 0;
}
.modal-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.modal-icon {
  font-size: 1.4rem;
  line-height: 1;
}
.modal-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
}
.close-btn { font-size: 1rem; color: var(--text-muted); }
.close-btn:hover { color: var(--text-primary); }

/* Body */
.modal-body {
  padding: 22px 24px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Field */
.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  position: relative;
}
.field-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.required { color: var(--danger); }
.field-error {
  font-size: 0.78rem;
  color: var(--danger);
  font-weight: 500;
}
.char-count {
  position: absolute;
  right: 0;
  top: 0;
  font-size: 0.72rem;
  color: var(--text-muted);
}

/* Color picker */
.color-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.color-swatch {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--t-base) var(--ease-spring);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.color-swatch:hover { transform: scale(1.15); }
.color-swatch.selected {
  border-color: #fff;
  transform: scale(1.2);
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
}
.check { color: #fff; font-size: 0.9rem; font-weight: 700; text-shadow: 0 1px 3px rgba(0,0,0,0.5); }

/* Pin toggle */
.pin-row {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
}
.toggle-label {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  cursor: default;
}
.toggle-sub { font-size: 0.75rem; font-weight: 400; color: var(--text-muted); }

.toggle-btn {
  width: 48px;
  height: 26px;
  border-radius: 99px;
  border: none;
  background: rgba(255,255,255,0.15);
  cursor: pointer;
  position: relative;
  transition: background var(--t-base) var(--ease-smooth);
  flex-shrink: 0;
}
.toggle-btn.on { background: var(--accent-main); }
.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  transition: transform var(--t-base) var(--ease-spring);
}
.toggle-btn.on .toggle-knob { transform: translateX(22px); }

/* Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 20px;
  border-top: 1px solid var(--border-glass);
  flex-shrink: 0;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}
</style>
