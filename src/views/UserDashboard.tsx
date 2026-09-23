import React, { useState, useEffect } from 'react';
import {
  Heart,
  Calendar,
  Video,
  FileText,
  ShieldCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Download,
  Trash2,
  Edit,
  Building,
  Printer,
  DollarSign,
  User,
  ArrowRight,
  FileDown,
  Loader2,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Animal, Appointment, Prescription, VaccinationRecord } from '../types';

interface UserDashboardProps {
  navigate: (path: string) => void;
  activeSubTab?: string;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ navigate, activeSubTab = 'overview' }) => {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [currentTab, setCurrentTab] = useState<'overview' | 'animals' | 'appointments' | 'prescriptions' | 'vaccines' | 'billing'>(
    activeSubTab as any || 'overview'
  );

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected animal detail modal
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [animalModalTab, setAnimalModalTab] = useState<'info' | 'medical' | 'vaccines' | 'prescriptions'>('info');

  // Add Animal form modal
  const [showAddAnimalModal, setShowAddAnimalModal] = useState(false);
  const [submittingAnimal, setSubmittingAnimal] = useState(false);
  const [animalFormError, setAnimalFormError] = useState<string | null>(null);
  const [newAnimal, setNewAnimal] = useState({
    name: '',
    species: 'Dogs',
    breed: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'UNKNOWN',
    ageYears: 2,
    weightKg: 8.5,
    microchipNumber: '',
    allergies: '',
    chronicConditions: '',
    isNeutered: true,
  });

  // Selected prescription print modal
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const authToken = token || localStorage.getItem('vetcare_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const [animRes, apptRes, prescRes] = await Promise.all([
        fetch('/api/animals', { headers }),
        fetch('/api/appointments', { headers }),
        fetch('/api/prescriptions', { headers }),
      ]);

      if (animRes.ok) {
        const d = await animRes.json();
        setAnimals(d.animals || []);
      }
      if (apptRes.ok) {
        const d = await apptRes.json();
        setAppointments(d.appointments || []);
      }
      if (prescRes.ok) {
        const d = await prescRes.json();
        setPrescriptions(d.prescriptions || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnimalFormError(null);

    const trimmedName = newAnimal.name.trim();
    if (!trimmedName) {
      setAnimalFormError('Please enter your animal\'s name.');
      return;
    }

    try {
      setSubmittingAnimal(true);
      const authToken = token || localStorage.getItem('vetcare_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch('/api/animals', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...newAnimal,
          name: trimmedName,
          breed: newAnimal.breed.trim(),
          sex: newAnimal.gender,
          gender: newAnimal.gender,
          isSterilized: newAnimal.isNeutered,
          isNeutered: newAnimal.isNeutered,
          allergies: newAnimal.allergies ? newAnimal.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
          chronicConditions: newAnimal.chronicConditions ? newAnimal.chronicConditions.split(',').map((s) => s.trim()).filter(Boolean) : [],
          conditions: newAnimal.chronicConditions ? newAnimal.chronicConditions.split(',').map((s) => s.trim()).filter(Boolean) : [],
        }),
      });

      if (res.ok) {
        const d = await res.json();
        const createdAnimal = d.animal || d;
        setAnimals((prev) => [createdAnimal, ...prev]);
        setShowAddAnimalModal(false);
        setAnimalFormError(null);
        setNewAnimal({
          name: '',
          species: 'Dogs',
          breed: '',
          gender: 'MALE',
          ageYears: 2,
          weightKg: 8.5,
          microchipNumber: '',
          allergies: '',
          chronicConditions: '',
          isNeutered: true,
        });
        setCurrentTab('animals');
      } else {
        const errData = await res.json().catch(() => ({}));
        setAnimalFormError(errData.error || 'Failed to save animal record. Please try again.');
      }
    } catch (err: any) {
      setAnimalFormError(err?.message || 'Network error while adding animal. Please try again.');
    } finally {
      setSubmittingAnimal(false);
    }
  };

  const handleCancelAppointment = async (apptId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment? Refund will be processed per our policy.')) return;
    try {
      const res = await fetch(`/api/appointments/${apptId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Owner requested cancellation' }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch {
      // ignore
    }
  };

  // Find next upcoming appointment
  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS'
  );
  const nextAppt = upcomingAppointments[0];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 space-y-4 sm:space-y-6">
      {/* Top Welcome Card - Clean & Normal */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md">Pet Guardian Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-outfit">Hello, {user?.name}</h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Manage your animals' health records, prescriptions, and veterinary appointments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-add-animal-header"
            onClick={() => setShowAddAnimalModal(true)}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-teal-600" /> Add Animal
          </button>
          <button
            id="btn-book-doctor-header"
            onClick={() => navigate('/veterinarians')}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5" /> Book a Doctor
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-1 sm:space-x-2 text-xs font-medium">
        {[
          { id: 'overview', label: 'Overview', icon: Heart },
          { id: 'animals', label: `My Animals (${animals.length})`, icon: Heart },
          { id: 'appointments', label: `Appointments (${appointments.length})`, icon: Calendar },
          { id: 'prescriptions', label: `Prescriptions (${prescriptions.length})`, icon: FileText },
          { id: 'vaccines', label: 'Vaccinations', icon: ShieldCheck },
          { id: 'billing', label: 'Billing', icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as any)}
              className={`py-2.5 px-3 border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                active
                  ? 'border-teal-600 text-teal-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {currentTab === 'overview' && (
        <div className="space-y-8">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold uppercase">Registered Animals</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{animals.length}</div>
              <div className="text-[11px] text-teal-600 font-medium mt-1">Full medical passports</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold uppercase">Upcoming Consultations</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{upcomingAppointments.length}</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">Confirmed slots</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold uppercase">Active Prescriptions</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{prescriptions.length}</div>
              <div className="text-[11px] text-blue-600 font-medium mt-1">Printable Rx slips</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-semibold uppercase">Vaccination Status</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">Up to Date</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">No overdue alerts</div>
            </div>
          </div>

          {/* Next Immediate Appointment Action Card */}
          {nextAppt && (
            <div className="bg-teal-50 border-2 border-teal-500/40 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-200/60 px-2 py-0.5 rounded">
                    Next Telemedicine Appointment
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {nextAppt.consultationType === 'ONLINE_VIDEO' ? 'Video Call' : 'Clinic Visit'} for {nextAppt.animalName}
                  </h3>
                  <p className="text-xs text-slate-600">
                    With <strong>{nextAppt.veterinarianName}</strong> on {nextAppt.appointmentDate} at {nextAppt.timeSlot}
                  </p>
                  <p className="text-xs text-teal-800 font-medium mt-1">Reason: {nextAppt.reason}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {nextAppt.consultationType === 'ONLINE_VIDEO' && (
                  <button
                    onClick={() => navigate(`/consultation/${nextAppt.id}`)}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md transition flex items-center gap-2"
                  >
                    <Video className="w-4 h-4" /> Enter Consultation Room
                  </button>
                )}
                <button
                  onClick={() => handleCancelAppointment(nextAppt.id)}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 px-3 py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Animals Quick Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 font-outfit">My Animals</h2>
              <div className="flex items-center gap-3">
                <button
                  id="btn-overview-add-animal"
                  onClick={() => setShowAddAnimalModal(true)}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Animal
                </button>
                <button
                  onClick={() => setCurrentTab('animals')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  View all <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {animals.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-3">
                <Heart className="w-10 h-10 text-teal-500 mx-auto opacity-70" />
                <h3 className="font-bold text-sm text-slate-800">No animals registered yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Add your dog, cat, bird, or farm animal to store their medical passport, vaccinations, and book online consultations.
                </p>
                <button
                  id="btn-empty-add-animal-overview"
                  onClick={() => setShowAddAnimalModal(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Register Animal Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {animals.map((animal) => (
                  <div
                    key={animal.id}
                    onClick={() => {
                      setSelectedAnimal(animal);
                      setAnimalModalTab('info');
                    }}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-teal-300 p-5 shadow-xs hover:shadow-md transition cursor-pointer flex items-center gap-4"
                  >
                    <img
                      src={animal.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200'}
                      alt={animal.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{animal.name}</h3>
                      <p className="text-xs text-slate-500">
                        {animal.species} • {animal.breed || 'Breed Unspecified'}
                      </p>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {animal.ageYears} yrs • {animal.weightKg} kg
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY ANIMALS */}
      {currentTab === 'animals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-outfit">Registered Animals</h2>
              <p className="text-xs text-slate-500">Maintain medical passports, vaccines, and treatment histories.</p>
            </div>
            <button
              id="btn-add-animal-tab"
              onClick={() => setShowAddAnimalModal(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Animal
            </button>
          </div>

          {animals.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto text-teal-600">
                <Heart className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 font-outfit">No animals registered yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Add your animal companion to keep track of their vaccination records, weight tracking, medical notes, and to book appointments.
                </p>
              </div>
              <button
                id="btn-add-animal-empty"
                onClick={() => setShowAddAnimalModal(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition inline-flex items-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4" /> Add Your First Animal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {animals.map((animal) => (
              <div
                key={animal.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={animal.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200'}
                      alt={animal.name}
                      className="w-18 h-18 rounded-2xl object-cover border border-slate-100 shadow-xs"
                    />
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded uppercase">
                        {animal.species}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">{animal.name}</h3>
                      <p className="text-xs text-slate-500">{animal.breed || 'Mixed Breed'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Age</span>
                      <span className="font-semibold text-slate-800">{animal.ageYears} years</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Weight</span>
                      <span className="font-semibold text-slate-800">{animal.weightKg} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Sex</span>
                      <span className="font-semibold text-slate-800">{animal.gender}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Neutered/Spayed</span>
                      <span className="font-semibold text-slate-800">{animal.isNeutered ? 'Yes' : 'No'}</span>
                    </div>
                  </div>

                  {animal.allergies && animal.allergies.length > 0 && (
                    <div className="text-xs bg-red-50 text-red-800 p-2.5 rounded-xl border border-red-100">
                      <span className="font-bold">Allergies:</span> {animal.allergies.join(', ')}
                    </div>
                  )}
                </div>

                <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedAnimal(animal);
                      setAnimalModalTab('info');
                    }}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900"
                  >
                    View Medical Passport
                  </button>
                  <button
                    onClick={() => navigate('/veterinarians')}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Book Doctor
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {/* TAB 3: APPOINTMENTS */}
      {currentTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 font-outfit">Consultation Appointments</h2>
            <button
              onClick={() => navigate('/veterinarians')}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
            >
              Book New Appointment
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100 text-xs">
              {appointments.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No appointments found.</div>
              ) : (
                appointments.map((appt) => (
                  <div key={appt.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            appt.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : appt.status === 'COMPLETED'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {appt.status}
                        </span>
                        <span className="text-slate-400 font-medium">#{appt.id}</span>
                      </div>
                      <div className="font-bold text-sm text-slate-900">
                        {appt.consultationType === 'ONLINE_VIDEO' ? 'Online Telehealth Video' : 'Clinic In-Person Visit'} - Patient: {appt.animalName}
                      </div>
                      <div className="text-slate-500">
                        With <strong>{appt.veterinarianName}</strong> on {appt.appointmentDate} at {appt.timeSlot}
                      </div>
                      <div className="text-slate-600 pt-0.5">Reason: {appt.reason}</div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {appt.status === 'CONFIRMED' && appt.consultationType === 'ONLINE_VIDEO' && (
                        <button
                          onClick={() => navigate(`/consultation/${appt.id}`)}
                          className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
                        >
                          <Video className="w-3.5 h-3.5" /> Join Room
                        </button>
                      )}
                      {appt.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleCancelAppointment(appt.id)}
                          className="text-red-600 hover:bg-red-50 font-semibold px-3 py-2 rounded-xl transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRESCRIPTIONS */}
      {currentTab === 'prescriptions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 font-outfit">Medical Prescriptions</h2>
              <p className="text-xs text-slate-500">Official digital veterinary prescriptions signed by certified clinicians.</p>
            </div>
            <button
              onClick={() => navigate('/pharmacy')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition self-start sm:self-auto"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Visit Online Pharmacy</span>
            </button>
          </div>

          {/* Online Pharmacy helper notice */}
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-teal-900">Need to fill your prescriptions?</div>
                <div className="text-[11px] text-teal-700">Order authentic prescribed medications, antibiotics, supplements, and tick treatments with temperature-controlled delivery.</div>
              </div>
            </div>
            <button
              onClick={() => navigate('/pharmacy?category=PRESCRIPTION_RX')}
              className="shrink-0 text-xs font-bold text-teal-800 bg-white border border-teal-300 px-3 py-1.5 rounded-lg hover:bg-teal-100/50 transition"
            >
              Fill Rx Now
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {prescriptions.length === 0 ? (
              <div className="col-span-2 bg-white p-8 rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
                No active prescriptions on file.
              </div>
            ) : (
              prescriptions.map((presc) => (
                <div key={presc.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">Rx Official</span>
                      <h3 className="font-bold text-sm text-slate-900 mt-1">Patient: {presc.animalName}</h3>
                      <p className="text-slate-500">Prescribing Vet: {presc.veterinarianName}</p>
                    </div>
                    <button
                      onClick={() => setSelectedPrescription(presc)}
                      className="p-2 text-teal-600 hover:bg-teal-50 rounded-xl transition"
                      title="Print / View Rx"
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="font-semibold text-slate-800">Diagnosis: {presc.diagnosis}</div>
                    <div className="divide-y divide-slate-100">
                      {(presc.items || presc.medications || []).map((item: any, i: number) => (
                        <div key={i} className="py-2 first:pt-0">
                          <div className="font-bold text-slate-900">
                            {item.medicationName || item.name} ({item.strength})
                          </div>
                          <div className="text-slate-600 text-[11px]">
                            Dosage: {item.dosage} • Route: {item.route} • Frequency: {item.frequency} for {item.durationDays || item.duration}
                          </div>
                          {item.instructions && (
                            <div className="text-slate-500 text-[11px] italic">Note: {item.instructions}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                    <div className="text-slate-400">
                      <span>Issued: {new Date(presc.createdAt).toLocaleDateString()}</span>
                      <span className="ml-2">Lic #{presc.vetLicenseNumber}</span>
                    </div>
                    <button
                      onClick={() => navigate(`/pharmacy?search=${encodeURIComponent(presc.diagnosis || '')}`)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline self-end sm:self-auto"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Order Medication</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: VACCINATIONS */}
      {currentTab === 'vaccines' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 font-outfit">Vaccination Registry</h2>
            <p className="text-xs text-slate-500">Track core immunization boosters and upcoming due dates.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {animals.map((anim) => (
              <div key={anim.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <img
                    src={anim.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200'}
                    alt={anim.name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900">{anim.name}</h3>
                    <p className="text-slate-500 text-[11px]">{anim.species}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">Rabies 3-Year Booster</div>
                      <div className="text-[11px] text-slate-500">Administered: May 2025</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Valid
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">DHPP / Core Viral</div>
                      <div className="text-[11px] text-slate-500">Next Due: Nov 2026</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Up to date
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: BILLING & RECEIPTS */}
      {currentTab === 'billing' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 font-outfit">Billing History & Invoices</h2>
            <p className="text-xs text-slate-500">Download digital invoices and inspect payment receipts.</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100 text-xs">
              <div className="p-4 bg-slate-50 font-bold text-slate-700 grid grid-cols-5">
                <span>Invoice ID</span>
                <span>Date</span>
                <span>Service</span>
                <span>Amount</span>
                <span className="text-right">Receipt</span>
              </div>

              {appointments.map((appt) => (
                <div key={appt.id} className="p-4 grid grid-cols-5 items-center hover:bg-slate-50/50">
                  <span className="font-mono text-slate-500 font-medium">INV-{appt.id.slice(0, 6)}</span>
                  <span className="text-slate-700">{appt.appointmentDate}</span>
                  <span className="font-semibold text-slate-900">
                    Telehealth Consultation ({appt.animalName})
                  </span>
                  <span className="font-bold text-teal-700">${appt.amountPaid || 50}.00</span>
                  <span className="text-right">
                    <button
                      onClick={() => alert(`Downloading official tax receipt for invoice INV-${appt.id.slice(0, 6)}`)}
                      className="text-teal-600 hover:underline font-semibold"
                    >
                      Download PDF
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ANIMAL MEDICAL PASSPORT MODAL */}
      {selectedAnimal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <img
                  src={selectedAnimal.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200'}
                  alt={selectedAnimal.name}
                  className="w-12 h-12 rounded-2xl object-cover"
                />
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-outfit">{selectedAnimal.name}'s Medical Passport</h3>
                  <p className="text-xs text-slate-500">
                    {selectedAnimal.species} • {selectedAnimal.breed || 'Mixed'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAnimal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Age</span>
                  <span className="font-bold text-slate-800">{selectedAnimal.ageYears} Years</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Weight</span>
                  <span className="font-bold text-slate-800">{selectedAnimal.weightKg} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Sex</span>
                  <span className="font-bold text-slate-800">{selectedAnimal.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Neutered</span>
                  <span className="font-bold text-slate-800">{selectedAnimal.isNeutered ? 'Yes' : 'No'}</span>
                </div>
              </div>

              {selectedAnimal.allergies && selectedAnimal.allergies.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl">
                  <strong>Known Allergies:</strong> {selectedAnimal.allergies.join(', ')}
                </div>
              )}

              {selectedAnimal.chronicConditions && selectedAnimal.chronicConditions.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl">
                  <strong>Chronic Conditions:</strong> {selectedAnimal.chronicConditions.join(', ')}
                </div>
              )}

              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-slate-900 text-sm">Past Veterinary Encounters</h4>
                <div className="border border-slate-100 rounded-xl p-3 bg-white space-y-1">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>Telehealth Video Consultation</span>
                    <span className="text-slate-500">2026-03-10</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Diagnosis: Mild allergic dermatitis with localized pruritus. Prescribed oral Apoquel and hypoallergenic topical shampoo.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedAnimal(null)}
                className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-xl text-xs"
              >
                Close Passport
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD ANIMAL MODAL */}
      {showAddAnimalModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-base text-slate-900 font-outfit">Add New Animal Patient</h3>
              <button onClick={() => setShowAddAnimalModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {animalFormError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{animalFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAnimal} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Animal Name *</label>
                  <input
                    id="input-animal-name"
                    type="text"
                    required
                    placeholder="e.g. Bella"
                    value={newAnimal.name}
                    onChange={(e) => setNewAnimal({ ...newAnimal, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Species *</label>
                  <select
                    id="select-animal-species"
                    value={newAnimal.species}
                    onChange={(e) => setNewAnimal({ ...newAnimal, species: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none bg-white"
                  >
                    <option value="Dogs">{t.dogs}</option>
                    <option value="Cats">{t.cats}</option>
                    <option value="Birds">{t.birds}</option>
                    <option value="Rabbits">{t.rabbits}</option>
                    <option value="Cows">{t.cows}</option>
                    <option value="Horses">{t.horses}</option>
                    <option value="Goats">{t.goats}</option>
                    <option value="Other">{t.otherAnimals}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Breed</label>
                  <input
                    id="input-animal-breed"
                    type="text"
                    placeholder="e.g. Golden Retriever"
                    value={newAnimal.breed}
                    onChange={(e) => setNewAnimal({ ...newAnimal, breed: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sex</label>
                  <select
                    id="select-animal-gender"
                    value={newAnimal.gender}
                    onChange={(e) => setNewAnimal({ ...newAnimal, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none bg-white"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="UNKNOWN">Unknown</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age (Years)</label>
                  <input
                    id="input-animal-age"
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={newAnimal.ageYears}
                    onChange={(e) => setNewAnimal({ ...newAnimal, ageYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Weight (kg)</label>
                  <input
                    id="input-animal-weight"
                    type="number"
                    min="0.1"
                    max="1000"
                    step="0.1"
                    value={newAnimal.weightKg}
                    onChange={(e) => setNewAnimal({ ...newAnimal, weightKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Known Allergies (comma separated)</label>
                <input
                  id="input-animal-allergies"
                  type="text"
                  placeholder="e.g. Beef protein, Penicillin"
                  value={newAnimal.allergies}
                  onChange={(e) => setNewAnimal({ ...newAnimal, allergies: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  id="btn-cancel-animal"
                  type="button"
                  onClick={() => setShowAddAnimalModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition"
                  disabled={submittingAnimal}
                >
                  Cancel
                </button>
                <button
                  id="btn-save-animal"
                  type="submit"
                  disabled={submittingAnimal}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold rounded-xl shadow-sm transition flex items-center gap-2"
                >
                  {submittingAnimal ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Animal'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRESCRIPTION PRINT SLIP MODAL */}
      {selectedPrescription && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 p-8 space-y-6 text-xs font-sans print:m-0 print:p-0">
            {/* Rx Letterhead */}
            <div className="border-b-2 border-slate-800 pb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-teal-800 font-bold text-lg font-outfit">
                  <Heart className="w-5 h-5 fill-teal-700 text-teal-700" />
                  <span>VetCare Telehealth Clinical Slip</span>
                </div>
                <p className="text-slate-500 text-[11px]">Official Digital Veterinary Prescription</p>
              </div>
              <div className="text-right text-[11px] text-slate-600">
                <div className="font-bold text-slate-900">{selectedPrescription.veterinarianName}</div>
                <div>License #{selectedPrescription.vetLicenseNumber}</div>
              </div>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px]">Patient Name</span>
                <span className="font-bold text-slate-900">{selectedPrescription.animalName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Date Issued</span>
                <span className="font-semibold text-slate-800">
                  {new Date(selectedPrescription.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[10px]">Primary Diagnosis</span>
                <span className="font-semibold text-slate-800">{selectedPrescription.diagnosis}</span>
              </div>
            </div>

            {/* Rx Items */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-teal-900">Prescribed Medications (Rx)</div>
              <div className="divide-y divide-slate-100">
                {(selectedPrescription.items || selectedPrescription.medications || []).map((item: any, i: number) => (
                  <div key={i} className="py-2.5 first:pt-0">
                    <div className="flex justify-between font-bold text-slate-900 text-sm">
                      <span>{item.medicationName || item.name} ({item.strength})</span>
                      <span className="text-xs font-semibold text-slate-500">{item.durationDays || item.duration} Days</span>
                    </div>
                    <div className="text-slate-700 mt-1">
                      <strong>Dosage & Route:</strong> {item.dosage} via {item.route}
                    </div>
                    <div className="text-slate-700">
                      <strong>Frequency:</strong> {item.frequency}
                    </div>
                    {item.instructions && (
                      <div className="text-slate-500 italic mt-0.5">Instructions: {item.instructions}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer & Footer */}
            <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between">
              <span>VetCare Telehealth ID: {selectedPrescription.id}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 rounded-lg flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Rx
                </button>
                <button
                  onClick={() => setSelectedPrescription(null)}
                  className="px-3 py-1.5 bg-teal-600 text-white font-semibold rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
