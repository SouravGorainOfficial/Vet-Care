import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Calendar,
  Video,
  Clock,
  FileText,
  DollarSign,
  Plus,
  CheckCircle2,
  AlertTriangle,
  User,
  Heart,
  Save,
  Star,
  Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Appointment, VeterinarianProfile, Animal, Prescription } from '../types';

interface VetDashboardProps {
  navigate: (path: string) => void;
}

export const VetDashboard: React.FC<VetDashboardProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<'queue' | 'schedule' | 'rx' | 'patients' | 'reviews'>('queue');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<VeterinarianProfile | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  // Availability schedule editor state
  const [schedule, setSchedule] = useState<any[]>([]);
  const [consultationFee, setConsultationFee] = useState(45);
  const [clinicVisitFee, setClinicVisitFee] = useState(85);
  const [clinicAddress, setClinicAddress] = useState('');
  const [saveScheduleSuccess, setSaveScheduleSuccess] = useState(false);

  // Prescription Generator Form State
  const [rxAnimalId, setRxAnimalId] = useState('');
  const [rxDiagnosis, setRxDiagnosis] = useState('');
  const [rxMedName, setRxMedName] = useState('');
  const [rxStrength, setRxStrength] = useState('');
  const [rxDosage, setRxDosage] = useState('');
  const [rxRoute, setRxRoute] = useState('Oral');
  const [rxFrequency, setRxFrequency] = useState('Every 12 hours (BID)');
  const [rxDuration, setRxDuration] = useState(7);
  const [rxInstructions, setRxInstructions] = useState('');
  const [rxSuccessMessage, setRxSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchVetData();
  }, []);

  const fetchVetData = async () => {
    try {
      setLoading(true);
      const [apptRes, vetRes, animRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/vets/vet-1'),
        fetch('/api/animals'),
      ]);

      if (apptRes.ok) {
        const d = await apptRes.json();
        setAppointments(d.appointments || []);
      }
      if (vetRes.ok) {
        const d = await vetRes.json();
        if (d.veterinarian) {
          setProfile(d.veterinarian);
          setSchedule(d.veterinarian.weeklySchedule || []);
          setConsultationFee(d.veterinarian.consultationFee || 45);
          setClinicVisitFee(d.veterinarian.clinicVisitFee || 85);
          setClinicAddress(d.veterinarian.clinicAddress || '');
        }
      }
      if (animRes.ok) {
        const d = await animRes.json();
        setAnimals(d.animals || []);
        if (d.animals && d.animals.length > 0) {
          setRxAnimalId(d.animals[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleScheduleDay = (idx: number) => {
    const updated = [...schedule];
    updated[idx].active = !updated[idx].active;
    setSchedule(updated);
  };

  const handleUpdateScheduleTimes = (idx: number, field: 'startTime' | 'endTime', val: string) => {
    const updated = [...schedule];
    updated[idx][field] = val;
    setSchedule(updated);
  };

  const handleSaveSchedule = async () => {
    try {
      const res = await fetch('/api/vets/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weeklySchedule: schedule,
          consultationFee,
          clinicVisitFee,
          clinicAddress,
        }),
      });
      if (res.ok) {
        setSaveScheduleSuccess(true);
        setTimeout(() => setSaveScheduleSuccess(false), 3000);
      }
    } catch {
      // ignore
    }
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const targetAnimal = animals.find((a) => a.id === rxAnimalId);
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointments[0]?.id || 'appt-1',
          animalId: rxAnimalId,
          animalName: targetAnimal?.name || 'Patient',
          diagnosis: rxDiagnosis,
          items: [
            {
              medicationName: rxMedName,
              strength: rxStrength,
              dosage: rxDosage,
              route: rxRoute,
              frequency: rxFrequency,
              durationDays: rxDuration,
              instructions: rxInstructions,
            },
          ],
        }),
      });

      if (res.ok) {
        setRxSuccessMessage('Official digital prescription created and sent to owner!');
        setRxDiagnosis('');
        setRxMedName('');
        setRxStrength('');
        setRxDosage('');
        setRxInstructions('');
        setTimeout(() => setRxSuccessMessage(null), 4000);
      }
    } catch {
      // ignore
    }
  };

  const completedAppts = appointments.filter((a) => a.status === 'COMPLETED');
  const totalEarnings = completedAppts.reduce((acc, curr) => acc + (curr.amountPaid || 45), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=256'}
            alt={profile?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-teal-300 uppercase tracking-widest bg-teal-900/60 px-2 py-0.5 rounded border border-teal-700">
                Verified Doctor Portal
              </span>
              <span className="text-xs text-slate-400">License #{profile?.licenseNumber}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-outfit mt-1">{profile?.name}</h1>
            <p className="text-xs text-slate-300">{profile?.qualification} • {profile?.university}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentTab('schedule')}
            className="bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4" /> Manage Availability
          </button>
        </div>
      </div>

      {/* Doctor Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Today's Consultations</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{appointments.length}</div>
          <div className="text-[11px] text-teal-600 font-medium mt-1">Active patient queue</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Total Animals Treated</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">128</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Dogs, Cats, Equine, Livestock</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Total Clinical Earnings</div>
          <div className="text-2xl font-bold text-teal-700 mt-1">${totalEarnings + 540}.00</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Direct Stripe payouts</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Client Rating</div>
          <div className="text-2xl font-bold text-amber-500 mt-1 flex items-center gap-1">
            <Star className="w-5 h-5 fill-amber-400" />
            <span>4.95</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Based on 128 verified reviews</div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-1 sm:space-x-2 text-xs font-semibold">
        {[
          { id: 'queue', label: "Today's Patient Queue", icon: Video },
          { id: 'schedule', label: 'Availability & Schedule', icon: Calendar },
          { id: 'rx', label: 'Prescription Generator', icon: FileText },
          { id: 'patients', label: 'Patient Medical Records', icon: Heart },
          { id: 'reviews', label: 'Client Reviews', icon: Star },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as any)}
              className={`py-3 px-3.5 border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
                active
                  ? 'border-teal-600 text-teal-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TODAY'S QUEUE */}
      {currentTab === 'queue' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 font-outfit">Consultation Appointments Queue</h2>
            <span className="text-xs font-medium text-slate-500">Live telemedicine rooms ready</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100 text-xs">
            {appointments.map((appt) => (
              <div key={appt.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded uppercase">
                      {appt.consultationType === 'ONLINE_VIDEO' ? 'Telehealth Video' : 'In-Person Visit'}
                    </span>
                    <span className="text-slate-400 font-mono">#{appt.id}</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900">
                    Patient: {appt.animalName} ({appt.appointmentDate} at {appt.timeSlot})
                  </h3>
                  <div className="text-slate-600">
                    <strong>Chief Complaint:</strong> {appt.reason}
                  </div>
                  {appt.symptoms && (
                    <div className="text-slate-500 text-[11px]">
                      <strong>Symptoms & Notes:</strong> {appt.symptoms} (Duration: {appt.symptomDuration})
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  {appt.consultationType === 'ONLINE_VIDEO' && (
                    <button
                      onClick={() => navigate(`/consultation/${appt.id}`)}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
                    >
                      <Video className="w-4 h-4" /> Launch Consultation
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setRxAnimalId(appt.animalId);
                      setCurrentTab('rx');
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl transition"
                  >
                    Write Rx
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: AVAILABILITY & WORKING SCHEDULE */}
      {currentTab === 'schedule' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-outfit">Weekly Consultation Availability</h2>
              <p className="text-slate-500">
                Configure your active working days, clinical hours, and fees. Changes take effect on the booking wizard immediately.
              </p>
            </div>
            {saveScheduleSuccess && (
              <span className="text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Availability Saved!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Online Video Consultation Fee ($)</label>
              <input
                type="number"
                value={consultationFee}
                onChange={(e) => setConsultationFee(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clinic Visit Fee ($)</label>
              <input
                type="number"
                value={clinicVisitFee}
                onChange={(e) => setClinicVisitFee(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Clinic Physical Address (for in-person visits)</label>
              <input
                type="text"
                value={clinicAddress}
                onChange={(e) => setClinicAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                placeholder="e.g. 104 Veterinary Way, Suite 200, Austin, TX"
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Weekly Working Hours</h3>
            <div className="space-y-2">
              {schedule.map((day, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-3 w-32">
                    <input
                      type="checkbox"
                      checked={day.active}
                      onChange={() => handleToggleScheduleDay(idx)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="font-bold text-slate-800">{day.day}</span>
                  </div>

                  {day.active ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => handleUpdateScheduleTimes(idx, 'startTime', e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => handleUpdateScheduleTimes(idx, 'endTime', e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  ) : (
                    <span className="text-slate-400 font-medium">Off Duty</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveSchedule}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Save Schedule & Fees
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: PRESCRIPTION GENERATOR */}
      {currentTab === 'rx' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 text-xs">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 font-outfit">Clinical Prescription Generator</h2>
            <p className="text-slate-500">
              Create and sign legal veterinary digital prescriptions with exact dosages, administration routes, and warnings.
            </p>
          </div>

          {rxSuccessMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{rxSuccessMessage}</span>
            </div>
          )}

          <form onSubmit={handleCreatePrescription} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Patient Animal</label>
                <select
                  value={rxAnimalId}
                  onChange={(e) => setRxAnimalId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-teal-500 focus:outline-none"
                >
                  {animals.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.species} - {a.weightKg} kg)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Diagnosis *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute Otitis Externa, Allergic Dermatitis"
                  value={rxDiagnosis}
                  onChange={(e) => setRxDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medication Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amoxicillin / Clavulanate"
                  value={rxMedName}
                  onChange={(e) => setRxMedName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Strength</label>
                <input
                  type="text"
                  placeholder="e.g. 250 mg tablets"
                  value={rxStrength}
                  onChange={(e) => setRxStrength(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dosage</label>
                <input
                  type="text"
                  placeholder="e.g. 1 tablet"
                  value={rxDosage}
                  onChange={(e) => setRxDosage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Administration Route</label>
                <select
                  value={rxRoute}
                  onChange={(e) => setRxRoute(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-teal-500 focus:outline-none"
                >
                  <option value="Oral">Oral (PO)</option>
                  <option value="Topical">Topical</option>
                  <option value="Ophthalmic">Ophthalmic (Eye drops)</option>
                  <option value="Otic">Otic (Ear drops)</option>
                  <option value="Subcutaneous">Subcutaneous (SC)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Frequency</label>
                <select
                  value={rxFrequency}
                  onChange={(e) => setRxFrequency(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-teal-500 focus:outline-none"
                >
                  <option value="Once daily (SID)">Once daily (SID)</option>
                  <option value="Every 12 hours (BID)">Every 12 hours (BID)</option>
                  <option value="Every 8 hours (TID)">Every 8 hours (TID)</option>
                  <option value="As needed (PRN)">As needed (PRN)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={rxDuration}
                  onChange={(e) => setRxDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Special Precautions / Instructions</label>
              <textarea
                rows={2}
                placeholder="e.g. Administer with food. Complete the full course even if symptoms improve."
                value={rxInstructions}
                onChange={(e) => setRxInstructions(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition"
            >
              Sign & Issue Official Prescription
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: PATIENT RECORDS */}
      {currentTab === 'patients' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 font-outfit">Patient Medical Registry</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {animals.map((a) => (
              <div key={a.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={a.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200'}
                    alt={a.name}
                    className="w-12 h-12 rounded-2xl object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{a.name}</h3>
                    <p className="text-slate-500">{a.species} • {a.breed || 'Mixed'}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-slate-600">
                  <div>Age: <strong>{a.ageYears} yrs</strong></div>
                  <div>Weight: <strong>{a.weightKg} kg</strong></div>
                  <div>Sex: <strong>{a.gender}</strong></div>
                  <div>Neutered: <strong>{a.isNeutered ? 'Yes' : 'No'}</strong></div>
                </div>
                {a.allergies && a.allergies.length > 0 && (
                  <div className="text-[11px] text-red-700 bg-red-50 p-2 rounded-lg">
                    Allergies: {a.allergies.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: REVIEWS */}
      {currentTab === 'reviews' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 text-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 font-outfit">Verified Client Reviews</h2>
            <span className="text-sm font-bold text-amber-500">★ 4.95 / 5.0 Rating</span>
          </div>

          <div className="space-y-4 divide-y divide-slate-100">
            <div className="pt-4 first:pt-0 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Eleanor Vance</span>
                <span className="text-amber-400 font-bold">★★★★★</span>
              </div>
              <p className="text-slate-600">
                Dr. Jenkins was calm, attentive, and quickly diagnosed Max's ear redness over video. The prescription worked within 48 hours!
              </p>
              <span className="text-[10px] text-slate-400">Golden Retriever • Verified Appointment</span>
            </div>

            <div className="pt-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Marcus Wright</span>
                <span className="text-amber-400 font-bold">★★★★★</span>
              </div>
              <p className="text-slate-600">
                Excellent equine advice for my yearling colt with a swollen hock. Saved me an expensive physical emergency haul.
              </p>
              <span className="text-[10px] text-slate-400">Quarter Horse • Verified Appointment</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
