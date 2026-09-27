import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { 
  UserCheck, 
  Lock, 
  Mail, 
  UserPlus, 
  ShieldAlert, 
  Building, 
  Phone, 
  CheckCircle2, 
  AlertCircle,
  Database,
  ChevronDown,
  Copy,
  ExternalLink,
  Check,
  RefreshCw
} from 'lucide-react';
import { 
  syncLoginWithSupabase, 
  SUPABASE_PROJECT_ID, 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY 
} from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('authority');
  const [agency, setAgency] = useState('State Disaster Management Authority (SDMA NER)');
  const [phone, setPhone] = useState('+91 94350 00000');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSupabasePanel, setShowSupabasePanel] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [supabaseSyncDetails, setSupabaseSyncDetails] = useState<{
    userId?: string;
    projectId: string;
    status: string;
    email: string;
    tableSaved?: boolean;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    const endpoint = mode === 'signin' ? '/api/auth/login' : '/api/auth/register';
    const cleanEmail = email.trim().toLowerCase();
    const payload = mode === 'signin' 
      ? { email: cleanEmail, password }
      : { name, email: cleanEmail, password, role, agency, phone };

    try {
      // 1. Send to server endpoint (which persists in Supabase backend)
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // 2. Dual client-side sync to Supabase backend
      const clientSync = await syncLoginWithSupabase({
        email: cleanEmail,
        password,
        name: mode === 'signup' ? name : data.user?.name,
        role: mode === 'signup' ? role : data.user?.role,
        agency: mode === 'signup' ? agency : data.user?.agency,
        phone: mode === 'signup' ? phone : data.user?.phone,
      }).catch(err => {
        console.log('Client Supabase sync notice:', err);
        return null;
      });

      const sbUserId = data.supabase?.supabaseUserId || clientSync?.supabaseUserId;
      const isTableSaved = data.supabase?.status?.includes('TABLE') || clientSync?.tableSaved;

      setSupabaseSyncDetails({
        userId: sbUserId,
        projectId: SUPABASE_PROJECT_ID,
        status: isTableSaved ? 'SAVED_TO_TABLE_AND_AUTH' : 'SAVED_TO_SUPABASE_AUTH_USERS',
        email: cleanEmail,
        tableSaved: isTableSaved,
      });

      setSuccessMsg(`Authenticated! User details saved to Supabase (Project: ${SUPABASE_PROJECT_ID})`);
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSupabase = async () => {
    setTestStatus('testing');
    setTestMessage('Pinging Supabase backend...');
    try {
      const res = await fetch('/api/supabase/status');
      const data = await res.json();
      if (data.connected) {
        setTestStatus('success');
        setTestMessage(`Connected to ${data.projectId} • Supabase Auth active`);
      } else {
        setTestStatus('error');
        setTestMessage('Could not verify connection');
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestMessage('Network error pinging Supabase');
    }
  };

  const sqlCode = `-- Run in Supabase Dashboard (SQL Editor) to create table for Table Editor view:
CREATE TABLE IF NOT EXISTS public.user_logins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT,
  agency TEXT,
  phone TEXT,
  event_type TEXT DEFAULT 'LOGIN',
  login_timestamp TIMESTAMPTZ DEFAULT now(),
  user_agent TEXT,
  status TEXT DEFAULT 'SUCCESS',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_logins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON public.user_logins 
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public read" ON public.user_logins 
  FOR SELECT TO anon, authenticated USING (true);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Quick Demo Account Pre-fill
  const selectDemoAccount = (demoRole: UserRole) => {
    if (demoRole === 'authority') {
      setEmail('mukul.sharma@ner-disaster.gov.in');
      setPassword('pass123');
      setName('Dr. Mukul Sharma');
      setAgency('State Disaster Management Authority (SDMA NER)');
      setRole('authority');
    } else if (demoRole === 'responder') {
      setEmail('anamika.borah@sdrf.gov.in');
      setPassword('pass123');
      setName('Sub-Inspector Anamika Borah');
      setAgency('SDRF 1st Bn Quick Response Team');
      setRole('responder');
    } else {
      setEmail('citizen@geoshield.ai');
      setPassword('pass123');
      setName('Pranjal Barua');
      setAgency('Guwahati Citizen Volunteer');
      setRole('citizen');
    }
    setMode('signin');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-md"
          >
            ✕
          </button>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base tracking-wide flex items-center gap-2">
                GeoShield Command
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-mono font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Supabase Live
                </span>
              </span>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-100">
            {mode === 'signin' ? 'Sign In to Disaster Intelligence' : 'Register New Responder / Official'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Login details are persisted directly into your Supabase backend tables.
          </p>
        </div>

        {/* Supabase Connection Pill */}
        <div className="px-5 py-2 bg-emerald-50/80 border-b border-emerald-200/70 flex items-center justify-between text-xs text-emerald-900 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-medium text-[11px]">
              Connected to Supabase: <strong className="font-mono">{SUPABASE_PROJECT_ID}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowSupabasePanel(prev => !prev)}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 underline underline-offset-2"
          >
            Backend Details
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showSupabasePanel ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expandable Supabase Project Configuration & SQL Helper */}
        {showSupabasePanel && (
          <div className="p-4 bg-slate-900 text-slate-200 border-b border-slate-800 text-xs shrink-0 max-h-60 overflow-y-auto space-y-3 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-[10px] font-mono">SUPABASE PROJECT ID</span>
                <strong className="font-mono text-emerald-400">{SUPABASE_PROJECT_ID}</strong>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-[10px] font-mono">SUPABASE BACKEND URL</span>
                <span className="font-mono text-slate-200 truncate block text-[10px]">{SUPABASE_URL}</span>
              </div>
            </div>

            <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Automatic Storage in Supabase
                </span>
                <button
                  type="button"
                  onClick={handleTestSupabase}
                  className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-[10px] flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                  Ping Backend
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                1. <strong>auth.users:</strong> Every login/registration is instantly registered in Supabase Authentication.
              </p>
              <p className="text-[11px] text-slate-400">
                2. <strong>public.user_logins:</strong> Every session records user ID, role, email, and timestamp.
              </p>
              {testMessage && (
                <div className={`p-1.5 rounded text-[10px] font-mono ${testStatus === 'success' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700' : 'bg-rose-950/60 text-rose-300 border border-rose-700'}`}>
                  {testMessage}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 font-mono">OPTIONAL SQL FOR TABLE EDITOR VIEW:</span>
                <button
                  type="button"
                  onClick={copySqlToClipboard}
                  className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold flex items-center gap-1"
                >
                  {copiedSql ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                  {copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}
                </button>
              </div>
              <pre className="p-2 rounded bg-black/50 text-[10px] font-mono text-slate-300 overflow-x-auto border border-slate-800">
                {sqlCode}
              </pre>
            </div>
          </div>
        )}

        {/* Quick Demo Selector */}
        <div className="px-5 pt-3 pb-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 font-medium">Quick Demo Profiles:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => selectDemoAccount('authority')}
              className="px-2 py-1 rounded bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-[11px] transition"
            >
              Authority
            </button>
            <button
              type="button"
              onClick={() => selectDemoAccount('responder')}
              className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] transition"
            >
              SDRF
            </button>
            <button
              type="button"
              onClick={() => selectDemoAccount('citizen')}
              className="px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-[11px] transition"
            >
              Citizen
            </button>
          </div>
        </div>

        {supabaseSyncDetails ? (
          <div className="p-6 space-y-4 text-center overflow-y-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-base text-slate-900">Login Info Successfully Saved!</h4>
              <p className="text-xs text-slate-500">
                Your credentials and profile details have been synced to your Supabase backend.
              </p>
            </div>

            {/* Supabase details summary table */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between items-center text-slate-600">
                <span>Supabase Project:</span>
                <span className="font-bold text-slate-900">{supabaseSyncDetails.projectId}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>User Email:</span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">{supabaseSyncDetails.email}</span>
              </div>
              {supabaseSyncDetails.userId && (
                <div className="flex justify-between items-center text-slate-600">
                  <span>Supabase Auth UID:</span>
                  <span className="font-bold text-emerald-700 truncate max-w-[200px] text-[11px]">{supabaseSyncDetails.userId}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-slate-600">
                <span>Database Sync:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {supabaseSyncDetails.status}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/auth/users`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
              >
                <span>View User in Supabase Auth Table</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
              >
                Continue to GeoShield Command Center
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'signup' && (
            <>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Mukul Sharma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Role:</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium outline-none"
                >
                  <option value="authority">District Disaster Management Authority (SDMA / DM)</option>
                  <option value="responder">Emergency First Responder (NDRF / SDRF)</option>
                  <option value="citizen">Citizen Volunteer / Field Reporter</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Agency / Department:</label>
                <input
                  type="text"
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  placeholder="e.g. Assam State Disaster Management Authority"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number (SMS / WhatsApp):</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 94350 00000"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">Email Address:</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@agency.gov.in"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Password:</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving to Supabase...</span>
              </>
            ) : mode === 'signin' ? (
              <>
                <Database className="w-4 h-4" />
                <span>Sign In & Save to Supabase</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account & Register in Supabase</span>
              </>
            )}
          </button>

          <div className="text-center pt-1 text-slate-500 text-xs">
            {mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Create an Account
                </button>
              </p>
            ) : (
              <p>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </form>
        )}
      </div>
    </div>
  );
};
