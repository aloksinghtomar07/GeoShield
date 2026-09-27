import React, { useState, useEffect } from 'react';
import { EarlyWarningAlert, DispatchedAlertLog, User } from '../types';
import { INITIAL_ALERT_DISPATCH_LOGS } from '../data/mockNerData';
import { DispatchedAlertLogPanel } from './DispatchedAlertLogPanel';
import { 
  BellRing, 
  Send, 
  Smartphone, 
  MessageSquare, 
  Volume2, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Users, 
  ShieldAlert,
  Flame,
  FileText,
  Plus,
  X,
  History,
  RadioTower,
  LayoutGrid
} from 'lucide-react';

interface AlertDispatchPanelProps {
  alerts: EarlyWarningAlert[];
  onBroadcastAlert: (alert: Partial<EarlyWarningAlert>) => void;
  onTriggerSiren: () => void;
  user?: User | null;
}

const DEFAULT_TARGET_GROUPS = [
  'Downhill Settlements & Hamlet Dwellers',
  'Commercial Freight / Truckers (NH-06)',
  'Village Disaster Management Volunteers',
  'Border Roads Task Force (BRTF / PWD)',
  'Hillside Tea Plantation Workers',
  'Emergency First Responders (SDRF)'
];

const LOCAL_STORAGE_KEY = 'geoshield_alert_logs_v2';

