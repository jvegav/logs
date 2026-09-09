import { useState, useEffect, useRef } from 'react';
import type { JournalEntry } from '../types/entry';
import { X, Upload, Trash2, Loader2 } from 'lucide-react';

interface EntryEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit: JournalEntry | null;
  onSave: (payload: { title: string; content: string; newPhotos: File[] }) => Promise<void>;
  onDeleteExistingImage?: (entryId: number, imageId: number) => Promise<void>;
}

export const EntryEditorModal = ({
  isOpen,
  onClose,
  entryToEdit,
  onSave,
  onDeleteExistingImage,
}: EntryEditorModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (entryToEdit) {
      setTitle(entryToEdit.title);
      setContent(entryToEdit.content || '');
    } else {
      setTitle('');
      setContent('');
    }
    setNewFiles([]);
    setPreviewUrls([]);
    setError(null);
  }, [entryToEdit, isOpen]);

  // Clean up preview object URLs when unmounting or changing
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    const newPreviews = selected.map((file) => URL.createObjectURL(file));

    setNewFiles((prev) => [...prev, ...selected]);
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveNewFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for your entry.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        content: content.trim(),
        newPhotos: newFiles,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#03060f]/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-2xl my-auto bg-[#090e1c] border border-blue-900/40 rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(2,6,23,0.85)] max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-blue-950/60 mb-6">
          <h2 className="text-xl font-serif text-white font-medium">
            {entryToEdit ? 'Edit Reflection' : 'New Journal Entry'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-blue-900/30 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-950/50 border border-rose-900/50 text-rose-300 text-xs sm:text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-sky-400/80 mb-2">
              Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Quiet afternoon in the courtyard..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-blue-950/30 border border-blue-900/40 focus:border-sky-500/50 rounded-xl text-white placeholder-slate-500 text-lg font-serif focus:outline-none focus:ring-1 focus:ring-sky-500/30 transition-all"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-sky-400/80 mb-2">
              Content
            </label>
            <textarea
              rows={7}
              placeholder="Write freely. What captured your attention today?..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 bg-blue-950/30 border border-blue-900/40 focus:border-sky-500/50 rounded-xl text-slate-200 placeholder-slate-500 text-sm sm:text-base font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-sky-500/30 transition-all resize-y"
            />
          </div>

          {/* Existing Photos (if editing) */}
          {entryToEdit && entryToEdit.images && entryToEdit.images.length > 0 && (
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Existing Attached Photos ({entryToEdit.images.length})
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {entryToEdit.images.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square rounded-lg overflow-hidden bg-blue-950/40 border border-blue-900/40 group"
                  >
                    <img
                      src={img.url}
                      alt={img.fileName}
                      className="w-full h-full object-cover"
                    />
                    {onDeleteExistingImage && (
                      <button
                        type="button"
                        onClick={() => onDeleteExistingImage(entryToEdit.id, img.id)}
                        className="absolute top-1.5 right-1.5 p-1 bg-rose-950/80 hover:bg-rose-800 text-rose-300 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Photos to Attach */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-sky-400/80">
                Attach Photos
              </label>
              <span className="text-xs font-mono text-slate-500">
                {newFiles.length > 0 ? `${newFiles.length} selected` : 'Multiple supported'}
              </span>
            </div>

            {/* Drop / upload zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-blue-900/50 hover:border-sky-500/50 bg-blue-950/20 hover:bg-blue-950/30 rounded-2xl p-6 text-center cursor-pointer transition-all group"
            >
              <Upload className="w-6 h-6 mx-auto mb-2 text-slate-400 group-hover:text-sky-400 transition-colors" />
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Click or drag images to attach
              </p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP, GIF up to 20MB</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Preview of newly selected images */}
            {previewUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {previewUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-lg overflow-hidden bg-blue-950/40 border border-sky-500/30 group"
                  >
                    <img
                      src={url}
                      alt="Selected upload preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewFile(idx)}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-rose-900 text-slate-300 hover:text-white rounded-md transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-blue-950/60">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white hover:bg-blue-950/50 rounded-full transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{entryToEdit ? 'Save Changes' : 'Publish Entry'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
