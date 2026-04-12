import type { Note, NoteCategory, NoteRequest } from '@/types'
import { client } from './client'

export async function fetchNotes(
  studentId: number,
  category?: NoteCategory,
): Promise<Note[]> {
  const { data } = await client.get(`/api/students/${studentId}/notes`, {
    params: category ? { category } : undefined,
  })
  return data
}

export async function createNote(
  studentId: number,
  body: NoteRequest,
): Promise<Note> {
  const { data } = await client.post(`/api/students/${studentId}/notes`, body)
  return data
}

export async function updateNote(
  studentId: number,
  noteId: number,
  body: NoteRequest,
): Promise<Note> {
  const { data } = await client.patch(`/api/students/${studentId}/notes/${noteId}`, body)
  return data
}

export async function deleteNote(
  studentId: number,
  noteId: number,
): Promise<void> {
  await client.delete(`/api/students/${studentId}/notes/${noteId}`)
}
