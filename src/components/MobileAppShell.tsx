import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Maximize2,
  Minimize2,
  Wifi,
  Battery,
  Signal,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface MobileAppShellProps {
  children: React.ReactNode;
  currentPath: string;
  navigate: (path: string) => void;
  onOpenSOS: () => void;
}

export const MobileAppShell: React.FC<MobileAppShellProps> = ({
  children,
  currentPath,
  navigate,
  onOpenSOS,
}) => {
  // View mode: 'device_frame' (iPhone mockup), 'mobile_canvas' (flat mobile width), 'desktop_full' (wide)
  const [viewMode, setViewMode] = useState<'device_frame' | 'mobile_canvas' | 'desktop_full'>('device_frame');
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [currentTime, setCurrentTime] = useState('9:41');

  // Detect real mobile screen width
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth <= 768;
      setIsMobileScreen(isMobile);
      if (isMobile) {
        setViewMode('mobile_canvas');
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update real-time clock for status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours % 12 || 12}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // If on actual mobile device or user toggled to mobile_canvas / desktop_full
  if (isMobileScreen) {
    return (
      <div className="w-full min-h-screen bg-slate-50 flex flex-col antialiased">
        {children}
      </div>
    );
  }

  if (viewMode === 'desktop_full') {
    return (
      <div className="w-full min-h-screen bg-slate-50 flex flex-col antialiased">
        {/* Top bar allowing quick switch back to Mobile App */}
        <div className="bg-slate-900 text-white px-4 py-2 text-xs flex items-center justify-between border-b border-slate-800 z-50 sticky top-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span className="font-semibold">VetCare Telehealth & Pharmacy</span>
            <span className="text-slate-400 text-[11px]">(Desktop View)</span>
          </div>
          <button
            onClick={() => setViewMode('device_frame')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold transition active:scale-95 shadow-xs"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Switch to Mobile App Preview</span>
          </button>
        </div>
        {children}
      </div>
    );
  }

  // Device Frame View (Default on desktop preview: iPhone 16 Pro mockup)
  return (
    <div className="min-h-screen bg-slate-900/95 py-6 px-4 flex flex-col items-center justify-start antialiased selection:bg-teal-500 selection:text-white">
      {/* Top Device Controls Bar */}
      <div className="w-full max-w-md mb-4 bg-slate-800/90 backdrop-blur-md rounded-2xl p-2 px-3 flex items-center justify-between border border-slate-700/80 shadow-lg text-xs text-white">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-slate-100 text-xs">Mobile Application</span>
            <span className="hidden sm:inline text-[10px] text-teal-400 ml-1.5 font-semibold">• iPhone 16 Pro</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => navigate('/landing')}
            className="px-2 py-1 rounded-xl bg-slate-700/80 hover:bg-slate-600 text-teal-300 hover:text-white font-semibold text-[11px] transition"
            title="Open Web Landing Page"
          >
            🌐 Landing
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-2 py-1 rounded-xl bg-slate-700/80 hover:bg-slate-600 text-slate-200 hover:text-white font-semibold text-[11px] transition"
            title="Open Sign In"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-2 py-1 rounded-xl bg-slate-700/80 hover:bg-slate-600 text-slate-200 hover:text-white font-semibold text-[11px] transition"
            title="Open Register"
          >
            Register
          </button>

          <button
            onClick={() => setViewMode('mobile_canvas')}
            className={`px-2.5 py-1 rounded-xl font-medium text-[11px] transition ${
              viewMode === 'mobile_canvas' ? 'bg-teal-600 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
            title="Clean Mobile Canvas without phone bezel"
          >
            Canvas
          </button>
          <button
            onClick={() => setViewMode('device_frame')}
            className={`px-2.5 py-1 rounded-xl font-medium text-[11px] transition ${
              viewMode === 'device_frame' ? 'bg-teal-600 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
            title="Phone Bezel Frame"
          >
            Phone
          </button>
          <button
            onClick={() => setViewMode('desktop_full')}
            className="p-1 text-slate-400 hover:text-white transition"
            title="Expand to Full Desktop View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Smartphone Hardware Frame Mockup */}
      <div
        className={
          viewMode === 'device_frame'
            ? 'relative w-[400px] h-[844px] bg-black rounded-[52px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.15)] ring-1 ring-slate-700/80 overflow-hidden flex flex-col'
            : 'relative w-[414px] min-h-[844px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-300'
        }
      >
        {/* Device Bezel Hardware Details (Hardware speaker & buttons reflection) */}
        {viewMode === 'device_frame' && (
          <>
            {/* Dynamic Island Pill */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-28 h-7 bg-black rounded-full flex items-center justify-between px-2.5 pointer-events-none shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-white tracking-wider">VetCare</span>
              </div>
            </div>

            {/* Hardware Glare subtle gradient */}
            <div className="absolute inset-0 pointer-events-none rounded-[52px] bg-gradient-to-tr from-white/[0.04] to-transparent z-40" />
          </>
        )}

        {/* Internal Screen Container */}
        <div className="w-full h-full bg-slate-50 rounded-[42px] overflow-hidden flex flex-col relative z-20">
          {/* Mobile Status Bar */}
          <div className="pt-3 pb-1 px-7 flex items-center justify-between bg-white text-slate-900 text-xs font-bold shrink-0 select-none z-30">
            <span className="text-[12px] font-bold tracking-tight">{currentTime}</span>
            <div className="flex items-center gap-1.5 text-slate-800">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-semibold">100%</span>
                <Battery className="w-4 h-4 fill-slate-800 text-slate-800" />
              </div>
            </div>
          </div>

          {/* Active Mobile Screen Content (with smooth native scroll) */}
          <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
            {children}
          </div>

          {/* Home Indicator Bar (iOS style bottom bar) */}
          {viewMode === 'device_frame' && (
            <div className="pt-1 pb-2 flex justify-center bg-white shrink-0 select-none pointer-events-none">
              <div className="w-32 h-1 bg-slate-400 rounded-full" />
            </div>
          )}
        </div>
      </div>

      <p className="text-slate-400 text-[11px] mt-4 text-center">
        📱 Native mobile application layout • Touch-friendly navigation • Offline PWA enabled
      </p>
    </div>
  );
};
