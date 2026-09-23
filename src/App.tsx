import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { EmergencyBanner } from './components/EmergencyBanner';
import { CartDrawer } from './components/CartDrawer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PWAInstallModal } from './components/PWAInstallModal';
import { MobileAppHome } from './views/MobileAppHome';
import { EmergencyActionSheet } from './components/EmergencyActionSheet';

// Public Views
import {
  HomePage,
  AboutPage,
  ServicesPage,
  HowItWorksPage,
  ContactPage,
  RefundPolicyPage,
  TermsPage,
  PrivacyPage,
  VetRegistrationPage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  VerifyEmailPage,
} from './views/PublicPages';

// Feature Views
import { VeterinariansDirectory } from './views/VeterinariansDirectory';
import { VeterinarianDetail } from './views/VeterinarianDetail';
import { BookAppointmentModal } from './views/BookAppointmentModal';
import { UserDashboard } from './views/UserDashboard';
import { VetDashboard } from './views/VetDashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { ConsultationRoom } from './views/ConsultationRoom';
import { PharmacyStore } from './views/PharmacyStore';
import { VeterinarianProfile } from './types';

// Helper to normalize path when hosted on GitHub Pages subfolders (e.g. /<repo-name>/...)
function getNormalizedPath(pathname: string): string {
  if (!pathname || pathname === '/' || pathname === '/index.html') return '/';

  const knownPrefixes = [
    '/landing',
    '/app',
    '/veterinarians',
    '/pharmacy',
    '/dashboard',
    '/vet',
    '/admin',
    '/consultation',
    '/login',
    '/register',
    '/vet-registration',
  ];

  // If path directly matches known routes
  if (knownPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?'))) {
    return pathname;
  }

  // If hosted under /<repo-name>/... strip the first repository segment
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length >= 1) {
    const afterRepo = '/' + segments.slice(1).join('/');
    const cleanAfter = afterRepo === '' ? '/' : afterRepo;
    if (cleanAfter === '/' || cleanAfter === '/index.html' || knownPrefixes.some((p) => cleanAfter === p || cleanAfter.startsWith(p + '/'))) {
      return cleanAfter === '/index.html' ? '/' : cleanAfter;
    }
  }

  return pathname;
}

