import React from 'react';
import {
  PhoneCall,
  AlertTriangle,
  MapPin,
  Clock,
  X,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface EmergencyActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
}

export const EmergencyActionSheet: React.FC<EmergencyActionSheetProps> = ({
  isOpen,
  onClose,
  navigate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4 transition-all">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-rose-200 overflow-hidden transform transition-all animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-800 to-red-900 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-black/10 hover:bg-black/20 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldAlert className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-rose-100 text-[10px] font-bold uppercase tracking-wider">
                <Clock className="w-3 h-3" /> 24/7 Priority Emergency
              </div>
              <h3 className="text-lg font-bold font-outfit text-white mt-0.5">Pet Emergency Services</h3>
              <p className="text-xs text-rose-100/90">Immediate clinical care for critical animals</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="bg-rose-50 border border-rose-200/90 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Severe Trauma or Poisoning?</span>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              If your animal is unconscious, bleeding profusely, experiencing seizures, or ingested toxic substances (chocolate, lilies, rat poison), contact emergency triage immediately.
            </p>
          </div>

          {/* Emergency Call Options */}
          <div className="space-y-2.5">
            {/* Primary Hotline */}
            <a
              href="tel:18008382273"
              className="w-full bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold p-3.5 rounded-2xl transition flex items-center justify-between shadow-lg shadow-rose-600/30 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <PhoneCall className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white text-xs">Call 24/7 Vet Emergency Hotline</div>
                  <div className="text-[10px] text-rose-100">1-800-VET-CARE (Toll Free)</div>
                </div>
              </div>
              <span className="bg-white text-rose-700 text-[11px] font-extrabold px-2.5 py-1 rounded-xl">
                Call Now
              </span>
            </a>

            {/* Animal Poison Control */}
            <a
              href="tel:8884264435"
              className="w-full bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold p-3 rounded-2xl transition flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white text-xs">Pet Poison Control Hotline</div>
                  <div className="text-[10px] text-slate-400">(888) 426-4435 (24/7 Toxicologist)</div>
                </div>
              </div>
              <span className="bg-slate-800 text-slate-200 text-[10px] font-bold px-2 py-1 rounded-lg">
                Dial
              </span>
            </a>
          </div>

          {/* Find Nearest Hospital Action */}
          <button
            onClick={() => {
              onClose();
              navigate('/veterinarians?service=clinic&emergency=true');
            }}
            className="w-full bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold p-3 rounded-2xl border border-teal-200 transition flex items-center justify-center gap-2 text-xs"
          >
            <MapPin className="w-4 h-4 text-teal-600" />
            <span>Locate Nearest 24/7 Physical Pet Hospital</span>
          </button>
        </div>
      </div>
    </div>
  );
};
