import React, { useState, useMemo } from 'react';
import { DispatchedAlertLog, AlertDeliveryStatus } from '../types';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Smartphone, 
  MessageSquare, 
  Volume2, 
  BellRing, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Radio, 
  Truck, 
  ShieldAlert, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  FileText,
  Activity,
  Layers,
  ArrowUpDown
} from 'lucide-react';

interface DispatchedAlertLogPanelProps {
  logs: DispatchedAlertLog[];
  onRefreshLogs?: () => void;
  onSimulateAck?: (logId: string) => void;
}

export const DispatchedAlertLogPanel: React.FC<DispatchedAlertLogPanelProps> = ({
  logs,
  onRefreshLogs,
  onSimulateAck,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<number | 'ALL'>('ALL');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<AlertDeliveryStatus | 'ALL'>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  // Extract unique target groups across all logs
  const allTargetGroups = useMemo(() => {
    const groupSet = new Set<string>();
    logs.forEach(l => {
      l.targetGroups?.forEach(g => groupSet.add(g));
    });
    return Array.from(groupSet);
  }, [logs]);

  // Aggregate metrics
  const totalDispatched = logs.length;
  const totalAudience = logs.reduce((acc, curr) => acc + (curr.totalRecipients || 0), 0);
  const totalDelivered = logs.reduce((acc, curr) => acc + (curr.deliveredRecipients || 0), 0);
  const totalAcks = logs.reduce((acc, curr) => acc + (curr.acknowledgements || 0), 0);
  const averageDeliveryRate = totalAudience > 0 ? ((totalDelivered / totalAudience) * 100).toFixed(1) : '99.2';

  // Filtered & Sorted Logs
  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => {
        // Search filter
        if (searchTerm) {
          const query = searchTerm.toLowerCase();
          const matchTitle = log.title?.toLowerCase().includes(query);
          const matchDistrict = log.targetDistrict?.toLowerCase().includes(query);
          const matchId = log.id?.toLowerCase().includes(query) || log.alertId?.toLowerCase().includes(query);
          const matchBody = log.messageBody?.toLowerCase().includes(query);
          const matchGroup = log.targetGroups?.some(g => g.toLowerCase().includes(query));
          if (!matchTitle && !matchDistrict && !matchId && !matchBody && !matchGroup) {
            return false;
          }
        }

        // Tier filter
        if (selectedTier !== 'ALL' && log.tier !== selectedTier) {
          return false;
        }

        // Target Group filter
        if (selectedGroup !== 'ALL' && !log.targetGroups?.includes(selectedGroup)) {
          return false;
        }

        // Status filter
        if (selectedStatus !== 'ALL' && log.deliveryStatus !== selectedStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestampISO || 0).getTime();
        const timeB = new Date(b.timestampISO || 0).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [logs, searchTerm, selectedTier, selectedGroup, selectedStatus, sortOrder]);

  const toggleExpand = (id: string) => {
    setExpandedLogId(prev => (prev === id ? null : id));
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLogId(id);
    setTimeout(() => setCopiedLogId(null), 2500);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `GeoShield_Alert_Dispatch_Log_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCsv = () => {
    const headers = ["Log ID", "Alert ID", "Tier", "Headline", "District", "Target Groups", "Issued At", "Status", "Delivered %", "Total Audience", "Delivered Audience", "Acks", "Dispatched By"];
    const rows = logs.map(l => [
      l.id,
      l.alertId,
      `Tier ${l.tier}`,
      `"${l.title.replace(/"/g, '""')}"`,
      `"${l.targetDistrict}"`,
      `"${l.targetGroups?.join('; ') || ''}"`,
      `"${l.issuedAt}"`,
      l.deliveryStatus,
      `${l.overallDeliveryPercent}%`,
      l.totalRecipients,
      l.deliveredRecipients,
      l.acknowledgements,
      `"${l.dispatchedBy}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GeoShield_Dispatched_Alert_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePingAck = (logId: string) => {
    setIsPinging(true);
    if (onSimulateAck) {
      onSimulateAck(logId);
    }
    setTimeout(() => setIsPinging(false), 800);
  };

  return (
    <div id="dispatched-alerts-persistent-log-panel" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header & Metrics Dashboard */}
      <div className="p-5 md:p-6 border-b border-slate-100 bg-slate-50/70">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-100/80 text-blue-800">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Historical Warning Dispatch Log</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                    Persistent Live Timeline
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chronological audit trail of all multi-tier disaster broadcasts, targeted demographics, telecom deliveries, and citizen acknowledgements.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons: Export CSV & JSON */}
          <div className="flex items-center gap-2">
            <button
              id="export-logs-csv-btn"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
              title="Export formatted CSV log for district magistrate review"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              id="export-logs-json-btn"
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
              title="Export complete JSON audit payload"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export JSON</span>
            </button>
            {onRefreshLogs && (
              <button
                id="refresh-logs-btn"
                onClick={onRefreshLogs}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
                title="Refresh persistent log from server"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Dispatches</span>
              <BellRing className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-xl font-black text-slate-900">{totalDispatched}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Total recorded broadcasts</div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Delivery Rate</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-emerald-700">{averageDeliveryRate}%</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Telecom & WhatsApp gateway</div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Audience</span>
              <Users className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-xl font-black text-slate-900">{totalAudience.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{totalDelivered.toLocaleString()} delivered</div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Citizen Acks</span>
              <Smartphone className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-xl font-black text-amber-700">{totalAcks.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Verified lockscreen responses</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 border-b border-slate-100 bg-white space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Field */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              id="search-alert-logs-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keyword, district, target group (e.g. Truckers, Haflong), or log ID..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 outline-none transition"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Toggle */}
          <button
            id="toggle-sort-order-btn"
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold shrink-0 transition"
            title="Toggle chronological sorting"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>

        {/* Filter Pills: Tier, Target Group, Status */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 mr-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <span>Filters:</span>
          </div>

          {/* Tier Buttons */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              onClick={() => setSelectedTier('ALL')}
              className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition ${
                selectedTier === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Tiers
            </button>
            <button
              onClick={() => setSelectedTier(1)}
              className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition ${
                selectedTier === 1 ? 'bg-rose-600 text-white shadow-2xs' : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              Tier 1 Emergency
            </button>
            <button
              onClick={() => setSelectedTier(2)}
              className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition ${
                selectedTier === 2 ? 'bg-amber-600 text-white shadow-2xs' : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              Tier 2 Warning
            </button>
            <button
              onClick={() => setSelectedTier(3)}
              className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition ${
                selectedTier === 3 ? 'bg-blue-600 text-white shadow-2xs' : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              Tier 3 Advisory
            </button>
          </div>

          {/* Target Group Dropdown */}
          <select
            id="filter-target-group-select"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold outline-none"
          >
            <option value="ALL">All Target Groups ({allTargetGroups.length})</option>
            {allTargetGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            id="filter-delivery-status-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold outline-none"
          >
            <option value="ALL">All Delivery Statuses</option>
            <option value="CONFIRMED_ACK">Confirmed Ack</option>
            <option value="DELIVERED">Delivered</option>
            <option value="TRANSMITTING">Transmitting</option>
            <option value="PARTIAL">Partial</option>
          </select>

          {(searchTerm || selectedTier !== 'ALL' || selectedGroup !== 'ALL' || selectedStatus !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedTier('ALL');
                setSelectedGroup('ALL');
                setSelectedStatus('ALL');
              }}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Historical Timeline Feed */}
      <div className="p-5 md:p-6 bg-slate-50/40">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 space-y-2">
            <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-sm text-slate-700">No dispatched warning logs match current criteria</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Try adjusting your search terms or clearing the selected Tier and Target Group filters.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const isTier1 = log.tier === 1;
              const isTier2 = log.tier === 2;

              return (
                <div 
                  key={log.id} 
                  id={`alert-log-${log.id}`}
                  className="relative group transition"
                >
                  {/* Timeline Node Bullet */}
                  <div className={`absolute -left-6 top-3 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center transition shadow-2xs ${
                    isTier1 
                      ? 'border-rose-500 text-rose-600' 
                      : isTier2 
                      ? 'border-amber-500 text-amber-600' 
                      : 'border-blue-500 text-blue-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      isTier1 
                        ? 'bg-rose-600 animate-pulse' 
                        : isTier2 
                        ? 'bg-amber-600' 
                        : 'bg-blue-600'
                    }`} />
                  </div>

                  {/* Log Content Card */}
                  <div className={`rounded-xl border bg-white p-4.5 space-y-3.5 shadow-2xs hover:shadow-xs transition ${
                    isTier1 
                      ? 'border-rose-200 hover:border-rose-300' 
                      : isTier2 
                      ? 'border-amber-200 hover:border-amber-300' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    {/* Top Row: Tier Badge, ID, Time and Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase text-white ${
                          isTier1 
                            ? 'bg-rose-600' 
                            : isTier2 
                            ? 'bg-amber-600' 
                            : 'bg-blue-600'
                        }`}>
                          Tier {log.tier} • {isTier1 ? 'Emergency' : isTier2 ? 'Warning' : 'Advisory'}
                        </span>

                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {log.id}
                        </span>

                        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                          Ref: {log.alertId}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {/* Delivery Status Badge */}
                        <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          log.deliveryStatus === 'CONFIRMED_ACK'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : log.deliveryStatus === 'DELIVERED'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                        }`}>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{log.deliveryStatus.replace('_', ' ')}</span>
                          <span className="text-slate-400 font-normal">({log.overallDeliveryPercent}%)</span>
                        </div>

                        {/* Timestamp & Horizon */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.issuedAt}</span>
                        </div>
                      </div>
                    </div>

                    {/* Headline & District */}
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                        {log.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                        <span className="font-medium text-slate-700">
                          Sector: <strong>{log.targetDistrict}</strong>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-medium text-slate-600">
                          Hazard: <strong>{log.hazardType}</strong>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 font-mono">
                          Horizon: <strong>{log.timeWindow}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Target Groups Section (Core Requirement) */}
                    <div className="bg-slate-50/90 p-3 rounded-lg border border-slate-100 space-y-1.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span>Target Groups & Demographics Dispatched:</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 font-normal">
                          {log.targetGroups?.length || 0} designated cohorts
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {log.targetGroups && log.targetGroups.length > 0 ? (
                          log.targetGroups.map((group, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white border border-slate-200 text-slate-800 shadow-2xs"
                            >
                              {group.toLowerCase().includes('truck') || group.toLowerCase().includes('freight') ? (
                                <Truck className="w-3 h-3 text-amber-600" />
                              ) : group.toLowerCase().includes('volunteer') || group.toLowerCase().includes('sdrf') || group.toLowerCase().includes('ndrf') ? (
                                <ShieldAlert className="w-3 h-3 text-rose-600" />
                              ) : group.toLowerCase().includes('farmer') || group.toLowerCase().includes('agricultural') || group.toLowerCase().includes('tea') ? (
                                <Activity className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Users className="w-3 h-3 text-blue-600" />
                              )}
                              <span>{group}</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">General public alert</span>
                        )}
                      </div>
                    </div>

                    {/* Delivery Status & Gateway Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                        <div className="flex items-center gap-3">
                          <span>
                            Delivered: <strong>{log.deliveredRecipients.toLocaleString()}</strong> / {log.totalRecipients.toLocaleString()}
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="text-emerald-700 font-semibold">
                            Acknowledgements: <strong>{log.acknowledgements.toLocaleString()}</strong> confirmed
                          </span>
                        </div>

                        {/* Dispatch Channels Badges */}
                        <div className="flex items-center gap-1">
                          {log.dispatchedChannels?.map((ch, idx) => (
                            <span 
                              key={idx}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1"
                            >
                              {ch === 'whatsapp' && <MessageSquare className="w-2.5 h-2.5 text-emerald-600" />}
                              {ch === 'sms' && <Smartphone className="w-2.5 h-2.5 text-blue-600" />}
                              {ch === 'siren' && <Volume2 className="w-2.5 h-2.5 text-rose-600" />}
                              {ch === 'in_app' && <BellRing className="w-2.5 h-2.5 text-indigo-600" />}
                              <span>{ch}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Visual progress bar */}
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isTier1 ? 'bg-rose-500' : isTier2 ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(10, log.overallDeliveryPercent))}%` }}
                        />
                      </div>
                    </div>

                    {/* Expandable Section: Channel Metrics, Message Text, Dispatcher Info */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-100 space-y-3.5 text-xs animate-in fade-in duration-200">
                        {/* Channel Delivery Breakdown Table */}
                        {log.channelMetrics && log.channelMetrics.length > 0 && (
                          <div>
                            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                              <span>Gateway Telemetry Breakdown:</span>
                              <span className="text-[10px] font-mono text-slate-400">Carrier LSA: Airtel / Jio / BSNL</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                              {log.channelMetrics.map((m, i) => (
                                <div key={i} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-800 uppercase text-[10px] font-mono">
                                      {m.channel}
                                    </span>
                                    <span className="text-[10px] font-bold text-emerald-600">
                                      {m.deliveryRatePercent}%
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-600">
                                    {m.deliveredCount.toLocaleString()} / {m.targetCount.toLocaleString()}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    Latency: {m.gatewayLatencyMs}ms
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Advisory Content Quote */}
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px] text-slate-600 uppercase">
                              Dispatched Advisory Content:
                            </span>
                            <button
                              onClick={() => handleCopyText(log.messageBody, log.id)}
                              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                            >
                              {copiedLogId === log.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700 font-semibold">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy Content</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-slate-800 font-mono leading-relaxed whitespace-pre-wrap">
                            {log.messageBody}
                          </p>
                        </div>

                        {/* Footer Details: Operator & Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
                          <div>
                            Dispatched By: <strong className="text-slate-800">{log.dispatchedBy}</strong>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePingAck(log.id)}
                              disabled={isPinging}
                              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                              title="Simulate incoming lockscreen acknowledgements from carrier cell broadcast"
                            >
                              <RefreshCw className={`w-3 h-3 text-slate-500 ${isPinging ? 'animate-spin' : ''}`} />
                              <span>Ping Citizen Acknowledgements</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expand/Collapse Toggle Trigger */}
                    <div className="pt-2 flex justify-center border-t border-slate-100">
                      <button
                        onClick={() => toggleExpand(log.id)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
                      >
                        <span>{isExpanded ? 'Hide Detailed Telemetry' : 'View Full Delivery Telemetry & Advisory'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
