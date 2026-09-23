import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  Calendar,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Stethoscope,
  ShieldCheck,
  Globe,
  ChevronDown,
  CheckCircle2,
  ShoppingBag,
  Smartphone,
  Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { UserRole } from '../types';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
  onOpenInstallModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate, onOpenInstallModal }) => {
  const { user, logout, switchDemoRole, notifications, unreadNotificationCount, markNotificationAsRead } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { setIsCartOpen, totalItems } = useCart();
  const { isInstalled, isInstallable, install } = usePWAInstall();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: t.navVets, path: '/veterinarians' },
    { label: t.navPharmacy || 'Pharmacy', path: '/pharmacy' },
    { label: t.navHowItWorks, path: '/how-it-works' },
    { label: t.navServices, path: '/services' },
    { label: t.navAbout, path: '/about' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'VETERINARIAN') return '/vet/dashboard';
    return '/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            id="brand-logo-btn"
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-2 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm group-hover:bg-teal-700 transition">
              <Heart className="w-5 h-5 fill-teal-100 text-teal-600" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 font-outfit">VetCare</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition ${
                    active
                      ? 'text-teal-700 bg-teal-50 font-semibold'
                      : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}

            {/* Mobile App Mode switch */}
            <button
              id="nav-mobile-app-btn"
              onClick={() => handleNavClick('/app')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 border shadow-2xs ${
                currentPath === '/app'
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
              }`}
              title="Switch to Mobile App View"
            >
              <Smartphone className="w-3.5 h-3.5 text-teal-600" />
              <span>Mobile App</span>
            </button>

            {/* Join as a Vet direct link */}
            <button
              id="nav-join-as-vet-btn"
              onClick={() => handleNavClick('/vet-registration')}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition flex items-center gap-1.5 ${
                currentPath === '/vet-registration'
                  ? 'text-teal-800 bg-teal-100/80 font-bold'
                  : 'text-teal-700 hover:text-teal-800 hover:bg-teal-50'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>{t.navVetRegister}</span>
            </button>

            {/* Admin Portal quick link when logged in as admin */}
            {user?.role === 'ADMIN' && (
              <button
                id="nav-admin-portal-btn"
                onClick={() => handleNavClick('/admin')}
                className={`px-3 py-1.5 text-sm font-bold rounded-lg transition flex items-center gap-1.5 ${
                  currentPath.startsWith('/admin')
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Admin Portal</span>
              </button>
            )}
          </nav>

          {/* Right Controls: Role, Language, Auth */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Demo Switcher (compact, quiet, clean) */}
            <div className="relative" ref={roleRef}>
              <button
                id="role-switcher-btn"
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition shadow-2xs"
                title="Switch demo account role"
              >
                <span className="text-[11px] font-medium text-slate-400">Role:</span>
                <span className="font-bold text-teal-800">{user ? user.role : 'Guest'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {roleSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs">
                  <div className="px-3 py-1 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    Switch Account Mode
                  </div>
                  <button
                    onClick={() => {
                      switchDemoRole('USER');
                      setRoleSwitcherOpen(false);
                      navigate('/dashboard');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">Pet Owner (Eleanor)</div>
                      <div className="text-slate-500 text-[11px]">3 pets, appointments</div>
                    </div>
                    {user?.role === 'USER' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>

                  <button
                    onClick={() => {
                      switchDemoRole('VETERINARIAN');
                      setRoleSwitcherOpen(false);
                      navigate('/vet/dashboard');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">Veterinarian (Dr. Jenkins)</div>
                      <div className="text-slate-500 text-[11px]">Calendar, video room</div>
                    </div>
                    {user?.role === 'VETERINARIAN' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>

                  <button
                    onClick={() => {
                      switchDemoRole('ADMIN');
                      setRoleSwitcherOpen(false);
                      navigate('/admin');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">Administrator</div>
                      <div className="text-slate-500 text-[11px]">Verification, platform logs</div>
                    </div>
                    {user?.role === 'ADMIN' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Language Toggle */}
            <button
              id="lang-toggle-btn"
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="p-1.5 text-xs text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition flex items-center gap-1"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-[11px]">{language === 'en' ? 'EN' : 'বাংলা'}</span>
            </button>

            {/* Mobile / PWA App Install Button */}
            {!isInstalled && (
              <button
                id="navbar-install-app-btn"
                onClick={() => {
                  if (isInstallable) {
                    install();
                  } else if (onOpenInstallModal) {
                    onOpenInstallModal();
                  }
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold border border-teal-200 transition active:scale-95"
                title="Install VetCare Mobile App"
              >
                <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                <span>Get App</span>
              </button>
            )}

            {/* Pharmacy Shopping Cart Button */}
            <button
              id="navbar-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition"
              title="Pharmacy Shopping Bag"
              aria-label="Pharmacy Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-teal-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  id="notifications-bell-btn"
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                      {unreadNotificationCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-800">Notifications</span>
                      <span className="text-xs text-slate-500">{notifications.length} total</span>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">
                          No notifications at this time.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              markNotificationAsRead(notif.id);
                              if (notif.link) {
                                navigate(notif.link);
                                setNotifDropdownOpen(false);
                              }
                            }}
                            className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition ${
                              !notif.read ? 'bg-teal-50/50' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-semibold text-slate-900">{notif.title}</span>
                              {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1"></span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Account / Navigation */}
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full border border-slate-200 hover:border-teal-400 hover:bg-slate-50 transition"
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=128'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-teal-500"
                  />
                  <span className="text-xs font-semibold text-slate-800 hidden sm:block max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="font-semibold text-slate-900 truncate">{user.name}</div>
                      <div className="text-slate-500 text-[11px] truncate">{user.email}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-100 text-teal-800">
                        {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate(getDashboardPath());
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 font-medium text-slate-700 flex items-center gap-2"
                    >
                      {user.role === 'ADMIN' ? (
                        <>
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          <span className="font-semibold text-slate-900">Admin Console</span>
                        </>
                      ) : user.role === 'VETERINARIAN' ? (
                        <>
                          <Stethoscope className="w-4 h-4 text-teal-600" />
                          <span>Doctor Portal</span>
                        </>
                      ) : (
                        <>
                          <Heart className="w-4 h-4 text-teal-600" />
                          <span>{t.navDashboard}</span>
                        </>
                      )}
                    </button>

                    {user.role === 'USER' && (
                      <>
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            navigate('/dashboard/animals');
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 font-medium text-slate-700 flex items-center gap-2"
                        >
                          <Heart className="w-4 h-4 text-teal-600" />
                          <span>{t.myAnimals}</span>
                        </button>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            navigate('/pharmacy');
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 font-medium text-slate-700 flex items-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4 text-teal-600" />
                          <span>Pharmacy & Orders</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-red-50 font-medium text-red-600 border-t border-slate-100 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.navLogout}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="nav-login-btn"
                  onClick={() => handleNavClick('/login')}
                  className="px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-teal-700 transition"
                >
                  {t.navLogin}
                </button>
                <button
                  id="nav-register-btn"
                  onClick={() => handleNavClick('/register')}
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm shadow-teal-600/20 transition"
                >
                  {t.navRegister}
                </button>
              </div>
            )}

            {/* Mobile menu hamburger toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => handleNavClick(link.path)}
              className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              {link.label}
            </button>
          ))}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {/* Quick Demo Switcher in Mobile Drawer */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 px-1">Switch Account Mode:</div>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  onClick={() => {
                    switchDemoRole('USER');
                    setMobileMenuOpen(false);
                    navigate('/dashboard');
                  }}
                  className={`py-1.5 px-2 rounded-lg font-semibold transition ${
                    user?.role === 'USER'
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Pet Owner
                </button>
                <button
                  onClick={() => {
                    switchDemoRole('VETERINARIAN');
                    setMobileMenuOpen(false);
                    navigate('/vet/dashboard');
                  }}
                  className={`py-1.5 px-2 rounded-lg font-semibold transition ${
                    user?.role === 'VETERINARIAN'
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Doctor
                </button>
                <button
                  onClick={() => {
                    switchDemoRole('ADMIN');
                    setMobileMenuOpen(false);
                    navigate('/admin');
                  }}
                  className={`py-1.5 px-2 rounded-lg font-semibold transition ${
                    user?.role === 'ADMIN'
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            <button
              onClick={() => handleNavClick('/app')}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-teal-800 bg-teal-50/80 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-teal-600" />
                <span>Mobile App Mode</span>
              </div>
              <span className="text-[10px] bg-teal-600 text-white font-bold px-2 py-0.5 rounded-full">
                App View
              </span>
            </button>

            <button
              onClick={() => handleNavClick('/vet-registration')}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-teal-700 bg-teal-50 rounded-lg"
            >
              {t.navVetRegister}
            </button>

            {/* Mobile App Install Button */}
            {!isInstalled && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (isInstallable) {
                    install();
                  } else if (onOpenInstallModal) {
                    onOpenInstallModal();
                  }
                }}
                className="w-full text-left px-3.5 py-3 text-sm font-bold text-slate-900 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl flex items-center justify-between shadow-2xs transition active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-5 h-5 text-teal-600 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Install VetCare Mobile App</div>
                    <div className="text-[10px] text-slate-500 font-normal">Add to Home Screen for fast 1-tap care</div>
                  </div>
                </div>
                <span className="text-[10px] bg-teal-600 text-white font-bold px-2 py-0.5 rounded-full">
                  FREE
                </span>
              </button>
            )}

            {user ? (
              <button
                onClick={() => handleNavClick(getDashboardPath())}
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-lg"
              >
                Go to {user.role === 'ADMIN' ? 'Admin Console' : user.role === 'VETERINARIAN' ? 'Doctor Portal' : 'My Dashboard'}
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => handleNavClick('/login')}
                  className="flex-1 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
                >
                  {t.navLogin}
                </button>
                <button
                  onClick={() => handleNavClick('/register')}
                  className="flex-1 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg"
                >
                  {t.navRegister}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
