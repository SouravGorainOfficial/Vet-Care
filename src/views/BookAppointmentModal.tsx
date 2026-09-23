import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Video,
  Building,
  CheckCircle2,
  AlertCircle,
  Upload,
  CreditCard,
  Lock,
  ChevronRight,
  ChevronLeft,
  Heart,
  FileText,
  Loader2,
} from 'lucide-react';
import { VeterinarianProfile, Animal, ConsultationType } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface BookAppointmentModalProps {
  vet: VeterinarianProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (appointmentId: string) => void;
}

interface SlotInfo {
  time: string;
  available: boolean;
  status: 'FREE' | 'BUSY' | 'BREAK';
  reason?: string;
}

interface DayOverview {
  date: string;
  dayOfWeek: string;
  isWorkingDay: boolean;
  isFree: boolean;
  availableCount: number;
  totalSlots: number;
  reason?: string;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  vet,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [step, setStep] = useState<number>(1);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [consultationType, setConsultationType] = useState<ConsultationType>('ONLINE_VIDEO');
  const [savingAnimal, setSavingAnimal] = useState(false);

  // Inline new animal form state
  const [showAddAnimal, setShowAddAnimal] = useState(false);
  const [newAnimalName, setNewAnimalName] = useState('');
  const [newAnimalSpecies, setNewAnimalSpecies] = useState('Dogs');
  const [newAnimalBreed, setNewAnimalBreed] = useState('');
  const [newAnimalAge, setNewAnimalAge] = useState(2);
  const [newAnimalWeight, setNewAnimalWeight] = useState(10);
  const [newAnimalGender, setNewAnimalGender] = useState<'MALE' | 'FEMALE' | 'UNKNOWN'>('MALE');

  // Date & Slot state
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [allSlots, setAllSlots] = useState<SlotInfo[]>([]);
  const [daysOverview, setDaysOverview] = useState<DayOverview[]>([]);
  const [isDateFree, setIsDateFree] = useState<boolean>(true);
  const [dateReason, setDateReason] = useState<string>('');
  const [dayWorkingHours, setDayWorkingHours] = useState<{ startTime: string; endTime: string } | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [autoSelectedFreeDay, setAutoSelectedFreeDay] = useState<boolean>(false);

