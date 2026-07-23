<template>
  <div class="home">

    <!-- ── Header ─────────────────────────────────────────── -->
    <header class="app-header glass">
      <div class="header-inner">
        <div class="brand">
          <div class="brand-logo">📂</div>
          <div class="brand-text">
            <h1 class="brand-name">NoteVault</h1>
            <span class="brand-sub">Your smart note manager</span>
          </div>
        </div>

        <div class="header-actions">
          <button
            id="settings-btn"
            class="btn btn-ghost theme-toggle-btn"
            title="Settings"
            @click="showTheme = true"
          >
            ⚙️ <span class="hide-mobile">Settings</span>
          </button>
          <button id="new-note-btn" class="btn btn-primary" @click="openCreate">
            <span class="btn-plus">＋</span>
            <span class="hide-mobile">New Note</span>
          </button>
        </div>
      </div>
    </header>

    <!-- ── Main content ─────────────────────────────────────── -->
    <main class="main-content">

      <!-- Search & Stats -->
      <SearchBar
        v-model="searchQuery"
        :total="notes.length"
        :pinned="pinnedCount"
      />

      <!-- Loading state -->
      <div v-if="loading.fetch" class="loading-state">
        <div class="spinner"></div>
        <p>Loading your notes…</p>
      </div>

      <!-- Error state -->
      <div v-else-if="fetchError" class="error-banner glass">
        <span>⚠️</span>
        <div>
          <strong>Could not connect to the server.</strong>
          <p>Make sure the backend is running at <code>http://localhost:3001</code></p>
        </div>
        <button class="btn btn-ghost" @click="fetchNotes">Retry</button>
      </div>

      <!-- Notes grid -->
      <TransitionGroup
        v-else-if="notes.length > 0"
        name="card-list"
        tag="div"
        class="notes-grid"
      >
        <NoteCard
          v-for="note in notes"
          :key="note.id"
          :note="note"
          @edit="openEdit"
          @delete="openDelete"
          @pin="togglePin"
        />
      </TransitionGroup>

      <!-- Empty state -->
      <div v-else class="empty-state">
        <div class="empty-icon">{{ searchQuery ? '🔍' : '📝' }}</div>
        <h3>{{ searchQuery ? 'No notes found' : 'No notes yet' }}</h3>
        <p v-if="searchQuery">
          No notes match "<strong>{{ searchQuery }}</strong>". Try a different search term.
        </p>
        <p v-else>
          Create your first note and start capturing your thoughts, ideas, and lists!
        </p>
        <button v-if="!searchQuery" class="btn btn-primary" @click="openCreate">
          ＋ Create First Note
        </button>
      </div>

    </main>

    <!-- ── Modals ─────────────────────────────────────────── -->
    <NoteModal
      v-model="showModal"
      :note="editingNote"
      :loading="loading.save"
      @save="saveNote"
    />

    <DeleteConfirm
      v-model="showDelete"
      :note-name="deletingNote?.title"
      :loading="loading.delete"
      @confirm="confirmDelete"
    />

    <!-- ── Toasts ─────────────────────────────────────────── -->
    <div class="toast-wrap" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="toast.type"
        >
          <span>{{ toast.icon }}</span>
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>

    <!-- ── Theme selector panel ──────────────────────────── -->
    <ThemeSelector v-model="showTheme" />

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import NoteCard      from '../components/NoteCard.vue'
import NoteModal     from '../components/NoteModal.vue'
import DeleteConfirm from '../components/DeleteConfirm.vue'
import SearchBar     from '../components/SearchBar.vue'
import ThemeSelector from '../components/ThemeSelector.vue'
import { getAllNotes, createNote, updateNote, deleteNote } from '../services/api.js'
// eslint-disable-next-line no-unused-vars
import { useTheme } from '../composables/useTheme.js'
import { useSound } from '../composables/useSound.js'

const { sounds } = useSound()

// ─── State ────────────────────────────────────────────────────────────────────
const notes       = ref([])
const searchQuery = ref('')
const showTheme   = ref(false)
const fetchError  = ref(false)

const showModal  = ref(false)
const showDelete = ref(false)
const editingNote  = ref(null)
const deletingNote = ref(null)

const loading = ref({ fetch: false, save: false, delete: false })
const toasts  = ref([])

// ─── Computed ─────────────────────────────────────────────────────────────────
const pinnedCount = computed(() => notes.value.filter(n => n.pinned).length)

// ─── Toast helper ──────────────────────────────────────────────────────────────
let toastId = 0
function addToast(message, type = 'success') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' }
  const id = ++toastId
  toasts.value.push({ id, message, type, icon: icons[type] })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3500)
}

