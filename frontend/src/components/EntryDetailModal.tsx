import { useState, useRef } from 'react';
import type { JournalEntry, JournalImage } from '../types/entry';
import { X, Calendar, Edit3, Trash2, Plus, Image as ImageIcon, Loader2 } from 'lucide-react';

interface EntryDetailModalProps {
  entry: JournalEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (entry: JournalEntry) => void;
  onImageClick: (images: JournalImage[], index: number) => void;
  onAddImages: (entryId: number, files: File[]) => Promise<void>;
  onDeleteImage: (entryId: number, imageId: number) => Promise<void>;
}

export const EntryDetailModal = ({
  entry,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onImageClick,
  onAddImages,
  onDeleteImage,
}: EntryDetailModalProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !entry) return null;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    setIsUploading(true);
    try {
      await onAddImages(entry.id, files);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async (imageId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this photo from the log?')) return;
    setDeletingImageId(imageId);
    try {
      await onDeleteImage(entry.id, imageId);
    } finally {
      setDeletingImageId(null);
    }
  };

  const images = entry.images || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#03060f]/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-3xl my-auto bg-[#090e1c] border border-blue-900/40 rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(2,6,23,0.85)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-blue-950/60 mb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400/80">
            <Calendar className="w-4 h-4 text-sky-400/60" />
            <span>{formatDate(entry.createdAt)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(entry)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-blue-950/40 hover:bg-blue-900/40 border border-blue-900/40 rounded-full transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete(entry)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-400/90 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-900/30 rounded-full transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-blue-900/30 rounded-full transition-colors cursor-pointer ml-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-serif font-normal text-white tracking-tight leading-snug mb-6">
          {entry.title}
        </h1>

        {/* Content Body */}
        {entry.content ? (
          <div className="text-base sm:text-lg text-slate-300 font-sans font-light leading-relaxed whitespace-pre-line mb-8">
            {entry.content}
          </div>
        ) : (
          <p className="text-sm italic text-slate-500 mb-8 font-serif">No text logged with this entry.</p>
        )}

        {/* Photos Section */}
        <div className="pt-6 border-t border-blue-950/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm font-mono text-slate-300">
              <ImageIcon className="w-4 h-4 text-sky-400" />
              <span>Preserved Photos ({images.length})</span>
            </div>

            {/* Add photos button */}
            <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-300 hover:text-sky-200 bg-sky-950/40 hover:bg-sky-900/40 border border-sky-800/40 rounded-full transition-colors cursor-pointer">
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach Photos</span>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {images.map((img, index) => (
                <div
                  key={img.id}
                  onClick={() => onImageClick(images, index)}
                  className="group/item relative aspect-[4/3] rounded-xl overflow-hidden bg-blue-950/40 border border-blue-900/40 cursor-zoom-in shadow-sm hover:border-sky-500/50 transition-all"
                >
                  <img
                    src={img.url}
                    alt={img.fileName || 'Log photo'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/item:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity flex items-end justify-between p-2.5">
                    <span className="text-[11px] font-mono text-slate-300 truncate max-w-[70%]">
                      {img.fileName || 'Snapshot'}
                    </span>
                    <button
                      onClick={(e) => handleDeleteImage(img.id, e)}
                      disabled={deletingImageId === img.id}
                      className="p-1.5 bg-rose-950/80 hover:bg-rose-800 text-rose-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Delete photo"
                    >
                      {deletingImageId === img.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-blue-950/80 bg-blue-950/20 p-8 text-center text-sm text-slate-500">
              No photos attached to this log yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
