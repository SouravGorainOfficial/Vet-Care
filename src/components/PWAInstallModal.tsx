import React from 'react';
import { Smartphone, Download, Share2, PlusSquare, X, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4 transition-all">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in slide-in-from-bottom duration-200">
        {/* Header with App Icon */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-black/10 hover:bg-black/20 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <img
              src="/pwa-192x192.png"
              alt="VetCare App Icon"
              className="w-16 h-16 rounded-2xl shadow-md border-2 border-white/30 bg-white"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/30 text-teal-100 text-[10px] font-bold uppercase tracking-wider">
                <Smartphone className="w-3 h-3" /> Official Mobile App
              </div>
              <h3 className="text-xl font-bold font-outfit text-white mt-1">VetCare Telehealth</h3>
              <p className="text-xs text-teal-100">Veterinary Hospital & Pharmacy in your pocket</p>
            </div>
          </div>
        </div>

        {/* Benefits list */}
        <div className="p-6 space-y-4">
          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span><strong>Instant 1-Tap Access:</strong> Launches full-screen directly from your mobile home screen without opening a browser tab.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span><strong>Offline Pet Health Pass:</strong> View medical histories, vaccination certificates, and prescriptions even with zero network signal.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span><strong>Consultation & Pill Reminders:</strong> Low battery consumption, fast performance, and crystal clear telehealth video calls.</span>
            </div>
          </div>

          {/* Action Area */}
          {isInstalled ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
              <p className="text-emerald-800 text-xs font-bold">App Already Installed on your device! 🎉</p>
              <p className="text-emerald-700 text-[11px] mt-0.5">Check your home screen or app drawer to launch.</p>
            </div>
          ) : isInstallable ? (
            <div className="space-y-2 pt-2">
              <button
                onClick={handleInstallClick}
                className="w-full bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 text-sm"
              >
                <Download className="w-5 h-5" />
                <span>Install VetCare Mobile App</span>
              </button>
              <p className="text-[11px] text-center text-slate-400">Fast install • No App Store account required • 100% Free</p>
            </div>
          ) : isIOS ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-teal-600" />
                <span>How to Install on iPhone & iPad:</span>
              </div>
              <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside pl-1">
                <li>Tap the <strong className="text-slate-900">Share</strong> button in the Safari bottom bar.</li>
                <li>Scroll down and tap <strong className="text-slate-900">Add to Home Screen</strong> <span className="inline-block align-middle"><PlusSquare className="w-3.5 h-3.5 inline text-slate-700" /></span>.</li>
                <li>Tap <strong className="text-slate-900">Add</strong> in the top-right corner.</li>
              </ol>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3.5 text-xs text-teal-800">
                To install on your mobile device: tap your browser menu (three dots <span className="font-bold">⋮</span>) and select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.
              </div>
              <button
                onClick={onClose}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl text-xs transition"
              >
                Got It
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
