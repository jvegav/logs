import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-[#02050e]/80 backdrop-blur-md">
      <div
        className="w-full max-w-md bg-[#090e1c] border border-blue-900/40 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(2,6,23,0.9)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-rose-950/40 border border-rose-900/40 rounded-xl text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-serif text-white font-medium">{title}</h3>
        </div>

        <p className="text-sm text-slate-400 font-sans leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-blue-950/40 hover:bg-blue-900/40 border border-blue-900/40 rounded-full transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 text-xs sm:text-sm font-medium rounded-full cursor-pointer transition-all ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.3)]'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
