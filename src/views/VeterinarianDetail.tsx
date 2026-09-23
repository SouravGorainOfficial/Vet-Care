import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Star,
  MapPin,
  Calendar,
  Clock,
  Languages,
  Award,
  BookOpen,
  CheckCircle2,
  Video,
  Building,
  ArrowLeft,
} from 'lucide-react';
import { VeterinarianProfile, Review } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface VeterinarianDetailProps {
  vetId: string;
  navigate: (path: string) => void;
  onBookAppointment: (vet: VeterinarianProfile) => void;
}

export const VeterinarianDetail: React.FC<VeterinarianDetailProps> = ({
  vetId,
  navigate,
  onBookAppointment,
}) => {
  const { t } = useLanguage();
  const [vet, setVet] = useState<VeterinarianProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVetDetails();
  }, [vetId]);

  const fetchVetDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/vets/${vetId}`);
      if (res.ok) {
        const data = await res.json();
        setVet(data.veterinarian);
        setReviews(data.reviews || []);
        if (window.location.search.includes('book=true')) {
          onBookAppointment(data.veterinarian);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        Loading doctor profile...
      </div>
    );
  }

  if (!vet) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Veterinarian not found</h2>
        <button
          onClick={() => navigate('/veterinarians')}
          className="text-teal-600 font-semibold text-xs hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/veterinarians')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Doctors Directory</span>
      </button>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
        <img
          src={vet.avatarUrl}
          alt={vet.name}
          className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl object-cover border border-slate-200 shadow-md"
        />

        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>{t.verifiedBadge}</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              License #{vet.licenseNumber} ({vet.licenseAuthority})
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-outfit">
            {vet.name}
          </h1>

          <p className="text-sm font-medium text-teal-800">{vet.qualification}</p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
            <div className="flex items-center gap-1 font-bold text-amber-500">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{vet.rating.toFixed(2)}</span>
              <span className="text-slate-400 font-normal">({vet.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{vet.yearsExperience} Years Clinical Experience</span>
            </div>
            <div className="flex items-center gap-1">
              <Languages className="w-4 h-4 text-slate-400" />
              <span>{vet.languages.join(', ')}</span>
            </div>
          </div>

          {vet.clinicAddress && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{vet.clinicAddress}</span>
            </div>
          )}

          {/* Quick booking CTA in header */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Telemedicine Video Fee</span>
              <span className="text-lg font-bold text-teal-700">${vet.consultationFee}</span>
            </div>
            {vet.clinicVisitFee && (
              <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Clinic Visit Fee</span>
                <span className="text-lg font-bold text-blue-700">${vet.clinicVisitFee}</span>
              </div>
            )}
            <button
              onClick={() => onBookAppointment(vet)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-teal-600/20 text-xs sm:text-sm transition ml-auto"
            >
              {t.bookConsultation}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Bio, Specializations, Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* About / Bio */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900 font-outfit">Doctor Biography & Philosophy</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{vet.bio}</p>
          </div>

          {/* Education & Credentials */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4 text-xs sm:text-sm">
            <h3 className="text-base font-bold text-slate-900 font-outfit">{t.educationAndLicense}</h3>
            <div className="space-y-3 text-slate-700">
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900">{vet.qualification}</div>
                  <div className="text-slate-500 text-xs">{vet.university} (Graduated {vet.graduationYear})</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900">License #{vet.licenseNumber}</div>
                  <div className="text-slate-500 text-xs">{vet.licenseAuthority}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Specializations & Species */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-outfit">Clinical Specialties & Animals Treated</h3>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Specializations</div>
              <div className="flex flex-wrap gap-1.5">
                {vet.specializations.map((spec, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium bg-teal-50 text-teal-800 px-3 py-1 rounded-lg border border-teal-100"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Supported Animals</div>
              <div className="flex flex-wrap gap-1.5">
                {vet.supportedSpecies.map((species, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium bg-slate-100 text-slate-800 px-3 py-1 rounded-lg"
                  >
                    {species}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 font-outfit">{t.reviewsAndRatings}</h3>
              <span className="text-xs font-semibold text-amber-500">★ {vet.rating.toFixed(2)} / 5.0</span>
            </div>

            <div className="space-y-4 divide-y divide-slate-100">
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">No reviews recorded yet.</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="pt-4 first:pt-0 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{rev.userName}</span>
                        {rev.verifiedAppointment && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified Appointment
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 leading-relaxed pt-1">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 block pt-0.5">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Weekly Availability & Booking Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 sticky top-24">
            <h3 className="text-base font-bold text-slate-900 font-outfit">Consultation Availability</h3>
            <p className="text-xs text-slate-500">
              Weekly schedule configured in timezone ({vet.timezone}). Slots bookable online.
            </p>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              {vet.weeklySchedule.map((sched, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 first:pt-0">
                  <span className="font-semibold text-slate-700">{sched.day}</span>
                  {sched.active ? (
                    <span className="text-slate-900 font-medium">
                      {sched.startTime} - {sched.endTime}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium">Off Duty</span>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => onBookAppointment(vet)}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl shadow-md transition text-xs sm:text-sm"
              >
                {t.bookConsultation}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
