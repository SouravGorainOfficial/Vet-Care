import React, { useState, useEffect } from 'react';
import {
  Search,
  Star,
  ShieldCheck,
  Video,
  MapPin,
  Calendar,
  Languages,
  Clock,
  Filter,
  CheckCircle,
  ArrowUpDown,
} from 'lucide-react';
import { VeterinarianProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface VeterinariansDirectoryProps {
  navigate: (path: string) => void;
  onBookVet?: (vet: VeterinarianProfile) => void;
  initialSpecies?: string;
  initialSearch?: string;
}

export const VeterinariansDirectory: React.FC<VeterinariansDirectoryProps> = ({
  navigate,
  onBookVet,
  initialSpecies = 'All',
  initialSearch = '',
}) => {
  const { t } = useLanguage();

  const [vets, setVets] = useState<VeterinarianProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedSpecies, setSelectedSpecies] = useState(initialSpecies);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [maxFee, setMaxFee] = useState<number>(150);
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'price_desc' | 'experience'>('rating');

  useEffect(() => {
    fetchVets();
  }, []);

  const fetchVets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/vets');
      if (res.ok) {
        const data = await res.json();
        setVets(data.veterinarians || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Filter & Sort
  const filteredVets = vets
    .filter((vet) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesName = vet.name.toLowerCase().includes(q);
        const matchesCity = vet.city.toLowerCase().includes(q);
        const matchesSpec = vet.specializations.some((s) => s.toLowerCase().includes(q));
        const matchesSpecies = vet.supportedSpecies.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesCity && !matchesSpec && !matchesSpecies) return false;
      }
      if (selectedSpecies !== 'All') {
        const sel = selectedSpecies.toLowerCase();
        const matches = vet.supportedSpecies.some((s) => {
          const spec = s.toLowerCase();
          if (spec === sel) return true;
          if ((sel === 'cattle' || sel === 'cows') && (spec.includes('cow') || spec.includes('cattle') || spec.includes('bovine') || spec.includes('livestock'))) return true;
          if (sel === 'birds' && (spec.includes('bird') || spec.includes('avian'))) return true;
          return false;
        });
        if (!matches) return false;
      }
      if (selectedSpecialty !== 'All') {
        if (!vet.specializations.some((s) => s.toLowerCase().includes(selectedSpecialty.toLowerCase()))) {
          return false;
        }
      }
      if (selectedLanguage !== 'All') {
        if (!vet.languages.some((l) => l.toLowerCase().includes(selectedLanguage.toLowerCase()))) {
          return false;
        }
      }
      if (vet.consultationFee > maxFee) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price_asc') return a.consultationFee - b.consultationFee;
      if (sortBy === 'price_desc') return b.consultationFee - a.consultationFee;
      if (sortBy === 'experience') return b.yearsExperience - a.yearsExperience;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 pb-28 sm:pb-12 space-y-3.5 sm:space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 font-outfit">
          Find a Certified Veterinarian
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Book verified video telehealth or physical clinic visits for your pets and farm animals.
        </p>
      </div>

      {/* Simplified Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by veterinarian name, pet type, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-teal-500 font-medium text-slate-700"
            >
              <option value="rating">Top Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Quick Pet Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium mr-1">Pet Type:</span>
          {[
            { id: 'All', label: 'All Pets' },
            { id: 'Dogs', label: '🐕 Dogs' },
            { id: 'Cats', label: '🐈 Cats' },
            { id: 'Birds', label: '🦜 Birds' },
            { id: 'Cows', label: '🐄 Livestock / Farm' },
            { id: 'Horses', label: '🐎 Horses' },
          ].map((item) => {
            const active = selectedSpecies === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedSpecies(item.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  active
                    ? 'bg-teal-600 text-white shadow-2xs font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Showing Verified Veterinarians Horizontal Box */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-slate-800">Showing</span>
              <span className="bg-teal-50 text-teal-800 font-extrabold px-2 py-0.5 rounded-md text-xs border border-teal-200/70 shrink-0">
                {filteredVets.length} Verified Doctors
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate hidden xs:block">
              Board-certified • Video telehealth & clinic visits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-bold text-teal-800 bg-teal-50/80 border border-teal-200/60 px-2.5 py-1 rounded-xl">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>Verified</span>
        </div>
      </div>

      {/* Doctors Display: Horizontal Cards Stacked One Under One */}
      {loading ? (
        <div className="space-y-3.5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 animate-pulse flex items-start gap-3.5">
              <div className="w-16 h-16 bg-slate-200 rounded-2xl shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredVets.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200 space-y-3">
          <Filter className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No doctors match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting species or increasing the maximum fee to see more verified veterinarians.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSpecies('All');
              setSelectedSpecialty('All');
              setSelectedLanguage('All');
              setMaxFee(150);
            }}
            className="text-xs font-bold text-teal-600 hover:underline pt-2"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3.5 sm:space-y-4">
          {filteredVets.map((vet) => {
            const todayDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
            const sched = vet.weeklySchedule?.find((s) => s.day.toLowerCase() === todayDay.toLowerCase());
            const isFreeToday = sched ? sched.active : true;

            return (
              <div
                key={vet.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 hover:border-teal-400 shadow-xs hover:shadow-md transition-all p-3.5 sm:p-5 overflow-hidden group"
              >
                {/* Horizontal Card Body */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-5">
                  {/* Left / Main Section: Avatar + Info */}
                  <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
                    {/* Doctor Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={vet.avatarUrl}
                        alt={vet.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(vet.name)}`;
                        }}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-100 shadow-xs group-hover:scale-105 transition shrink-0"
                      />
                      <span
                        className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-2xs"
                        title="Verified & Active"
                      />
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-teal-600 shrink-0" />
                          <span>Board Verified</span>
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{vet.rating.toFixed(2)}</span>
                          <span className="text-slate-400 font-normal">({vet.reviewCount})</span>
                        </div>
                      </div>

                      <h3
                        onClick={() => navigate(`/veterinarians/${vet.id}`)}
                        className="font-bold text-sm sm:text-base text-slate-900 hover:text-teal-700 cursor-pointer font-outfit leading-tight truncate"
                        title={vet.name}
                      >
                        {vet.name}
                      </h3>

                      <p className="text-[11px] sm:text-xs text-slate-500 truncate" title={vet.qualification}>
                        {vet.qualification}
                      </p>

                      {/* Specialties Badges */}
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {vet.specializations.slice(0, 3).map((spec, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

                      {/* Meta: Treats, Experience & Languages */}
                      <div className="flex items-center gap-2 sm:gap-3 pt-0.5 text-[11px] text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1 text-slate-700">
                          <span className="text-slate-400 font-medium">Treats:</span>
                          <span className="font-semibold truncate max-w-[140px] sm:max-w-none">{vet.supportedSpecies.join(', ')}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{vet.yearsExperience}y exp</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 truncate">
                          <Languages className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{vet.languages.join(', ')}</span>
                        </span>
                      </div>

                      {/* Live Availability Status */}
                      <div className="pt-1">
                        {isFreeToday ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-lg">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            <span>Available Today ({sched?.startTime || '09:00'} - {sched?.endTime || '18:00'})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
                            <Calendar className="w-3 h-3 text-teal-600 shrink-0" />
                            <span>Next Slot: Tomorrow • Bookings Open</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Fee & Action Buttons */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-5 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Consultation Fee</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base sm:text-xl font-extrabold text-teal-800">${vet.consultationFee}</span>
                        <span className="text-[11px] text-slate-500 font-medium">/ call</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/veterinarians/${vet.id}`)}
                        className="py-2 px-3 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-center active:scale-95 whitespace-nowrap"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          if (onBookVet) {
                            onBookVet(vet);
                          } else {
                            navigate(`/veterinarians/${vet.id}?book=true`);
                          }
                        }}
                        className="py-2 px-3.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs shadow-teal-600/30 transition text-center flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap"
                      >
                        <Video className="w-3.5 h-3.5 shrink-0" />
                        <span>Book Call</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
