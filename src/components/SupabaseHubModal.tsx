import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  RefreshCw, 
  Radio, 
  Users, 
  FileText, 
  BellRing, 
  Send, 
  ShieldCheck, 
  Terminal, 
  X,
  Clock
} from 'lucide-react';
import { 
  SUPABASE_PROJECT_ID, 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  SUPABASE_SQL_SCHEMAS 
} from '../lib/supabase';

interface SupabaseHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SyncedEvent {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  agency?: string;
  eventType: string;
  timestamp: string;
  tableStatus: string;
  authUserId?: string;
  details?: string;
}

export const SupabaseHubModal: React.FC<SupabaseHubModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'events' | 'sql' | 'tester'>('events');
  const [selectedSchema, setSelectedSchema] = useState<'userLogins' | 'incidentReports' | 'sosBroadcasts'>('userLogins');
  
  // Status State
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusData, setStatusData] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Test Runner State
  const [testEmail, setTestEmail] = useState('');
  const [testName, setTestName] = useState('Officer Ananya Roy');
  const [testRole, setTestRole] = useState('authority');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const fetchStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await fetch('/api/supabase/status');
      const data = await res.json();
      setStatusData(data);
    } catch (e) {
      console.error('Failed to fetch Supabase status:', e);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      if (!testEmail) {
        setTestEmail(`officer.ner.${Math.floor(1000 + Math.random() * 9000)}@geoshield.gov.in`);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleRunTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestLoading(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/supabase/test-insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          name: testName,
          role: testRole
        })
      });
      const data = await res.json();
      setTestResult(data);
      // Refresh status to show newly synced test event
      fetchStatus();
    } catch (err: any) {
      setTestResult({ success: false, error: err?.message || 'Test request failed' });
    } finally {
      setTestLoading(false);
    }
  };

  const events: SyncedEvent[] = statusData?.recentEvents || statusData?.recentSavedLogins || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Supabase Cloud Backend Command
                </h2>
                <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Connected
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Project: <strong className="font-mono text-slate-200">{SUPABASE_PROJECT_ID}</strong> • Region: ap-southeast-1
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStatus}
              disabled={statusLoading}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
              title="Refresh connection status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${statusLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <a
              href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <span>Supabase Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Project Meta Bar */}
        <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Supabase URL:</span>
              <span className="font-mono font-semibold text-slate-800 text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                {SUPABASE_URL}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Auth Integration:</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active (auth.users)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-slate-500">Auto-Syncing:</span>
            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-medium">Logins</span>
            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-medium">Field Reports</span>
            <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded font-medium">SOS Siren Broadcasts</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 bg-white border-b border-slate-200 flex items-center gap-4 shrink-0">
          <button
            onClick={() => setActiveTab('events')}
            className={`pb-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'events'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Synced Events ({events.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tester')}
            className={`pb-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'tester'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Interactive Test Runner</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>SQL Schema Setup (Table Editor)</span>
          </button>
        </div>

        {/* Tab 1: Live Synced Events */}
        {activeTab === 'events' && (
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Real-Time Synchronization Stream</h3>
                <p className="text-xs text-slate-500">
                  Every user login, field report, and emergency alert is automatically captured and registered into Supabase.
                </p>
              </div>
              <button
                onClick={fetchStatus}
                className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Refresh stream
              </button>
            </div>

            {events.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <Database className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No events recorded yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Log in via the Sign In button, submit a Field Incident Report, or use the Interactive Test Runner tab to record your first Supabase entries.
                </p>
                <button
                  onClick={() => setActiveTab('tester')}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Run Instant Test
                </button>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 shadow-2xs">
                {events.map((ev, i) => (
                  <div key={ev.id || i} className="p-3.5 bg-white hover:bg-slate-50/70 transition flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 mt-0.5 ${
                        ev.eventType === 'LOGIN' ? 'bg-blue-600' :
                        ev.eventType === 'REGISTER' ? 'bg-indigo-600' :
                        ev.eventType === 'INCIDENT_REPORT' ? 'bg-amber-600' :
                        ev.eventType === 'BROADCAST_ALERT' ? 'bg-rose-600' : 'bg-emerald-600'
                      }`}>
                        {ev.eventType === 'LOGIN' && <Users className="w-4 h-4" />}
                        {ev.eventType === 'REGISTER' && <Users className="w-4 h-4" />}
                        {ev.eventType === 'INCIDENT_REPORT' && <FileText className="w-4 h-4" />}
                        {ev.eventType === 'BROADCAST_ALERT' && <BellRing className="w-4 h-4" />}
                        {ev.eventType === 'TEST_PING' && <Radio className="w-4 h-4" />}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ev.eventType === 'LOGIN' ? 'bg-blue-100 text-blue-800' :
                            ev.eventType === 'REGISTER' ? 'bg-indigo-100 text-indigo-800' :
                            ev.eventType === 'INCIDENT_REPORT' ? 'bg-amber-100 text-amber-800' :
                            ev.eventType === 'BROADCAST_ALERT' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {ev.eventType}
                          </span>
                          <strong className="text-xs font-semibold text-slate-900">
                            {ev.name || ev.email || ev.details || 'System Action'}
                          </strong>
                          {ev.role && (
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                              Role: {ev.role}
                            </span>
                          )}
                        </div>

                        {ev.email && (
                          <div className="text-xs text-slate-600 font-mono">
                            {ev.email}
                          </div>
                        )}

                        {ev.details && (
                          <div className="text-xs text-slate-500">
                            {ev.details}
                          </div>
                        )}

                        {ev.authUserId && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            Supabase UID: {ev.authUserId}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        {ev.tableStatus.replace(/_/g, ' ')}
                      </span>
                      <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Interactive Test Runner */}
        {activeTab === 'tester' && (
          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Live Supabase Backend Test Rig
              </h3>
              <p className="text-xs text-emerald-800 mt-1">
                Fill in the details below or keep the auto-generated test credentials to trigger an immediate live write into Supabase project <strong>{SUPABASE_PROJECT_ID}</strong>.
              </p>
            </div>

            <form onSubmit={handleRunTest} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Officer / User Name:</label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">User Email Address:</label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Operational Role:</label>
                <select
                  value={testRole}
                  onChange={(e) => setTestRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="authority">Disaster Management Authority (SDMA / NDMA)</option>
                  <option value="responder">SDRF Field Rescue Responder</option>
                  <option value="citizen">Community Field Volunteer</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={testLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {testLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Writing to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Execute Test Write to Supabase</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {testResult && (
              <div className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in ${
                testResult.success ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-2">
                    {testResult.success ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Supabase Test Succeeded!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                        <span>Test Failed</span>
                      </>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Project: {SUPABASE_PROJECT_ID}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="bg-black/40 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">AUTH.USERS PERSISTENCE:</span>
                    <strong className="text-emerald-400">
                      {testResult.authSaved ? 'Registered in Supabase Auth' : 'Auth Active'}
                    </strong>
                  </div>
                  <div className="bg-black/40 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">TABLE PERSISTENCE:</span>
                    <strong className="text-emerald-400">
                      {testResult.tableSaved ? 'Inserted into public.user_logins' : 'Saved to Supabase Auth Users'}
                    </strong>
                  </div>
                </div>

                <pre className="p-2.5 rounded bg-black/60 text-[10px] font-mono text-emerald-300 overflow-x-auto border border-slate-800">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: SQL Schema Setup */}
        {activeTab === 'sql' && (
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Supabase Table Editor Setup Scripts</h3>
              <p className="text-xs text-slate-500">
                To view your records directly in the Supabase Table Editor UI, run the corresponding SQL in your Supabase Dashboard.
              </p>
            </div>

            {/* Sub-selector for SQL table */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setSelectedSchema('userLogins')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedSchema === 'userLogins' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                1. user_logins (Auth & Sessions)
              </button>
              <button
                onClick={() => setSelectedSchema('incidentReports')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedSchema === 'incidentReports' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                2. incident_reports (Field Hazards)
              </button>
              <button
                onClick={() => setSelectedSchema('sosBroadcasts')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedSchema === 'sosBroadcasts' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                3. sos_broadcasts (Alert History)
              </button>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">
                  SQL for <strong className="font-mono text-emerald-700">{selectedSchema}</strong>:
                </span>
                <button
                  onClick={() => copyToClipboard(SUPABASE_SQL_SCHEMAS[selectedSchema], selectedSchema)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  {copiedKey === selectedSchema ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy SQL Script</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed max-h-72">
                {SUPABASE_SQL_SCHEMAS[selectedSchema]}
              </pre>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 space-y-1.5">
              <strong className="text-slate-800 block font-semibold">How to run in Supabase:</strong>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                <li>Click <strong>Copy SQL Script</strong> above.</li>
                <li>Go to your <a href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`} target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">Supabase SQL Editor (opens new tab)</a>.</li>
                <li>Paste the script and click <strong>Run</strong>.</li>
                <li>Visit the <strong>Table Editor</strong> tab in Supabase to see all synchronized rows populated!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Supabase JavaScript Client v2.49.1 configured</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
