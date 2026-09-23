import React, { useState, useEffect } from 'react';
import {
  Heart,
  Video,
  Calendar,
  FileText,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  Clock,
  Star,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Mail,
  Phone,
  Send,
  Upload,
  UserCheck,
  Stethoscope,
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  Package,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { VeterinarianProfile } from '../types';

interface PublicViewProps {
  navigate: (path: string) => void;
  onBookVet?: (vet: VeterinarianProfile) => void;
}

// -------------------------------------------------------------
// 1. HOMEPAGE
// -------------------------------------------------------------
export const HomePage: React.FC<PublicViewProps> = ({ navigate, onBookVet }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('All');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [featuredVets, setFeaturedVets] = useState<VeterinarianProfile[]>([]);

  useEffect(() => {
    fetch('/api/vets')
      .then((res) => res.json())
      .then((data) => {
        if (data.veterinarians) {
          setFeaturedVets(data.veterinarians.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/veterinarians?search=${encodeURIComponent(searchTerm)}&species=${selectedSpecies}`);
  };

  const faqs = [
    {
      q: 'How does an online vet consultation work?',
      a: 'Choose an available veterinarian and select a time that fits your schedule. At the appointment time, you join a secure video call to show your pet, discuss symptoms, and receive advice and treatment plans in real time.',
    },
    {
      q: 'Can online veterinarians issue prescriptions?',
      a: 'Yes. When clinically appropriate, our licensed veterinarians provide digital prescriptions with dosage and instructions that you can download or fulfill at your local pharmacy.',
    },
    {
      q: 'Can I book an in-person clinic appointment?',
      a: 'Yes. In addition to video calls, many veterinarians on VetCare offer physical clinic visits that you can book directly through the platform.',
    },
    {
      q: 'What should I do in a severe emergency?',
      a: 'If your animal is experiencing severe breathing difficulty, uncontrolled bleeding, bloat, or trauma, do not wait for an online call. Visit your nearest 24/7 physical emergency hospital immediately.',
    },
  ];

  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* Clean, Welcoming Hero */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200/80 shadow-2xs">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
          </span>
          <span>Verified Online & Clinic Veterinary Care</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight font-outfit max-w-3xl mx-auto leading-tight">
          Compassionate vet care for your pets, right on time.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Book certified veterinarians for secure online video calls or physical clinic visits. High-clarity video, instant prescriptions, and zero clinic stress.
        </p>

        {/* Clean, Simple Search Bar */}
        <form
          onSubmit={handleHeroSearch}
          className="max-w-2xl mx-auto bg-white p-2 rounded-2xl border-2 border-slate-200 hover:border-teal-400 focus-within:border-teal-500 shadow-sm transition flex flex-col sm:flex-row items-center gap-2"
        >
          <div className="flex-1 flex items-center gap-2.5 px-3 w-full">
            <Stethoscope className="w-5 h-5 text-teal-600 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by doctor name, pet type (e.g. Dog, Cat), or condition..."
              className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none py-1.5"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 shrink-0 shadow-sm"
          >
            <span>Find a Vet</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Pet Category Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 font-semibold mr-1">Quick Select:</span>
          {[
            { label: 'Dogs', icon: '🐕' },
            { label: 'Cats', icon: '🐈' },
            { label: 'Birds', icon: '🦜' },
            { label: 'Horses', icon: '🐎' },
            { label: 'Farm Animals', icon: '🐄', key: 'Cows' },
          ].map((cat) => (
            <button
              key={cat.label}
              onClick={() => navigate(`/veterinarians?species=${cat.key || cat.label}`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 font-semibold transition shadow-2xs hover:shadow-xs"
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Simple Trust Bullets */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            100% Board-Certified Doctors
          </span>
          <span className="flex items-center gap-1.5">
            <Video className="w-4 h-4 text-teal-600" />
            HD Encrypted Video Consultations
          </span>
          <span className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-teal-600" />
            Digital Prescriptions & Records
          </span>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-outfit">Top Available Veterinarians</h2>
            <p className="text-xs sm:text-sm text-slate-500">Certified specialists ready for video and clinic appointments.</p>
          </div>
          <button
            onClick={() => navigate('/veterinarians')}
            className="text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 bg-teal-50 px-3 py-1.5 rounded-xl transition"
          >
            <span>View All Doctors</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredVets.map((vet) => (
            <div
              key={vet.id}
              className="bg-white rounded-3xl border border-slate-200 hover:border-teal-400 p-5 sm:p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="flex items-start gap-3.5">
                  <img
                    src={vet.avatarUrl}
                    alt={vet.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Available
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug truncate">{vet.name}</h3>
                    <p className="text-xs text-teal-700 font-semibold truncate">{vet.specializations.join(', ')}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-800">{vet.rating}</span>
                      <span>({vet.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{vet.bio}</p>

                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                  <span className="text-slate-500 font-medium">{vet.yearsExperience} yrs experience</span>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium mr-1">Video</span>
                    <span className="font-extrabold text-slate-900 text-sm">${vet.consultationFee}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onBookVet) {
                      onBookVet(vet);
                    } else {
                      navigate(`/veterinarians/${vet.id}?book=true`);
                    }
                  }}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition text-center"
                >
                  Book Appointment
                </button>
                <button
                  onClick={() => navigate(`/veterinarians/${vet.id}`)}
                  className="px-3 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3 Simple Steps */}
      <section className="bg-slate-50/80 py-12 border-y border-slate-200/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-md mx-auto mb-10">
            <h2 className="text-2xl font-bold text-slate-900 font-outfit">How VetCare Works</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Quality pet medical care in three easy steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold text-sm flex items-center justify-center mx-auto">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Choose Your Vet</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Browse verified doctors by species, specialty, fee, or language.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold text-sm flex items-center justify-center mx-auto">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Select a Time</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pick a date and convenient time slot. Free slots are highlighted clearly.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold text-sm flex items-center justify-center mx-auto">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Connect & Care</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Join a secure video consultation or visit the clinic. Get your digital prescription immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Online Medicine Store & Pharmacy Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Certified Veterinary Online Store</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-outfit text-white">
                Genuine pet medications, delivered to your door.
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Fill prescriptions from your VetCare telehealth consultations with 100% genuine pharmaceuticals, flea & tick treatments, antibiotics, and supplements with temperature-controlled shipping.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate('/pharmacy')}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-teal-500/20"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Explore Pharmacy Store</span>
                </button>
                <button
                  onClick={() => navigate('/pharmacy?category=PRESCRIPTION_RX')}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 rounded-xl border border-white/15 transition text-xs sm:text-sm"
                >
                  Order Prescription (Rx)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div
                onClick={() => navigate('/pharmacy?category=PRESCRIPTION_RX')}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                  💊
                </div>
                <div className="font-bold text-sm text-white">Prescription Rx</div>
                <div className="text-xs text-slate-400 mt-1">Antibiotics, pain relief & heart health validated by licensed pharmacists.</div>
              </div>

              <div
                onClick={() => navigate('/pharmacy?category=FLEA_TICK_DEWORMING')}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                  🛡️
                </div>
                <div className="font-bold text-sm text-white">Flea & Tick</div>
                <div className="text-xs text-slate-400 mt-1">Chewables, spot-on pipettes & broad-spectrum dewormers.</div>
              </div>

              <div
                onClick={() => navigate('/pharmacy?category=SUPPLEMENTS_VITAMINS')}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                  ✨
                </div>
                <div className="font-bold text-sm text-white">Supplements</div>
                <div className="text-xs text-slate-400 mt-1">Joint glucosamine, omega fatty acids, probiotics & skin balms.</div>
              </div>

              <div
                onClick={() => navigate('/pharmacy?category=FARM_LIVESTOCK')}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                  🐄
                </div>
                <div className="font-bold text-sm text-white">Farm Animals</div>
                <div className="text-xs text-slate-400 mt-1">Veterinary electrolytes, calcium boluses & herd mastitis tubes.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple FAQ Accordion */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 font-outfit">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Quick answers to common questions</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full text-left p-4 flex items-center justify-between font-semibold text-slate-800 hover:text-teal-700 transition text-sm"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180 text-teal-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 border-t border-slate-100 pt-2.5 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Clean Bottom Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-teal-700 text-white rounded-2xl p-8 sm:p-10 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-outfit">Ready to talk to a veterinarian?</h2>
          <p className="text-xs sm:text-sm text-teal-100 max-w-lg mx-auto">
            Find the right care for your pet in just a few minutes. Verified doctors available today.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/veterinarians')}
              className="bg-white text-teal-900 hover:bg-teal-50 font-bold px-6 py-2.5 rounded-xl shadow-sm transition text-xs sm:text-sm inline-flex items-center gap-1.5"
            >
              <span>Browse All Veterinarians</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

// -------------------------------------------------------------
// 2. ABOUT US
// -------------------------------------------------------------
export const AboutPage: React.FC<PublicViewProps> = ({ navigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-extrabold text-slate-900 font-outfit">About VetCare</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Pioneering compassionate, high-standard digital veterinary medicine for pets, farm livestock, and companion animals worldwide.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
        <h3 className="text-xl font-bold text-slate-900">Our Mission</h3>
        <p>
          VetCare was founded by veterinary physicians and animal welfare advocates to eliminate geographic and logistical barriers in veterinary care. Whether you have an anxious dog in an urban apartment, a family cat with chronic allergies, or a herd of cattle in a rural pasture, prompt veterinary expertise should always be within reach.
        </p>

        <h3 className="text-xl font-bold text-slate-900 pt-4">Rigorous Medical Verification</h3>
        <p>
          Every veterinarian practicing on VetCare is subject to formal verification with state and national veterinary medical licensing boards (RCVS, AVMA, VCI). We verify doctoral degrees, active practice licenses, liability credentials, and specialization records before granting clinical consultation privileges.
        </p>

        <h3 className="text-xl font-bold text-slate-900 pt-4">Ethics & Emergency Commitment</h3>
        <p>
          We uphold the highest veterinary clinical ethics. We never provide automated AI medical diagnoses or replace hands-on critical trauma care. When an animal exhibits signs of severe distress, our platform proactively directs guardians to immediate physical emergency hospitals.
        </p>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 3. SERVICES PAGE
// -------------------------------------------------------------
export const ServicesPage: React.FC<PublicViewProps> = ({ navigate }) => {
  const { t } = useLanguage();
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-4xl font-extrabold text-slate-900 font-outfit">{t.servicesTitle}</h1>
        <p className="text-slate-600">{t.servicesSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <Video className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">{t.serviceTelemedicine}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Direct real-time video consultation with licensed veterinarians. Ideal for dermatological complaints, behavioral evaluations, post-surgical recovery monitoring, dietary triage, and initial symptom triage.
          </p>
          <button onClick={() => navigate('/veterinarians')} className="text-teal-600 font-semibold text-sm hover:underline flex items-center gap-1">
            Book Video Call <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">{t.serviceClinicVisits}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Need hands-on diagnostic imaging, vaccinations, or physical palpation? Book in-person appointments at verified partner veterinary clinics with transparent pricing.
          </p>
          <button onClick={() => navigate('/veterinarians')} className="text-blue-600 font-semibold text-sm hover:underline flex items-center gap-1">
            Find Clinics <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">{t.servicePrescriptions}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Digital prescriptions created with exact medication strength, dosage, route, administration frequency, warnings, and refill allowances. Instantly printable and auditable.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">{t.serviceVaccinations}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Complete core and lifestyle vaccination records (Rabies, DHPP, FVRCP, Bovine vaccines). Automated notification alerts remind you when boosters are due.
          </p>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 4. HOW IT WORKS PAGE
// -------------------------------------------------------------
export const HowItWorksPage: React.FC<PublicViewProps> = ({ navigate }) => {
  const { t } = useLanguage();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-extrabold text-slate-900 font-outfit">{t.howItWorksTitle}</h1>
        <p className="text-slate-600">{t.howItWorksSubtitle}</p>
      </div>

      <div className="space-y-8">
        <div className="flex gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-lg">1</div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t.step1Title}</h3>
            <p className="text-sm text-slate-600 mt-1">{t.step1Desc}</p>
          </div>
        </div>

        <div className="flex gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-lg">2</div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t.step2Title}</h3>
            <p className="text-sm text-slate-600 mt-1">{t.step2Desc}</p>
          </div>
        </div>

        <div className="flex gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-lg">3</div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t.step3Title}</h3>
            <p className="text-sm text-slate-600 mt-1">{t.step3Desc}</p>
          </div>
        </div>

        <div className="flex gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-lg">4</div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t.step4Title}</h3>
            <p className="text-sm text-slate-600 mt-1">{t.step4Desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 5. CONTACT & SUPPORT PAGE
// -------------------------------------------------------------
export const ContactPage: React.FC<PublicViewProps> = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-extrabold text-slate-900 font-outfit">Contact VetCare Support</h1>
        <p className="text-slate-600">Our customer care and clinical operations team is here to help you 24/7.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 bg-teal-900 text-white p-8 rounded-3xl space-y-6">
          <h3 className="text-xl font-bold font-outfit">Get in Touch</h3>
          <p className="text-teal-200 text-xs leading-relaxed">
            Have questions regarding consultations, payments, technical setup, or veterinarian verification? Send us a ticket.
          </p>

          <div className="space-y-4 text-xs text-teal-100">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-teal-400 shrink-0" />
              <span>support@vetcare.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-teal-400 shrink-0" />
              <span>+1 (800) 555-8387 (24/7 Hotline)</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          {submitted ? (
            <div className="p-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">Support Request Received</h3>
              <p className="text-xs text-slate-600">
                Thank you! Our support team has logged your inquiry and will reply to {email} within 2 to 4 hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setMessage('');
                  setSubject('');
                }}
                className="mt-4 px-5 py-2 text-xs font-semibold bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100"
              >
                Submit another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                  placeholder="e.g. Appointment booking question"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                  placeholder="Please describe how we can help..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl shadow-md transition"
              >
                {loading ? 'Submitting...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 6. REFUND POLICY PAGE
// -------------------------------------------------------------
export const RefundPolicyPage: React.FC<PublicViewProps> = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-slate-900 font-outfit">Refund & Cancellation Policy</h1>
        <p className="text-xs text-slate-500">Effective Date: January 1, 2026</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
        <h3 className="text-lg font-bold text-slate-900">1. Client-Initiated Cancellations</h3>
        <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
          <li><strong>More than 24 Hours Notice:</strong> Appointments cancelled 24 hours or more before the scheduled appointment start time receive a <strong>100% full refund</strong> automatically credited to the original payment method.</li>
          <li><strong>Between 2 and 24 Hours Notice:</strong> Appointments cancelled between 2 and 24 hours prior to appointment time receive a <strong>50% partial refund</strong>, recognizing the veterinarian's reserved clinical availability slot.</li>
          <li><strong>Less than 2 Hours / No-Show:</strong> Appointments cancelled with less than 2 hours notice or where the client fails to enter the consultation room are non-refundable.</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-900 pt-4">2. Doctor-Initiated Cancellations & Rescheduling</h3>
        <p className="text-xs sm:text-sm">
          If a veterinarian is called into a surgical emergency or cancels an appointment, the pet guardian is offered an instant 100% full refund or immediate rebooking with an available specialist of equivalent standing at no extra charge.
        </p>

        <h3 className="text-lg font-bold text-slate-900 pt-4">3. Technical Difficulties</h3>
        <p className="text-xs sm:text-sm">
          If an online video consultation is interrupted or prevented due to verifiable platform or telecommunication connectivity failures on our server side, our team will issue an immediate credit or refund upon ticket review.
        </p>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 7. TERMS OF SERVICE & PRIVACY
// -------------------------------------------------------------
export const TermsPage: React.FC<PublicViewProps> = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-slate-900 font-outfit">Terms of Service</h1>
        <p className="text-xs text-slate-500">Last updated: 2026</p>
      </div>
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <h3 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h3>
        <p>By registering, accessing, or using VetCare, you agree to be bound by these clinical terms and conditions.</p>
        <h3 className="text-lg font-bold text-slate-900">2. Nature of Telehealth Services</h3>
        <p>VetCare provides an online communications platform connecting animal owners and certified veterinary doctors. Telehealth is not a replacement for intensive emergency surgical or trauma hospital facilities.</p>
        <h3 className="text-lg font-bold text-slate-900">3. Prescription Regulations</h3>
        <p>Prescription issuance is strictly determined by the veterinarian's independent medical judgment under applicable state and national veterinary medical practice acts.</p>
      </div>
    </div>
  );
};

export const PrivacyPage: React.FC<PublicViewProps> = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-slate-900 font-outfit">Privacy Policy</h1>
        <p className="text-xs text-slate-500">Security & Confidentiality Standards</p>
      </div>
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <h3 className="text-lg font-bold text-slate-900">1. Animal Medical Records Privacy</h3>
        <p>All animal health records, clinical diagnostic notes, lab photos, and consultation messages are stored in encrypted environments and accessible solely by the guardian, treating doctors, and authorized medical administrators.</p>
        <h3 className="text-lg font-bold text-slate-900">2. Video Consultation Data</h3>
        <p>Live audio/video streams are transmitted peer-to-peer using WebRTC protocols. No video or audio recording of consultations is captured or retained without explicit advance consent.</p>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 8. VETERINARIAN ONBOARDING & REGISTRATION FLOW
// -------------------------------------------------------------
export const VetRegistrationPage: React.FC<PublicViewProps> = ({ navigate }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    qualification: '',
    university: '',
    graduationYear: 2020,
    licenseNumber: '',
    licenseAuthority: '',
    specializations: 'Canine Medicine, Feline Medicine',
    supportedSpecies: 'Dogs, Cats',
    yearsExperience: 5,
    languages: 'English',
    bio: '',
    consultationFee: 45,
    clinicVisitFee: 85,
    city: '',
    country: 'United States',
    acceptTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!formData.acceptTerms) {
      setError('You must accept the Terms of Service and Verification policy.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        ...formData,
        role: 'VETERINARIAN',
        specializations: formData.specializations.split(',').map((s) => s.trim()),
        supportedSpecies: formData.supportedSpecies.split(',').map((s) => s.trim()),
        languages: formData.languages.split(',').map((s) => s.trim()),
      } as any);

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch {
      setError('Network error during registration');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 font-outfit">Application Submitted!</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Welcome Dr. {formData.name}. Your professional credentials and license (#{formData.licenseNumber}) have been received by the VetCare Medical Licensing Board for verification.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 text-left">
          <strong>Status: PENDING REVIEW.</strong> Your application is now in the administrative verification queue. Once approved by the administrator, your profile will become active in the public directory.
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/vet/dashboard')}
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            Go to Doctor Portal
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-6 py-3 rounded-xl transition"
          >
            Check Admin Portal Verification Queue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold mb-1">
          <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
          <span>Veterinary Doctor Onboarding</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-outfit">Join the VetCare Physician Network</h1>
        <p className="text-sm text-slate-600">Provide online telemedicine & clinic consultations to animal parents worldwide.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        {/* Personal Details */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-teal-700">1. Personal & Contact Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name (with Dr. prefix)</label>
              <input
                type="text"
                required
                placeholder="Dr. John Doe, DVM"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="doctor@clinic.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                required
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City & State</label>
              <input
                type="text"
                required
                placeholder="e.g. Austin, TX"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Professional & License */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-teal-700">2. Qualifications & Medical License</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Degree / Qualifications</label>
              <input
                type="text"
                required
                placeholder="e.g. DVM, BVSc, MRCVS"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">University / College of Veterinary Medicine</label>
              <input
                type="text"
                required
                placeholder="e.g. Cornell University"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">State / National License Number</label>
              <input
                type="text"
                required
                placeholder="e.g. VET-TX-98412"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Issuing Board / Authority</label>
              <input
                type="text"
                required
                placeholder="e.g. Texas State Board of Veterinary Medical Examiners"
                value={formData.licenseAuthority}
                onChange={(e) => setFormData({ ...formData, licenseAuthority: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Clinical Practice */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-teal-700">3. Clinical Focus & Fees</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Specializations (comma separated)</label>
              <input
                type="text"
                value={formData.specializations}
                onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                placeholder="Canine Medicine, Dermatology, Surgery"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Animals Treated (comma separated)</label>
              <input
                type="text"
                value={formData.supportedSpecies}
                onChange={(e) => setFormData({ ...formData, supportedSpecies: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                placeholder="Dogs, Cats, Birds, Cows"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Online Video Consultation Fee ($)</label>
              <input
                type="number"
                min="10"
                max="500"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clinic In-Person Visit Fee ($)</label>
              <input
                type="number"
                min="10"
                max="500"
                value={formData.clinicVisitFee}
                onChange={(e) => setFormData({ ...formData, clinicVisitFee: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Professional Bio</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
              placeholder="Introduce your clinical background, philosophy, and special interests..."
            ></textarea>
          </div>
        </div>

        {/* Security / Password */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-teal-700">4. Account Security</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-start gap-2 cursor-pointer text-slate-600">
            <input
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
              className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
            />
            <span>
              I attest that the veterinary degree and licensing credentials entered are truthful, valid, and active. I accept the VetCare Physician Agreement and Privacy Policy.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl shadow-md transition text-sm"
        >
          {loading ? 'Submitting Application...' : 'Submit Doctor Application'}
        </button>
      </form>
    </div>
  );
};

// -------------------------------------------------------------
// 9. AUTH PAGES: LOGIN, REGISTER, FORGOT PASSWORD, VERIFY EMAIL
// -------------------------------------------------------------
export const LoginPage: React.FC<PublicViewProps> = ({ navigate }) => {
  const { login, switchDemoRole } = useAuth();
  const [email, setEmail] = useState('owner@vetcare.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-md">
          <Heart className="w-6 h-6 fill-teal-100 text-teal-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-outfit">Sign in to VetCare</h1>
        <p className="text-xs text-slate-500">Access your animal profiles, appointments, and telemedicine room.</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5 text-xs">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-teal-600 hover:underline"
              >
                Forgot?
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-md transition text-sm"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Fast Quick-Demo Logins */}
        <div className="pt-3 border-t border-slate-100">
          <div className="text-center text-slate-400 font-medium mb-3">Or quick-switch demo account:</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                switchDemoRole('USER');
                navigate('/dashboard');
              }}
              className="px-2 py-2 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl text-[11px] font-semibold text-slate-700 transition"
            >
              Pet Owner
            </button>
            <button
              onClick={() => {
                switchDemoRole('VETERINARIAN');
                navigate('/vet/dashboard');
              }}
              className="px-2 py-2 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl text-[11px] font-semibold text-slate-700 transition"
            >
              Veterinarian
            </button>
            <button
              onClick={() => {
                switchDemoRole('ADMIN');
                navigate('/admin');
              }}
              className="px-2 py-2 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl text-[11px] font-semibold text-slate-700 transition"
            >
              Admin
            </button>
          </div>
        </div>

        <p className="text-center text-slate-500 pt-2">
          Don't have an account yet?{' '}
          <button onClick={() => navigate('/register')} className="text-teal-600 font-bold hover:underline">
            Register free
          </button>
        </p>
      </div>
    </div>
  );
};

export const RegisterPage: React.FC<PublicViewProps> = ({ navigate }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('United States');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'bn'>('en');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!acceptTerms) {
      setError('You must accept the Terms of Service & Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name,
        email,
        phone,
        password,
        role: 'USER',
        preferredLanguage,
        city,
        country,
      });

      if (res.success) {
        navigate('/verify-email');
      } else {
        setError(res.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12 sm:py-16 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 font-outfit">Create Pet Owner Account</h1>
        <p className="text-xs text-slate-500">Register in 2 minutes to book appointments and manage animal health.</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
              placeholder="e.g. Eleanor Vance"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                placeholder="Seattle"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Language</label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none bg-white"
              >
                <option value="en">English</option>
                <option value="bn">Bengali (বাংলা)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-2 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
              />
              <span>I agree to the Terms of Service, Privacy Policy, and Refund Policy.</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-md transition text-sm mt-2"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <p className="text-center text-slate-500 pt-2">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-teal-600 font-bold hover:underline">
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export const ForgotPasswordPage: React.FC<PublicViewProps> = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 font-outfit">Reset Your Password</h1>
        <p className="text-xs text-slate-500">Enter your email and we will send secure password reset instructions.</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
        {sent ? (
          <div className="text-center space-y-3 p-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Reset Link Sent</h3>
            <p className="text-slate-600">
              If an account matches {email}, a secure reset link has been dispatched to your inbox.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-3 px-4 py-2 bg-teal-600 text-white font-semibold rounded-xl"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                placeholder="your@email.com"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition"
            >
              Send Reset Instructions
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export const VerifyEmailPage: React.FC<PublicViewProps> = ({ navigate }) => {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto">
        <Mail className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 font-outfit">Email Verification Confirmed</h2>
      <p className="text-xs text-slate-600 leading-relaxed">
        Your email has been verified! Your account is active with full access to add animal health records and book consultations.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-xl transition text-xs"
      >
        Go to Dashboard
      </button>
    </div>
  );
};
