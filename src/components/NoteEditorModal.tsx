import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Plus, BookOpen, Eye, Edit3 } from 'lucide-react';
import { CreateProjectKnowledgeInput } from '../types';

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateProjectKnowledgeInput) => Promise<void>;
  isLoading: boolean;
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [project, setProject] = useState('LocalMcp');
  const [category, setCategory] = useState('architecture');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('agents, architecture');
  const [source, setSource] = useState('manual');
  const [content, setContent] = useState('# Agent bridge design\n\nWrite your markdown documentation here...');
  const [viewMode, setViewMode] = useState<'write' | 'preview'>('write');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!project.trim() || !title.trim() || !content.trim()) {
      setErrorMsg('Project, Title, and Content are required.');
      return;
    }

    try {
      await onSubmit({
        project: project.trim(),
        title: title.trim(),
        content: content.trim(),
        category: category.trim() || 'general',
        tags: tags.trim() || '',
        source: source.trim() || 'manual',
      });
      // Reset form
      setTitle('');
      setContent('# Title\n\nDescription...');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create knowledge entry.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-xl border border-[#E7E3DC] shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-entry-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E3DC] bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#DF6357]/10 text-[#DF6357]">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 id="new-entry-title" className="font-semibold text-stone-900 text-base">
                New Project Knowledge Entry
              </h2>
              <p className="text-xs text-stone-500">Record architecture notes, design specs, or guides</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#227C70]"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="create-note-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-lg font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Project Name *</label>
              <input
                type="text"
                required
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="LocalMcp"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#227C70]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="architecture, general, design"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#227C70]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Agent bridge design"
              className="w-full px-3 py-2 text-xs sm:text-sm font-semibold bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#227C70]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="agents, architecture"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#227C70]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Source</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="manual, vscode-chat-copilot"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#227C70]"
              />
            </div>
          </div>

          {/* Markdown Content Field with Write / Preview Tabs */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-stone-700">Content (Markdown) *</label>
              <div className="flex items-center bg-stone-200/60 p-0.5 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setViewMode('write')}
                  className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                    viewMode === 'write' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Write</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                    viewMode === 'preview' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  <Eye className="w-3 h-3 text-[#227C70]" />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {viewMode === 'write' ? (
              <textarea
                rows={8}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="# Design Note..."
                className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#227C70]"
              />
            ) : (
              <div className="p-4 bg-stone-50 border border-stone-300 rounded-lg min-h-[200px] max-h-[300px] overflow-y-auto markdown-body text-xs">
                <ReactMarkdown>{content || '*No content to preview.*'}</ReactMarkdown>
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-[#E7E3DC] bg-[#FAF8F5]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-note-form"
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#DF6357] hover:bg-[#c95145] text-white text-xs font-medium rounded-lg shadow-2xs transition-all disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DF6357]"
          >
            {isLoading ? 'Saving Entry...' : 'Create Entry'}
          </button>
        </div>
      </div>
    </div>
  );
};
