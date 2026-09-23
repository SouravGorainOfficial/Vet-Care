import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Share2,
  ShieldCheck,
  Clock,
  Heart,
  FileText,
  Send,
  Upload,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  User,
  Paperclip,
  Image as ImageIcon,
  X,
  Sparkles,
  ChevronRight,
  Stethoscope,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Appointment, Animal, ConsultationMessage } from '../types';

interface ConsultationRoomProps {
  appointmentId: string;
  navigate: (path: string) => void;
}

export const ConsultationRoom: React.FC<ConsultationRoomProps> = ({
  appointmentId,
  navigate,
}) => {
  const { user, token } = useAuth();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);

  // Audio/Video Hardware State
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [callEnded, setCallEnded] = useState(false);
  const [showEndCallModal, setShowEndCallModal] = useState(false);
  const [endingCall, setEndingCall] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ConsultationMessage[]>([
    {
      id: 'm1',
      appointmentId,
      senderId: 'vet-1',
      senderName: 'Dr. Sarah Jenkins',
      senderRole: 'VETERINARIAN',
      text: 'Hello! I can see the video feed clearly. Could you please position the camera towards the animal’s right ear?',
      content: 'Hello! I can see the video feed clearly. Could you please position the camera towards the animal’s right ear?',
      createdAt: new Date(Date.now() - 120000).toISOString(),
      timestamp: new Date(Date.now() - 120000).toISOString(),
    },
    {
      id: 'm2',
      appointmentId,
      senderId: 'owner-1',
      senderName: 'Eleanor Vance',
      senderRole: 'USER',
      text: 'Yes doctor, he has been scratching it continuously since yesterday morning.',
      content: 'Yes doctor, he has been scratching it continuously since yesterday morning.',
      createdAt: new Date(Date.now() - 60000).toISOString(),
      timestamp: new Date(Date.now() - 60000).toISOString(),
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<{
    url: string;
    name: string;
    type: 'image' | 'document';
  } | null>(null);

  // Doctor in-call clinical note
  const [clinicalNote, setClinicalNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  // Video stream refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchConsultationData();
    initMediaStream();

    // Call timer interval
    const timer = setInterval(() => {
      setCallDurationSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [appointmentId, token]);

  // Polling for incoming chat messages every 2.5 seconds
  useEffect(() => {
    if (callEnded) return;

    const pollInterval = setInterval(() => {
      pollMessages();
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [appointmentId, token, callEnded]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConsultationData = async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/consultations/${appointmentId}`, { headers });
      if (res.ok) {
        const d = await res.json();
        if (d.appointment) setAppointment(d.appointment);
        if (d.animal) setAnimal(d.animal);
        if (d.messages && Array.isArray(d.messages) && d.messages.length > 0) {
          setMessages(d.messages);
        }
        if (d.clinicalNotes) {
          setClinicalNote(
            d.clinicalNotes.assessment ||
              d.clinicalNotes.examinationFindings ||
              d.clinicalNotes.treatmentPlan ||
              ''
          );
        }
      } else {
        // Fallback: direct appointment fetch
        const apptRes = await fetch(`/api/appointments/${appointmentId}`, { headers });
        if (apptRes.ok) {
          const apptData = await apptRes.json();
          setAppointment(apptData.appointment);
          if (apptData.appointment?.animalId) {
            const animRes = await fetch(`/api/animals/${apptData.appointment.animalId}`, { headers });
            if (animRes.ok) {
              const animData = await animRes.json();
              setAnimal(animData.animal);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching consultation room data:', err);
    } finally {
      setLoading(false);
    }
  };

  const pollMessages = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/consultations/${appointmentId}`, { headers });
      if (res.ok) {
        const d = await res.json();
        if (d.messages && Array.isArray(d.messages) && d.messages.length > 0) {
          setMessages(d.messages);
        }
      }
    } catch {
      // Silent polling catch
    }
  };

  const initMediaStream = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }
    } catch {
      // Permission not granted or running in iframe without hardware access:
      // Gracefully handled with visual avatar & simulated camera preview
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    }
    setVideoEnabled(!videoEnabled);
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    }
    setAudioEnabled(!audioEnabled);
  };

  const handleSendMessage = async (e?: React.FormEvent, directText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (directText !== undefined ? directText : newMessage).trim();
    if (!textToSend && !attachmentPreview) return;

    const senderRole = user?.role || (appointment?.ownerId === user?.id ? 'USER' : 'USER');
    const senderName = user?.name || (senderRole === 'VETERINARIAN' ? 'Dr. Veterinarian' : 'Pet Guardian');
    const nowIso = new Date().toISOString();

    const optimisticMsg: ConsultationMessage = {
      id: 'local-' + Date.now(),
      appointmentId,
      senderId: user?.id || 'guest',
      senderName,
      senderRole,
      text: textToSend,
      content: textToSend,
      attachmentUrl: attachmentPreview?.url,
      attachmentName: attachmentPreview?.name,
      attachmentType: attachmentPreview?.type || 'image',
      timestamp: nowIso,
      createdAt: nowIso,
    };

    // Instant optimistic update
    setMessages((prev) => [...prev, optimisticMsg]);
    if (!directText) setNewMessage('');
    const currentAttachment = attachmentPreview;
    setAttachmentPreview(null);

    try {
      setSendingMessage(true);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/consultations/${appointmentId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text: textToSend,
          content: textToSend,
          attachmentUrl: currentAttachment?.url,
          attachmentName: currentAttachment?.name,
          attachmentType: currentAttachment?.type || 'image',
        }),
      });

      if (res.ok) {
        const d = await res.json();
        if (d.message) {
          setMessages((prev) =>
            prev.map((m) => (m.id === optimisticMsg.id ? d.message : m))
          );
        }
        // Poll quickly after 1.5s to receive doctor's response
        setTimeout(pollMessages, 1600);
      }
    } catch (err) {
      console.error('Failed to post message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const isImg = file.type.startsWith('image/');
      setAttachmentPreview({
        url: reader.result as string,
        name: file.name,
        type: isImg ? 'image' : 'document',
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const selectSampleAttachment = (type: 'ear' | 'report') => {
    if (type === 'ear') {
      setAttachmentPreview({
        url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400',
        name: 'Pet_Ear_Inspection_Photo.jpg',
        type: 'image',
      });
    } else {
      setAttachmentPreview({
        url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400',
        name: 'Diagnostic_Lab_Report.pdf',
        type: 'document',
      });
    }
  };

  const handleEndCallClick = () => {
    setShowEndCallModal(true);
  };

  const confirmEndCall = async () => {
    try {
      setEndingCall(true);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`/api/consultations/${appointmentId}/end`, {
        method: 'POST',
        headers,
      });
    } catch (err) {
      console.error('Failed to end call on backend:', err);
    } finally {
      setEndingCall(false);
      setShowEndCallModal(false);
      setCallEnded(true);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Quick suggestion prompts for 1-tap testing
  const quickPrompts = [
    '🐾 The redness is right inside the ear canal',
    '💊 Taking 1 tablet of allergy medicine daily',
    '🥣 Eating and drinking normally today',
    '📋 Please issue a digital prescription',
  ];

  // Screen when consultation has ended
  if (callEnded) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white font-outfit">Consultation Concluded</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your live video session with <strong>{appointment?.vetName || appointment?.veterinarianName || 'Dr. Sarah Jenkins'}</strong> has ended.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 text-left space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Patient Animal:</span>
              <strong className="text-slate-100">{appointment?.animalName || animal?.name || 'Max'}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Session Duration:</span>
              <strong className="text-teal-400 font-mono">{formatTimer(callDurationSeconds)}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Consultation Type:</span>
              <span className="text-slate-200">Encrypted Telehealth</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Status:</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[11px] font-bold border border-emerald-800">
                Completed & Filed
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              id="return-to-dashboard-btn"
              onClick={() => navigate('/dashboard')}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3.5 rounded-xl transition shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2"
            >
              <span>Go to My Dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              id="view-prescriptions-btn"
              onClick={() => navigate('/dashboard')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-3 rounded-xl border border-slate-700 transition"
            >
              View Prescriptions & Medical Passport
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full text-slate-400 hover:text-slate-200 text-xs py-1.5 transition"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col relative overflow-hidden">
      {/* TOP TELEMEDICINE BAR */}
      <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md">
            <Heart className="w-5 h-5 fill-teal-100 text-teal-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-100">
                {appointment?.animalName || animal?.name || 'Pet'} Telemedicine Consultation
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Veterinarian: <strong>{appointment?.vetName || appointment?.veterinarianName || 'Dr. Sarah Jenkins'}</strong> • Patient: <strong>{appointment?.animalName || animal?.name || 'Max'}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-full text-xs font-mono text-slate-200 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>{formatTimer(callDurationSeconds)}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted WebRTC</span>
          </div>

          {/* Quick Header Leave Call Button */}
          <button
            id="header-leave-call-btn"
            onClick={handleEndCallClick}
            className="flex items-center gap-1.5 bg-red-950/70 hover:bg-red-900 border border-red-800/80 text-red-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition"
            title="End Consultation"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">End Call</span>
          </button>
        </div>
      </header>

      {/* MAIN 3-COLUMN TELEMEDICINE WORKSPACE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT COLUMN: Patient Animal Passport & Medical Context */}
        <div className="lg:col-span-3 bg-slate-900/90 border-r border-slate-800 p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <img
              src={animal?.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200'}
              alt={animal?.name || 'Pet'}
              className="w-13 h-13 rounded-2xl object-cover border border-slate-700 shadow-md"
            />
            <div>
              <h3 className="font-bold text-sm text-slate-100">{animal?.name || appointment?.animalName || 'Max'}</h3>
              <p className="text-slate-400 text-[11px]">{animal?.species || 'Dog'} • {animal?.breed || 'Golden Retriever'}</p>
              <span className="inline-block mt-1 text-[10px] font-bold text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded-md border border-teal-800">
                {animal?.sex || animal?.gender || 'MALE'} • {animal?.ageYears || 4} Years • {animal?.weightKg || 31.4} kg
              </span>
            </div>
          </div>

          {/* Clinical Reason */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
              <span>Consultation Purpose</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/70 text-slate-200 font-medium">
              {appointment?.reason || 'Routine skin follow-up & ear irritation'}
            </div>
          </div>

          {/* Symptoms Checklist */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-teal-400">Reported Symptoms</div>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-slate-300 leading-relaxed">
              {Array.isArray(appointment?.symptoms)
                ? appointment.symptoms.join(', ')
                : appointment?.symptoms || 'Head shaking, Scratching left ear, Mild redness on paws'}
            </div>
          </div>

          {/* Allergies & Alerts */}
          <div className="bg-red-950/50 border border-red-800/70 rounded-xl p-3 text-red-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-xs text-red-300">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              <span>Allergy Alerts</span>
            </div>
            <p className="text-[11px] text-red-200/90">
              {animal?.allergies && animal.allergies.length > 0
                ? animal.allergies.join(', ')
                : 'Beef protein, Chicken meal'}
            </p>
          </div>

          {/* Immunization Status */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-teal-400">Vaccine Records</div>
            <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-200">Rabies 3-Year Vaccine</span>
              <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">Valid</span>
            </div>
            <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-200">Canine DHPP Viral</span>
              <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">Active</span>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Interactive Video Stream with Picture-in-Picture */}
        <div className="lg:col-span-6 bg-slate-950 flex flex-col justify-between p-3 sm:p-5 relative">
          {/* Main Video Screen (Veterinary Doctor Feed) */}
          <div className="flex-1 bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 relative flex items-center justify-center shadow-2xl min-h-[300px]">
            {/* Primary Doctor video simulation / stream */}
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
              <img
                src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=1200"
                alt="Veterinarian video stream"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40"></div>
            </div>

            {/* Top Doctor Badge */}
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700 text-xs font-semibold flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-100">{appointment?.vetName || appointment?.veterinarianName || 'Dr. Sarah Jenkins'}</span>
              <span className="text-[10px] text-teal-400 bg-teal-950 px-1.5 py-0.2 rounded border border-teal-800">Veterinarian</span>
            </div>

            {/* Local Video Picture-in-Picture (Patient Animal & Guardian) */}
            <div className="absolute bottom-4 right-4 w-36 sm:w-52 aspect-video bg-slate-950 rounded-2xl overflow-hidden border-2 border-teal-500 shadow-2xl z-10">
              {videoEnabled ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 text-xs p-2 text-center">
                  <VideoOff className="w-5 h-5 mb-1 text-slate-500" />
                  <span className="text-[10px]">Camera Paused</span>
                </div>
              )}
              <div className="absolute bottom-1.5 left-2 text-[10px] font-bold text-white bg-slate-950/70 px-2 py-0.5 rounded-md backdrop-blur-sm">
                You & {animal?.name || appointment?.animalName || 'Pet'}
              </div>
            </div>
          </div>

          {/* VIDEO CONTROL TOOLBAR */}
          <div className="h-20 flex items-center justify-center gap-3 sm:gap-4 mt-3 shrink-0">
            {/* Audio Mute/Unmute */}
            <button
              id="call-mic-toggle-btn"
              onClick={toggleAudio}
              className={`p-3.5 sm:p-4 rounded-2xl border transition shadow-md flex items-center justify-center ${
                audioEnabled
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                  : 'bg-red-600 hover:bg-red-700 text-white border-red-600 animate-pulse'
              }`}
              title={audioEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            {/* Video On/Off */}
            <button
              id="call-video-toggle-btn"
              onClick={toggleVideo}
              className={`p-3.5 sm:p-4 rounded-2xl border transition shadow-md flex items-center justify-center ${
                videoEnabled
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                  : 'bg-red-600 hover:bg-red-700 text-white border-red-600'
              }`}
              title={videoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            {/* Screen Share */}
            <button
              id="call-screen-share-btn"
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`p-3.5 sm:p-4 rounded-2xl border transition shadow-md flex items-center justify-center ${
                isScreenSharing
                  ? 'bg-teal-600 text-white border-teal-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
              }`}
              title="Share Screen"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* END CONSULTATION BUTTON */}
            <button
              id="call-end-consultation-btn"
              onClick={handleEndCallClick}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3.5 rounded-2xl transition flex items-center gap-2.5 shadow-lg shadow-red-600/30 text-xs sm:text-sm active:scale-95 cursor-pointer"
              title="End Consultation"
            >
              <PhoneOff className="w-5 h-5" />
              <span>End Consultation</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Chat & In-Call Clinical Records */}
        <div className="lg:col-span-3 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-hidden text-xs">
          {/* Chat Header */}
          <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
            <span className="font-bold text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-400" />
              <span>Consultation Chat & Files</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
              Active Stream
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-slate-950/40">
            {messages.map((msg, index) => {
              const textContent = msg.text || msg.content || '';
              const timeStr = msg.timestamp || msg.createdAt || new Date().toISOString();
              const isMe =
                msg.senderId === user?.id ||
                (user?.role === 'VETERINARIAN' && msg.senderRole === 'VETERINARIAN') ||
                (user?.role === 'USER' && msg.senderRole === 'USER');

              return (
                <div
                  key={msg.id || index}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-300">{msg.senderName}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        msg.senderRole === 'VETERINARIAN'
                          ? 'bg-teal-950 text-teal-300 border border-teal-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {msg.senderRole === 'VETERINARIAN' ? 'Doctor' : 'Pet Owner'}
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-2xl max-w-[88%] leading-relaxed shadow-sm ${
                      isMe
                        ? 'bg-teal-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
                    }`}
                  >
                    {textContent && <p className="text-xs">{textContent}</p>}

                    {/* Image Attachment Preview */}
                    {msg.attachmentUrl && msg.attachmentType === 'image' && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-white/20">
                        <img
                          src={msg.attachmentUrl}
                          alt={msg.attachmentName || 'Attachment'}
                          className="w-full max-h-40 object-cover rounded-lg"
                        />
                        {msg.attachmentName && (
                          <div className="text-[10px] bg-black/40 p-1 truncate text-slate-200">
                            📎 {msg.attachmentName}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Document Attachment Preview */}
                    {msg.attachmentUrl && msg.attachmentType === 'document' && (
                      <div className="mt-2 p-2 bg-black/20 rounded-xl flex items-center gap-2 border border-white/20">
                        <FileText className="w-4 h-4 text-teal-200 shrink-0" />
                        <span className="text-[11px] truncate text-white">{msg.attachmentName || 'Medical Report.pdf'}</span>
                      </div>
                    )}
                  </div>

                  <span className="text-[9px] text-slate-500 mt-1">
                    {new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="p-2 border-t border-slate-800/80 bg-slate-900/90 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none shrink-0">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(undefined, prompt)}
                className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 shrink-0 transition"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Attachment Preview Banner if Selected */}
          {attachmentPreview && (
            <div className="p-2 bg-slate-800/90 border-t border-slate-700 flex items-center justify-between text-xs text-teal-300">
              <div className="flex items-center gap-2 truncate">
                {attachmentPreview.type === 'image' ? (
                  <ImageIcon className="w-4 h-4 shrink-0 text-teal-400" />
                ) : (
                  <FileText className="w-4 h-4 shrink-0 text-teal-400" />
                )}
                <span className="truncate">{attachmentPreview.name}</span>
              </div>
              <button
                onClick={() => setAttachmentPreview(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => handleSendMessage(e)}
            className="p-3 border-t border-slate-800 bg-slate-950/80 shrink-0 flex items-center gap-2"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf"
            />

            {/* Attach button */}
            <button
              type="button"
              id="chat-attach-btn"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-teal-400 hover:bg-slate-800 rounded-xl transition shrink-0"
              title="Upload photo or document"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Quick sample photo button */}
            <button
              type="button"
              onClick={() => selectSampleAttachment('ear')}
              className="p-2 text-slate-400 hover:text-teal-400 hover:bg-slate-800 rounded-xl transition shrink-0 hidden sm:block"
              title="Attach sample ear examination photo"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            <input
              id="consultation-chat-input"
              type="text"
              placeholder="Type message to doctor..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition"
            />

            <button
              id="consultation-chat-send-btn"
              type="submit"
              disabled={(!newMessage.trim() && !attachmentPreview) || sendingMessage}
              className="p-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:hover:bg-teal-600 text-white rounded-xl transition shrink-0 shadow-sm"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Doctor Live Clinical Notes Area (Visible when user is Veterinarian) */}
          {user?.role === 'VETERINARIAN' && (
            <div className="p-3 border-t border-slate-800 bg-slate-950/90 space-y-2 shrink-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-400 text-[11px] flex items-center gap-1.5">
                  <FileText className="w-3 h-3" /> Doctor Clinical Notes
                </span>
                {noteSaved && <span className="text-emerald-400 text-[10px] font-bold">✓ Filed to Chart</span>}
              </div>
              <textarea
                rows={2}
                value={clinicalNote}
                onChange={(e) => setClinicalNote(e.target.value)}
                placeholder="Diagnosis, otoscopic findings, prescription plan..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
              <button
                type="button"
                onClick={() => {
                  setNoteSaved(true);
                  setTimeout(() => setNoteSaved(false), 3000);
                }}
                className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-xs transition"
              >
                Save Clinical Note
              </button>
            </div>
          )}
        </div>
      </div>

      {/* END CONSULTATION CONFIRMATION MODAL (Replaces blocked window.confirm) */}
      {showEndCallModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-inner">
              <PhoneOff className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white font-outfit">End Consultation Session?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to end this live telemedicine call with{' '}
                <strong>{appointment?.vetName || appointment?.veterinarianName || 'the doctor'}</strong>?
              </p>
              <div className="bg-slate-800/80 p-2.5 rounded-xl text-[11px] text-slate-300">
                Call Duration: <span className="font-mono font-bold text-teal-400">{formatTimer(callDurationSeconds)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                id="confirm-end-call-btn"
                disabled={endingCall}
                onClick={confirmEndCall}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                {endingCall ? (
                  <span>Ending Session...</span>
                ) : (
                  <>
                    <PhoneOff className="w-4 h-4" />
                    <span>Yes, End Consultation</span>
                  </>
                )}
              </button>

              <button
                id="cancel-end-call-btn"
                disabled={endingCall}
                onClick={() => setShowEndCallModal(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2.5 rounded-xl border border-slate-700 transition"
              >
                Continue Consultation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
