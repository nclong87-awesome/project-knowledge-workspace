import React from 'react';
import { Plus, Settings, RotateCw, BookOpen, Key } from 'lucide-react';

interface TopBarProps {
  isAuthenticated: boolean;
  clientId: string | null;
  onOpenNewNote: () => void;
  onOpenSettings: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  isAuthenticated,
  clientId,
  onOpenNewNote,
  onOpenSettings,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E7E3DC] px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#227C70]/10 border border-[#227C70]/20 flex items-center justify-center text-[#227C70]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-lg text-stone-900 tracking-tight leading-none">
                Project Knowledge
              </h1>
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-stone-200/70 text-stone-600">
                Workspace
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              Editorial notes & architecture decision records
            </p>
          </div>
        </div>

        {/* Status and Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Auth Status Pill */}
          <button
            onClick={onOpenSettings}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              isAuthenticated
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-700 border border-amber-200/70 hover:bg-amber-100'
            }`}
            title={isAuthenticated ? `Authenticated as ${clientId || 'Client'}` : 'Click to configure credentials'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isAuthenticated ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="hidden xs:inline">
              {isAuthenticated ? (clientId ? `ID: ${clientId}` : 'Authenticated') : 'Setup API Auth'}
            </span>
            {!isAuthenticated && <Key className="w-3 h-3 ml-0.5" />}
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={!isAuthenticated}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#227C70]"
            title="Refresh entries cache"
            aria-label="Refresh entries"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#227C70]' : ''}`} />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#227C70] relative"
            title="API Settings & OAuth credentials"
            aria-label="Open settings"
          >
            <Settings className="w-4 h-4" />
            {!isAuthenticated && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#FAF8F5]" />
            )}
          </button>

          {/* New Entry Primary Action */}
          <button
            onClick={onOpenNewNote}
            disabled={!isAuthenticated}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#DF6357] hover:bg-[#c95145] active:bg-[#b54439] text-white text-xs sm:text-sm font-medium rounded-lg shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DF6357] focus-visible:ring-offset-2"
            title="Create new project knowledge entry"
          >
            <Plus className="w-4 h-4" />
            <span>New Entry</span>
          </button>
        </div>
      </div>
    </header>
  );
};
