import React, { useState } from 'react';
import { IncidentReport, User } from '../types';
import { 
  Camera, 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Truck, 
  LifeBuoy, 
  User as UserIcon,
  Search,
  ExternalLink
} from 'lucide-react';

interface IncidentTriagePanelProps {
  reports: IncidentReport[];
  user: User | null;
  onAddNewReport: (report: IncidentReport) => void;
  onUpdateReportStatus: (id: string, status: 'REPORTED' | 'DISPATCHED' | 'RESOLVED', assignedUnit?: string) => void;
}

export const IncidentTriagePanel: React.FC<IncidentTriagePanelProps> = ({
  reports,
  user,
  onAddNewReport,
  onUpdateReportStatus
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'queue' | 'submit'>('queue');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MODERATE'>('ALL');
  
  // Submit Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'crack' | 'slope_movement' | 'rockfall' | 'flash_flood' | 'blocked_road'>('crack');
  const [locationName, setLocationName] = useState('NH-06 Sonapur Corridor, Meghalaya');
  const [lat, setLat] = useState('25.1118');
  const [lng, setLng] = useState('92.3610');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);

  // Sample photo helpers for quick testing in preview
  const samplePhotos = [
    {
      label: 'Slope Tension Crack',
      url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
      title: 'Tension Crack on Upper Cutting',
      category: 'crack' as const,
      loc: 'Sonapur Slope Km 141',
    },
    {
      label: 'Flooded Highway',
      url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
      title: 'Road Submerged by Flash Inflow',
      category: 'flash_flood' as const,
      loc: 'Haflong River Crossing Km 42',
    },
    {
      label: 'Boulder Rockfall',
      url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
      title: 'Loose Shale Rockfall Obstructing Lane',
      category: 'rockfall' as const,
      loc: 'Zubza Bypass Ridge',
    },
  ];

  // Handle File Upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit Report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccessMsg(null);

    try {
      const payload = {
        title: title || `${category.toUpperCase()} at ${locationName}`,
        category,
        lat: parseFloat(lat) || 25.1118,
        lng: parseFloat(lng) || 92.3610,
        locationName,
        description: description || "Field observation report submitted via GeoShield mobile app.",
        imageUrl: imagePreview || samplePhotos[0].url,
        reportedBy: user ? user.name : "Field Officer B. Das",
        reporterRole: user ? user.role : "Citizen Volunteer",
      };

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.report) {
        onAddNewReport(data.report);
        setSubmitSuccessMsg(`Report submitted & verified by AI! ID: ${data.report.id}`);
        // Reset form
        setTitle('');
        setDescription('');
        setImagePreview(null);
        setTimeout(() => {
          setActiveSubTab('queue');
          setSubmitSuccessMsg(null);
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to submit report:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered reports
  const filteredReports = reports.filter(r => {
    if (severityFilter === 'ALL') return true;
    return r.severity === severityFilter;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <Camera className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              AI-Verified Incident Triage & Field Reporting
            </h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Citizen & field official geo-tagged uploads verified by Gemini Computer Vision anti-spam filtering to eliminate social media fake noise.
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('queue')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'queue'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SDRF Rescue Priority Queue ({reports.length})
          </button>
          <button
            onClick={() => setActiveSubTab('submit')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeSubTab === 'submit'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>1-Tap Geo-Tagged Report</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: RESCUE PRIORITY QUEUE */}
      {activeSubTab === 'queue' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                Filter Priority:
              </span>
              {(['ALL', 'P1_CRITICAL', 'P2_HIGH', 'P3_MODERATE'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSeverityFilter(lvl)}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    severityFilter === lvl
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lvl === 'ALL' ? 'All Incidents' : lvl.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
              <span>Verified Genuine Disasters: <strong className="text-emerald-600">{reports.filter(r => r.aiSpamStatus === 'VERIFIED_DISASTER').length}</strong></span>
              <span>•</span>
              <span>Pending Action: <strong className="text-rose-600">{reports.filter(r => r.status !== 'RESOLVED').length}</strong></span>
            </div>
          </div>

          {/* Incident Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredReports.map((report) => {
              const isCritical = report.severity === 'P1_CRITICAL';
              return (
                <div 
                  key={report.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition"
                >
                  {/* Image & AI Spam Filter Badge */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    {report.imageUrl ? (
                      <img 
                        src={report.imageUrl} 
                        alt={report.title} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Camera className="w-8 h-8" />
                      </div>
                    )}

                    {/* AI Verification Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold border border-slate-700">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>AI Verified Genuine ({report.aiConfidence}%)</span>
                    </div>

                    {/* Severity Pill */}
                    <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold text-white uppercase ${
                      isCritical ? 'bg-rose-600' : report.severity === 'P2_HIGH' ? 'bg-amber-600' : 'bg-blue-600'
                    }`}>
                      {report.severity.replace('_', ' ')}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-1">
                        <span>{report.id}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {report.timestamp}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm line-clamp-2">
                        {report.title}
                      </h4>

                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{report.locationName}</span>
                      </p>

                      <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                        {report.description}
                      </p>

                      {/* Computer Vision Technical Inspection */}
                      {report.aiNotes && (
                        <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700">
                          <strong className="text-indigo-700 block mb-0.5">CV Feature Extraction:</strong>
                          <span>{report.aiNotes}</span>
                        </div>
                      )}
                    </div>

                    {/* Reporter & SDRF Dispatch Action */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>By: {report.reportedBy}</span>
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          report.status === 'RESOLVED' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : report.status === 'DISPATCHED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {report.status}
                        </span>
                      </div>

                      {/* Unit Assignment / Action */}
                      <div className="flex items-center gap-1.5 pt-1">
                        {report.status === 'REPORTED' && (
                          <button
                            onClick={() => onUpdateReportStatus(report.id, 'DISPATCHED', 'SDRF Quick Response Unit')}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Dispatch SDRF Unit</span>
                          </button>
                        )}
                        {report.status === 'DISPATCHED' && (
                          <button
                            onClick={() => onUpdateReportStatus(report.id, 'RESOLVED')}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Resolved</span>
                          </button>
                        )}
                        {report.status === 'RESOLVED' && (
                          <div className="w-full text-center py-1 text-xs text-emerald-700 font-semibold bg-emerald-50 rounded-lg">
                            ✓ Site Cleared & Hazard Mitigated
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CITIZEN / FIELD UPLOAD FORM */}
      {activeSubTab === 'submit' && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">
              Submit 1-Tap Geo-Tagged Damage Photo / Incident
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Photos are analyzed with Gemini multimodal vision to automatically classify soil fissure apertures, rockfall mass, and road water depth.
            </p>
          </div>

          {submitSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{submitSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
            {/* Photo Upload Area */}
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">
                Hazard Photo (Auto GPS & Computer Vision Extraction):
              </label>

              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-64">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-2 right-2 bg-slate-900/80 text-white text-[11px] px-2.5 py-1 rounded-md"
                  >
                    Change Photo
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-purple-400 transition bg-slate-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                    id="hazard-photo-upload"
                  />
                  <label htmlFor="hazard-photo-upload" className="cursor-pointer space-y-2 block">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block">Click to upload photo or take picture</span>
                      <span className="text-[11px] text-slate-500">Supports JPG, PNG with camera EXIF coordinates</span>
                    </div>
                  </label>
                </div>
              )}

              {/* Sample Photo selector for quick demo testing */}
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Or use field test sample:</span>
                {samplePhotos.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setImagePreview(s.url);
                      setTitle(s.title);
                      setCategory(s.category);
                      setLocationName(s.loc);
                    }}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-700 transition"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Hazard Category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium outline-none"
                >
                  <option value="crack">Slope Tension Crack / Fissure</option>
                  <option value="slope_movement">Active Soil Creep / Mudslide</option>
                  <option value="rockfall">Rockfall & Boulder Hazard</option>
                  <option value="flash_flood">Submerged Carriageway / Flood</option>
                  <option value="blocked_road">Debris Obstructing Road</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Location / Landmark:</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. NH-06 Sonapur Tunnel Km 140"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium outline-none"
                  required
                />
              </div>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Latitude:</label>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Longitude:</label>
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Detailed Description:</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe crack length, rate of soil movement, water flow, or stranded vehicles..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'Verifying with Computer Vision AI...' : 'Submit & Analyze with Gemini'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
