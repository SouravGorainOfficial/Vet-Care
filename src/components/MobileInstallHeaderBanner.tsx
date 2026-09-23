import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Star } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface MobileInstallHeaderBannerProps {
  onOpenInstallModal: () => void;
}

export const MobileInstallHeaderBanner: React.FC<MobileInstallHeaderBannerProps> = ({
  onOpenInstallModal,
}) => {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('vetcare_install_banner_dismissed');
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  if (isInstalled || dismissed) {
    return null;
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    sessionStorage.setItem('vetcare_install_banner_dismissed', 'true');
  };

  const handleInstall = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        onOpenInstallModal();
      }
    } else {
      onOpenInstallModal();
    }
  };

  return (
    <div className="md:hidden bg-slate-900 text-white px-3 py-2 border-b border-slate-800 flex items-center justify-between gap-2.5 text-xs animate-in slide-in-from-top duration-200">
      <div className="flex items-center gap-2.5 flex-1 min-w-0" onClick={handleInstall}>
        <img
          src="/pwa-192x192.png"
          alt="VetCare App"
          className="w-8 h-8 rounded-lg shadow-xs bg-white shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="font-bold text-white text-xs truncate flex items-center gap-1.5">
            <span>VetCare App</span>
            <span className="text-[9px] bg-teal-500/20 text-teal-300 px-1.5 py-0.2 rounded font-semibold">FREE</span>
          </div>
          <div className="text-[10px] text-slate-300 flex items-center gap-1 truncate">
            <span className="flex text-amber-400">★★★★★</span>
            <span>• Fast 1-Tap Telehealth</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleInstall}
          className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-3 py-1 rounded-lg text-[11px] flex items-center gap-1 transition shadow-xs"
        >
          <Download className="w-3 h-3" />
          <span>Install</span>
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 text-slate-400 hover:text-white rounded-md transition"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
