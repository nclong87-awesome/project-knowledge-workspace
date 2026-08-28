import React, { useState, useEffect, useMemo } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

import {
  ProjectKnowledgeItem,
  ProjectKnowledgeSearchItem,
  CreateProjectKnowledgeInput,
  UpdateProjectKnowledgeInput,
} from './types';
import {
  getApiBaseUrl,
  getStoredToken,
  isTokenValid,
  isTokenUnexpired,
  getInMemoryCredentials,
  logout as authLogout,
} from './lib/auth';
import {
  getLatestProjectKnowledge,
  searchProjectKnowledge,
  getProjectKnowledge,
  createProjectKnowledge,
  updateProjectKnowledge,
  deleteProjectKnowledge,
} from './lib/api';

import { TopBar } from './components/TopBar';
import { NoteList } from './components/NoteList';
import { NoteDetail } from './components/NoteDetail';
import { SettingsModal } from './components/SettingsModal';
import { NoteEditorModal } from './components/NoteEditorModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { AuthPrompt } from './components/AuthPrompt';

// Create TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        if (error?.status === 401 || error?.status === 403 || error?.name === 'AuthError') {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});

function WorkspaceContent() {
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(getApiBaseUrl());
  const [tokenRecord, setTokenRecord] = useState(getStoredToken());
  const [clientId, setClientId] = useState<string | null>(getInMemoryCredentials().clientId);
  
  // UI Navigation & Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProjectKnowledgeItem | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  // Search parameters
  const [query, setQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [topLimit, setTopLimit] = useState(10);

  // Toast feedback state
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Check auth status
  const isAuthenticated = isTokenValid(tokenRecord) || (isTokenUnexpired(tokenRecord) && Boolean(clientId));

  // Sync stored token on mount or focus
  useEffect(() => {
    const t = getStoredToken();
    setTokenRecord(t);
    const creds = getInMemoryCredentials();
    if (creds.clientId) setClientId(creds.clientId);

    // Open settings automatically on first visit if no token exists
    if (!t && !isTokenValid(t)) {
      setIsSettingsOpen(true);
    }
  }, []);

  // Search or Latest Entries Query Hook
  const searchQuery = useQuery({
    queryKey: ['knowledge-list', query, projectFilter, categoryFilter, topLimit, apiBaseUrl],
    queryFn: () => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        return getLatestProjectKnowledge();
      }
      return searchProjectKnowledge({
        query: trimmedQuery,
        project: projectFilter,
        category: categoryFilter,
        top: topLimit,
      });
    },
    enabled: isAuthenticated,
    staleTime: 10000,
  });

  // Single Item Query Hook
  const itemQuery = useQuery({
    queryKey: ['knowledge-item', selectedId, apiBaseUrl],
    queryFn: () => getProjectKnowledge(selectedId!),
    enabled: isAuthenticated && Boolean(selectedId),
    staleTime: 10000,
  });

  // Handle Search Auth Errors
  useEffect(() => {
    if (searchQuery.error) {
      const err = searchQuery.error as any;
      if (err?.status === 401 || err?.status === 403 || err?.name === 'AuthError') {
        setTokenRecord(null);
      }
    }
  }, [searchQuery.error]);

  // Derive item list & active note item
  const items: ProjectKnowledgeSearchItem[] = searchQuery.data?.items || [];

  // Extract unique projects and categories for filter dropdowns
  const { projectsList, categoriesList } = useMemo(() => {
    const pSet = new Set<string>(['LocalMcp']);
    const cSet = new Set<string>(['architecture', 'general']);
    items.forEach((it) => {
      if (it.project) pSet.add(it.project);
      if (it.category) cSet.add(it.category);
    });
    return {
      projectsList: Array.from(pSet),
      categoriesList: Array.from(cSet),
    };
  }, [items]);

  // Selected Note Resolution
  const activeNote: ProjectKnowledgeItem | null = useMemo(() => {
    if (!selectedId) return null;
    if (itemQuery.data) return itemQuery.data;
    const foundInSearch = items.find((i) => i.id === selectedId);
    return foundInSearch || null;
  }, [selectedId, itemQuery.data, items]);

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (input: CreateProjectKnowledgeInput) => createProjectKnowledge(input),
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-list'] });
      setSelectedId(newItem.id);
      setMobileView('detail');
      showToast('success', `Created entry "${newItem.title}"`);
    },
    onError: (err: any) => {
      showToast('error', err.message || 'Failed to create entry.');
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateProjectKnowledgeInput }) =>
      updateProjectKnowledge(id, updates),
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-list'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-item', updatedItem.id] });
      showToast('success', `Updated entry "${updatedItem.title}"`);
    },
    onError: (err: any) => {
      showToast('error', err.message || 'Failed to update entry.');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProjectKnowledge(id),
    onSuccess: (responseMessage, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-list'] });
      queryClient.removeQueries({ queryKey: ['knowledge-item', deletedId] });
      if (selectedId === deletedId) {
        setSelectedId(null);
        setMobileView('list');
      }
      setDeleteTarget(null);
      const textMsg =
        typeof responseMessage === 'string'
          ? responseMessage
          : 'Project knowledge entry deleted successfully.';
      showToast('success', textMsg);
    },
    onError: (err: any) => {
      showToast('error', err.message || 'Failed to delete entry.');
    },
  });

  // Handlers
  const handleSelectNote = (id: string) => {
    setSelectedId(id);
    setMobileView('detail');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      searchQuery.refetch();
    }
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
  };

  const handleAuthSuccess = (cId: string) => {
    setClientId(cId);
    setTokenRecord(getStoredToken());
    showToast('success', 'Authenticated successfully with API bearer token.');
    searchQuery.refetch();
  };

  const handleLogout = () => {
    authLogout();
    setTokenRecord(null);
    setClientId(null);
    setSelectedId(null);
    showToast('success', 'Logged out and cleared token from localStorage.');
  };

  const handleRefreshAll = () => {
    searchQuery.refetch();
    if (selectedId) itemQuery.refetch();
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans selection:bg-[#227C70]/20 selection:text-[#227C70]">
      {/* Toast Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200 max-w-sm">
          <div
            className={`p-3.5 rounded-xl shadow-lg border text-xs font-medium flex items-start gap-2.5 ${
              toast.type === 'success'
                ? 'bg-stone-900 text-white border-stone-800'
                : 'bg-rose-900 text-white border-rose-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 pr-2">{toast.text}</div>
            <button
              onClick={() => setToast(null)}
              className="text-stone-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <TopBar
        isAuthenticated={isAuthenticated}
        clientId={clientId}
        onOpenNewNote={() => setIsNewNoteOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRefresh={handleRefreshAll}
        isRefreshing={searchQuery.isFetching || itemQuery.isFetching}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 flex flex-col overflow-hidden">
        {!isAuthenticated ? (
          <AuthPrompt onOpenSettings={() => setIsSettingsOpen(true)} />
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 border border-[#E7E3DC] rounded-2xl bg-white/60 shadow-xs overflow-hidden min-h-[75vh]">
            {/* Left Pane: Search & Notes List (Visible on LG screens or on mobile when view is 'list') */}
            <div
              className={`lg:col-span-5 border-r border-[#E7E3DC] flex flex-col ${
                mobileView === 'detail' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              <NoteList
                items={items}
                selectedId={selectedId}
                onSelectNote={handleSelectNote}
                query={query}
                setQuery={setQuery}
                projectFilter={projectFilter}
                setProjectFilter={setProjectFilter}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                topLimit={topLimit}
                setTopLimit={setTopLimit}
                isLoading={searchQuery.isLoading}
                isError={searchQuery.isError}
                errorMessage={
                  (searchQuery.error as any)?.message || 'Query failed'
                }
                onSearchSubmit={handleSearchSubmit}
                onQuickSearch={handleQuickSearch}
                projectsList={projectsList}
                categoriesList={categoriesList}
              />
            </div>

            {/* Right Pane: Note Detail View (Visible on LG screens or on mobile when view is 'detail') */}
            <div
              className={`lg:col-span-7 flex flex-col bg-white ${
                mobileView === 'list' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              <NoteDetail
                note={activeNote}
                isLoading={itemQuery.isLoading && Boolean(selectedId)}
                isError={itemQuery.isError}
                errorMessage={(itemQuery.error as any)?.message}
                onBackToList={() => setMobileView('list')}
                onRefresh={() => itemQuery.refetch()}
                onDeleteRequest={(note) => setDeleteTarget(note)}
                onUpdateNote={async (id, updates) => {
                  await updateMutation.mutateAsync({ id, updates });
                }}
                isUpdating={updateMutation.isPending}
              />
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        onLogout={handleLogout}
        isAuthenticated={isAuthenticated}
        apiBaseUrl={apiBaseUrl}
        setApiBaseUrl={setApiBaseUrl}
      />

      <NoteEditorModal
        isOpen={isNewNoteOpen}
        onClose={() => setIsNewNoteOpen(false)}
        onSubmit={async (input) => {
          await createMutation.mutateAsync(input);
        }}
        isLoading={createMutation.isPending}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        note={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteMutation.mutateAsync(deleteTarget.id);
          }
        }}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WorkspaceContent />
    </QueryClientProvider>
  );
}
