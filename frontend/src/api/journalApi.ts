import type { JournalEntry, JournalImage, CreateEntryPayload, UpdateEntryPayload } from '../types/entry';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export async function fetchEntries(search?: string): Promise<JournalEntry[]> {
  const url = new URL(`${BASE_URL}/api/entries`, window.location.origin);
  if (search && search.trim()) {
    url.searchParams.set('search', search.trim());
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch entries: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchEntryById(id: number): Promise<JournalEntry> {
  const res = await fetch(`${BASE_URL}/api/entries/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch entry: ${res.statusText}`);
  }
  return res.json();
}

export async function createEntry(payload: CreateEntryPayload): Promise<JournalEntry> {
  const res = await fetch(`${BASE_URL}/api/entries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to create entry: ${res.statusText}`);
  }
  return res.json();
}

export async function updateEntry(id: number, payload: UpdateEntryPayload): Promise<JournalEntry> {
  const res = await fetch(`${BASE_URL}/api/entries/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to update entry: ${res.statusText}`);
  }
  return res.json();
}

export async function deleteEntry(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/entries/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to delete entry: ${res.statusText}`);
  }
}

export async function uploadEntryImages(id: number, files: File[]): Promise<JournalImage[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }

  const res = await fetch(`${BASE_URL}/api/entries/${id}/images`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to upload images: ${res.statusText}`);
  }
  return res.json();
}

export async function deleteEntryImage(id: number, imageId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/entries/${id}/images/${imageId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to delete image: ${res.statusText}`);
  }
}
