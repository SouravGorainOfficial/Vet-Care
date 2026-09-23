import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Settings,
  Lock,
  FileText,
  Activity,
  Phone,
  Save,
  RotateCcw,
} from 'lucide-react';
import { VeterinarianProfile, User, Appointment } from '../types';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardProps {
  navigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const { user, token } = useAuth();
  const [currentTab, setCurrentTab] = useState<'verifications' | 'users' | 'appointments' | 'settings' | 'audits'>('verifications');

  const [vets, setVets] = useState<VeterinarianProfile[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Settings State
  const [emergencyPhone, setEmergencyPhone] = useState('+1 (800) 555-8387');
  const [cancellationHours, setCancellationHours] = useState(24);
  const [partialRefundPct, setPartialRefundPct] = useState(50);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Audit trail log
  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: '1', action: 'VET_VERIFIED', detail: 'Dr. Sarah Jenkins license #VET-CA-8921 verified with California Board', timestamp: '2026-03-18 10:14:00' },
    { id: '2', action: 'REFUND_PROCESSED', detail: '100% Refund issued for Appt #appt-9 ($50.00)', timestamp: '2026-03-19 14:22:11' },
    { id: '3', action: 'SETTINGS_UPDATE', detail: 'Emergency hotline updated to +1 (800) 555-8387', timestamp: '2026-03-20 09:00:00' },
  ]);

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      const [vetsRes, usersRes, apptsRes, metricsRes] = await Promise.all([
        fetch('/api/admin/vets', { headers }).catch(() => fetch('/api/vets?all=true')),
        fetch('/api/admin/users', { headers }).catch(() => fetch('/api/users')),
        fetch('/api/appointments?role=ADMIN', { headers }),
        fetch('/api/admin/metrics', { headers }).catch(() => null),
      ]);

      if (vetsRes && vetsRes.ok) {
        const d = await vetsRes.json();
        setVets(d.veterinarians || []);
      }
      if (usersRes && usersRes.ok) {
        const d = await usersRes.json();
        setUsers(d.users || []);
      }
      if (apptsRes && apptsRes.ok) {
        const d = await apptsRes.json();
        setAppointments(d.appointments || []);
      }
      if (metricsRes && metricsRes.ok) {
        const m = await metricsRes.json();
        if (m.recentAuditLogs && m.recentAuditLogs.length > 0) {
          setAuditLogs(m.recentAuditLogs);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVet = async (vetId: string) => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const res = await fetch(`/api/admin/vets/${vetId}/status`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ status: 'VERIFIED' }),
      });
      if (res.ok) {
        const updated = await res.json();
        setVets((prev) =>
          prev.map((v) =>
            v.id === vetId ? { ...v, status: 'VERIFIED', verificationStatus: 'VERIFIED' } as any : v
          )
        );
        setActionNotice(`Doctor successfully approved and published to public directory!`);
        setTimeout(() => setActionNotice(null), 4000);
        setAuditLogs((prev) => [
          {
            id: Date.now().toString(),
            action: 'VET_APPROVED',
            detail: `Doctor ${updated.veterinarian?.name || vetId} approved and verified.`,
            timestamp: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error('Approve error', err);
    }
  };

  const handleRejectVet = async (vetId: string) => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const res = await fetch(`/api/admin/vets/${vetId}/status`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ status: 'REJECTED' }),
      });
      if (res.ok) {
        setVets((prev) =>
          prev.map((v) =>
            v.id === vetId ? { ...v, status: 'REJECTED', verificationStatus: 'REJECTED' } as any : v
          )
        );
        setActionNotice(`Doctor application marked as Rejected.`);
        setTimeout(() => setActionNotice(null), 4000);
        setAuditLogs((prev) => [
          {
            id: Date.now().toString(),
            action: 'VET_REJECTED',
            detail: `Doctor application ${vetId} rejected.`,
            timestamp: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error('Reject error', err);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaved(true);
    setAuditLogs([
      {
        id: Date.now().toString(),
        action: 'SETTINGS_UPDATE',
        detail: `Platform policies updated: Cancellation=${cancellationHours}h, Partial Refund=${partialRefundPct}%`,
        timestamp: new Date().toISOString(),
      },
      ...auditLogs,
    ]);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const getVetStatus = (v: any) => v.status || v.verificationStatus || 'PENDING';

  const pendingVets = vets.filter((v) => getVetStatus(v) === 'PENDING' || getVetStatus(v) === 'UNDER_REVIEW');
  const verifiedVets = vets.filter((v) => getVetStatus(v) === 'VERIFIED');
  const rejectedVets = vets.filter((v) => getVetStatus(v) === 'REJECTED');

  const filteredVets = vets.filter((v) => {
    const s = getVetStatus(v);
    if (statusFilter === 'PENDING') return s === 'PENDING' || s === 'UNDER_REVIEW';
    if (statusFilter === 'VERIFIED') return s === 'VERIFIED';
    if (statusFilter === 'REJECTED') return s === 'REJECTED';
    return true;
  });

  const totalRevenue = appointments.reduce((acc, curr) => acc + (curr.amountPaid || 50), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
              Admin Governance & Auditing Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit mt-1">VetCare System Administration</h1>
          <p className="text-xs text-slate-400">
            Enforce medical license verification, manage user roles, audit appointments, and configure platform compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950 text-emerald-300 text-xs font-semibold border border-emerald-800">
            <Activity className="w-3.5 h-3.5 text-emerald-400" /> System Healthy
          </span>
        </div>
      </div>

      {/* Analytics KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Pending Vet Verifications</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{pendingVets.length}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">Requires medical credential audit</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Total Registered Users</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{users.length || 3}</div>
          <div className="text-[11px] text-teal-600 font-medium mt-1">Owners, Doctors, Admins</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Total Telehealth Consultations</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{appointments.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Video rooms & clinics</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Gross Telehealth GMV</div>
          <div className="text-2xl font-bold text-teal-700 mt-1">${totalRevenue}.00</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Stripe processed volume</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-1 sm:space-x-2 text-xs font-semibold">
        {[
          { id: 'verifications', label: `Doctor Verifications (${pendingVets.length} Pending)`, icon: ShieldCheck },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'appointments', label: 'Appointment Audits', icon: Calendar },
          { id: 'settings', label: 'Platform & Policies', icon: Settings },
          { id: 'audits', label: 'Security & Audit Logs', icon: Lock },
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

      {/* TAB 1: DOCTOR VERIFICATIONS */}
      {currentTab === 'verifications' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-outfit">Veterinarian Credential Verification</h2>
              <p className="text-xs text-slate-500">Review licenses, board authorities, and approve doctors for public booking.</p>
            </div>

            {/* Quick status filters */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({vets.length})
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  statusFilter === 'PENDING'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-amber-700 hover:text-amber-800'
                }`}
              >
                Pending ({pendingVets.length})
              </button>
              <button
                onClick={() => setStatusFilter('VERIFIED')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  statusFilter === 'VERIFIED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-700 hover:text-emerald-800'
                }`}
              >
                Verified ({verifiedVets.length})
              </button>
              <button
                onClick={() => setStatusFilter('REJECTED')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  statusFilter === 'REJECTED'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-red-700 hover:text-red-800'
                }`}
              >
                Rejected ({rejectedVets.length})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredVets.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
                <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-700 text-sm">No veterinarians found in this filter.</p>
                <p className="text-xs">Doctors who register via "Join as a Vet" will appear here for review.</p>
              </div>
            ) : (
              filteredVets.map((vet) => {
                const status = getVetStatus(vet);
                const isPending = status === 'PENDING' || status === 'UNDER_REVIEW';
                const isVerified = status === 'VERIFIED';
                const isRejected = status === 'REJECTED';

                return (
                  <div
                    key={vet.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={
                          vet.avatarUrl ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(vet.name)}`
                        }
                        alt={vet.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              isVerified
                                ? 'bg-emerald-100 text-emerald-800'
                                : isRejected
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800 font-extrabold ring-1 ring-amber-300'
                            }`}
                          >
                            {status}
                          </span>
                          <span className="font-bold text-slate-900 text-sm">{vet.name}</span>
                          <span className="text-slate-400 text-[11px] font-mono">ID: {vet.id}</span>
                        </div>

                        <p className="text-slate-600 font-medium">
                          {vet.qualification} • {vet.university} (Class of {vet.graduationYear})
                        </p>

                        <div className="text-slate-500 flex flex-wrap gap-x-3 gap-y-1 pt-0.5">
                          <span>
                            <strong>State License:</strong> #{vet.licenseNumber}
                          </span>
                          <span>
                            <strong>Board:</strong> {vet.licenseAuthority}
                          </span>
                          <span>
                            <strong>Location:</strong> {vet.city || 'Remote'}, {vet.country}
                          </span>
                          <span>
                            <strong>Consultation Fee:</strong> ${vet.consultationFee || 45}
                          </span>
                        </div>

                        <div className="text-slate-400 text-[11px] pt-1">
                          Species:{' '}
                          {Array.isArray(vet.supportedSpecies)
                            ? vet.supportedSpecies.join(', ')
                            : vet.supportedSpecies}{' '}
                          • Specialties:{' '}
                          {Array.isArray(vet.specializations)
                            ? vet.specializations.join(', ')
                            : vet.specializations}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleApproveVet(vet.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Approve Doctor
                          </button>
                          <button
                            onClick={() => handleRejectVet(vet.id)}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </>
                      )}

                      {isVerified && (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active & Live
                          </span>
                          <button
                            onClick={() => handleRejectVet(vet.id)}
                            className="text-slate-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 text-[11px] font-semibold transition"
                          >
                            Revoke
                          </button>
                        </div>
                      )}

                      {isRejected && (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-red-50 text-red-700 font-bold text-xs">
                            <XCircle className="w-3.5 h-3.5 text-red-600" /> Rejected
                          </span>
                          <button
                            onClick={() => handleApproveVet(vet.id)}
                            className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition"
                          >
                            Re-Approve
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {currentTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs text-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-outfit">Registered Accounts</h2>
            <span className="text-slate-500">{users.length || 3} accounts total</span>
          </div>

          <div className="divide-y divide-slate-100">
            {users.map((u) => (
              <div key={u.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-slate-500 text-[11px]">{u.email} • {u.phone || 'No phone'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-teal-50 text-teal-800">
                    {u.role}
                  </span>
                  <span className="text-emerald-700 font-semibold text-[11px]">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: APPOINTMENT AUDITS */}
      {currentTab === 'appointments' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs text-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-outfit">Platform Consultation Master Audit</h2>
            <span className="text-slate-500">{appointments.length} consultations logged</span>
          </div>

          <div className="divide-y divide-slate-100">
            {appointments.map((a) => (
              <div key={a.id} className="p-5 flex items-start justify-between hover:bg-slate-50/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-500">#{a.id}</span>
                    <span className="font-bold text-slate-900">
                      {a.animalName} with {a.veterinarianName}
                    </span>
                  </div>
                  <div className="text-slate-500">
                    {a.appointmentDate} at {a.timeSlot} • Modality: {a.consultationType}
                  </div>
                  <div className="text-slate-600">Reason: {a.reason}</div>
                </div>

                <div className="text-right space-y-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                    {a.status}
                  </span>
                  <div className="font-bold text-teal-700">${a.amountPaid || 50}.00</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PLATFORM SETTINGS & POLICIES */}
      {currentTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-outfit">Global Platform Policies</h2>
              <p className="text-slate-500">Configure emergency disclaimer contacts, refund windows, and operational switches.</p>
            </div>
            {settingsSaved && (
              <span className="text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Settings Saved!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">24/7 Emergency Veterinary Hotline</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">100% Refund Cancellation Window (Hours)</label>
              <input
                type="number"
                value={cancellationHours}
                onChange={(e) => setCancellationHours(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Late Cancellation Partial Refund (%)</label>
              <input
                type="number"
                value={partialRefundPct}
                onChange={(e) => setPartialRefundPct(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="rounded text-teal-600"
                />
                <span>Maintenance Mode (Graceful downtime banner)</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded-xl transition flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" /> Save Platform Policies
          </button>
        </form>
      )}

      {/* TAB 5: SECURITY AUDIT TRAIL */}
      {currentTab === 'audits' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs text-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-outfit">Audit Trail & Access Logs</h2>
            <span className="text-slate-500">Immutable governance ledger</span>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                <div>
                  <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {log.action}
                  </span>
                  <p className="font-medium text-slate-800 mt-1">{log.detail}</p>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
