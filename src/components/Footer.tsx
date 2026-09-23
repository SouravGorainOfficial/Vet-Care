import React from 'react';
import { Heart, Phone, Mail, MapPin, ShieldAlert, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Emergency Notice Card */}
        <div className="bg-amber-950/70 border border-amber-800/80 rounded-2xl p-5 sm:p-6 mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white font-semibold text-sm sm:text-base">Important Emergency Veterinary Disclaimer</h4>
              <p className="text-amber-200/90 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
                If your animal has a life-threatening emergency (severe respiratory distress, uncontrolled hemorrhage, gastric dilation volvulus/bloat, active seizure), contact the nearest physical emergency veterinary clinic immediately. VetCare telehealth does not substitute emergency surgical intervention.
              </p>
            </div>
          </div>
          <a
            href="tel:18005558387"
            className="shrink-0 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition"
          >
            <Phone className="w-4 h-4" />
            <span>24/7 Hotline: +1 (800) 555-VETS</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 cursor-pointer inline-flex"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
                <Heart className="w-5 h-5 fill-slate-950 text-teal-500" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white font-outfit">VetCare</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              {t.tagline}. Connecting animal parents, livestock farmers, and guardians with certified veterinary specialists worldwide.
            </p>
            <div className="pt-2 flex flex-col gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400" />
                <span>support@vetcare.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400" />
                <span>+1 (800) 555-8387 (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span>Global Veterinary Telehealth Network</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 text-sm">
            <h4 className="text-white font-semibold tracking-wider text-xs uppercase text-teal-400">Platform</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate('/veterinarians')} className="hover:text-white transition">
                  {t.navVets}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/pharmacy')} className="hover:text-white transition flex items-center gap-1.5 text-teal-300 font-semibold">
                  <span>🐾 Online Pharmacy & Rx</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/services')} className="hover:text-white transition">
                  {t.navServices}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/how-it-works')} className="hover:text-white transition">
                  {t.navHowItWorks}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/vet-registration')} className="hover:text-white transition">
                  {t.navVetRegister}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/faq')} className="hover:text-white transition">
                  {t.navFAQ}
                </button>
              </li>
            </ul>
          </div>

          {/* Supported Animals */}
          <div className="space-y-3 text-sm">
            <h4 className="text-white font-semibold tracking-wider text-xs uppercase text-teal-400">Animals Supported</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><button onClick={() => navigate('/veterinarians?species=Dogs')} className="hover:text-white transition">{t.dogs}</button></li>
              <li><button onClick={() => navigate('/veterinarians?species=Cats')} className="hover:text-white transition">{t.cats}</button></li>
              <li><button onClick={() => navigate('/veterinarians?species=Birds')} className="hover:text-white transition">{t.birds}</button></li>
              <li><button onClick={() => navigate('/veterinarians?species=Rabbits')} className="hover:text-white transition">{t.rabbits}</button></li>
              <li><button onClick={() => navigate('/veterinarians?species=Cows')} className="hover:text-white transition">{t.cows}</button></li>
              <li><button onClick={() => navigate('/veterinarians?species=Horses')} className="hover:text-white transition">{t.horses}</button></li>
              <li><button onClick={() => navigate('/veterinarians?species=Goats')} className="hover:text-white transition">{t.goats}</button></li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-3 text-sm">
            <h4 className="text-white font-semibold tracking-wider text-xs uppercase text-teal-400">Trust & Legal</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate('/privacy')} className="hover:text-white transition">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/terms')} className="hover:text-white transition">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/refund-policy')} className="hover:text-white transition">
                  Refund Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-white transition">
                  Contact Support
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} VetCare Health Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-teal-400">
              <CheckCircle className="w-4 h-4 text-teal-400" />
              <span>HIPAA & Veterinary Telehealth Compliant Architecture</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
