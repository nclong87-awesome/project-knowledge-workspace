import React, { useState, useEffect } from 'react';
import { X, Key, ShieldAlert, CheckCircle2, AlertCircle, Server, LogOut } from 'lucide-react';
import { getApiBaseUrl, fetchOAuthToken, setInMemoryCredentials, getInMemoryCredentials, logout, getStoredToken } from '../lib/auth';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (clientId: string) => void;
  onLogout: () => void;
  isAuthenticated: boolean;
  apiBaseUrl: string;
  setApiBaseUrl: (url: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  onLogout,
  isAuthenticated,
  apiBaseUrl,
  setApiBaseUrl,
}) => {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [customUrl, setCustomUrl] = useState(apiBaseUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync state on open
  useEffect(() => {
    if (isOpen) {
      setCustomUrl(apiBaseUrl);
      const creds = getInMemoryCredentials();
      if (creds.clientId) setClientId(creds.clientId);
      if (creds.clientSecret) setClientSecret(creds.clientSecret);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, apiBaseUrl]);

  if (!isOpen) return null;

  const storedToken = getStoredToken();
  const tokenExpiresInMin = storedToken
    ? Math.max(0, Math.floor((storedToken.expiresAt - Date.now()) / 60000))
    : 0;

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId.trim() || !clientSecret.trim()) {
      setError('Please provide both Client ID and Client Secret.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const formattedUrl = customUrl.trim().replace(/\/+$/, '');
      setApiBaseUrl(formattedUrl);

      // Perform OAuth Client Credentials Token Request
      await fetchOAuthToken(formattedUrl, clientId.trim(), clientSecret.trim());
      setInMemoryCredentials(clientId.trim(), clientSecret.trim());
      
      setSuccessMsg('Authentication successful! Token obtained.');
      onAuthSuccess(clientId.trim());
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate. Verify credentials and backend URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAction = () => {
    logout();
    setClientId('');
    setClientSecret('');
    setSuccessMsg(null);
    setError(null);
    onLogout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-xl border border-[#E7E3DC] shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        {/* Dialog Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E3DC] bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#227C70]/10 text-[#227C70]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 id="settings-title" className="font-semibold text-stone-900 text-base">
                API & OAuth Credentials
              </h2>
              <p className="text-xs text-stone-500">Configure Client Credentials and API origin</p>
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

        {/* Dialog Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Active Auth Summary Card */}
          {isAuthenticated && storedToken ? (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-emerald-950">Session Active</p>
                  <p className="text-emerald-700 mt-0.5">
                    Bearer token valid for ~{tokenExpiresInMin} minutes.
                    {clientId ? ` (Client ID: ${clientId})` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogoutAction}
                className="inline-flex items-center gap-1 text-emerald-800 hover:text-rose-700 font-medium px-2 py-1 bg-white border border-emerald-300 rounded shadow-2xs transition-colors shrink-0"
                title="Log out and clear token"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-950">Authentication Required</p>
                <p className="text-amber-800 mt-0.5">
                  Protected operations require a valid OAuth bearer token from your backend API.
                </p>
              </div>
            </div>
          )}

          {/* Error and Success Feedback */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="break-words font-medium">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>{successMsg}</div>
            </div>
          )}

          {/* Form */}
          <form id="settings-form" onSubmit={handleAuthenticate} className="space-y-4">
            {/* Base URL */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-stone-500" />
                API Base URL
              </label>
              <input
                type="url"
                required
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="http://localhost:5204"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#227C70] focus:border-transparent transition-all"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Reads from VITE_API_BASE_URL (defaults to http://localhost:5204)
              </p>
            </div>

            {/* Client ID */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                OAuth Client ID
              </label>
              <input
                type="text"
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Enter client ID"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#227C70] focus:border-transparent transition-all"
              />
            </div>

            {/* Client Secret */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                OAuth Client Secret
              </label>
              <input
                type="password"
                required
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="Enter client secret"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#227C70] focus:border-transparent transition-all font-mono"
              />
            </div>

            {/* Client Secret Security Callout */}
            <div className="p-3 rounded-lg bg-stone-100 border border-stone-200 text-stone-600 text-[11px] leading-relaxed flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-stone-800">Security Notice:</strong> The client secret is held exclusively in React memory and is <em>never</em> written to localStorage, cookies, or disk. A browser environment cannot guarantee secret confidentiality.
              </div>
            </div>
          </form>
        </div>

        {/* Dialog Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#E7E3DC] bg-[#FAF8F5]">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogoutAction}
              className="px-3 py-1.5 text-xs text-rose-700 hover:text-rose-900 hover:bg-rose-50 rounded-lg font-medium transition-colors"
            >
              Clear Session
            </button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="settings-form"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#227C70] hover:bg-[#1a6057] active:bg-[#144c45] text-white text-xs font-medium rounded-lg shadow-2xs transition-all disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#227C70]"
            >
              {loading ? 'Authenticating...' : 'Save & Authenticate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