  // Symptoms & Notes
  const [reason, setReason] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [symptomDuration, setSymptomDuration] = useState('2-3 days');
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);

  // Payment
  const [cardHolder, setCardHolder] = useState(user?.name || '');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMyAnimals();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDate && vet.id) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate, vet.id]);

  const fetchMyAnimals = async () => {
    try {
      const authToken = token || localStorage.getItem('vetcare_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/animals', { headers });
      if (res.ok) {
        const data = await res.json();
        setAnimals(data.animals || []);
        if (data.animals && data.animals.length > 0) {
          setSelectedAnimalId(data.animals[0].id);
        } else {
          setShowAddAnimal(true);
        }
      }
    } catch {
      // ignore
    }
  };

  const fetchSlots = async (dateStr: string) => {
    try {
      setLoadingSlots(true);
      const res = await fetch(`/api/vets/${vet.id}/slots?date=${dateStr}&days=14`);
      if (res.ok) {
        const data = await res.json();
        const openSlots: string[] = data.slots || [];
        setAvailableSlots(openSlots);
        setAllSlots(data.allSlots || []);
        setIsDateFree(Boolean(data.isFree));
        setDateReason(data.reason || '');
        setDayWorkingHours(data.workingHours || null);

        if (data.overview && Array.isArray(data.overview)) {
          setDaysOverview(data.overview);
          // If the initial date has no free slots, automatically select doctor's nearest free date
          if (!data.isFree && !autoSelectedFreeDay) {
            const firstFreeDay = data.overview.find((d: any) => d.isFree);
            if (firstFreeDay) {
              setAutoSelectedFreeDay(true);
              setSelectedDate(firstFreeDay.date);
              return;
            }
          }
        }

        if (openSlots.length > 0) {
          setSelectedSlot(openSlots[0]);
        } else {
          setSelectedSlot('');
        }
      } else {
        setAvailableSlots([]);
        setAllSlots([]);
        setIsDateFree(false);
        setDateReason('Unable to load doctor schedule');
      }
    } catch {
      setAvailableSlots([]);
      setAllSlots([]);
      setIsDateFree(false);
      setDateReason('Network error checking calendar');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleCreateNewAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newAnimalName.trim()) {
      setError('Please provide an animal name');
      return;
    }

    try {
      setSavingAnimal(true);
      const authToken = token || localStorage.getItem('vetcare_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/animals', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: newAnimalName.trim(),
          species: newAnimalSpecies,
          breed: newAnimalBreed.trim(),
          ageYears: newAnimalAge,
          weightKg: newAnimalWeight,
          gender: newAnimalGender,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const createdAnimal = data.animal || data;
        setAnimals((prev) => [...prev, createdAnimal]);
        setSelectedAnimalId(createdAnimal.id);
        setShowAddAnimal(false);
        setNewAnimalName('');
        setNewAnimalBreed('');
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || 'Failed to add animal. Please try again.');
      }
    } catch {
      setError('Network communication failure while adding animal');
    } finally {
      setSavingAnimal(false);
    }
  };

  const handleMockFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachedFiles([...attachedFiles, file.name]);
    }
  };

  const calculateTotal = () => {
    const baseFee = consultationType === 'ONLINE_VIDEO' ? vet.consultationFee : (vet.clinicVisitFee || 80);
    const platformFee = 5;
    return { baseFee, platformFee, total: baseFee + platformFee };
  };

  const handleConfirmAndPay = async () => {
    setError(null);
    setProcessing(true);

    try {
      const { total } = calculateTotal();
      const authToken = token || localStorage.getItem('vetcare_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          veterinarianId: vet.id,
          vetId: vet.id,
          animalId: selectedAnimalId,
          consultationType,
          type: consultationType,
          appointmentDate: selectedDate,
          timeSlot: selectedSlot,
          dateTimeUtc: `${selectedDate}T${selectedSlot}:00Z`,
          reason,
          symptoms,
          symptomDuration,
          attachments: attachedFiles,
          documentUrls: attachedFiles,
          amountPaid: total,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onSuccess(data.appointment.id);
      } else {
        const err = await res.json();
        setError(err.error || 'Booking failed');
      }
    } catch {
      setError('Network communication failure');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <img
              src={vet.avatarUrl}
              alt={vet.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <div>
              <h3 className="font-bold text-base text-slate-900 font-outfit leading-tight">
                {vet.name}
              </h3>
              <p className="text-xs text-teal-700 font-medium">{vet.specializations.join(', ')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Breadcrumb */}
        <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200/80">
          <div className="grid grid-cols-4 gap-1.5 text-center">
            {[
              { stepNum: 1, label: '1. Patient', icon: Heart },
              { stepNum: 2, label: '2. Date & Time', icon: Calendar },
              { stepNum: 3, label: '3. Reason', icon: FileText },
              { stepNum: 4, label: '4. Confirm', icon: CheckCircle2 },
            ].map(({ stepNum, label, icon: Icon }) => {
              const isDone = step > stepNum;
              const isCurrent = step === stepNum;
              return (
                <button
                  key={stepNum}
                  type="button"
                  disabled={stepNum > step}
                  onClick={() => isDone && setStep(stepNum)}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs transition ${
                    isCurrent
                      ? 'bg-teal-600 text-white font-bold shadow-xs'
                      : isDone
                      ? 'bg-teal-100 text-teal-900 font-semibold hover:bg-teal-200 cursor-pointer'
                      : 'bg-white/80 text-slate-400 font-medium cursor-not-allowed border border-slate-200/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Animal & Consultation Type */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-bold text-slate-900 text-sm">Select Pet Patient</label>
                  {animals.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddAnimal(!showAddAnimal)}
                      className="text-xs text-teal-600 hover:text-teal-800 font-semibold"
                    >
                      {showAddAnimal ? 'Use Existing Pet' : '+ Add New Pet'}
                    </button>
                  )}
                </div>

                {/* Quick Presets for New / Guest users or fast booking */}
                {animals.length === 0 && !showAddAnimal && (
                  <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-200/70 space-y-3">
                    <p className="text-slate-700 font-semibold text-xs">
                      Who is this consultation for? Select your pet:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { species: 'Dogs', name: 'Max (Dog)', icon: '🐕' },
                        { species: 'Cats', name: 'Luna (Cat)', icon: '🐈' },
                        { species: 'Birds', name: 'Charlie (Bird)', icon: '🦜' },
                        { species: 'Horses', name: 'Spirit (Horse)', icon: '🐎' },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setNewAnimalName(preset.name);
                            setNewAnimalSpecies(preset.species);
                            // Auto save as patient
                            setShowAddAnimal(true);
                          }}
                          className="p-2.5 rounded-xl bg-white border border-teal-200 hover:border-teal-500 hover:bg-teal-50 text-slate-800 font-bold transition flex flex-col items-center justify-center gap-1 shadow-2xs"
                        >
                          <span className="text-xl">{preset.icon}</span>
                          <span className="text-xs">{preset.species}</span>
                        </button>
                      ))}
                    </div>
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddAnimal(true)}
                        className="text-teal-700 hover:text-teal-900 font-bold text-xs underline"
                      >
                        or enter pet's exact custom name
                      </button>
                    </div>
                  </div>
                )}

                {animals.length > 0 && !showAddAnimal && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {animals.map((anim) => {
                        const selected = selectedAnimalId === anim.id;
                        return (
                          <div
                            key={anim.id}
                            onClick={() => setSelectedAnimalId(anim.id)}
                            className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition ${
                              selected
                                ? 'border-teal-600 bg-teal-50/70 shadow-sm ring-2 ring-teal-500/20'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <img
                              src={anim.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200'}
                              alt={anim.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-slate-900 text-sm truncate">{anim.name}</div>
                              <div className="text-[11px] text-slate-500">
                                {anim.species} • {anim.breed || 'Mixed'}
                              </div>
                            </div>
                            {selected && (
                              <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {showAddAnimal && (
                  <form onSubmit={handleCreateNewAnimal} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="font-bold text-slate-800 text-sm">Add Animal Patient</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Pet's Name *</label>
                        <input
                          id="input-book-animal-name"
                          type="text"
                          required
                          value={newAnimalName}
                          onChange={(e) => setNewAnimalName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs focus:border-teal-500 focus:outline-none"
                          placeholder="e.g. Luna or Max"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Species *</label>
                        <select
                          id="select-book-animal-species"
                          value={newAnimalSpecies}
                          onChange={(e) => setNewAnimalSpecies(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs focus:border-teal-500 focus:outline-none font-medium"
                        >
                          <option value="Dogs">Dog</option>
                          <option value="Cats">Cat</option>
                          <option value="Birds">Bird</option>
                          <option value="Rabbits">Rabbit</option>
                          <option value="Cows">Cow / Cattle</option>
                          <option value="Horses">Horse</option>
                          <option value="Goats">Goat</option>
                          <option value="Other">Other Pet</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        id="btn-book-save-animal"
                        type="submit"
                        disabled={savingAnimal}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold rounded-xl flex items-center gap-1.5 transition text-xs shadow-xs"
                      >
                        {savingAnimal ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save & Select Patient'
                        )}
                      </button>
                      {animals.length > 0 && (
                        <button
                          id="btn-book-cancel-animal"
                          type="button"
                          disabled={savingAnimal}
                          onClick={() => setShowAddAnimal(false)}
                          className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100">
                <label className="block font-bold text-slate-900 text-sm mb-2">Choose Visit Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setConsultationType('ONLINE_VIDEO')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
                      consultationType === 'ONLINE_VIDEO'
                        ? 'border-teal-600 bg-teal-50/70 shadow-sm ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                      <Video className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">Online Video Call</span>
                        <span className="text-teal-700 font-black text-sm">${vet.consultationFee}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        HD encrypted video room. Live diagnosis, behavioral advice & prescription.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setConsultationType('CLINIC_VISIT')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
                      consultationType === 'CLINIC_VISIT'
                        ? 'border-teal-600 bg-teal-50/70 shadow-sm ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <Building className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">In-Person Clinic Visit</span>
                        <span className="text-blue-700 font-black text-sm">${vet.clinicVisitFee || 80}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed truncate">
                        {vet.clinicAddress || 'Partner Veterinary Clinic'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Date & Available Slots */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm font-outfit">Select Consultation Date & Time</h4>
                  <p className="text-[11px] text-slate-500">
                    Schedule configured in doctor's timezone ({vet.timezone || 'Local'}).
                  </p>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-3 text-[11px] bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 shrink-0">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block ring-2 ring-emerald-200" />
                    <span>Free (Available)</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-rose-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block ring-2 ring-rose-200" />
                    <span>Busy / Off</span>
                  </div>
                </div>
              </div>

              {/* Quick Day Selector Strip (14 days) */}
              <div>
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <span className="font-bold text-slate-700">Select Date</span>
                  <span className="text-[11px] text-slate-400">Green = Doctor Free • Red = Doctor Busy / Off</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {daysOverview.map((day) => {
                    const isSelected = selectedDate === day.date;
                    const [y, m, d] = day.date.split('-');
                    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
                    const monthShort = dateObj.toLocaleDateString('en-US', { month: 'short' });
                    const dayNum = Number(d);

                    return (
                      <button
                        key={day.date}
                        type="button"
                        id={`date-btn-${day.date}`}
                        onClick={() => setSelectedDate(day.date)}
                        className={`shrink-0 flex flex-col items-center justify-center min-w-[70px] py-2 px-2.5 rounded-2xl border-2 transition text-center ${
                          isSelected
                            ? day.isFree
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-md ring-2 ring-emerald-300'
                              : 'border-rose-600 bg-rose-50 text-rose-950 shadow-md ring-2 ring-rose-300'
                            : day.isFree
                            ? 'border-emerald-300 bg-emerald-50/30 hover:border-emerald-500 hover:bg-emerald-50/70 text-slate-800'
                            : 'border-rose-200 bg-rose-50/20 hover:border-rose-300 hover:bg-rose-50/50 text-slate-600'
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {day.dayOfWeek.slice(0, 3)}
                        </span>
                        <span className="text-base font-black my-0.5">
                          {dayNum}
                        </span>
                        <span className="text-[9px] font-medium text-slate-400">
                          {monthShort}
                        </span>

                        {/* Green / Red Indicator Badge */}
                        <div className="mt-1.5 flex items-center">
                          {day.isFree ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Free
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Busy
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specific Date Picker Input & Realtime Status Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 text-xs mb-1">Pick Specific Calendar Date</label>
                  <input
                    id="input-appointment-date"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={`w-full px-3 py-2 text-xs border-2 rounded-xl focus:outline-none transition ${
                      isDateFree
                        ? 'border-emerald-400 focus:border-emerald-600 bg-emerald-50/30'
                        : 'border-rose-300 focus:border-rose-500 bg-rose-50/30'
                    }`}
                  />
                </div>

                {/* Date Status Banner (Green when Free, Red when Busy) */}
                <div className="flex items-center">
                  {loadingSlots ? (
                    <div className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2 text-xs text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin text-teal-600 shrink-0" />
                      <span>Checking doctor calendar...</span>
                    </div>
                  ) : isDateFree ? (
                    <div className="w-full p-2.5 rounded-xl border-2 border-emerald-400 bg-emerald-50 text-emerald-900 flex items-center justify-between text-xs shadow-xs">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                        </span>
                        <div>
                          <span className="font-extrabold text-emerald-950 block">Doctor is Free</span>
                          <span className="text-[11px] text-emerald-800">{availableSlots.length} consultation slots open</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full font-black text-[10px] bg-emerald-600 text-white tracking-wide uppercase">
                        Free
                      </span>
                    </div>
                  ) : (
                    <div className="w-full p-2.5 rounded-xl border-2 border-rose-300 bg-rose-50 text-rose-900 flex items-center justify-between text-xs shadow-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-rose-600 shrink-0 inline-block"></span>
                        <div>
                          <span className="font-extrabold text-rose-950 block">Doctor is Busy / Off</span>
                          <span className="text-[11px] text-rose-700 line-clamp-1">{dateReason || 'Off duty / fully booked'}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full font-black text-[10px] bg-rose-600 text-white tracking-wide uppercase">
                        Not Free
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Available Slots Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-bold text-slate-800 text-xs">
                    Consultation Slots on {selectedDate}
                  </label>
                  {dayWorkingHours && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      Duty Hours: {dayWorkingHours.startTime} - {dayWorkingHours.endTime}
                    </span>
                  )}
                </div>

                {loadingSlots ? (
                  <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                    <span>Loading consultation slots...</span>
                  </div>
                ) : !isDateFree || availableSlots.length === 0 ? (
                  <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl text-xs space-y-2">
                    <div className="flex items-center gap-2 text-rose-800 font-bold">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{vet.name} is not available for consultations on this date.</span>
                    </div>
                    <p className="text-rose-700 text-[11px]">
                      {dateReason || 'The doctor is off duty or all consultation slots are fully occupied.'}
                    </p>
                    {/* Nearest green date recommendation */}
                    {daysOverview.some((d) => d.isFree && d.date !== selectedDate) && (
                      <div className="pt-2 flex items-center gap-2 flex-wrap">
                        <span className="text-slate-600 font-medium text-[11px]">Pick nearest available date:</span>
                        {daysOverview
                          .filter((d) => d.isFree)
                          .slice(0, 3)
                          .map((freeDay) => (
                            <button
                              key={freeDay.date}
                              type="button"
                              onClick={() => setSelectedDate(freeDay.date)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition flex items-center gap-1 shadow-xs"
                            >
                              <span>{freeDay.dayOfWeek.slice(0, 3)}, {freeDay.date.slice(5)}</span>
                              <span className="text-emerald-100 font-normal">({freeDay.availableCount} slots)</span>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {allSlots.map((slotObj) => {
                        const isSelected = selectedSlot === slotObj.time;
                        const isFree = slotObj.available;

                        if (isFree) {
                          return (
                            <button
                              key={slotObj.time}
                              id={`slot-btn-${slotObj.time.replace(':', '-')}`}
                              type="button"
                              onClick={() => setSelectedSlot(slotObj.time)}
                              className={`py-2 px-2 text-xs rounded-xl border-2 transition flex flex-col items-center justify-center font-bold ${
                                isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300'
                                  : 'bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 border-emerald-300 hover:border-emerald-500'
                              }`}
                            >
                              <span className="text-xs">{slotObj.time}</span>
                              <span className={`text-[9px] font-extrabold flex items-center gap-1 mt-0.5 ${
                                isSelected ? 'text-emerald-100' : 'text-emerald-700'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                                Free
                              </span>
                            </button>
                          );
                        }

                        // Busy / Booked / Break slot shown in RED
                        return (
                          <button
                            key={slotObj.time}
                            type="button"
                            disabled
                            title={slotObj.reason || 'Not available'}
                            className="py-2 px-2 text-xs rounded-xl border-2 border-rose-200 bg-rose-50/60 text-rose-500 cursor-not-allowed flex flex-col items-center justify-center opacity-70"
                          >
                            <span className="text-xs line-through">{slotObj.time}</span>
                            <span className="text-[9px] font-bold text-rose-600 flex items-center gap-1 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              {slotObj.status === 'BREAK' ? 'Break' : 'Booked'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {selectedSlot && (
                      <p className="text-[11px] text-emerald-800 font-semibold pt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Selected Slot: {selectedDate} at {selectedSlot} ({vet.consultationDurationMinutes || 30} mins)</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Symptoms & Documents */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-900 text-sm mb-1.5">Primary Reason for Consultation *</label>
                
                {/* 1-Tap Quick Reason Chips */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {[
                    'General Health Checkup',
                    'Vaccination & Deworming',
                    'Skin Itching / Rash',
                    'Vomiting / Stomach Ache',
                    'Ear Infection / Scratching',
                    'Limping / Joint Stiffness',
                    'Diet & Nutrition Advice',
                    'Post-Surgery Follow-up',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setReason(chip)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition ${
                        reason === chip
                          ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-teal-50'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  required
                  placeholder="e.g. Skin rash, vomiting, post-surgery checkup, limp"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Symptoms or Notes (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Describe when symptoms started, dietary appetite, behavior changes, or past medication..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none text-xs leading-relaxed"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Symptom Duration</label>
                  <select
                    value={symptomDuration}
                    onChange={(e) => setSymptomDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-teal-500 focus:outline-none text-xs"
                  >
                    <option value="Less than 24 hours">Less than 24 hours</option>
                    <option value="1-3 days">1-3 days</option>
                    <option value="1 week">1 week</option>
                    <option value="Chronic (> 1 month)">Chronic (&gt; 1 month)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Attach Photo or Report</label>
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl px-3 py-2 cursor-pointer hover:border-teal-400 bg-slate-50 transition">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-[11px] text-slate-600 font-medium">Upload File</span>
                    <input type="file" onChange={handleMockFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {attachedFiles.map((name, i) => (
                    <span key={i} className="bg-teal-50 text-teal-800 px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 border border-teal-200">
                      <FileText className="w-3 h-3" /> {name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Summary & Payment */}
          {step === 4 && (
            <div className="space-y-4">
              <label className="block font-bold text-slate-900 text-sm">Review Appointment & Payment</label>

              {/* Summary Card */}
              <div className="bg-linear-to-br from-slate-50 to-teal-50/40 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <img
                      src={vet.avatarUrl}
                      alt={vet.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{vet.name}</h4>
                      <p className="text-xs text-teal-700 font-medium">{vet.specializations.join(', ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded-full">
                      {consultationType === 'ONLINE_VIDEO' ? 'HD Video Call' : 'Clinic Visit'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-1">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Patient</span>
                    <span className="font-bold text-slate-800">
                      {animals.find((a) => a.id === selectedAnimalId)?.name || 'Patient'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Date & Time</span>
                    <span className="font-bold text-slate-800">
                      {selectedDate} at {selectedSlot}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 text-[11px] block">Primary Concern</span>
                    <span className="font-medium text-slate-700">{reason}</span>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Consultation Fee:</span>
                    <span>${calculateTotal().baseFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Platform & HD Video Service:</span>
                    <span>${calculateTotal().platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total To Pay:</span>
                    <span className="text-teal-700 text-base">${calculateTotal().total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment details */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Card Payment (Pre-Filled Test Card)</span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <Lock className="w-3 h-3 text-emerald-600" /> 256-Bit Encrypted
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1 text-[11px]">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1 text-[11px]">Card Number</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 bg-teal-50/70 p-3 rounded-xl border border-teal-200/80 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span><strong>Zero-Risk Guarantee:</strong> 100% free cancellation up to 24 hours prior to appointment time with instant refund.</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer: Navigation buttons */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-200 transition text-xs flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              onClick={() => {
                if (step === 1 && !selectedAnimalId) {
                  setError('Please choose or add an animal patient.');
                  return;
                }
                if (step === 2 && !selectedSlot) {
                  setError('Please select an available consultation time slot.');
                  return;
                }
                if (step === 3 && !reason) {
                  setError('Please specify the primary consultation reason.');
                  return;
                }
                setError(null);
                setStep(step + 1);
              }}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm transition text-xs flex items-center gap-1"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleConfirmAndPay}
              disabled={processing}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition text-xs flex items-center gap-2"
            >
              {processing ? (
                <span>Processing Payment...</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Confirm & Pay ${calculateTotal().total.toFixed(2)}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
