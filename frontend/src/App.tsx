import { useState, useEffect, useCallback } from 'react';
import type { JournalEntry, JournalImage } from './types/entry';
import {
  fetchEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  uploadEntryImages,
  deleteEntryImage,
} from './api/journalApi';
import { Navbar } from './components/Navbar';
import { EntryCard } from './components/EntryCard';
import { EntryDetailModal } from './components/EntryDetailModal';
import { EntryEditorModal } from './components/EntryEditorModal';
import { PhotoLightbox } from './components/PhotoLightbox';
import { ConfirmModal } from './components/ConfirmModal';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { Plus, BookOpen, Sparkles } from 'lucide-react';

export function App() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<JournalEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);

  // Lightbox state
  const [lightboxImages, setLightboxImages] = useState<JournalImage[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load entries
  const loadEntries = useCallback(async (query?: string) => {
    setIsLoading(true);
    try {
      const data = await fetchEntries(query);
      setEntries(data);
    } catch (err: any) {
      addToast(err.message || 'Could not load entries', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadEntries(searchQuery);
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, loadEntries]);

  // Handle create or edit save
  const handleSaveEntry = async ({
    title,
    content,
    newPhotos,
  }: {
    title: string;
    content: string;
    newPhotos: File[];
  }) => {
    if (entryToEdit) {
      // Update existing
      const updated = await updateEntry(entryToEdit.id, { title, content });
      let finalImages = updated.images || [];

      if (newPhotos.length > 0) {
        const uploaded = await uploadEntryImages(entryToEdit.id, newPhotos);
        finalImages = [...finalImages, ...uploaded];
      }

      const fullUpdated = { ...updated, images: finalImages };
      setEntries((prev) => prev.map((e) => (e.id === fullUpdated.id ? fullUpdated : e)));
      if (selectedEntry?.id === fullUpdated.id) {
        setSelectedEntry(fullUpdated);
      }
      addToast('Reflection updated successfully.');
    } else {
      // Create new
      const created = await createEntry({ title, content });
      let finalImages: JournalImage[] = [];

      if (newPhotos.length > 0) {
        try {
          finalImages = await uploadEntryImages(created.id, newPhotos);
        } catch (imgErr: any) {
          addToast('Entry created, but photos failed to upload: ' + imgErr.message, 'error');
        }
      }

      const fullCreated = { ...created, images: finalImages };
      setEntries((prev) => [fullCreated, ...prev]);
      addToast('New journal entry logged.');
    }
  };

  // Delete entry
  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;
    try {
      await deleteEntry(entryToDelete.id);
      setEntries((prev) => prev.filter((e) => e.id !== entryToDelete.id));
      if (selectedEntry?.id === entryToDelete.id) {
        setSelectedEntry(null);
      }
      addToast('Log entry removed.');
    } catch (err: any) {
      addToast('Failed to delete entry: ' + err.message, 'error');
    } finally {
      setEntryToDelete(null);
    }
  };

  // Add images to currently opened entry
  const handleAddImagesToEntry = async (entryId: number, files: File[]) => {
    try {
      const uploaded = await uploadEntryImages(entryId, files);
      setEntries((prev) =>
        prev.map((e) => (e.id === entryId ? { ...e, images: [...(e.images || []), ...uploaded] } : e))
      );
      if (selectedEntry?.id === entryId) {
        setSelectedEntry((prev) =>
          prev ? { ...prev, images: [...(prev.images || []), ...uploaded] } : null
        );
      }
      addToast(`${uploaded.length} ${uploaded.length === 1 ? 'photo' : 'photos'} attached.`);
    } catch (err: any) {
      addToast('Failed to upload photos: ' + err.message, 'error');
    }
  };

  // Delete single image from entry
  const handleDeleteImageFromEntry = async (entryId: number, imageId: number) => {
    try {
      await deleteEntryImage(entryId, imageId);
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId ? { ...e, images: (e.images || []).filter((img) => img.id !== imageId) } : e
        )
      );
      if (selectedEntry?.id === entryId) {
        setSelectedEntry((prev) =>
          prev ? { ...prev, images: (prev.images || []).filter((img) => img.id !== imageId) } : null
        );
      }
      addToast('Photo removed.');
    } catch (err: any) {
      addToast('Failed to delete photo: ' + err.message, 'error');
    }
  };

  const handleOpenLightbox = (images: JournalImage[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#050811] text-slate-200 flex flex-col selection:bg-sky-500/25 selection:text-sky-200 overflow-x-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[750px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 -left-40 w-[600px] h-[600px] bg-sky-950/15 rounded-full blur-[160px]" />
      </div>

      {/* Navigation */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewEntry={() => {
          setEntryToEdit(null);
          setIsEditorOpen(true);
        }}
        entryCount={entries.length}
      />

      {/* Main Stream Content */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Serene Welcome Banner */}
        <section className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-blue-950/60">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-900/40 text-[11px] font-mono text-sky-400 tracking-wider uppercase mb-3">
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>Digital Notebook</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif text-white tracking-tight font-normal">
              Chronicle of moments.
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-2 font-sans font-light max-w-xl">
              A private, calm space to capture memories, daily milestones, and visual notes.
            </p>
          </div>

          <button
            onClick={() => {
              setEntryToEdit(null);
              setIsEditorOpen(true);
            }}
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.4)] transition-all cursor-pointer active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Write Entry</span>
          </button>
        </section>

        {/* Entries Stream */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-64 rounded-2xl bg-blue-950/20 border border-blue-950/50 p-6 animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-24 h-3 bg-blue-900/30 rounded-full" />
                  <div className="w-3/4 h-6 bg-blue-900/40 rounded-lg" />
                  <div className="w-full h-4 bg-blue-900/20 rounded" />
                  <div className="w-5/6 h-4 bg-blue-900/20 rounded" />
                </div>
                <div className="w-32 h-3 bg-blue-900/20 rounded-full" />
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 px-4 rounded-3xl border border-dashed border-blue-950/80 bg-blue-950/15 max-w-lg mx-auto">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-900/30 border border-blue-800/40 flex items-center justify-center text-sky-400">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-serif text-white font-medium mb-2">
              {searchQuery ? 'No matching logs found' : 'The page is empty'}
            </h3>
            <p className="text-sm text-slate-400 font-sans font-light leading-relaxed mb-6 max-w-xs mx-auto">
              {searchQuery
                ? `No reflections match "${searchQuery}". Try a different keyword.`
                : 'Your journal is ready for your thoughts, photos, and milestones.'}
            </p>
            <button
              onClick={() => {
                if (searchQuery) {
                  setSearchQuery('');
                } else {
                  setEntryToEdit(null);
                  setIsEditorOpen(true);
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-full shadow-lg transition-all cursor-pointer"
            >
              {searchQuery ? (
                <span>Clear search</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Log your first moment</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onOpen={(e) => setSelectedEntry(e)}
                onEdit={(e) => {
                  setEntryToEdit(e);
                  setIsEditorOpen(true);
                }}
                onDelete={(e) => setEntryToDelete(e)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <EntryDetailModal
        entry={selectedEntry}
        isOpen={Boolean(selectedEntry)}
        onClose={() => setSelectedEntry(null)}
        onEdit={(entry) => {
          setSelectedEntry(null);
          setEntryToEdit(entry);
          setIsEditorOpen(true);
        }}
        onDelete={(entry) => {
          setEntryToDelete(entry);
        }}
        onImageClick={handleOpenLightbox}
        onAddImages={handleAddImagesToEntry}
        onDeleteImage={handleDeleteImageFromEntry}
      />

      <EntryEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEntryToEdit(null);
        }}
        entryToEdit={entryToEdit}
        onSave={handleSaveEntry}
        onDeleteExistingImage={handleDeleteImageFromEntry}
      />

      <PhotoLightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />

      <ConfirmModal
        isOpen={Boolean(entryToDelete)}
        title="Delete Journal Entry"
        message={`Are you sure you want to delete "${entryToDelete?.title}"? All attached photos will also be deleted from Supabase Storage.`}
        confirmText="Delete Entry"
        onConfirm={handleConfirmDelete}
        onCancel={() => setEntryToDelete(null)}
      />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
