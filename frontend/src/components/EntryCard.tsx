import type { JournalEntry } from '../types/entry';
import { Calendar, Trash2, Edit3, ArrowRight } from 'lucide-react';

interface EntryCardProps {
  entry: JournalEntry;
  onOpen: (entry: JournalEntry) => void;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (entry: JournalEntry) => void;
}

export const EntryCard = ({
  entry,
  onOpen,
  onEdit,
  onDelete,
}: EntryCardProps) => {
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const images = entry.images || [];

  return (
    <article
      onClick={() => onOpen(entry)}
      className="group relative bg-[#0a1020]/75 hover:bg-[#0f172e]/90 border border-blue-950/70 hover:border-sky-500/30 rounded-2xl p-5 sm:p-6 transition-all duration-300 cursor-pointer shadow-[0_4px_20px_rgba(3,7,18,0.4)] hover:shadow-[0_8px_32px_rgba(14,165,233,0.08)] flex flex-col justify-between"
    >
      <div>
        {/* Header: Date & Action icons */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-sky-400/80 font-mono tracking-wide">
            <Calendar className="w-3.5 h-3.5 text-sky-500/70" />
            <span>{formatDate(entry.createdAt)}</span>
          </div>

          <div
            className="flex items-center gap-1 opacity-75 sm:opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onEdit(entry)}
              className="p-1.5 text-slate-400 hover:text-sky-300 hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer"
              title="Edit entry"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(entry)}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
              title="Delete entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-serif font-normal text-slate-100 group-hover:text-sky-200 transition-colors tracking-tight line-clamp-2 mb-2">
          {entry.title}
        </h3>

        {/* Content Excerpt */}
        {entry.content && (
          <p className="text-sm text-slate-400 font-sans leading-relaxed line-clamp-3 whitespace-pre-line mb-4 font-light">
            {entry.content}
          </p>
        )}
      </div>

      {/* Footer: Photos preview or counter */}
      <div>
        {images.length > 0 ? (
          <div className="mt-2 pt-3 border-t border-blue-950/40">
            <div className="grid grid-cols-4 gap-2">
              {images.slice(0, 4).map((img, idx) => (
                <div
                  key={img.id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-blue-950/40 border border-blue-900/30 group/img"
                >
                  <img
                    src={img.url}
                    alt={img.fileName || 'Journal snapshot'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                    loading="lazy"
                  />
                  {idx === 3 && images.length > 4 && (
                    <div className="absolute inset-0 bg-blue-950/80 backdrop-blur-xs flex items-center justify-center text-xs font-mono font-medium text-sky-300">
                      +{images.length - 4}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-2 pt-3 border-t border-blue-950/30 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Text reflection</span>
            <span className="flex items-center gap-1 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all text-slate-500">
              Read log <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        )}
      </div>
    </article>
  );
};
