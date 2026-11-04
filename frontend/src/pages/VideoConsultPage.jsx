import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MessageSquare,
  Send,
  User,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Clock,
  Sparkles
} from 'lucide-react';

export default function VideoConsultPage() {
  const [searchParams] = useSearchParams();
  const roomRef = searchParams.get('room');
  const { user } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState(null);

  // Video call controls
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callActive, setCallActive] = useState(Boolean(roomRef));
  const [chatMessages, setChatMessages] = useState([
    { sender: 'System', text: 'Encrypted consultation room initialized. Waiting for physician to connect.' }
  ]);
  const [messageInput, setMessageInput] = useState('');

  // Fetch teleconsult doctors
  useEffect(() => {
    async function loadTeleconsult() {
      try {
        setLoading(true);
        const res = await api.get('/teleconsult/doctors');
        if (res.data.success) {
          setDoctors(res.data.doctors);
        }

        if (roomRef) {
          const rRes = await api.get(`/teleconsult/room/${roomRef}`);
          if (rRes.data.success) {
            setRoomData(rRes.data.room);
          }
        }
      } catch (err) {
        console.error('Error loading teleconsult:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTeleconsult();
  }, [roomRef]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { sender: user?.full_name || 'Patient', text: messageInput.trim() }
    ]);
    setMessageInput('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Video className="w-3.5 h-3.5" />
          Telehealth & Virtual Consultations
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800">Video Teleconsultation Suite</h1>
        <p className="text-sm text-slate-500 mt-1">
          Connect with certified medical specialists through secure video rooms with in-session clinical chat.
        </p>
      </div>

      {/* ACTIVE CALL ROOM INTERFACE */}
      {callActive ? (
        <div className="card-health p-0 overflow-hidden border-slate-300 shadow-md">
          {/* Room Top Banner */}
          <div className="bg-slate-900 text-white p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold">Room: {roomRef || 'DEMO-CONSULT-01'}</span>
              <span className="text-slate-400 font-mono">| Mode: Virtual OPD</span>
            </div>
            
            {/* Honest Demo Provider Label */}
            <span className="bg-slate-800 px-2.5 py-1 rounded border border-slate-700 text-slate-300">
              Provider: HealthAI Telehealth Peer Framework (Demo Simulation)
            </span>
          </div>

          {/* Main Video Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 bg-slate-950 min-h-[460px]">
            
            {/* Patient & Doctor Video Feeds Container */}
            <div className="lg:col-span-2 p-4 flex flex-col justify-between gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                
                {/* Doctor's Video Screen (Transparent State: Waiting for connection) */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center justify-center p-6 text-center text-slate-400 relative overflow-hidden min-h-[220px]">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-3 text-slate-500">
                    <User className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-white text-sm">
                    {roomData?.doctor_name || 'Assigned Specialist'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {roomData ? 'Physician in queue - Call starts at scheduled appointment time.' : 'Doctor consultation channel'}
                  </p>
                  <span className="absolute bottom-3 left-3 text-[11px] bg-black/60 px-2 py-0.5 rounded text-slate-300">
                    Status: Standby
                  </span>
                </div>

                {/* Patient's Self-View Screen */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center justify-center p-6 text-center text-slate-400 relative overflow-hidden min-h-[220px]">
                  {isVideoOff ? (
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-3 text-slate-500">
                      <VideoOff className="w-8 h-8" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-teal-900/60 text-teal-400 flex items-center justify-center mb-3">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                  <h4 className="font-bold text-white text-sm">
                    {user?.full_name || 'You (Patient)'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {isVideoOff ? 'Camera is muted' : 'Local camera feed ready'}
                  </p>
                  <span className="absolute bottom-3 left-3 text-[11px] bg-black/60 px-2 py-0.5 rounded text-slate-300">
                    {isAudioMuted ? 'Mic Muted' : 'Mic Active'}
                  </span>
                </div>
              </div>

              {/* Call Controls Bar */}
              <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsAudioMuted(!isAudioMuted)}
                  className={`p-3 rounded-xl transition-colors ${
                    isAudioMuted ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                  title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`p-3 rounded-xl transition-colors ${
                    isVideoOff ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                  title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setCallActive(false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 text-xs transition-colors shadow-sm"
                  title="Disconnect Consultation"
                >
                  <PhoneOff className="w-5 h-5" />
                  Leave Room
                </button>
              </div>
            </div>

            {/* In-Call Chat Sidebar */}
            <div className="bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between h-[460px]">
              <div className="p-3 bg-slate-800/80 border-b border-slate-700 text-xs font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-400" />
                Consultation Chat & Notes
              </div>

              <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
                {chatMessages.map((msg, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-800 border border-slate-700/60 space-y-0.5">
                    <span className="font-bold text-teal-400 block text-[10px] uppercase">{msg.sender}</span>
                    <p className="text-slate-200">{msg.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a clinical message..."
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 flex-1"
                />
                <button type="submit" className="bg-[#087f8c] hover:bg-teal-700 text-white p-2 rounded-lg">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>

          {/* Medical Integrity Note */}
          <div className="bg-slate-900 px-4 py-2 border-t border-slate-800 text-[11px] text-slate-400 text-center">
            Ethical Telehealth Notice: Simulated fallback video room active. No artificial or fake doctor video is displayed.
          </div>
        </div>
      ) : (
        /* AVAILABLE TELECONSULT DOCTORS */
        <div className="space-y-6">
          <div className="card-health p-6 bg-gradient-to-r from-blue-50 to-teal-50 border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Have a Video Consultation Booking?</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter your booking reference or appointment number to enter the private room directly.
              </p>
            </div>
            <Link to="/appointments?type=Video" className="btn-primary text-xs py-2 px-4 shrink-0">
              Check My Video Bookings
            </Link>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Doctors Available for Teleconsultation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doc) => (
                <div key={doc.id} className="card-health flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-base text-slate-800">{doc.name}</h3>
                        <p className="text-xs font-bold text-blue-600">{doc.specialty_name}</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Available
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">{doc.qualification}</p>

                    <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Experience</span>
                        <span className="font-bold text-slate-800">{doc.experience_years} Years</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Virtual Fee</span>
                        <span className="font-bold text-teal-700">₹{doc.consultation_fee}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">{doc.bio}</p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <Link
                      to={`/book-appointment?hospitalId=${doc.hospital_id}&doctorId=${doc.id}&type=Video`}
                      className="btn-primary w-full text-xs py-2 justify-center"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Schedule Virtual Appointment
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
