import React from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Map, 
  Navigation, 
  Camera, 
  BellRing, 
  Bot, 
  UserCircle, 
  LogOut, 
  Radio, 
  Wifi, 
  WifiOff, 
  Layers,
  HardDrive
} from 'lucide-react';
import { User } from '../types';

export type ActiveTab = 
  | 'gis_map' 
  | 'predictive_nowcasting' 
  | 'hazard_routing' 
  | 'incident_triage' 
  | 'alert_dispatch' 
  | 'agro_weather';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab?: (tab: ActiveTab) => void;
  onSelectTab?: (tab: ActiveTab) => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenExport?: () => void;
  isOfflineMode?: boolean;
  onToggleOffline?: () => void;
  criticalCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onSelectTab,
  user,
  onOpenAuth,
  onLogout,
  onOpenExport,
  isOfflineMode = false,
  onToggleOffline = () => {},
  criticalCount = 0
}) => {
  const handleTabClick = (tabId: ActiveTab) => {
    if (typeof setActiveTab === 'function') {
      setActiveTab(tabId);
    }
    if (typeof onSelectTab === 'function') {
      onSelectTab(tabId);
    }
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; badge?: number; phase: string }[] = [
    { id: 'gis_map', label: 'GIS Command Center', icon: Map, phase: 'Live GIS' },
    { id: 'predictive_nowcasting', label: 'Predictive Nowcast & XAI', icon: Activity, badge: criticalCount, phase: 'Pre-Disaster' },
    { id: 'hazard_routing', label: 'Hazard-Aware Routing', icon: Navigation, phase: 'During-Disaster' },
    { id: 'incident_triage', label: 'Field Triage & AI Checks', icon: Camera, phase: 'Post-Disaster' },
    { id: 'alert_dispatch', label: 'Multi-Tier Alert Dispatch', icon: BellRing, phase: 'Dissemination' },
    { id: 'agro_weather', label: 'Agro-WeatherGPT', icon: Bot, phase: 'Citizen Voice' },
  ];

  return (
    <aside 
      id="main-sidebar" 
      className="w-72 bg-[#0B1528] text-slate-200 flex flex-col justify-between border-r border-slate-800 select-none shrink-0 h-screen sticky top-0"
    >
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-rose-900/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-wide">GeoShield AI</span>
                <span className="text-[10px] uppercase font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-700/50 px-1.5 py-0.5 rounded">
                  v2.6 NER
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Landslide & Flood Early Warning</p>
            </div>
          </div>

          {/* Quick status pill */}
          <div className="mt-4 flex items-center justify-between p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOfflineMode ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOfflineMode ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span className="text-slate-300 font-medium">
                {isOfflineMode ? 'Zero-Network Mode' : 'Cloud Radar Sync Active'}
              </span>
            </div>
            <button
              onClick={onToggleOffline}
              title={isOfflineMode ? "Switch to Online Mode" : "Simulate Cell Tower Collapse"}
              className={`p-1.5 rounded transition ${isOfflineMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              {isOfflineMode ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1.5">
          <div className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Disaster Lifecycle Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge ? (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                      {item.badge} High
                    </span>
                  ) : (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${isActive ? 'bg-blue-700/80 text-blue-100' : 'text-slate-500'}`}>
                      {item.phase}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {onOpenExport && (
            <div className="pt-2 border-t border-slate-800/60 mt-2">
              <button
                id="sidebar-export-drive-btn"
                onClick={onOpenExport}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium text-blue-300 hover:bg-blue-950/40 hover:text-white border border-blue-900/40 transition-all shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <HardDrive className="w-4 h-4 text-blue-400" />
                  <span className="truncate">Save Project to Drive</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-200 border border-blue-700/50">
                  Export
                </span>
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* User / Auth Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-[#070e1c]">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-blue-300 font-bold text-xs uppercase border border-slate-600">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.agency || user.email}</p>
                </div>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                user.role === 'authority' 
                  ? 'bg-purple-950 text-purple-300 border border-purple-800/40' 
                  : user.role === 'responder'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                  : 'bg-blue-950 text-blue-300 border border-blue-800/40'
              }`}>
                {user.role}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 border border-slate-800 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-slate-400">Emergency responder or official?</p>
            <button
              id="sidebar-signin-btn"
              onClick={onOpenAuth}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <UserCircle className="w-4 h-4" />
              <span>Sign In / Create Account</span>
            </button>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-slate-800/50 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>NER Corridor: NH-06 / NH-29</span>
          <span>SDRF: 154.65 MHz</span>
        </div>
      </div>
    </aside>
  );
};
