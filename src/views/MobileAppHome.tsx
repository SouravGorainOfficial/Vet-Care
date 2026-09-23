import React, { useState, useEffect } from 'react';
import {
  Video,
  ShoppingBag,
  Building,
  FileText,
  Plus,
  Star,
  ShieldCheck,
  PhoneCall,
  ChevronRight,
  Clock,
  Sparkles,
  Heart,
  Search,
  AlertCircle,
  Pill,
  ArrowRight,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { VeterinarianProfile, Animal } from '../types';
import { DEFAULT_VETS } from '../data/defaultData';

interface MobileAppHomeProps {
  navigate: (path: string) => void;
  onBookVet: (vet: VeterinarianProfile) => void;
  onOpenSOS: () => void;
}

export const MobileAppHome: React.FC<MobileAppHomeProps> = ({
  navigate,
  onBookVet,
  onOpenSOS,
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { addToCart, totalItems, setIsCartOpen } = useCart();

  const [vets, setVets] = useState<VeterinarianProfile[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loadingVets, setLoadingVets] = useState(true);
  const [selectedSpeciesFilter, setSelectedSpeciesFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch active vets
    fetch('/api/vets')
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((data) => {
        if (data.veterinarians && data.veterinarians.length > 0) {
          setVets(data.veterinarians);
        } else {
          setVets(DEFAULT_VETS);
        }
      })
      .catch(() => {
        setVets(DEFAULT_VETS);
      })
      .finally(() => setLoadingVets(false));

    // Fetch user's pets if logged in
    fetch('/api/user/animals')
      .then((res) => res.json())
      .then((data) => {
        if (data.animals) {
          setAnimals(data.animals);
        }
      })
      .catch(() => {});
  }, []);

  const speciesList = [
    { label: 'All', emoji: '🐾', count: '120+' },
    { label: 'Dogs', emoji: '🐕', count: '48 vets' },
    { label: 'Cats', emoji: '🐈', count: '42 vets' },
    { label: 'Cattle', emoji: '🐮', count: '18 vets' },
    { label: 'Birds', emoji: '🦜', count: '12 vets' },
    { label: 'Horses', emoji: '🐴', count: '9 vets' },
    { label: 'Goats', emoji: '🐐', count: '14 vets' },
  ];

  // Featured popular pet medications for instant mobile add
  const quickPharmacyItems = [
    {
      id: 'med_nexgard_chew',
      name: 'NexGard Spectra',
      category: 'Flea & Tick',
      forPet: 'Dogs (3.5 - 7.5kg)',
      price: 24.5,
      requiresPrescription: true,
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'med_amoxicillin_susp',
      name: 'Amoxicillin Oral Drops',
      category: 'Antibiotic',
      forPet: 'Dogs & Cats',
      price: 18.0,
      requiresPrescription: true,
      image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'med_joint_chews',
      name: 'Glucosamine Hip & Joint',
      category: 'Supplements',
      forPet: 'Senior Dogs & Cats',
      price: 22.0,
      requiresPrescription: false,
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&auto=format&fit=crop&q=80',
    },
  ];

  const filteredVets = vets.filter((v) => {
    const matchesSpecies =
      selectedSpeciesFilter === 'All' ||
      v.supportedSpecies.includes(selectedSpeciesFilter) ||
      v.supportedSpecies.includes('All Animals');
    const matchesSearch =
      !searchQuery ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.specializations.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSpecies && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-20 text-slate-800 select-none">
      {/* 1. Mobile Search & Action Bar */}
      <div className="px-4 pt-3 space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigate(`/veterinarians?search=${encodeURIComponent(searchQuery)}`);
              }
            }}
            placeholder="Search doctors, symptoms, medicines..."
            className="w-full pl-10 pr-10 py-2.5 bg-white rounded-2xl border border-slate-200/90 text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Highlighted Banner: Landing Page, Login & Register Shortcut */}
        <div className="bg-gradient-to-r from-slate-900 to-teal-950 rounded-2xl p-3 text-white shadow-xs flex items-center justify-between gap-2.5 border border-slate-800">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0" />
              <span className="text-[11px] font-bold text-teal-300">VetCare Platform</span>
            </div>
            <p className="text-[10px] text-slate-300 truncate mt-0.5">
              {user ? `Logged in as ${user.name.split(' ')[0]} (${user.role})` : 'Web Landing Page, Sign In & Registration'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => navigate('/landing')}
              className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1"
              title="View full landing page"
            >
              <span>🌐 Landing</span>
            </button>
            {!user ? (
              <button
                onClick={() => navigate('/login')}
                className="px-2.5 py-1.5 bg-white text-slate-900 text-[11px] font-bold rounded-xl shadow-xs transition active:scale-95"
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={() => navigate(user.role === 'VETERINARIAN' ? '/vet/dashboard' : user.role === 'ADMIN' ? '/admin' : '/dashboard')}
                className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 text-[11px] font-semibold rounded-xl transition"
              >
                Dashboard
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Quick Action App Grid (4 Core Pillars) */}
      <div className="px-4">
        <div className="grid grid-cols-4 gap-2.5">
          {/* Action 1: Video Consult */}
          <button
            onClick={() => navigate('/veterinarians')}
            className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-gradient-to-b from-teal-50 to-teal-100/60 border border-teal-200/70 hover:shadow-xs active:scale-95 transition"
          >
            <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/30 mb-1.5">
              <Video className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">Video Vet</span>
            <span className="text-[9px] text-teal-700 font-medium">In 15 mins</span>
          </button>

          {/* Action 2: Online Pharmacy */}
          <button
            onClick={() => navigate('/pharmacy')}
            className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-gradient-to-b from-emerald-50 to-emerald-100/60 border border-emerald-200/70 hover:shadow-xs active:scale-95 transition"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 mb-1.5">
              <Pill className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">Pharmacy</span>
            <span className="text-[9px] text-emerald-700 font-medium">Rx & Meds</span>
          </button>

          {/* Action 3: Clinic Visit */}
          <button
            onClick={() => navigate('/veterinarians?service=clinic')}
            className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-gradient-to-b from-sky-50 to-sky-100/60 border border-sky-200/70 hover:shadow-xs active:scale-95 transition"
          >
            <div className="w-11 h-11 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/30 mb-1.5">
              <Building className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">Clinic</span>
            <span className="text-[9px] text-sky-700 font-medium">In-Person</span>
          </button>

          {/* Action 4: 24/7 Emergency */}
          <button
            onClick={onOpenSOS}
            className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-gradient-to-b from-rose-50 to-rose-100/60 border border-rose-200/70 hover:shadow-xs active:scale-95 transition relative overflow-hidden"
          >
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30 mb-1.5">
              <PhoneCall className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-rose-900 leading-tight">SOS 24/7</span>
            <span className="text-[9px] text-rose-700 font-medium">Emergency</span>
          </button>
        </div>
      </div>

      {/* 3. My Pets Carousel (Native Mobile Passport Strip) */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-teal-600 fill-teal-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">My Pet Health Passports</h3>
          </div>
          <button
            onClick={() => navigate('/dashboard/animals')}
            className="text-[11px] font-bold text-teal-600 flex items-center hover:underline"
          >
            <span>Manage</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
          {/* Default Sample Pets if none */}
          {(animals.length > 0
            ? animals
            : [
                {
                  id: 'demo_1',
                  name: 'Max',
                  species: 'Dogs',
                  breed: 'Golden Retriever',
                  ageYears: 3,
                  gender: 'MALE',
                  photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&auto=format&fit=crop&q=80',
                },
                {
                  id: 'demo_2',
                  name: 'Mochi',
                  species: 'Cats',
                  breed: 'British Shorthair',
                  ageYears: 2,
                  gender: 'FEMALE',
                  photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&auto=format&fit=crop&q=80',
                },
              ]
          ).map((pet) => (
            <div
              key={pet.id}
              onClick={() => navigate('/dashboard/animals')}
              className="shrink-0 w-44 bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex items-center gap-2.5 active:scale-98 transition cursor-pointer hover:border-teal-300"
            >
              <img
                src={pet.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&auto=format&fit=crop&q=80'}
                alt={pet.name}
                className="w-11 h-11 rounded-xl object-cover ring-2 ring-teal-500/20 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-slate-900 truncate">{pet.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{pet.breed || pet.species}</div>
                <div className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-full mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Vaccines OK</span>
                </div>
              </div>
            </div>
          ))}

          {/* Add Pet Tile */}
          <button
            onClick={() => navigate('/dashboard/animals')}
            className="shrink-0 w-28 bg-slate-50 hover:bg-teal-50/50 rounded-2xl p-2.5 border border-dashed border-slate-300 hover:border-teal-400 flex flex-col items-center justify-center text-center transition active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-white shadow-2xs flex items-center justify-center text-teal-600 mb-1">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold text-slate-700">+ Add Pet</span>
          </button>
        </div>
      </div>

      {/* 4. Telehealth Promo / Instant Consultation Card */}
      <div className="px-4">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-teal-700 via-teal-800 to-teal-900 p-4 text-white shadow-md">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-teal-600/30 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="space-y-1 max-w-[70%]">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/20 text-teal-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                <Sparkles className="w-2.5 h-2.5" /> Instant Connect
              </span>
              <h4 className="text-sm font-bold font-outfit text-white">Need a Vet Right Now?</h4>
              <p className="text-[11px] text-teal-100/90 leading-tight">
                Live video triage, behavioral advice, and authorized prescription refills in minutes.
              </p>
            </div>
            <button
              onClick={() => navigate('/veterinarians')}
              className="bg-white hover:bg-teal-50 text-teal-800 font-bold px-3 py-2 rounded-xl text-xs shadow-md active:scale-95 transition shrink-0"
            >
              Consult Vet
            </button>
          </div>
        </div>
      </div>

      {/* 5. Species Filter Chips Carousel */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Consult by Animal Type</h3>
          <span className="text-[11px] text-slate-500 font-medium">Filter doctors</span>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
          {speciesList.map((item) => {
            const active = selectedSpeciesFilter === item.label;
            return (
              <button
                key={item.label}
                onClick={() => setSelectedSpeciesFilter(item.label)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                  active
                    ? 'bg-teal-600 text-white shadow-xs shadow-teal-600/30 scale-[1.02]'
                    : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Doctors On-Duty Available Now */}
      <div className="px-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Available Doctors Now</h3>
          </div>
          <button
            onClick={() => navigate('/veterinarians')}
            className="text-[11px] font-bold text-teal-600 flex items-center hover:underline"
          >
            <span>View all ({filteredVets.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loadingVets ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading veterinarians...</div>
        ) : (
          <div className="space-y-2.5">
            {filteredVets.slice(0, 3).map((vet) => (
              <div
                key={vet.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs hover:border-teal-300 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={vet.avatarUrl}
                      alt={vet.name}
                      className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                    />
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{vet.name}</h4>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-md">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{vet.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate">
                      {vet.specializations.slice(0, 2).join(' • ')}
                    </p>

                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-600">
                      <span className="font-bold text-teal-700">${vet.consultationFee} / call</span>
                      <span>•</span>
                      <span>{vet.yearsExperience}y exp</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100">
                  <button
                    onClick={() => navigate(`/veterinarians/${vet.id}`)}
                    className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[11px] text-center transition active:scale-95"
                  >
                    View Bio
                  </button>
                  <button
                    onClick={() => onBookVet(vet)}
                    className="py-1.5 px-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-[11px] text-center shadow-xs shadow-teal-600/20 transition active:scale-95 flex items-center justify-center gap-1"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Book Call</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. Online Medicine Store Highlights (Mobile Carousel) */}
      <div className="px-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Pill className="w-3.5 h-3.5 text-teal-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Online Pet Pharmacy</h3>
          </div>
          <button
            onClick={() => navigate('/pharmacy')}
            className="text-[11px] font-bold text-teal-600 flex items-center hover:underline"
          >
            <span>Visit Store</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {quickPharmacyItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 mb-1.5">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {item.requiresPrescription && (
                    <span className="absolute top-1 left-1 bg-amber-500 text-white text-[8px] font-extrabold px-1 rounded-sm">
                      Rx
                    </span>
                  )}
                </div>
                <div className="font-bold text-[11px] text-slate-900 line-clamp-1 leading-tight">
                  {item.name}
                </div>
                <div className="text-[9px] text-slate-500 line-clamp-1">{item.forPet}</div>
              </div>

              <div className="mt-2 pt-1 flex items-center justify-between">
                <span className="font-extrabold text-[11px] text-teal-800">${item.price}</span>
                <button
                  onClick={() => {
                    addToCart({
                      id: item.id,
                      name: item.name,
                      category: item.category,
                      requiresPrescription: item.requiresPrescription,
                      price: item.price,
                      image: item.image,
                      species: ['Dogs', 'Cats'],
                    } as any);
                    setIsCartOpen(true);
                  }}
                  className="w-6 h-6 rounded-lg bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white flex items-center justify-center font-bold text-xs transition active:scale-90"
                  title="Add to shopping cart"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Mobile Pet Care Tips Widget */}
      <div className="px-4">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl p-3.5 border border-amber-200/70">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              💡
            </div>
            <div>
              <h5 className="font-bold text-xs text-amber-900">Vet Advice of the Day</h5>
              <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                Ensure fresh, cool drinking water is refilled twice daily for cats & dogs to prevent urinary crystals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 9. Landing Page, Login, Register & Doctor Portal Quick Access */}
      <div className="px-4 pt-1">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-800">Quick Access & Accounts</span>
            <span className="text-[10px] text-teal-600 font-semibold">Web & Portal</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => navigate('/landing')}
              className="p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100/80 border border-teal-200/70 text-teal-800 font-bold flex items-center gap-2 transition active:scale-95"
            >
              <span className="text-base">🌐</span>
              <div className="text-left">
                <div className="leading-tight">Landing Page</div>
                <span className="text-[9px] text-teal-600 font-normal">Full Web Overview</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/login')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold flex items-center gap-2 transition active:scale-95"
            >
              <span className="text-base">🔑</span>
              <div className="text-left">
                <div className="leading-tight">Sign In</div>
                <span className="text-[9px] text-slate-500 font-normal">Existing Account</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/register')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold flex items-center gap-2 transition active:scale-95"
            >
              <span className="text-base">📝</span>
              <div className="text-left">
                <div className="leading-tight">Register</div>
                <span className="text-[9px] text-slate-500 font-normal">Create New Profile</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/vet-registration')}
              className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/70 text-emerald-800 font-bold flex items-center gap-2 transition active:scale-95"
            >
              <span className="text-base">🩺</span>
              <div className="text-left">
                <div className="leading-tight">Join as Vet</div>
                <span className="text-[9px] text-emerald-600 font-normal">Doctor Application</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
