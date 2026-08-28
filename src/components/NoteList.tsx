import React from 'react';
import { Search, X, Filter, Sparkles, Folder, Tag, Layers, ArrowRight } from 'lucide-react';
import { ProjectKnowledgeSearchItem } from '../types';

interface NoteListProps {
  items: ProjectKnowledgeSearchItem[];
  selectedId: string | null;
  onSelectNote: (id: string) => void;
  query: string;
  setQuery: (q: string) => void;
  projectFilter: string;
  setProjectFilter: (p: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  topLimit: number;
  setTopLimit: (t: number) => void;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onSearchSubmit: (e: React.FormEvent) => void;
  onSearchClear?: () => void;
  onQuickSearch: (term: string) => void;
  projectsList: string[];
  categoriesList: string[];
  recentSearchTerms?: string[];
  onRemoveSearchTerm?: (term: string) => void;
  onClearSearchTerms?: () => void;
}

export const NoteList: React.FC<NoteListProps> = ({
  items,
  selectedId,
  onSelectNote,
  query,
  setQuery,
  projectFilter,
  setProjectFilter,
  categoryFilter,
  setCategoryFilter,
  topLimit,
  setTopLimit,
  isLoading,
  isError,
  errorMessage,
  onSearchSubmit,
  onSearchClear,
  onQuickSearch,
  projectsList,
  categoriesList,
  recentSearchTerms = [],
  onRemoveSearchTerm,
  onClearSearchTerms,
}) => {
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const searchTermsToDisplay =
    recentSearchTerms && recentSearchTerms.length > 0
      ? recentSearchTerms.slice(0, 5)
      : ['*', 'LocalMcp', 'architecture', 'agents', 'manual'];

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Search Bar & Controls */}
      <div className="p-4 sm:p-5 border-b border-[#E7E3DC] space-y-3">
        <form onSubmit={onSearchSubmit} className="relative">
          <button
            type="submit"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#227C70] focus:outline-none focus:text-[#227C70] transition-colors p-0.5 rounded-md"
            title="Search (or press Enter)"
            aria-label="Submit search"
          >
            <Search className="w-4 h-4" />
          </button>
          <input
            ref={searchInputRef}
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, tags, or content (press Enter to search)..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-[#E7E3DC] rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#227C70] focus:border-transparent transition-all shadow-2xs"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                if (onSearchClear) onSearchClear();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-700 rounded-full"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Quick Suggestion Chips (Last 5 search terms stored in localStorage) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span
            className="text-[11px] font-medium text-stone-400 shrink-0 flex items-center gap-1"
            title="Last 5 search terms stored in local storage"
          >
            <Sparkles className="w-3 h-3 text-[#227C70]" /> Quick:
          </span>
          {searchTermsToDisplay.map((term) => (
            <div key={term} className="relative group/chip shrink-0 inline-flex items-center">
              <button
                type="button"
                onClick={() => onQuickSearch(term)}
                className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                  query === term
                    ? 'bg-[#227C70] text-white shadow-2xs'
                    : 'bg-stone-200/70 hover:bg-stone-300/80 text-stone-700'
                }`}
                title={`Search for "${term}" (saved in localStorage)`}
              >
                {term}
              </button>
              {onRemoveSearchTerm && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSearchTerm(term);
                  }}
                  className="hidden group-hover/chip:flex items-center justify-center w-3.5 h-3.5 -ml-1.5 mr-0.5 bg-stone-400 hover:bg-rose-500 text-white rounded-full text-[9px] transition-colors"
                  title={`Remove "${term}" from history`}
                  aria-label={`Remove search term ${term}`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          ))}
          {onClearSearchTerms && recentSearchTerms.length > 0 && (
            <button
              type="button"
              onClick={onClearSearchTerms}
              className="text-[10px] text-stone-400 hover:text-stone-600 underline ml-1 shrink-0"
              title="Reset search terms history in localStorage"
            >
              Reset
            </button>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-stone-600">
          <div className="flex items-center gap-1 shrink-0 font-medium text-stone-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-2 py-1 text-xs bg-white border border-[#E7E3DC] rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#227C70]"
          >
            <option value="all">All Projects</option>
            {projectsList.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2 py-1 text-xs bg-white border border-[#E7E3DC] rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#227C70]"
          >
            <option value="all">All Categories</option>
            {categoriesList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Top Limit */}
          <div className="ml-auto flex items-center gap-1 text-[11px] text-stone-500">
            <span>Limit:</span>
            <select
              value={topLimit}
              onChange={(e) => setTopLimit(Number(e.target.value))}
              className="px-1.5 py-0.5 text-xs bg-white border border-[#E7E3DC] rounded-md text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#227C70]"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header / Count */}
      <div className="px-5 py-2.5 bg-[#F3EFE6]/50 border-b border-[#E7E3DC] flex items-center justify-between text-xs text-stone-500 font-medium">
        <span>
          {isLoading
            ? 'Loading entries...'
            : isError
            ? 'Error loading entries'
            : !query.trim()
            ? `Latest entries (${items.length})`
            : `${items.length} ${items.length === 1 ? 'entry' : 'entries'} found`}
        </span>
        {query.trim() ? (
          <span className="text-stone-400 font-normal truncate max-w-[150px]">for "{query}"</span>
        ) : (
          <span className="text-stone-400 font-normal text-[11px]">Most recent activity</span>
        )}
      </div>

      {/* Note Cards List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && (
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="p-4 rounded-xl border border-[#E7E3DC] bg-white animate-pulse space-y-2.5"
              >
                <div className="h-4 bg-stone-200 rounded w-3/4" />
                <div className="h-3 bg-stone-100 rounded w-1/2" />
                <div className="h-3 bg-stone-100 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2">
            <p className="font-semibold text-rose-900">Search Failed</p>
            <p>{errorMessage || 'Unable to retrieve search results. Ensure query is not empty.'}</p>
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div className="text-center py-10 px-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-200/60 mx-auto flex items-center justify-center text-stone-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-800">No entries match your search</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                Try searching for a different keyword like <button type="button" onClick={() => onQuickSearch('*')} className="text-[#227C70] underline font-medium">*</button> or create a new knowledge entry.
              </p>
            </div>
          </div>
        )}

        {!isLoading &&
          !isError &&
          items.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <div
                key={item.id}
                onClick={() => onSelectNote(item.id)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => e.key === 'Enter' && onSelectNote(item.id)}
                className={`group p-4 rounded-xl border transition-all text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#227C70] ${
                  isSelected
                    ? 'bg-white border-[#227C70] ring-1 ring-[#227C70] shadow-md'
                    : 'bg-white/80 hover:bg-white border-[#E7E3DC] hover:border-stone-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="font-semibold text-sm text-stone-900 line-clamp-1 group-hover:text-[#227C70] transition-colors">
                    {item.title}
                  </h3>
                  {typeof item.score === 'number' && item.score > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/80 shrink-0" title="Relevance score">
                      {(item.score * 100).toFixed(0)}%
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 line-clamp-2 mb-3 leading-relaxed font-mono text-[11px] bg-stone-50/70 p-1.5 rounded border border-stone-100">
                  {item.content ? item.content.slice(0, 120) : 'No content'}
                </p>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#227C70]/10 text-[#227C70] font-medium">
                    <Folder className="w-3 h-3" />
                    {item.project}
                  </span>

                  {item.category && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                      <Tag className="w-3 h-3 text-stone-400" />
                      {item.category}
                    </span>
                  )}

                  <span className="ml-auto text-[10px] text-stone-400 font-mono">
                    {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
