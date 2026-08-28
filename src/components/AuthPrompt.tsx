import React from 'react';
import { ShieldAlert, Key, Settings, Server } from 'lucide-react';

interface AuthPromptProps {
  onOpenSettings: () => void;
  reason?: string | null;
}

export const AuthPrompt: React.FC<AuthPromptProps> = ({ onOpenSettings, reason }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-lg mx-auto space-y-5 my-12 bg-white rounded-2xl border border-[#E7E3DC] shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-2xs">
        <Key className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-stone-900 tracking-tight">
          Backend API Authentication Required
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {reason ||
            'To search, create, read, edit, or delete project knowledge entries, configure your OAuth Client ID & Secret in API Settings.'}
        </p>
      </div>

      <div className="p-3 bg-[#FAF8F5] border border-[#E7E3DC] rounded-xl text-xs text-stone-500 font-mono text-left w-full space-y-1">
        <div className="flex items-center gap-1.5 text-stone-700 font-medium">
          <Server className="w-3.5 h-3.5 text-[#227C70]" />
          <span>OAuth Client Credentials Flow</span>
        </div>
        <p className="text-[11px] text-stone-500 font-sans">
          Requests an access token from <code className="text-[#227C70] bg-stone-200/60 px-1 py-0.5 rounded">/oauth/token</code> and stores the Bearer token in localStorage.
        </p>
      </div>

      <button
        onClick={onOpenSettings}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#227C70] hover:bg-[#1a6057] active:bg-[#144c45] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#227C70] focus-visible:ring-offset-2"
      >
        <Settings className="w-4 h-4" />
        <span>Configure API Auth & Credentials</span>
      </button>
    </div>
  );
};
