import React, { useState, useRef, useEffect } from 'react';
import { 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Globe, 
  Radio, 
  CloudRain, 
  PhoneCall,
  WifiOff,
  User as UserIcon,
  HardDrive,
  ChevronDown,
  MapPin,
  Layers,
  X,
  Database,
  FileText
} from 'lucide-react';
import { User } from '../types';

const NER_STATES = [
  {
    id: 'assam',
    name: 'Assam',
    capital: 'Dispur / Guwahati',
    color: '#3b82f6',
    border: '#1d4ed8',
    risk: 'High Alert',
    riskBadge: 'bg-rose-100 text-rose-800 border-rose-200',
    sensors: '5 Inclinometers, 8 Rain Gauges',
    corridor: 'Dima Hasao & Brahmaputra Valley',
    d: 'M 52 58 L 62 44 C 70 44 82 42 98 42 C 122 42 148 50 158 68 L 148 78 L 132 74 L 122 84 L 105 84 L 103 108 L 92 108 L 92 84 L 62 82 L 52 72 Z',
  },
  {
    id: 'meghalaya',
    name: 'Meghalaya',
    capital: 'Shillong',
    color: '#8b5cf6',
    border: '#6d28d9',
    risk: 'Critical Rainfall',
    riskBadge: 'bg-rose-100 text-rose-800 border-rose-200',
    sensors: '3 Inclinometers, 4 Rain Gauges',
    corridor: 'NH-06 Sonapur Tunnel & Khasi Hills',
    d: 'M 62 84 C 76 82 92 83 94 84 C 95 96 90 98 62 98 C 60 92 60 86 62 84 Z',
  },
  {
    id: 'arunachal',
    name: 'Arunachal Pradesh',
    capital: 'Itanagar',
    color: '#10b981',
    border: '#047857',
    risk: 'High Risk',
    riskBadge: 'bg-amber-100 text-amber-800 border-amber-200',
    sensors: '2 Seismic Nodes, 3 Rain Gauges',
    corridor: 'Upper Subansiri & Tawang Highway',
    d: 'M 62 44 C 75 25 105 16 135 15 C 162 14 182 26 186 42 C 188 56 180 66 172 70 L 158 68 C 148 50 122 42 98 42 C 82 42 70 44 62 44 Z',
  },
  {
    id: 'sikkim',
    name: 'Sikkim',
    capital: 'Gangtok',
    color: '#06b6d4',
    border: '#0e7490',
    risk: 'Monitored',
    riskBadge: 'bg-blue-100 text-blue-800 border-blue-200',
    sensors: '2 Piezometers, 2 Weather Stations',
    corridor: 'Teesta River Basin & Chungthang',
    d: 'M 14 38 C 16 30 22 28 26 34 C 28 42 24 50 18 52 C 14 50 12 44 14 38 Z',
  },
  {
    id: 'nagaland',
    name: 'Nagaland',
    capital: 'Kohima',
    color: '#f59e0b',
    border: '#b45309',
    risk: 'Moderate',
    riskBadge: 'bg-amber-100 text-amber-800 border-amber-200',
    sensors: '1 Inclinometer, 2 Rain Gauges',
    corridor: 'NH-29 Kohima-Dimapur Sinking Zone',
    d: 'M 148 78 C 162 72 174 74 178 86 C 172 98 160 100 152 98 L 144 88 Z',
  },
  {
    id: 'manipur',
    name: 'Manipur',
    capital: 'Imphal',
    color: '#ec4899',
    border: '#be185d',
    risk: 'Monitored',
    riskBadge: 'bg-blue-100 text-blue-800 border-blue-200',
    sensors: '1 Inclinometer, 1 Rain Gauge',
    corridor: 'Noney Tupul Railway Slopes',
    d: 'M 152 98 C 164 98 172 104 170 118 C 160 122 150 120 146 114 L 146 102 Z',
  },
  {
    id: 'mizoram',
    name: 'Mizoram',
    capital: 'Aizawl',
    color: '#14b8a6',
    border: '#0f766e',
    risk: 'Monitored',
    riskBadge: 'bg-blue-100 text-blue-800 border-blue-200',
    sensors: '2 Acoustic Nodes, 2 Rain Gauges',
    corridor: 'NH-306 Kolasib-Aizawl Link',
    d: 'M 136 114 C 148 112 152 116 150 138 C 144 146 136 146 132 134 C 130 124 132 116 136 114 Z',
  },
  {
    id: 'tripura',
    name: 'Tripura',
    capital: 'Agartala',
    color: '#f97316',
    border: '#c2410c',
    risk: 'Stable',
    riskBadge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    sensors: '1 Rain Gauge, 1 Soil Moisture',
    corridor: 'Jampui Hills & Gomati Valley',
    d: 'M 112 108 C 124 108 126 114 124 130 C 114 134 108 126 108 118 Z',
  },
];

