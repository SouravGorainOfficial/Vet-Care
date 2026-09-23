import React from 'react';
import { WifiOff, AlertCircle } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-slate-900/95 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-amber-300 shadow-xl border border-amber-500/30 animate-pulse">
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span>Offline Mode — Cached data active</span>
    </div>
  );
};
