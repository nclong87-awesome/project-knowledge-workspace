import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { ProjectKnowledgeItem } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  note: ProjectKnowledgeItem | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  note,
  onClose,
  onConfirm,
  isLoading,
}) => {
  if (!isOpen || !note) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-xl border border-[#E7E3DC] shadow-xl w-full max-w-md overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 id="delete-dialog-title" className="text-base font-semibold text-stone-900">
                Delete Knowledge Entry
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Are you sure you want to delete <strong className="text-stone-800 font-medium">"{note.title}"</strong>? This operation will remove it from the backend server state.
              </p>
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600 space-y-1 font-mono">
            <div><span className="text-stone-400">ID:</span> {note.id}</div>
            <div><span className="text-stone-400">Project:</span> {note.project}</div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-[#E7E3DC] bg-[#FAF8F5]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-lg shadow-2xs transition-all disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Deleting...' : 'Delete Entry'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
