import React, { useState } from 'react';
import { AlertTriangle, Phone, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const EmergencyBanner: React.FC = () => {
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div id="emergency-banner" className="bg-amber-50 border-b border-amber-200/80 text-amber-900 px-4 py-2 text-xs font-medium transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          <span className="text-amber-800 line-clamp-1">{t.emergencyDisclaimer}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="tel:18005558387"
            className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-900 font-semibold underline underline-offset-2 text-xs"
          >
            <Phone className="w-3 h-3" />
            <span>{t.emergencyCall}</span>
          </a>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-amber-500 hover:text-amber-800 rounded transition"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
