const RECENT_SEARCHES_KEY = 'project-knowledge.recent-searches';
export const DEFAULT_SEARCH_TERMS = ['*', 'LocalMcp', 'architecture', 'agents', 'manual'];

/**
 * Get recent 5 search terms from localStorage.
 * Falls back to default terms if empty or missing.
 */
export function getRecentSearchTerms(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return DEFAULT_SEARCH_TERMS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 5);
    }
  } catch (err) {
    console.error('Error reading recent search terms from localStorage:', err);
  }
  return DEFAULT_SEARCH_TERMS;
}

/**
 * Save a new search term to localStorage (keeps last 5 unique terms).
 */
export function addRecentSearchTerm(term: string): string[] {
  const trimmed = term.trim();
  if (!trimmed) return getRecentSearchTerms();

  const current = getRecentSearchTerms();
  // Filter out existing occurrence (case-insensitive)
  const filtered = current.filter((t) => t.toLowerCase() !== trimmed.toLowerCase());
  // Place newly searched term at the front and keep at most 5 items
  const updated = [trimmed, ...filtered].slice(0, 5);

  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save search term to localStorage:', err);
  }
  return updated;
}

/**
 * Remove a single search term from localStorage history
 */
export function removeRecentSearchTerm(term: string): string[] {
  const current = getRecentSearchTerms();
  const updated = current.filter((t) => t.toLowerCase() !== term.toLowerCase());
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to remove search term from localStorage:', err);
  }
  return updated.length > 0 ? updated : DEFAULT_SEARCH_TERMS;
}

/**
 * Clear all recent search terms from localStorage
 */
export function clearRecentSearchTerms(): string[] {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (err) {
    console.error('Failed to clear search terms from localStorage:', err);
  }
  return DEFAULT_SEARCH_TERMS;
}
