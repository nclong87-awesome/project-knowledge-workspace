import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Eye,
  Pencil,
  Copy,
  Check,
  Trash2,
  RotateCw,
  Folder,
  Tag,
  Clock,
  Code2,
  Save,
  X,
  ArrowLeft,
  Sparkles,
  Share2,
} from 'lucide-react';
import { ProjectKnowledgeItem, UpdateProjectKnowledgeInput } from '../types';

interface NoteDetailProps {
  note: ProjectKnowledgeItem | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onBackToList?: () => void;
  onRefresh: () => void;
  onDeleteRequest: (note: ProjectKnowledgeItem) => void;
  onUpdateNote: (id: string, updates: UpdateProjectKnowledgeInput) => Promise<void>;
  isUpdating?: boolean;
}

export const NoteDetail: React.FC<NoteDetailProps> = ({
  note,
  isLoading,
  isError,
  errorMessage,
  onBackToList,
  onRefresh,
  onDeleteRequest,
  onUpdateNote,
  isUpdating,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editProject, setEditProject] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editSource, setEditSource] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync edit form when note changes
  useEffect(() => {
    if (note) {
      setEditTitle(note.title);
      setEditProject(note.project);
      setEditCategory(note.category || 'general');
      setEditTags(note.tags || '');
      setEditSource(note.source || 'manual');
      setEditContent(note.content);
      setIsEditing(false);
      setSaveError(null);
    }
  }, [note]);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-stone-400 space-y-3">
        <RotateCw className="w-6 h-6 animate-spin text-[#227C70]" />
        <p className="text-xs">Loading entry content...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
        <div className="p-3 bg-rose-50 text-rose-600 rounded-full">
          <Trash2 className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-stone-800">Error Loading Entry</h3>
        <p className="text-xs text-stone-500 max-w-sm">{errorMessage || 'The requested note could not be retrieved.'}</p>
        <button
          onClick={onRefresh}
          className="px-3 py-1.5 text-xs font-medium bg-stone-200 text-stone-800 rounded-lg hover:bg-stone-300 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-transparent text-stone-400 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#227C70]/10 border border-[#227C70]/20 flex items-center justify-center text-[#227C70]">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-stone-800">No Knowledge Entry Selected</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Select a note from the left workspace list, or click <strong>New Entry</strong> to record new project documentation.
          </p>
        </div>
      </div>
    );
  }

  const handleCopyContent = () => {
    if (note.content) {
      navigator.clipboard.writeText(note.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyId = () => {
    if (note.id) {
      navigator.clipboard.writeText(note.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    const updates: UpdateProjectKnowledgeInput = {};
    if (editTitle !== note.title) updates.title = editTitle;
    if (editProject !== note.project) updates.project = editProject;
    if (editCategory !== note.category) updates.category = editCategory;
    if (editTags !== note.tags) updates.tags = editTags;
    if (editSource !== note.source) updates.source = editSource;
    if (editContent !== note.content) updates.content = editContent;

    if (Object.keys(updates).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      await onUpdateNote(note.id, updates);
      setIsEditing(false);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update entry.');
    }
  };

  const tagList = (isEditing ? editTags : note.tags)
    ?.split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Top Toolbar */}
      <div className="px-5 py-3 border-b border-[#E7E3DC] bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="lg:hidden p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200/70 rounded-lg transition-colors"
              title="Back to entry list"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {/* Clearly Visible ID Badge & Copy to Clipboard Button */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white border border-[#E7E3DC] rounded-lg text-xs font-mono text-stone-800 shadow-2xs">
            <span className="text-stone-500 font-medium select-none">ID:</span>
            <span className="font-semibold text-stone-900 select-all tracking-tight" title={note.id}>
              {note.id}
            </span>
            <button
              type="button"
              onClick={handleCopyId}
              className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-sans font-medium text-[#227C70] hover:text-[#1a6057] bg-[#227C70]/10 hover:bg-[#227C70]/20 rounded-md transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#227C70]"
              title="Copy ID to Clipboard"
            >
              {copiedId ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[#227C70]" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {!isEditing ? (
            <>
              {/* Preview vs Code tab */}
              <div className="flex items-center bg-stone-200/60 p-0.5 rounded-lg text-xs font-medium text-stone-600 mr-1">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                    activeTab === 'preview' ? 'bg-white text-stone-900 shadow-2xs' : 'hover:text-stone-900'
                  }`}
                  title="Rendered Markdown Preview"
                >
                  <Eye className="w-3.5 h-3.5 text-[#227C70]" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                    activeTab === 'code' ? 'bg-white text-stone-900 shadow-2xs' : 'hover:text-stone-900'
                  }`}
                  title="Plain Text / Raw Source"
                >
                  <Code2 className="w-3.5 h-3.5 text-stone-500" />
                  <span>Source</span>
                </button>
              </div>

              {/* Refresh */}
              <button
                onClick={onRefresh}
                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#227C70]"
                title="Refresh entry"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Copy Content Button */}
              <button
                onClick={handleCopyContent}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200/80 border border-stone-200/80 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#227C70]"
                title="Copy Markdown content to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-600" />
                    <span>Copy Content</span>
                  </>
                )}
              </button>

              {/* Edit */}
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#227C70] bg-[#227C70]/10 hover:bg-[#227C70]/20 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#227C70]"
                title="Edit entry"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              {/* Delete */}
              <button
                onClick={() => onDeleteRequest(note)}
                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                title="Delete entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-2.5 py-1 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isUpdating}
                className="inline-flex items-center gap-1 px-3 py-1 bg-[#227C70] hover:bg-[#1a6057] text-white text-xs font-medium rounded-lg shadow-2xs transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Detail Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {saveError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-lg">
            {saveError}
          </div>
        )}

        {/* Read Mode */}
        {!isEditing ? (
          <div className="space-y-6">
            {/* Title & Metadata */}
            <div className="space-y-3 pb-4 border-b border-[#E7E3DC]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-800 border border-stone-200/80 text-xs font-mono">
                  <span className="text-stone-400 font-medium">ID:</span>
                  <span className="font-semibold text-stone-900 select-all">{note.id}</span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="p-0.5 text-stone-500 hover:text-[#227C70] transition-colors rounded ml-0.5"
                    title="Copy ID to Clipboard"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#227C70]/10 text-[#227C70] font-medium text-xs">
                  <Folder className="w-3.5 h-3.5" />
                  {note.project}
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700 text-xs font-medium">
                  <Tag className="w-3.5 h-3.5 text-stone-400" />
                  {note.category || 'general'}
                </span>

                {note.source && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 text-[11px] font-mono">
                    <Share2 className="w-3 h-3 text-amber-600" />
                    {note.source}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight leading-snug">
                {note.title}
              </h1>

              {/* Tags & Dates */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 font-medium pt-1">
                {tagList.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    {tagList.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded bg-stone-100 text-stone-600 text-[11px]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 text-[11px] text-stone-400 font-mono ml-auto">
                  <span title="Created timestamp" className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    Created: {new Date(note.createdAt).toLocaleString()}
                  </span>
                  {note.updatedAt && (
                    <span title="Updated timestamp">
                      Updated: {new Date(note.updatedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Markdown Content or Plain Text */}
            {activeTab === 'preview' ? (
              <div className="markdown-body text-stone-800 pt-2">
                <ReactMarkdown>{note.content || '*No content provided.*'}</ReactMarkdown>
              </div>
            ) : (
              <pre className="p-4 bg-stone-900 text-stone-100 text-xs font-mono rounded-xl overflow-x-auto leading-relaxed">
                {note.content}
              </pre>
            )}
          </div>
        ) : (
          /* Edit Mode Form */
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={editProject}
                  onChange={(e) => setEditProject(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#227C70]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Category</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  placeholder="architecture, general..."
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#227C70]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Title *</label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm font-semibold bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#227C70]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="agents, bridge, architecture"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#227C70]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Source</label>
                <input
                  type="text"
                  value={editSource}
                  onChange={(e) => setEditSource(e.target.value)}
                  placeholder="manual, vscode-chat-copilot"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#227C70]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-stone-700">Content (Markdown) *</label>
                <span className="text-[11px] text-stone-400 font-mono">Markdown supported</span>
              </div>
              <textarea
                rows={12}
                required
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#227C70]"
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
