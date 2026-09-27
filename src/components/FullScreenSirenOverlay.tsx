import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Navigation, 
  PhoneCall, 
  ShieldAlert, 
  Radio, 
  CheckCircle2,
  X
} from 'lucide-react';
import { INITIAL_RELIEF_CAMPS } from '../data/mockNerData';

interface FullScreenSirenOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCamp: () => void;
}

export const FullScreenSirenOverlay: React.FC<FullScreenSirenOverlayProps> = ({
  isOpen,
  onClose,
  onNavigateToCamp,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  if (!isOpen) return null;

  const nearestCamp = INITIAL_RELIEF_CAMPS[0];

  const handleSendSos = () => {
    setSosSent(true);
    setTimeout(() => {
      // simulated SOS transmission to SDRF
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-rose-950/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      {/* Flashing Ambient Background */}
      <div className="absolute inset-0 bg-red-600/20 animate-pulse pointer-events-none" />

      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-rose-500 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-rose-900/50 space-y-6 text-center">
        {/* Top Dismiss & Audio controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-bold font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span>TIER-1 CRITICAL SIREN ACTIVE</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hazard Alarm Emblem */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-600/50 border-4 border-rose-400">
          <AlertTriangle className="w-10 h-10 text-white animate-bounce" />
        </div>

        {/* Warning Title & Guidance */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            Catastrophic Slope Failure / Flash Surge
          </h2>
          <p className="text-sm text-rose-200 max-w-md mx-auto leading-relaxed">
            Immediate threat to life in East Jaintia Hills / NH-06 Sonapur corridor. Evacuate roadside settlements and proceed to elevated ridge ground immediately!
          </p>
        </div>

        {/* Nearest Shelter Card */}
        <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 text-left space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Nearest Elevated Safe Shelter
            </span>
            <span className="font-mono text-slate-400">Dist: 14.8 km</span>
          </div>
          <h4 className="font-bold text-base text-white">
            {nearestCamp.name}
          </h4>
          <p className="text-xs text-slate-400">
            {nearestCamp.location} • Radio Frequency: <strong className="text-amber-300 font-mono">{nearestCamp.radioFrequencyMhz}</strong>
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => {
              onClose();
              onNavigateToCamp();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm tracking-wide uppercase shadow-lg shadow-emerald-700/40 flex items-center justify-center gap-2.5 transition active:scale-98"
          >
            <Navigation className="w-5 h-5" />
            <span>Navigate to Safe Ridge Shelter Now</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSendSos}
              disabled={sosSent}
              className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition ${
                sosSent
                  ? 'bg-rose-900/40 border-rose-800 text-rose-300'
                  : 'bg-rose-700 hover:bg-rose-600 border-rose-500 text-white'
              }`}
            >
              {sosSent ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Radio className="w-4 h-4" />}
              <span>{sosSent ? 'SOS Dispatched to SDRF' : 'Broadcast Live GPS SOS'}</span>
            </button>

            <a
              href="tel:1077"
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-xs text-slate-200 flex items-center justify-center gap-2 transition"
            >
              <PhoneCall className="w-4 h-4 text-amber-400" />
              <span>Call State Control 1077</span>
            </a>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          Audio synthesis alert designed for extreme mountain environments when cellular networks are disrupted.
        </div>
      </div>
    </div>
  );
};
