import React from 'react';
import { Home, Stethoscope, ShoppingBag, Heart, User, Download, Smartphone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface MobileBottomNavProps {
  currentPath: string;
  navigate: (path: string) => void;
  onOpenInstallModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPath,
  navigate,
  onOpenInstallModal,
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const { isInstalled } = usePWAInstall();

  // Hide on video consultation room to maximize screen space for camera
  if (currentPath.startsWith('/consultation')) {
    return null;
  }

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      isActive: currentPath === '/',
      onClick: () => navigate('/'),
    },
    {
      id: 'vets',
      label: 'Find Vets',
      icon: Stethoscope,
      isActive: currentPath.startsWith('/veterinarians') || currentPath.startsWith('/vet-profile'),
      onClick: () => navigate('/veterinarians'),
    },
    {
      id: 'pharmacy',
      label: 'Pharmacy',
      icon: ShoppingBag,
      badge: totalItems > 0 ? totalItems : null,
      isActive: currentPath.startsWith('/pharmacy'),
      onClick: () => navigate('/pharmacy'),
    },
    {
      id: 'animals',
      label: user ? 'My Pets' : 'Animals',
      icon: Heart,
      isActive: currentPath.startsWith('/dashboard/animals') || (currentPath.startsWith('/dashboard') && !currentPath.startsWith('/dashboard/prescriptions')),
      onClick: () => {
        if (user) {
          navigate('/dashboard/animals');
        } else {
          navigate('/login');
        }
      },
    },
    {
      id: 'account',
      label: user ? 'Account' : 'Login',
      icon: User,
      badge: !user ? 'Sign In' : null,
      badgeColor: 'bg-teal-600',
      isActive:
        currentPath.startsWith('/dashboard') ||
        currentPath.startsWith('/vet/dashboard') ||
        currentPath === '/admin' ||
        currentPath === '/login' ||
        currentPath === '/register' ||
        currentPath === '/vet-registration',
      onClick: () => {
        if (user) {
          navigate(user.role === 'VETERINARIAN' ? '/vet/dashboard' : user.role === 'ADMIN' ? '/admin' : '/dashboard');
        } else {
          navigate('/login');
        }
      },
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] shrink-0"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.35rem)' }}
    >
      <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 select-none ${
                active
                  ? 'text-teal-700 font-bold scale-[1.03]'
                  : 'text-slate-500 hover:text-slate-800 font-medium active:scale-95'
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1 rounded-xl transition ${
                    active ? 'bg-teal-50 text-teal-700' : 'bg-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'stroke-[2.4px]' : 'stroke-[1.8px]'}`} />
                </div>

                {/* Badge for cart count or promo */}
                {item.badge && (
                  <span
                    className={`absolute -top-1 -right-2 min-w-[17px] h-[17px] px-1 rounded-full ${
                      item.badgeColor || 'bg-teal-600'
                    } text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs border border-white`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] tracking-tight mt-0.5 leading-tight ${active ? 'text-teal-700' : 'text-slate-500'}`}>
                {item.label}
              </span>

              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
