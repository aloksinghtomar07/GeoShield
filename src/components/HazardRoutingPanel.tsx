import React, { useState } from 'react';
import { RoadSegment, ReliefCamp } from '../types';
import { 
  Navigation, 
  AlertTriangle, 
  CheckCircle2, 
  WifiOff, 
  Compass, 
  Radio, 
  MapPin, 
  ShieldCheck, 
  ArrowRight,
  Clock,
  Layers,
  Phone,
  HardDrive
} from 'lucide-react';

interface HazardRoutingPanelProps {
  roads: RoadSegment[];
  reliefCamps: ReliefCamp[];
  isOfflineMode: boolean;
  onToggleOffline: () => void;
  onTriggerSiren: () => void;
}

export const HazardRoutingPanel: React.FC<HazardRoutingPanelProps> = ({
  roads,
  reliefCamps,
  isOfflineMode,
  onToggleOffline,
  onTriggerSiren
}) => {
  const [origin, setOrigin] = useState<string>('Sonapur Bazar (NH-06 Corridor)');
  const [destinationCampId, setDestinationCampId] = useState<string>(reliefCamps[0]?.id || 'camp-01');
  const [vehicleType, setVehicleType] = useState<'suv' | 'ambulance' | 'heavy_truck'>('ambulance');

  const selectedCamp = reliefCamps.find(c => c.id === destinationCampId) || reliefCamps[0];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Navigation className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Hazard-Aware Evacuation Routing & Safe Corridors
            </h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Dynamic safe path calculation penalizing roads submerged &gt;30cm or blocked by active slope failure.
          </p>
        </div>

        {/* Offline Vector Mode Status Card */}
        <div className={`p-3.5 rounded-xl border flex items-center gap-3 transition ${
          isOfflineMode 
            ? 'bg-amber-50 border-amber-300 text-amber-950' 
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <div className={`p-2 rounded-lg ${isOfflineMode ? 'bg-amber-200 text-amber-800' : 'bg-slate-200 text-slate-700'}`}>
            <HardDrive className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="font-bold flex items-center gap-1.5">
              <span>{isOfflineMode ? 'Local Vector Database Active' : 'Live Cloud pgRouting Engine'}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-mono bg-white border border-slate-300">
                {isOfflineMode ? 'Offline SQLite' : 'Online'}
              </span>
            </div>
            <p className="text-slate-500 text-[11px]">
              {isOfflineMode ? 'Routing from cached offline topo vector pack (14.2 MB)' : 'Real-time telemetry and bridge gauges enabled'}
            </p>
          </div>
          <button
            onClick={onToggleOffline}
            className="px-2.5 py-1 text-xs font-semibold rounded bg-white border border-slate-300 shadow-xs hover:bg-slate-50 ml-2"
          >
            {isOfflineMode ? 'Go Online' : 'Simulate Offline'}
          </button>
        </div>
      </div>

      {/* Corridor Planner Form & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Route Parameters (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider text-xs">
            Evacuation Route Parameters
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Current Location / Stranded Point:
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-rose-500" />
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Sonapur Bazar (NH-06 Corridor)">Sonapur Bazar (NH-06 East Jaintia)</option>
                  <option value="Haflong Hill Cut (Dima Hasao)">Haflong Hill Cut (Dima Hasao)</option>
                  <option value="Dzongu Valley (North Sikkim)">Dzongu Valley (North Sikkim)</option>
                  <option value="Kohima Zubza Bypass (Nagaland)">Kohima Zubza Bypass (Nagaland)</option>
                  <option value="Guwahati Noonmati Escarpment">Guwahati Noonmati Escarpment</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Destination Relief Camp / Shelter:
              </label>
              <select
                value={destinationCampId}
                onChange={(e) => setDestinationCampId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
              >
                {reliefCamps.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {camp.name} ({camp.capacity - camp.currentOccupancy} beds free)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Vehicle Clearance / Mission Profile:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'ambulance', label: 'Ambulance / Rescue' },
                  { id: 'suv', label: 'Light 4x4' },
                  { id: 'heavy_truck', label: 'Heavy Relief Truck' },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVehicleType(v.id as any)}
                    className={`py-1.5 px-2 rounded-lg text-center font-medium border transition ${
                      vehicleType === v.id
                        ? 'bg-blue-50 border-blue-500 text-blue-800 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Destination Shelter Telemetry */}
          {selectedCamp && (
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-2">
              <div className="font-bold flex items-center justify-between">
                <span>Shelter Status: Verified Open</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono">
                  {selectedCamp.capacity - selectedCamp.currentOccupancy} Available
                </span>
              </div>
              <p className="text-[11px] text-slate-600">{selectedCamp.location}</p>
              
              <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between font-mono text-[11px]">
                <span className="flex items-center gap-1 text-slate-700">
                  <Radio className="w-3.5 h-3.5 text-emerald-700" />
                  {selectedCamp.radioFrequencyMhz}
                </span>
                <span className="text-emerald-800 font-bold">{selectedCamp.contactNumber}</span>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={onTriggerSiren}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Trigger Full-Screen Audio Siren</span>
            </button>
          </div>
        </div>

        {/* Right Area: Dynamic Routing Comparison (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Comparison Cards: Standard GPS vs GeoShield Dynamic Safe Corridor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Standard Navigation: Danger Warning */}
            <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs relative overflow-hidden space-y-3">
              <div className="absolute top-0 right-0 bg-rose-600 text-white px-3 py-1 text-[10px] font-bold uppercase rounded-bl-lg">
                ⚠️ DANGER: Standard GPS Route
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium">Standard Blind Routing (e.g. Google Maps)</span>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">
                  Direct Highway NH-06 Through Tunnel
                </h4>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-950 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>SEVERED / CRITICAL SUBMERSION</span>
                </div>
                <p className="text-[11px] text-rose-900 leading-relaxed">
                  Water depth <strong>55 cm</strong> at Km 140. Impassable mudflow debris from upper escarpment. Standard navigation algorithms do not measure water depth or active landslides, risking vehicle submergence.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-600 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block">Distance</span>
                  <span className="font-bold">42 km</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Water Depth</span>
                  <span className="font-bold text-rose-600">55 cm (&gt;30cm)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Status</span>
                  <span className="font-bold text-rose-600">Blocked</span>
                </div>
              </div>
            </div>

            {/* GeoShield Hazard-Aware Route: Verified Safe */}
            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500 shadow-md relative overflow-hidden space-y-3 ring-1 ring-emerald-400">
              <div className="absolute top-0 right-0 bg-emerald-600 text-white px-3 py-1 text-[10px] font-bold uppercase rounded-bl-lg">
                ✓ RECOMMENDED SAFE CORRIDOR
              </div>

              <div>
                <span className="text-xs text-emerald-700 font-semibold">GeoShield Dynamic Safe Routing</span>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">
                  Upper Ridge Evacuation Corridor (Via Lumshnong Ridge)
                </h4>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% PASSABLE / ELEVATED GROUND</span>
                </div>
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  Routes around the high saturation polygon. Water depth &lt; 5 cm. Slopes engineered with retaining walls. Safe for emergency ambulances and evacuee convoys.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-600 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block">Distance</span>
                  <span className="font-bold text-slate-800">58 km (+16 km)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Water Depth</span>
                  <span className="font-bold text-emerald-600">&lt; 5 cm (Safe)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Corridor Type</span>
                  <span className="font-bold text-emerald-700">High Ridge</span>
                </div>
              </div>
            </div>
          </div>

          {/* Turn-by-Turn Safe Navigation Feed */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>Turn-by-Turn Safe Corridor Guidance</span>
              </h4>
              <span className="text-xs text-slate-400 font-mono">Bearing: 328° NW • Elevation: 1,240m</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </span>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">Depart Sonapur Point along North Diversion Road</div>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Avoid NH-06 main portal. Take immediate right turn at police barricade onto elevated limestone spur.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-500 shrink-0">0.0 km</span>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </span>
                <div className="flex-1">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>Pass Lumshnong Quarry Bypass</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">Slow 20 km/h</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Surface contains fine gravel runoff. Keep headlights on due to low-level cloud cover.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-500 shrink-0">18.4 km</span>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </span>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">Arrive at Khliehriat Higher Secondary Relief Center</div>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Proceed to Gate 2 for registration and medical checkup. Mobile water tankers available.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-500 shrink-0">58.0 km</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
