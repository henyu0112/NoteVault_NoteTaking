import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// ─── Notes API ────────────────────────────────────────────────────────────────

/**
 * Fetch all notes, optionally filtered by a search term.
 * @param {string} [search] - Optional search query
 */
export async function getAllNotes(search = '') {
  const params = search ? { search } : {}
  const res = await api.get('/notes', { params })
  return res.data.data
}

/**
 * Fetch a single note by its ID.
 * @param {number} id
 */
export async function getNoteById(id) {
  const res = await api.get(`/notes/${id}`)
  return res.data.data
}

/**
 * Create a new note.
 * @param {{ title: string, content: string, color: string, pinned: boolean }} note
 */
export async function createNote(note) {
  const res = await api.post('/notes', note)
  return res.data.data
}

/**
 * Update an existing note by ID.
 * @param {number} id
 * @param {{ title?: string, content?: string, color?: string, pinned?: boolean }} updates
 */
export async function updateNote(id, updates) {
  const res = await api.put(`/notes/${id}`, updates)
  return res.data.data
}

/**
 * Delete a note by ID.
 * @param {number} id
 */
export async function deleteNote(id) {
  const res = await api.delete(`/notes/${id}`)
  return res.data
}

export default api
