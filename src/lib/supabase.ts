import { createClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_ID = 'fdvajrjkxzbkiubahelj';
const rawClientUrl = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) || 
  'https://fdvajrjkxzbkiubahelj.supabase.co';

export const SUPABASE_URL = 
  (rawClientUrl.includes('supabase.co') && !rawClientUrl.includes('dashboard'))
    ? rawClientUrl
    : `https://${SUPABASE_PROJECT_ID}.supabase.co`;

function getValidClientKey(): string {
  const envKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY);
  if (envKey && !envKey.includes('•') && !/[^\x00-\x7F]/.test(envKey) && envKey.trim().length > 15) {
    return envKey.trim();
  }
  return 'sb_publishable_VCQwMea37gRlS3uOT01oKg_EByw0mrc';
}

export const SUPABASE_ANON_KEY = getValidClientKey();

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface SupabaseLoginPayload {
  email: string;
  name?: string;
  role?: string;
  agency?: string;
  phone?: string;
  password?: string;
  source?: string;
}

export interface SupabaseReportPayload {
  id: string;
  title: string;
  category: string;
  lat: number;
  lng: number;
  locationName: string;
  description: string;
  severity: string;
  reportedBy: string;
  reporterRole: string;
  aiVerified: boolean;
  aiNotes?: string;
  imageUrl?: string;
}

export interface SupabaseAlertPayload {
  id: string;
  tier: number;
  title: string;
  hazardType: string;
  targetDistrict: string;
  severity: string;
  dispatchedChannels: string[];
  affectedPopulationEstimate: number;
  messageBody: string;
}

export const SUPABASE_SQL_SCHEMAS = {
  userLogins: `-- Table: public.user_logins (For User Authentication & Session Tracking)
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
CREATE POLICY "Allow public insert user_logins" ON public.user_logins FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public read user_logins" ON public.user_logins FOR SELECT TO anon, authenticated USING (true);`,

  incidentReports: `-- Table: public.incident_reports (For AI-Verified Landslide & Flood Reports)
CREATE TABLE IF NOT EXISTS public.incident_reports (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_name TEXT,
  description TEXT,
  severity TEXT DEFAULT 'P2_HIGH',
  status TEXT DEFAULT 'REPORTED',
  reported_by TEXT,
  reporter_role TEXT,
  ai_verified BOOLEAN DEFAULT true,
  ai_notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert incident_reports" ON public.incident_reports FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public read incident_reports" ON public.incident_reports FOR SELECT TO anon, authenticated USING (true);`,

  sosBroadcasts: `-- Table: public.sos_broadcasts (For Emergency Siren & SMS Broadcasts)
CREATE TABLE IF NOT EXISTS public.sos_broadcasts (
  id TEXT PRIMARY KEY,
  tier INT DEFAULT 1,
  title TEXT NOT NULL,
  hazard_type TEXT,
  target_district TEXT,
  severity TEXT,
  channels TEXT[],
  population_affected INT,
  message_body TEXT,
  dispatched_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sos_broadcasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert sos_broadcasts" ON public.sos_broadcasts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public read sos_broadcasts" ON public.sos_broadcasts FOR SELECT TO anon, authenticated USING (true);`
};

/**
 * Persists an incident report to Supabase public.incident_reports table
 */
export async function syncIncidentReportWithSupabase(report: SupabaseReportPayload) {
  try {
    const record = {
      id: report.id,
      title: report.title,
      category: report.category,
      latitude: report.lat,
      longitude: report.lng,
      location_name: report.locationName,
      description: report.description,
      severity: report.severity,
      reported_by: report.reportedBy,
      reporter_role: report.reporterRole,
      ai_verified: report.aiVerified,
      ai_notes: report.aiNotes || '',
      image_url: report.imageUrl || '',
      created_at: new Date().toISOString()
    };
    const { error } = await supabase.from('incident_reports').upsert([record]);
    return { success: !error, error: error?.message };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Persists an alert broadcast to Supabase public.sos_broadcasts table
 */
export async function syncAlertWithSupabase(alert: SupabaseAlertPayload) {
  try {
    const record = {
      id: alert.id,
      tier: alert.tier,
      title: alert.title,
      hazard_type: alert.hazardType,
      target_district: alert.targetDistrict,
      severity: alert.severity,
      channels: alert.dispatchedChannels,
      population_affected: alert.affectedPopulationEstimate,
      message_body: alert.messageBody,
      dispatched_at: new Date().toISOString()
    };
    const { error } = await supabase.from('sos_broadcasts').upsert([record]);
    return { success: !error, error: error?.message };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Persists login information directly to Supabase
 * 1. Synchronizes user with Supabase Auth (auth.users)
 * 2. Attempts insertion into public.user_logins and public.profiles table
 */
export async function syncLoginWithSupabase(payload: SupabaseLoginPayload) {
  const emailClean = payload.email.trim().toLowerCase();
  const result = {
    authSaved: false,
    tableSaved: false,
    supabaseUserId: null as string | null,
    tableName: 'user_logins',
    error: null as string | null,
  };

  try {
    // 1. Try Supabase Auth sign in or sign up to record the user in Supabase auth.users
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: emailClean,
      password: payload.password || 'GeoShield2026!',
    });

    if (signInData?.user) {
      result.authSaved = true;
      result.supabaseUserId = signInData.user.id;
    } else if (signInError) {
      // If user doesn't exist yet, sign up to register in auth.users
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: emailClean,
        password: payload.password || 'GeoShield2026!',
        options: {
          data: {
            name: payload.name || emailClean.split('@')[0],
            role: payload.role || 'citizen',
            agency: payload.agency || 'GeoShield NER Network',
            phone: payload.phone || '+91 94350 00000',
            last_login_at: new Date().toISOString(),
          },
        },
      });

      if (signUpData?.user) {
        result.authSaved = true;
        result.supabaseUserId = signUpData.user.id;
      } else if (signUpErr) {
        // Still proceed to table insertion attempt
        console.warn('Supabase Auth notice:', signUpErr.message);
      }
    }

    // 2. Attempt table insertion into public.user_logins
    const loginRecord = {
      user_id: result.supabaseUserId,
      email: emailClean,
      name: payload.name || emailClean.split('@')[0],
      role: payload.role || 'citizen',
      agency: payload.agency || 'GeoShield NER System',
      phone: payload.phone || '+91 94350 00000',
      login_timestamp: new Date().toISOString(),
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Client',
      status: 'SUCCESS',
    };

    const { error: tableError } = await supabase.from('user_logins').insert([loginRecord]);
    if (!tableError) {
      result.tableSaved = true;
    } else {
      // Try public.profiles as fallback
      const { error: profError } = await supabase.from('profiles').upsert([loginRecord]);
      if (!profError) {
        result.tableSaved = true;
        result.tableName = 'profiles';
      }
    }
  } catch (err: any) {
    result.error = err?.message || 'Supabase sync failed';
    console.error('Error syncing with Supabase:', err);
  }

  return result;
}