// ─── Fetch notes ───────────────────────────────────────────────────────────────
async function fetchNotes() {
  loading.value.fetch = true
  fetchError.value = false
  try {
    notes.value = await getAllNotes(searchQuery.value)
  } catch (err) {
    console.error(err)
    fetchError.value = true
  } finally {
    loading.value.fetch = false
  }
}

// Debounced search watcher
let searchTimer = null
watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(fetchNotes, 300)
})

onMounted(fetchNotes)

// ─── Create / Edit ────────────────────────────────────────────────────────────
function openCreate() {
  sounds.open()
  editingNote.value = null
  showModal.value   = true
}

function openEdit(note) {
  sounds.open()
  editingNote.value = { ...note }
  showModal.value   = true
}

async function saveNote(formData) {
  loading.value.save = true
  try {
    if (formData.id) {
      const updated = await updateNote(formData.id, formData)
      const idx = notes.value.findIndex(n => n.id === formData.id)
      if (idx !== -1) notes.value[idx] = updated
      sounds.save()
      addToast('Note updated successfully!', 'success')
    } else {
      const created = await createNote(formData)
      if (created.pinned) notes.value.unshift(created)
      else notes.value.push(created)
      sounds.create()
      addToast('Note created!', 'success')
    }
    showModal.value = false
    // Re-fetch to get correct pinned order
    await fetchNotes()
  } catch (err) {
    console.error(err)
    addToast('Something went wrong. Please try again.', 'error')
  } finally {
    loading.value.save = false
  }
}

// ─── Pin toggle ───────────────────────────────────────────────────────────────
async function togglePin(note) {
  try {
    await updateNote(note.id, { pinned: !note.pinned })
    await fetchNotes()
    addToast(note.pinned ? 'Note unpinned.' : 'Note pinned!', 'info')
  } catch (err) {
    addToast('Failed to update pin status.', 'error')
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────
function openDelete(note) {
  deletingNote.value = note
  showDelete.value   = true
}

async function confirmDelete() {
  loading.value.delete = true
  try {
    await deleteNote(deletingNote.value.id)
    notes.value = notes.value.filter(n => n.id !== deletingNote.value.id)
    addToast(`"${deletingNote.value.title}" deleted.`, 'success')
    showDelete.value = false
  } catch (err) {
    addToast('Failed to delete note.', 'error')
  } finally {
    loading.value.delete = false
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── Header ──────────────────────────────────────────────── */
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  border-radius: 0;
  border-top: none;
  border-left: none;
  border-right: none;
}

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-logo {
  font-size: 2rem;
  line-height: 1;
  filter: drop-shadow(0 2px 8px color-mix(in srgb, var(--accent-main) 50%, transparent));
  animation: logoPulse 4s ease-in-out infinite;
}

@keyframes logoPulse {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 2px 8px color-mix(in srgb, var(--accent-main) 50%, transparent)); }
  50%       { transform: scale(1.08); filter: drop-shadow(0 4px 16px color-mix(in srgb, var(--accent-main) 80%, transparent)); }
}

.brand-text { display: flex; flex-direction: column; gap: 2px; }
.brand-name {
  font-size: 1.4rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--text-primary) 20%, var(--accent-main) 65%, var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
  transition: background var(--t-slow) var(--ease-smooth);
}
.brand-sub {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 500;
  letter-spacing: 0.04em;
}

.btn-plus {
  font-size: 1.2rem;
  line-height: 1;
  font-weight: 300;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.theme-toggle-btn {
  gap: 6px;
  font-size: 0.875rem;
}

/* ── Main ────────────────────────────────────────────────── */
.main-content {
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 24px 60px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  flex: 1;
}

/* ── Notes grid ──────────────────────────────────────────── */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--density-gap, 20px);
  position: relative;
}

/* ── Loading state ───────────────────────────────────────── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* ── Error banner ────────────────────────────────────────── */
.error-banner {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  border-radius: var(--radius-lg);
  border-color: rgba(244, 63, 94, 0.3);
  background: rgba(244, 63, 94, 0.07);
  color: var(--text-primary);
}
.error-banner span { font-size: 1.5rem; flex-shrink: 0; }
.error-banner strong { display: block; margin-bottom: 4px; }
.error-banner p { font-size: 0.85rem; color: var(--text-secondary); }
.error-banner code {
  background: rgba(255,255,255,0.1);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
}
.error-banner .btn { margin-left: auto; flex-shrink: 0; }

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 640px) {
  .header-inner { padding: 14px 16px; }
  .main-content { padding: 20px 16px 48px; }
  .notes-grid   { grid-template-columns: 1fr; }
  .brand-name   { font-size: 1.2rem; }
}
</style>
