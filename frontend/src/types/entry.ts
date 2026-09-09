export interface JournalImage {
  id: number;
  url: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  createdAt: string;
}

export interface JournalEntry {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  images: JournalImage[];
}

export interface CreateEntryPayload {
  title: string;
  content: string;
}

export interface UpdateEntryPayload {
  title: string;
  content: string;
}
