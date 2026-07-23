<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="backdrop"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        @click.self="cancel"
      >
        <Transition name="scale">
          <div v-if="modelValue" class="confirm-dialog glass">
            <div class="confirm-icon">🗑️</div>
            <h3 id="confirm-title" class="confirm-title">Delete Note?</h3>
            <p class="confirm-message">
              Are you sure you want to delete
              <strong class="note-name">"{{ noteName }}"</strong>?
              <br />This action cannot be undone.
            </p>
            <div class="confirm-actions">
              <button
                ref="cancelBtn"
                class="btn btn-ghost"
                @click="cancel"
              >
                Cancel
              </button>
              <button
                class="btn btn-danger"
                :disabled="loading"
                @click="confirm"
              >
                <span v-if="loading" class="btn-spinner"></span>
                Delete
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  noteName:   { type: String,  default: 'this note' },
  loading:    { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const cancelBtn = ref(null)

watch(() => props.modelValue, async (open) => {
  if (open) {
    await nextTick()
    cancelBtn.value?.focus()
    window.addEventListener('keydown', onKey)
  } else {
    window.removeEventListener('keydown', onKey)
  }
})

function onKey(e) {
  if (e.key === 'Escape')  cancel()
  if (e.key === 'Enter')   confirm()
}

function cancel()  { emit('update:modelValue', false); emit('cancel') }
function confirm() { emit('confirm') }
</script>

<style scoped>
.confirm-dialog {
  width: min(380px, calc(100vw - 32px));
  border-radius: var(--radius-xl);
  padding: 36px 28px 28px;
  text-align: center;
  box-shadow: var(--shadow-modal);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.confirm-icon {
  font-size: 2.8rem;
  animation: shake 0.5s var(--ease-spring);
}

@keyframes shake {
  0%, 100% { transform: rotate(0); }
  25%       { transform: rotate(-12deg); }
  75%       { transform: rotate(12deg); }
}

.confirm-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.confirm-message {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.65;
}

.note-name {
  color: var(--danger);
  font-weight: 700;
}

.confirm-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  width: 100%;
  justify-content: center;
}

.confirm-actions .btn { flex: 1; }

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