function AppContent() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const ghRedirect = sessionStorage.getItem('gh_pages_redirect');
    if (ghRedirect) {
      sessionStorage.removeItem('gh_pages_redirect');
      return getNormalizedPath(ghRedirect.split('?')[0]);
    }
    return getNormalizedPath(window.location.pathname || '/');
  });
  const [bookingVet, setBookingVet] = useState<VeterinarianProfile | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isSOSOpen, setIsSOSOpen] = useState<boolean>(false);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getNormalizedPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(getNormalizedPath(path.split('?')[0]));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Parse path & params
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search') || '';
  const speciesParam = urlParams.get('species') || 'All';

  // Check if route matches /veterinarians/:id
  const vetDetailMatch = currentPath.match(/^\/veterinarians\/([a-zA-Z0-9_-]+)$/);
  const vetId = vetDetailMatch ? vetDetailMatch[1] : null;

  // Check if route matches /consultation/:id
  const consultationMatch = currentPath.match(/^\/consultation\/([a-zA-Z0-9_-]+)$/);
  const consultationId = consultationMatch ? consultationMatch[1] : null;

  // Handle booking from detail page if ?book=true is passed
  useEffect(() => {
    if (vetId && urlParams.get('book') === 'true') {
      fetch(`/api/vets/${vetId}`)
        .then((res) => res.json())
        .then((d) => {
          if (d.veterinarian) setBookingVet(d.veterinarian);
        })
        .catch(() => {});
    }
  }, [vetId]);

  // If in active live consultation room, hide regular navbar and footer for immersive full-screen video
  if (consultationId) {
    return <ConsultationRoom appointmentId={consultationId} navigate={navigate} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-800 pb-16 md:pb-0">
      {/* 24/7 Emergency Disclaimer Banner */}
      <EmergencyBanner />

      {/* Offline Status Pill Notification */}
      <OfflineIndicator />

      {/* Full Responsive Navigation Header with Login & Register */}
      <Navbar
        currentPath={currentPath}
        navigate={navigate}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Main Screen Content Area */}
      <main className="flex-1">
        {/* Full Marketing Landing Page at root / and /landing */}
        {(currentPath === '/' || currentPath === '/landing') && (
          <HomePage
            navigate={navigate}
            onBookVet={(vet) => setBookingVet(vet)}
          />
        )}

        {/* Dedicated Mobile App Mode at /app */}
        {currentPath === '/app' && (
          <div className="max-w-2xl mx-auto py-4">
            <div className="px-4 mb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                📱 Mobile App Mode
              </span>
              <button
                onClick={() => navigate('/')}
                className="text-xs font-semibold text-slate-600 hover:text-teal-700 underline"
              >
                Switch to Web Landing Page →
              </button>
            </div>
            <MobileAppHome
              navigate={navigate}
              onBookVet={(vet) => setBookingVet(vet)}
              onOpenSOS={() => setIsSOSOpen(true)}
            />
          </div>
        )}

        {currentPath === '/veterinarians' && (
          <VeterinariansDirectory
            navigate={navigate}
            initialSearch={searchParam}
            initialSpecies={speciesParam}
            onBookVet={(vet) => setBookingVet(vet)}
          />
        )}

        {vetId && (
          <VeterinarianDetail
            vetId={vetId}
            navigate={navigate}
            onBookAppointment={(vet) => setBookingVet(vet)}
          />
        )}

        {currentPath === '/services' && <ServicesPage navigate={navigate} />}
        {currentPath === '/how-it-works' && <HowItWorksPage navigate={navigate} />}
        {currentPath === '/about' && <AboutPage navigate={navigate} />}
        {currentPath === '/contact' && <ContactPage navigate={navigate} />}
        {currentPath === '/faq' && <HomePage navigate={navigate} />}
        {currentPath === '/terms' && <TermsPage navigate={navigate} />}
        {currentPath === '/privacy' && <PrivacyPage navigate={navigate} />}
        {currentPath === '/refund-policy' && <RefundPolicyPage navigate={navigate} />}
        {currentPath === '/vet-registration' && <VetRegistrationPage navigate={navigate} />}
        {currentPath === '/login' && <LoginPage navigate={navigate} />}
        {currentPath === '/register' && <RegisterPage navigate={navigate} />}
        {currentPath === '/forgot-password' && <ForgotPasswordPage navigate={navigate} />}
        {currentPath === '/verify-email' && <VerifyEmailPage navigate={navigate} />}

        {/* Online Pharmacy Store */}
        {currentPath.startsWith('/pharmacy') && (
          <PharmacyStore
            initialCategory={
              currentPath === '/pharmacy/rx'
                ? 'PRESCRIPTION_RX'
                : currentPath === '/pharmacy/flea-tick'
                ? 'FLEA_TICK_DEWORMING'
                : 'ALL'
            }
          />
        )}

        {/* Dashboards */}
        {currentPath.startsWith('/dashboard') && (
          <UserDashboard
            navigate={navigate}
            activeSubTab={
              currentPath === '/dashboard/animals'
                ? 'animals'
                : currentPath === '/dashboard/appointments'
                ? 'appointments'
                : currentPath === '/dashboard/prescriptions'
                ? 'prescriptions'
                : 'overview'
            }
          />
        )}

        {currentPath.startsWith('/vet') && <VetDashboard navigate={navigate} />}
        {currentPath.startsWith('/admin') && <AdminDashboard navigate={navigate} />}
      </main>

      {/* Global Comprehensive Footer (shown on all standard pages) */}
      <Footer navigate={navigate} />

      {/* Mobile Touch Bottom Nav Bar (visible on mobile screens <= 768px) */}
      <MobileBottomNav
        currentPath={currentPath}
        navigate={navigate}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* 24/7 Emergency Action Sheet */}
      <EmergencyActionSheet
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        navigate={navigate}
      />

      {/* Global Slide-over Pharmacy Cart Drawer */}
      <CartDrawer onNavigateToOrders={() => navigate('/pharmacy')} />

      {/* PWA Mobile App Installation Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Global Booking Wizard Modal */}
      {bookingVet && (
        <BookAppointmentModal
          vet={bookingVet}
          isOpen={!!bookingVet}
          onClose={() => setBookingVet(null)}
          onSuccess={(appointmentId) => {
            setBookingVet(null);
            navigate(`/dashboard`);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
