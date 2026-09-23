import React, { useState } from 'react';
import {
  ChevronLeft,
  ShoppingBag,
  PhoneCall,
  User,
  Sparkles,
  Globe,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { UserRole } from '../types';

interface MobileAppHeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
  onOpenSOS: () => void;
}

export const MobileAppHeader: React.FC<MobileAppHeaderProps> = ({
  currentPath,
  navigate,
  onOpenSOS,
}) => {
  const { user, switchDemoRole, logout, notifications, unreadNotificationCount } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { totalItems, setIsCartOpen } = useCart();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const isHome = currentPath === '/';

  // Compute title for non-home pages
  const getPageTitle = () => {
    if (currentPath === '/landing') return 'Web Landing Page';
    if (currentPath.startsWith('/veterinarians/')) return 'Doctor Profile';
    if (currentPath === '/veterinarians') return 'Find Veterinarians';
    if (currentPath.startsWith('/pharmacy')) return 'Online Pharmacy Store';
    if (currentPath === '/dashboard/animals') return 'My Pets & Health Cards';
    if (currentPath.startsWith('/dashboard')) return 'My Account & Records';
    if (currentPath === '/vet/dashboard') return 'Veterinarian Portal';
    if (currentPath === '/admin') return 'Hospital Administration';
    if (currentPath === '/login') return 'Sign In';
    if (currentPath === '/register') return 'Create Account';
    if (currentPath === '/vet-registration') return 'Doctor Registration';
    return 'VetCare';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-4 py-2 shadow-2xs">
      {isHome ? (
        <div className="flex items-center justify-between gap-2">
          {/* User Info / Avatar or Sign In / Register if logged out */}
          {user ? (
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="relative shrink-0 active:scale-95 transition"
                title="Account Menu & Options"
              >
                <img
                  src={
                    user?.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                  }
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-teal-500/20 shadow-2xs"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-medium leading-none">Hello</span>
                  {/* Account / Role Menu Pill */}
                  <button
                    onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                    className="px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[9px] font-bold border border-teal-200/80 flex items-center gap-0.5 hover:bg-teal-100 transition"
                    title="Account & Role Menu"
                  >
                    <span>{user?.role === 'VETERINARIAN' ? 'Dr. Mode' : user?.role === 'ADMIN' ? 'Admin' : 'Pet Owner'}</span>
                    <span className="text-[8px]">▾</span>
                  </button>
                </div>

                <div
                  onClick={() => navigate(user.role === 'VETERINARIAN' ? '/vet/dashboard' : user.role === 'ADMIN' ? '/admin' : '/dashboard')}
                  className="font-bold text-xs text-slate-900 truncate flex items-center gap-1 cursor-pointer hover:text-teal-700"
                >
                  <span className="truncate">{user.name.split(' ')[0]}</span>
                  <span>🐾</span>
                </div>
              </div>
            </div>
          ) : (
            /* Logged out state: direct Login and Register options */
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => navigate('/login')}
                className="px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl border border-teal-200/80 transition active:scale-95"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-2.5 py-1 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition active:scale-95"
              >
                Register
              </button>
            </div>
          )}

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Direct Landing Page Link */}
            <button
              onClick={() => navigate('/landing')}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition active:scale-95"
              title="View full web landing page"
            >
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden xs:inline">Landing</span>
            </button>

            {/* 24/7 SOS Emergency Button */}
            <button
              onClick={onOpenSOS}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold shadow-2xs active:scale-95 transition"
              title="Emergency 24/7 Hotline"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
              <span>SOS</span>
            </button>

            {/* Language Switch */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="p-1.5 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-bold hover:bg-slate-200 transition"
              title="Change Language"
            >
              {language === 'en' ? 'বাংলা' : 'EN'}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/80 active:scale-95 transition"
              title="Open Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-teal-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-teal-600 text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Subpage Header with Back Navigation */
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  navigate('/');
                }
              }}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-90 shrink-0"
              aria-label="Go Back"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <h2 className="font-bold font-outfit text-sm text-slate-900 truncate">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Landing Page link if not on landing */}
            {currentPath !== '/landing' && (
              <button
                onClick={() => navigate('/landing')}
                className="p-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1"
                title="View Landing Page"
              >
                <Globe className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden sm:inline">Landing</span>
              </button>
            )}

            {/* Quick Home */}
            <button
              onClick={() => navigate('/')}
              className="p-1.5 px-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold"
            >
              App Home
            </button>
          </div>
        </div>
      )}

      {/* Account & Role Switcher Dropdown Modal */}
      {roleMenuOpen && (
        <div className="absolute top-14 left-3 right-3 sm:left-4 sm:right-4 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 animate-in fade-in zoom-in-95 duration-150 space-y-3">
          {/* User Profile Summary */}
          {user && (
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-500/20"
                />
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{user.name}</h4>
                  <p className="text-[10px] text-slate-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  navigate(user.role === 'VETERINARIAN' ? '/vet/dashboard' : user.role === 'ADMIN' ? '/admin' : '/dashboard');
                  setRoleMenuOpen(false);
                }}
                className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-lg hover:bg-teal-100"
              >
                Dashboard
              </button>
            </div>
          )}

          {/* Quick Navigation: Landing, Login, Register */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Platform Links
            </div>
            <button
              onClick={() => {
                navigate('/landing');
                setRoleMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 text-slate-700 hover:bg-slate-50"
            >
              <Globe className="w-4 h-4 text-teal-600" />
              <span>🌐 View Full Web Landing Page</span>
            </button>
            <button
              onClick={() => {
                navigate('/login');
                setRoleMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 text-slate-700 hover:bg-slate-50"
            >
              <User className="w-4 h-4 text-slate-600" />
              <span>🔑 Sign In Page</span>
            </button>
            <button
              onClick={() => {
                navigate('/register');
                setRoleMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 text-slate-700 hover:bg-slate-50"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>📝 Register New Account</span>
            </button>
            <button
              onClick={() => {
                navigate('/vet-registration');
                setRoleMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 text-slate-700 hover:bg-slate-50"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>🩺 Veterinarian Registration (Apply as Doctor)</span>
            </button>
          </div>

          {/* Demo Account Switcher */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Switch Demo Role
            </div>
            <button
              onClick={() => {
                switchDemoRole('USER');
                setRoleMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                user?.role === 'USER' ? 'bg-teal-50 text-teal-800' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span>🐾 Pet Owner (John Doe)</span>
              {user?.role === 'USER' && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
            </button>
            <button
              onClick={() => {
                switchDemoRole('VETERINARIAN');
                setRoleMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                user?.role === 'VETERINARIAN' ? 'bg-teal-50 text-teal-800' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span>🩺 Veterinarian (Dr. Sarah Jenkins)</span>
              {user?.role === 'VETERINARIAN' && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
            </button>
            <button
              onClick={() => {
                switchDemoRole('ADMIN');
                setRoleMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                user?.role === 'ADMIN' ? 'bg-teal-50 text-teal-800' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span>⚡ Admin (Platform Oversight)</span>
              {user?.role === 'ADMIN' && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
            </button>
          </div>

          {/* Sign Out Button */}
          {user && (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  logout();
                  setRoleMenuOpen(false);
                }}
                className="w-full text-center py-2 px-3 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
