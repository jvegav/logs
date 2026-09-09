import { useEffect } from 'react';
import type { JournalImage } from '../types/entry';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface PhotoLightboxProps {
  images: JournalImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const PhotoLightbox = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: PhotoLightboxProps) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === 'ArrowRight' && currentIndex < images.length - 1) onNavigate(currentIndex + 1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];
  if (!currentImage) return null;

  return (
    <div
      className="fixed inset-0 z-60 bg-[#02050e]/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8"
      onClick={onClose}
    >
      {/* Top Header */}
      <div
        className="flex items-center justify-between w-full max-w-5xl mx-auto z-10 text-slate-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-xs font-mono text-sky-400">
          Photo {currentIndex + 1} of {images.length}
          {currentImage.fileName && (
            <span className="text-slate-400 ml-2">({currentImage.fileName})</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <a
            href={currentImage.url}
            target="_blank"
            rel="noreferrer"
            className="p-2 hover:bg-blue-900/30 text-slate-400 hover:text-white rounded-full transition-colors"
            title="Open original"
          >
            <Download className="w-5 h-5" />
          </a>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-900/30 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative flex-1 flex items-center justify-center my-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev button */}
        {currentIndex > 0 && (
          <button
            onClick={() => onNavigate(currentIndex - 1)}
            className="absolute left-2 sm:left-4 z-10 p-2.5 sm:p-3 bg-blue-950/60 hover:bg-blue-900/80 text-white rounded-full backdrop-blur-md border border-blue-800/40 transition-all cursor-pointer shadow-lg hover:scale-105"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Current Image */}
        <img
          src={currentImage.url}
          alt={currentImage.fileName || 'Snapshot'}
          className="max-h-[82vh] max-w-[90vw] object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] select-none animate-in fade-in zoom-in-95 duration-200"
        />

        {/* Next button */}
        {currentIndex < images.length - 1 && (
          <button
            onClick={() => onNavigate(currentIndex + 1)}
            className="absolute right-2 sm:right-4 z-10 p-2.5 sm:p-3 bg-blue-950/60 hover:bg-blue-900/80 text-white rounded-full backdrop-blur-md border border-blue-800/40 transition-all cursor-pointer shadow-lg hover:scale-105"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom thumbnails thumbnail bar */}
      {images.length > 1 && (
        <div
          className="flex items-center justify-center gap-2 max-w-xl mx-auto overflow-x-auto py-2 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => onNavigate(idx)}
              className={`relative w-12 h-12 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'border-sky-400 scale-105 shadow-[0_0_10px_#38bdf8]'
                  : 'border-blue-950/80 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