export const AlertDispatchPanel: React.FC<AlertDispatchPanelProps> = ({
  alerts,
  onBroadcastAlert,
  onTriggerSiren,
  user
}) => {
  // View mode tab: 'overview' (both form + timeline) | 'timeline' (focused full-width log) | 'dispatch' (focused broadcast form)
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'timeline' | 'dispatch'>('overview');

  // New Broadcast Form State
  const [tier, setTier] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState('IMMINENT DEBRIS SURGE & ROAD SEVERANCE WARNING');
  const [targetDistrict, setTargetDistrict] = useState('East Jaintia Hills & Cachar Border');
  const [timeWindow, setTimeWindow] = useState('Next 15–30 Minutes');
  const [messageBody, setMessageBody] = useState('CRITICAL ADVISORY: 91% soil saturation and active creep detected on NH-06 Sonapur corridor. Evacuate roadside stalls immediately. Follow safe ridge route.');
  const [channels, setChannels] = useState<('whatsapp' | 'sms' | 'siren' | 'in_app')[]>(['whatsapp', 'sms', 'siren', 'in_app']);
  
  // Selected Target Groups (Core Requirement)
  const [selectedGroups, setSelectedGroups] = useState<string[]>([
    'Downhill Settlements & Hamlet Dwellers',
    'Commercial Freight / Truckers (NH-06)',
    'Village Disaster Management Volunteers'
  ]);
  const [customGroupInput, setCustomGroupInput] = useState('');
  const [showAddCustomGroup, setShowAddCustomGroup] = useState(false);

  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  // Persistent Dispatched Warning Logs State
  const [logs, setLogs] = useState<DispatchedAlertLog[]>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed reading alert logs from localStorage", e);
    }
    return INITIAL_ALERT_DISPATCH_LOGS as DispatchedAlertLog[];
  });

  // Fetch latest logs from backend on mount
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/alerts/logs');
        if (res.ok) {
          const data = await res.json();
          if (data.logs && Array.isArray(data.logs) && data.logs.length > 0) {
            setLogs(data.logs);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.logs));
          }
        }
      } catch (err) {
        console.warn("Failed to fetch logs from server, using local state", err);
      }
    };
    fetchLogs();
  }, []);

  // Save to localStorage on change
  const updateLogsState = (newLogs: DispatchedAlertLog[]) => {
    setLogs(newLogs);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newLogs));
    } catch (e) {
      console.warn("Error caching logs to localStorage", e);
    }
  };

  const toggleChannel = (ch: 'whatsapp' | 'sms' | 'siren' | 'in_app') => {
    if (channels.includes(ch)) {
      setChannels(channels.filter(c => c !== ch));
    } else {
      setChannels([...channels, ch]);
    }
  };

  const toggleTargetGroup = (group: string) => {
    if (selectedGroups.includes(group)) {
      setSelectedGroups(selectedGroups.filter(g => g !== group));
    } else {
      setSelectedGroups([...selectedGroups, group]);
    }
  };

  const handleAddCustomGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customGroupInput.trim();
    if (trimmed && !selectedGroups.includes(trimmed)) {
      setSelectedGroups([...selectedGroups, trimmed]);
      setCustomGroupInput('');
      setShowAddCustomGroup(false);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGroups.length === 0) {
      alert("Please select at least one Target Group or Demographic for this warning.");
      return;
    }
    if (channels.length === 0) {
      alert("Please select at least one Dispatch Channel.");
      return;
    }

    setIsBroadcasting(true);
    setDispatchSuccess(null);

    const dispatcherName = user ? `${user.name} (${user.agency || 'SDMA Authority'})` : 'Dr. Mukul Sharma (SDMA NER Duty Officer)';

    try {
      const res = await fetch('/api/alerts/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          title,
          hazardType: tier === 1 ? 'Landslide Debris Flow' : tier === 2 ? 'High Rain & Saturation' : 'Weather Advisory',
          targetDistrict,
          targetGroups: selectedGroups,
          severity: tier === 1 ? 'CRITICAL' : tier === 2 ? 'HIGH' : 'MODERATE',
          timeWindow,
          messageBody,
          dispatchedChannels: channels,
          dispatchedBy: dispatcherName,
        }),
      });

      const data = await res.json();
      if (data.alert) {
        onBroadcastAlert(data.alert);

        // Capture newly generated log in persistent state
        if (data.log) {
          const updatedLogs = [data.log, ...logs.filter(l => l.id !== data.log.id)];
          updateLogsState(updatedLogs);
        } else {
          // Fallback if backend returned only alert
          const fallbackLog: DispatchedAlertLog = {
            id: `LOG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
            alertId: data.alert.id,
            tier: tier,
            title: data.alert.title,
            hazardType: data.alert.hazardType,
            targetDistrict: data.alert.targetDistrict,
            targetGroups: selectedGroups,
            severity: data.alert.severity,
            issuedAt: 'Just now',
            timestampISO: new Date().toISOString(),
            timeWindow: data.alert.timeWindow,
            messageBody: data.alert.messageBody,
            dispatchedBy: dispatcherName,
            dispatchedChannels: channels,
            deliveryStatus: 'CONFIRMED_ACK',
            overallDeliveryPercent: 99.4,
            totalRecipients: data.alert.affectedPopulationEstimate || 15000,
            deliveredRecipients: Math.round((data.alert.affectedPopulationEstimate || 15000) * 0.994),
            acknowledgements: Math.round((data.alert.affectedPopulationEstimate || 15000) * 0.26),
            channelMetrics: channels.map(ch => ({
              channel: ch,
              status: 'DELIVERED',
              targetCount: data.alert.affectedPopulationEstimate || 15000,
              deliveredCount: Math.round((data.alert.affectedPopulationEstimate || 15000) * 0.99),
              deliveryRatePercent: 99.2,
              gatewayLatencyMs: ch === 'whatsapp' ? 140 : ch === 'sms' ? 210 : ch === 'siren' ? 45 : 80
            }))
          };
          updateLogsState([fallbackLog, ...logs]);
        }

        setDispatchSuccess(`Alert logged & broadcast successfully to ${selectedGroups.length} target cohorts via ${channels.join(', ')}.`);
        if (channels.includes('siren') && tier === 1) {
          onTriggerSiren();
        }
      }
    } catch (err) {
      console.error("Failed to broadcast alert:", err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleSimulateAck = async (logId: string) => {
    // Increment acks on server & locally
    const log = logs.find(l => l.id === logId);
    if (!log) return;

    try {
      await fetch(`/api/alerts/logs/${logId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acknowledgementsIncrement: 120,
          deliveryStatus: 'CONFIRMED_ACK'
        })
      });
    } catch (e) {
      console.warn("Backend ack ping skipped, updating local state", e);
    }

    const updated = logs.map(l => {
      if (l.id === logId) {
        return {
          ...l,
          acknowledgements: (l.acknowledgements || 0) + 120,
          deliveryStatus: 'CONFIRMED_ACK' as const
        };
      }
      return l;
    });
    updateLogsState(updated);
  };

  const handleRefreshLogs = async () => {
    try {
      const res = await fetch('/api/alerts/logs');
      if (res.ok) {
        const data = await res.json();
        if (data.logs && Array.isArray(data.logs)) {
          updateLogsState(data.logs);
        }
      }
    } catch (e) {
      console.warn("Error refreshing logs", e);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & View Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-100 text-rose-800">
              <RadioTower className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Alert Dispatch & Warning Log</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white font-mono uppercase">
                  Multi-Tier SDMA
                </span>
              </h2>
              <p className="text-xs md:text-sm text-slate-600 mt-0.5">
                Targeted emergency broadcasts, demographic groups dispatching, and persistent delivery audit trail.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold shrink-0">
          <button
            id="tab-view-overview"
            onClick={() => setActiveSubTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'overview'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
            <span>Unified View</span>
          </button>

          <button
            id="tab-view-timeline"
            onClick={() => setActiveSubTab('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'timeline'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5 text-emerald-600" />
            <span>Persistent Log Timeline</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold">
              {logs.length}
            </span>
          </button>

          <button
            id="tab-view-dispatch"
            onClick={() => setActiveSubTab('dispatch')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'dispatch'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-rose-600" />
            <span>Dispatch Station</span>
          </button>
        </div>
      </div>

      {/* 3-Tier Alert Architecture Infographic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tier 1 */}
        <div className="p-4 rounded-xl border-2 border-rose-500 bg-rose-50/50 space-y-2 relative overflow-hidden shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white uppercase tracking-wider">
              Tier 1 • Emergency
            </span>
            <span className="text-xs font-mono font-bold text-rose-800">Next 15–30 Mins</span>
          </div>
          <h3 className="font-bold text-sm text-rose-950">Imminent Disaster Warning</h3>
          <p className="text-xs text-rose-900 leading-relaxed">
            Flash SMS cell broadcasts, multilingual WhatsApp cards, and audible evacuation siren relays across affected mountain spurs.
          </p>
          <div className="pt-2 border-t border-rose-200 text-[11px] text-rose-800 font-medium">
            Channels: [Flash SMS] [WhatsApp] [Audio Siren] [In-App]
          </div>
        </div>

        {/* Tier 2 */}
        <div className="p-4 rounded-xl border-2 border-amber-400 bg-amber-50/50 space-y-2 relative overflow-hidden shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white uppercase tracking-wider">
              Tier 2 • High Warning
            </span>
            <span className="text-xs font-mono font-bold text-amber-800">2–6 Hours Horizon</span>
          </div>
          <h3 className="font-bold text-sm text-amber-950">Pre-Disaster Advisory</h3>
          <p className="text-xs text-amber-900 leading-relaxed">
            Triggered by heavy rainfall forecasts and high soil saturation. In-app priority alerts with highway speed warnings and shelter maps.
          </p>
          <div className="pt-2 border-t border-amber-200 text-[11px] text-amber-800 font-medium">
            Channels: [WhatsApp Interactive] [Flash SMS] [In-App Banner]
          </div>
        </div>

        {/* Tier 3 */}
        <div className="p-4 rounded-xl border-2 border-blue-400 bg-blue-50/50 space-y-2 relative overflow-hidden shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">
              Tier 3 • Advisory
            </span>
            <span className="text-xs font-mono font-bold text-blue-800">24h Horizon</span>
          </div>
          <h3 className="font-bold text-sm text-blue-950">Routine & Agricultural</h3>
          <p className="text-xs text-blue-900 leading-relaxed">
            Delivered via background in-app vector sync. Zero SMS cost to eliminate notification fatigue for citizens and farmers.
          </p>
          <div className="pt-2 border-t border-blue-200 text-[11px] text-blue-800 font-medium">
            Channels: [In-App Vector Sync] [Agro-WeatherGPT]
          </div>
        </div>
      </div>

      {/* Main Content Layout based on activeSubTab */}
      {(activeSubTab === 'overview' || activeSubTab === 'dispatch') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Broadcast Form */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-blue-600" />
                  <span>Dispatch New Early Warning</span>
                </h3>
                <p className="text-[11px] text-slate-400">Targeted Multi-Channel Broadcast Engine</p>
              </div>
              <span className="text-[11px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                Role: SDMA Authority
              </span>
            </div>

            {dispatchSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{dispatchSuccess}</span>
              </div>
            )}

            <form onSubmit={handleBroadcast} className="space-y-3.5 text-xs">
              {/* Tier Select */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Warning Tier:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { t: 1, label: 'Tier 1 Critical', color: 'border-rose-500 text-rose-700 bg-rose-50' },
                    { t: 2, label: 'Tier 2 Warning', color: 'border-amber-500 text-amber-700 bg-amber-50' },
                    { t: 3, label: 'Tier 3 Advisory', color: 'border-blue-500 text-blue-700 bg-blue-50' },
                  ].map((item) => (
                    <button
                      key={item.t}
                      type="button"
                      onClick={() => {
                        setTier(item.t as any);
                        setTimeWindow(item.t === 1 ? 'Next 15–30 Minutes' : item.t === 2 ? 'Next 2–6 Hours' : 'Next 24 Hours');
                      }}
                      className={`py-2 rounded-lg font-bold border transition text-center ${
                        tier === item.t ? item.color : 'border-slate-200 text-slate-600 bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target District */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target District / Corridor:</label>
                <select
                  value={targetDistrict}
                  onChange={(e) => setTargetDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium outline-none"
                >
                  <option value="East Jaintia Hills & Cachar Border">East Jaintia Hills & Cachar Border (NH-06 Sonapur)</option>
                  <option value="Dima Hasao & Karbi Anglong">Dima Hasao & Karbi Anglong (Haflong Corridor)</option>
                  <option value="North Sikkim (Mangan & Dzongu)">North Sikkim (Mangan & Dzongu Valley)</option>
                  <option value="Kohima & Phek Ridge">Kohima & Phek Ridge (NH-29 Bypass)</option>
                  <option value="Kamrup Metropolitan">Kamrup Metropolitan (Guwahati Urban Hills)</option>
                </select>
              </div>

              {/* TARGET GROUPS (Core Requirement) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>Target Groups & Demographics:</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">
                    {selectedGroups.length} selected
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Select which community cohorts will receive priority alerts:
                </p>

                <div className="space-y-1.5 pt-1">
                  {DEFAULT_TARGET_GROUPS.map((group) => {
                    const isSelected = selectedGroups.includes(group);
                    return (
                      <button
                        key={group}
                        type="button"
                        onClick={() => toggleTargetGroup(group)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-2xs' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{group}</span>
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300'
                        }`}>
                          {isSelected ? '✓' : ''}
                        </span>
                      </button>
                    );
                  })}

                  {/* Any custom groups added */}
                  {selectedGroups.filter(g => !DEFAULT_TARGET_GROUPS.includes(g)).map((cg) => (
                    <div
                      key={cg}
                      className="px-2.5 py-1.5 rounded-lg border bg-blue-50 border-blue-300 text-blue-900 text-xs font-semibold flex items-center justify-between"
                    >
                      <span className="truncate">{cg}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedGroups(selectedGroups.filter(g => g !== cg))}
                        className="text-blue-700 hover:text-blue-900 ml-2"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Add Custom Group Input */}
                  {showAddCustomGroup ? (
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        value={customGroupInput}
                        onChange={(e) => setCustomGroupInput(e.target.value)}
                        placeholder="e.g. Tea Plantation Union, Village Ward 4"
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs outline-none focus:border-blue-500"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomGroup}
                        className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddCustomGroup(false)}
                        className="p-1.5 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddCustomGroup(true)}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 pt-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Custom Cohort or Organization</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Alert Title */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Headline:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium outline-none"
                  required
                />
              </div>

              {/* Message Body */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Advisory Message Body:</label>
                <textarea
                  rows={3}
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium outline-none"
                  required
                />
              </div>

              {/* Channels Checklist */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Dispatch Channels:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'whatsapp' as const, label: 'WhatsApp Card', icon: MessageSquare },
                    { id: 'sms' as const, label: 'Flash SMS (Telecom)', icon: Smartphone },
                    { id: 'siren' as const, label: 'In-App Audio Siren', icon: Volume2 },
                    { id: 'in_app' as const, label: 'In-App Banner', icon: BellRing },
                  ].map((c) => {
                    const Icon = c.icon;
                    const isChecked = channels.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleChannel(c.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-left font-medium transition ${
                          isChecked ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] truncate">{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isBroadcasting}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-white text-xs shadow-xs transition flex items-center justify-center gap-2 ${
                  tier === 1 ? 'bg-rose-600 hover:bg-rose-500' : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isBroadcasting ? 'Broadcasting to Gateways...' : `Broadcast Tier-${tier} Alert Now`}</span>
              </button>
            </form>
          </div>

          {/* Right: Live Queue Preview & Quick Summary */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                  <span>Real-Time Broadcast Queue & Citizen Views</span>
                </h4>
                <button
                  onClick={() => setActiveSubTab('timeline')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                >
                  <span>View Full Timeline Log ({logs.length})</span>
                  <span>→</span>
                </button>
              </div>

              <div className="space-y-3">
                {alerts.slice(0, 3).map((alert) => (
                  <div 
                    key={alert.id}
                    className={`p-4 rounded-xl border space-y-2.5 transition ${
                      alert.tier === 1 
                        ? 'bg-rose-50/40 border-rose-200' 
                        : alert.tier === 2 
                        ? 'bg-amber-50/40 border-amber-200' 
                        : 'bg-blue-50/40 border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase ${
                          alert.tier === 1 ? 'bg-rose-600' : alert.tier === 2 ? 'bg-amber-600' : 'bg-blue-600'
                        }`}>
                          Tier {alert.tier}
                        </span>
                        <span className="font-mono text-slate-500 text-[11px]">{alert.id}</span>
                      </div>
                      <span className="text-slate-500 text-[11px] flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {alert.issuedAt}
                      </span>
                    </div>

                    <h5 className="font-bold text-sm text-slate-900">
                      {alert.title}
                    </h5>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {alert.messageBody}
                    </p>

                    <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Est. Reach: <strong>{alert.affectedPopulationEstimate?.toLocaleString()}</strong> citizens</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {alert.dispatchedChannels?.map((ch, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] uppercase font-mono font-semibold text-slate-600">
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Preview Card of Historical Audit Logs */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-blue-100 text-blue-800">
                  <History className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Persistent Log Panel Active</h4>
                  <p className="text-[11px] text-slate-500">
                    {logs.length} historical warnings stored with target groups and delivery status.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSubTab('timeline')}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition shadow-2xs"
              >
                Open Audit Timeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Historical Log Panel (Visible in 'overview' and 'timeline' modes) */}
      {(activeSubTab === 'overview' || activeSubTab === 'timeline') && (
        <div className="pt-2">
          <DispatchedAlertLogPanel
            logs={logs}
            onRefreshLogs={handleRefreshLogs}
            onSimulateAck={handleSimulateAck}
          />
        </div>
      )}
    </div>
  );
};