interface NavbarProps {
  currentLanguage: 'en' | 'hi' | 'as' | 'bn';
  onSelectLanguage: (lang: 'en' | 'hi' | 'as' | 'bn') => void;
  onTriggerSiren?: () => void;
  onToggleSiren?: () => void;
  isSirenPlaying?: boolean;
  isSirenActive?: boolean;
  isOfflineMode: boolean;
  onToggleOffline: () => void;
  user: User | null;
  onOpenAuth: () => void;
  onOpenExport?: () => void;
  onOpenSupabaseHub?: () => void;
  unreadAlertsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  onSelectLanguage,
  onTriggerSiren,
  onToggleSiren,
  isSirenPlaying,
  isSirenActive,
  isOfflineMode,
  onToggleOffline,
  user,
  onOpenAuth,
  onOpenExport,
  onOpenSupabaseHub,
  unreadAlertsCount = 0
}) => {
  const [isStateMapOpen, setIsStateMapOpen] = useState(false);
  const [selectedStateId, setSelectedStateId] = useState<string>('assam');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const mapContainerRef = useRef<HTMLSpanElement>(null);

  const handleDownloadDocsPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const res = await fetch('/api/docs/pdf');
      if (!res.ok) throw new Error('Failed to fetch PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'NER_GeoShield_Technical_Documentation.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('PDF download error:', err);
      window.open('/NER_GeoShield_Technical_Documentation.pdf', '_blank');
    } finally {
      setTimeout(() => setIsDownloadingPdf(false), 800);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (mapContainerRef.current && !mapContainerRef.current.contains(e.target as Node)) {
        setIsStateMapOpen(false);
      }
    };
    if (isStateMapOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isStateMapOpen]);

  const activeStateObj = NER_STATES.find(s => s.id === selectedStateId) || NER_STATES[0];
  const sirenActive = isSirenActive ?? isSirenPlaying ?? false;
  const handleSirenClick = () => {
    if (typeof onToggleSiren === 'function') {
      onToggleSiren();
    } else if (typeof onTriggerSiren === 'function') {
      onTriggerSiren();
    }
  };
  const languageLabels: Record<string, string> = {
    en: 'English',
    hi: 'हिन्दी (Hindi)',
    as: 'অসমীয়া (Assamese)',
    bn: 'বাংলা (Bengali)'
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Ticker: Live IMD / Sentinel Radar Telemetry Banner */}
      <div className="bg-amber-500/10 border-b border-amber-200/60 px-4 py-1.5 flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="inline-flex items-center gap-1 font-bold text-[11px] px-1.5 py-0.5 rounded bg-amber-600 text-white shrink-0">
            <Radio className="w-3 h-3 animate-pulse" />
            LIVE TELEMETRY
          </span>
          <span className="truncate font-medium text-slate-800">
            <strong>IMD Nowcast (NER Sector):</strong> Heavy rain cell active over East Jaintia Hills (74mm/6h). NH-06 Sonapur Inclinometer exceeds threshold (4.8°). SDRF Battalion 1 on high standby.
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-4 shrink-0 text-slate-600 font-mono text-[11px]">
          <span className="flex items-center gap-1">
            <CloudRain className="w-3.5 h-3.5 text-blue-600" />
            Cherrapunji: 168mm / 24h
          </span>
          <span className="text-slate-300">|</span>
          <span>Brahmaputra Gauge: +0.42m</span>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>NER Disaster Intelligence Command</span>
              <span
                ref={mapContainerRef}
                id="ner-states-map-symbol"
                onClick={() => setIsStateMapOpen(prev => !prev)}
                className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-50/90 via-sky-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-900 border border-blue-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer text-xs font-semibold select-none ring-0 hover:ring-2 hover:ring-blue-300/60"
                title="Click to view interactive map of North Eastern Region states"
              >
                {/* Visual SVG Mini Map of NER States */}
                <svg
                  viewBox="0 0 200 150"
                  className="w-7 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 drop-shadow-2xs"
                  aria-label="Map of North Eastern Region States"
                >
                  {/* Sikkim */}
                  <path
                    d="M 14 38 C 16 30 22 28 26 34 C 28 42 24 50 18 52 C 14 50 12 44 14 38 Z"
                    fill="#06b6d4"
                    stroke="#0891b2"
                    strokeWidth="1.2"
                  />
                  {/* Arunachal Pradesh */}
                  <path
                    d="M 62 44 C 75 25 105 16 135 15 C 162 14 182 26 186 42 C 188 56 180 66 172 70 L 158 68 C 148 50 122 42 98 42 C 82 42 70 44 62 44 Z"
                    fill="#10b981"
                    stroke="#059669"
                    strokeWidth="1.2"
                  />
                  {/* Assam */}
                  <path
                    d="M 52 58 L 62 44 C 70 44 82 42 98 42 C 122 42 148 50 158 68 L 148 78 L 132 74 L 122 84 L 105 84 L 103 108 L 92 108 L 92 84 L 62 82 L 52 72 Z"
                    fill="#3b82f6"
                    stroke="#2563eb"
                    strokeWidth="1.2"
                  />
                  {/* Meghalaya */}
                  <path
                    d="M 62 84 C 76 82 92 83 94 84 C 95 96 90 98 62 98 C 60 92 60 86 62 84 Z"
                    fill="#8b5cf6"
                    stroke="#7c3aed"
                    strokeWidth="1.2"
                  />
                  {/* Nagaland */}
                  <path
                    d="M 148 78 C 162 72 174 74 178 86 C 172 98 160 100 152 98 L 144 88 Z"
                    fill="#f59e0b"
                    stroke="#d97706"
                    strokeWidth="1.2"
                  />
                  {/* Manipur */}
                  <path
                    d="M 152 98 C 164 98 172 104 170 118 C 160 122 150 120 146 114 L 146 102 Z"
                    fill="#ec4899"
                    stroke="#db2777"
                    strokeWidth="1.2"
                  />
                  {/* Mizoram */}
                  <path
                    d="M 136 114 C 148 112 152 116 150 138 C 144 146 136 146 132 134 C 130 124 132 116 136 114 Z"
                    fill="#14b8a6"
                    stroke="#0d9488"
                    strokeWidth="1.2"
                  />
                  {/* Tripura */}
                  <path
                    d="M 112 108 C 124 108 126 114 124 130 C 114 134 108 126 108 118 Z"
                    fill="#f97316"
                    stroke="#ea580c"
                    strokeWidth="1.2"
                  />
                  {/* Active telemetry radar indicator */}
                  <circle cx="106" cy="64" r="3.5" fill="#ef4444" className="animate-ping" />
                  <circle cx="106" cy="64" r="2.5" fill="#dc2626" />
                </svg>

                <span className="font-semibold text-blue-900 tracking-tight">
                  NER States Map
                </span>
                <span className="px-1.5 py-0.2 rounded bg-blue-600 text-[10px] text-white font-bold">
                  8 States
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-blue-600 transition-transform duration-200 ${isStateMapOpen ? 'rotate-180' : ''}`} />

                {/* Interactive State Map Flyout Modal */}
                {isStateMapOpen && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="absolute left-0 top-full mt-2 w-[340px] sm:w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 text-slate-800 z-50 cursor-default animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">
                            North Eastern Region States Map
                          </h4>
                          <p className="text-[11px] text-slate-500 font-normal">
                            Interactive territorial coverage & landslide telemetry
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsStateMapOpen(false)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Interactive Large SVG Map */}
                    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-xl p-3 border border-slate-800 shadow-inner relative overflow-hidden">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          GIS GEODETIC GRID (NER)
                        </span>
                        <span>Hover state to inspect</span>
                      </div>

                      <svg
                        viewBox="0 0 200 150"
                        className="w-full h-44 drop-shadow-lg"
                      >
                        {/* Background Grid Lines */}
                        <defs>
                          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                          </pattern>
                        </defs>
                        <rect width="200" height="150" fill="url(#grid)" />

                        {/* Interactive States */}
                        {NER_STATES.map((st) => {
                          const isSelected = st.id === selectedStateId;
                          return (
                            <path
                              key={st.id}
                              d={st.d}
                              fill={st.color}
                              stroke={isSelected ? '#ffffff' : st.border}
                              strokeWidth={isSelected ? '2.5' : '1.2'}
                              fillOpacity={isSelected ? 1 : 0.85}
                              className="cursor-pointer transition-all duration-150 hover:opacity-100 hover:brightness-110"
                              onMouseEnter={() => setSelectedStateId(st.id)}
                              onClick={() => setSelectedStateId(st.id)}
                            />
                          );
                        })}

                        {/* Telemetry Sensor markers */}
                        <circle cx="106" cy="64" r="3" fill="#ef4444" className="animate-ping" />
                        <circle cx="106" cy="64" r="2" fill="#ef4444" />
                        <circle cx="78" cy="88" r="2.5" fill="#f59e0b" />
                        <circle cx="20" cy="42" r="2.5" fill="#38bdf8" />
                        <circle cx="120" cy="30" r="2.5" fill="#10b981" />
                        <circle cx="156" cy="68" r="2.5" fill="#fbbf24" />

                        {/* State Labels overlay */}
                        <text x="18" y="58" fill="#e0f2fe" fontSize="6.5" fontWeight="bold" textAnchor="middle">Sikkim</text>
                        <text x="120" y="32" fill="#d1fae5" fontSize="7" fontWeight="bold" textAnchor="middle">Arunachal</text>
                        <text x="96" y="66" fill="#eff6ff" fontSize="8" fontWeight="bold" textAnchor="middle">Assam</text>
                        <text x="74" y="93" fill="#f3e8ff" fontSize="6.5" fontWeight="bold" textAnchor="middle">Meghalaya</text>
                        <text x="165" y="74" fill="#fef3c7" fontSize="6" fontWeight="bold">Nagaland</text>
                        <text x="162" y="104" fill="#fce7f3" fontSize="6" fontWeight="bold">Manipur</text>
                        <text x="142" y="128" fill="#ccfbf1" fontSize="6.5" fontWeight="bold" textAnchor="middle">Mizoram</text>
                        <text x="114" y="124" fill="#ffedd5" fontSize="6" fontWeight="bold" textAnchor="middle">Tripura</text>
                      </svg>
                    </div>

                    {/* Selected State Details Card */}
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                            style={{ backgroundColor: activeStateObj.color }}
                          />
                          <span className="font-bold text-sm text-slate-900">
                            {activeStateObj.name}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeStateObj.riskBadge}`}>
                          {activeStateObj.risk}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 mt-2">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span><strong>Capital:</strong> {activeStateObj.capital}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span><strong>Sensors:</strong> {activeStateObj.sensors}</span>
                        </div>
                      </div>
                      <div className="mt-1.5 text-[11px] text-slate-500">
                        <strong>Key Corridor:</strong> {activeStateObj.corridor}
                      </div>
                    </div>

                    {/* Quick State Pills Selector */}
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {NER_STATES.map((st) => (
                        <button
                          key={st.id}
                          onClick={() => setSelectedStateId(st.id)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition ${
                            st.id === selectedStateId
                              ? 'bg-blue-600 text-white font-bold shadow-2xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {st.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Assam • Meghalaya • Sikkim • Nagaland • Arunachal • Mizoram
            </p>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2.5">
          {/* Emergency Siren Test button */}
          <button
            id="emergency-siren-trigger"
            onClick={handleSirenClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
              sirenActive
                ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            {sirenActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-rose-600" />}
            <span>{sirenActive ? 'Stop Siren' : 'Test Siren (Audio+Alert)'}</span>
          </button>

          {/* Offline Mode Toggle */}
          <button
            onClick={onToggleOffline}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              isOfflineMode
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Simulates tower failure / remote low network"
          >
            <WifiOff className={`w-3.5 h-3.5 ${isOfflineMode ? 'text-amber-700' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">{isOfflineMode ? 'Offline: Vector Cache' : 'Online Sync'}</span>
          </button>

          {/* Multilingual Selector */}
          <div className="relative">
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <select
                id="language-selector"
                value={currentLanguage}
                onChange={(e) => onSelectLanguage(e.target.value as any)}
                className="bg-transparent text-xs font-medium outline-none cursor-pointer text-slate-800"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="as">অসমীয়া</option>
                <option value="bn">বাংলা</option>
              </select>
            </div>
          </div>

          {/* Technical Documentation PDF Button */}
          <button
            id="navbar-docs-pdf-btn"
            onClick={handleDownloadDocsPdf}
            disabled={isDownloadingPdf}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition shadow-2xs cursor-pointer disabled:opacity-60"
            title="Download Official Technical Manual (PDF)"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden md:inline">
              {isDownloadingPdf ? 'Downloading...' : 'Docs (PDF)'}
            </span>
          </button>

          {/* Export / Save to Drive */}
          {onOpenExport && (
            <button
              id="navbar-export-drive-btn"
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition shadow-2xs"
              title="Export complete project and save snapshot to Google Drive"
            >
              <HardDrive className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Save to Drive</span>
            </button>
          )}

          {/* Supabase Status Pill */}
          <button
            onClick={onOpenSupabaseHub || onOpenAuth}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/90 hover:bg-emerald-100 text-xs font-medium transition shadow-2xs cursor-pointer"
            title="Open Supabase Backend Command Hub (Project: fdvajrjkxzbkiubahelj)"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden lg:inline text-[11px] font-semibold">Supabase</span>
          </button>

          {/* User Sign In / Profile Quick Button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium transition shadow-xs"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {user ? user.name.split(' ')[0] : 'Sign In'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
