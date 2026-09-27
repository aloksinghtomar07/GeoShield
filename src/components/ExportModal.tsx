import React, { useState } from 'react';
import { 
  HardDrive, 
  Download, 
  Cloud, 
  FileJson, 
  Archive, 
  FileText,
  CheckCircle2, 
  ExternalLink, 
  X, 
  ShieldCheck, 
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [downloadingJson, setDownloadingJson] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const res = await fetch('/api/docs/pdf');
      if (!res.ok) throw new Error('Failed to fetch PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'NER_GeoShield_Technical_Documentation.pdf';
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error('PDF download error:', err);
      window.open('/NER_GeoShield_Technical_Documentation.pdf', '_blank');
    } finally {
      setTimeout(() => setDownloadingPdf(false), 800);
    }
  };

  const handleDownloadZip = () => {
    setDownloadingZip(true);
    const link = document.createElement('a');
    link.href = '/api/export/project-zip';
    link.setAttribute('download', 'geoshield-ner-full-project.zip');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadingZip(false), 2000);
  };

  const handleDownloadJson = () => {
    setDownloadingJson(true);
    const link = document.createElement('a');
    link.href = '/api/export/project-data';
    link.setAttribute('download', 'geoshield-ner-data-snapshot.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadingJson(false), 1500);
  };

  const openGoogleDriveUpload = () => {
    // Direct link to Google Drive web interface so user can drop/upload their downloaded project archive or backup
    window.open('https://drive.google.com/drive/my-drive', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/70 to-indigo-50/50">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <HardDrive className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <span>Export & Save to Google Drive</span>
              </h3>
              <p className="text-xs text-slate-500">
                Package source code, GIS hazard layers, and telemetry logs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/80 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Quick steps banner */}
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1.5">
            <div className="font-bold text-xs flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-blue-600" />
              <span>How to store in your Google Drive:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 leading-relaxed text-[11px]">
              <li>Click <strong>Download Full Project ZIP</strong> below to save the entire application bundle.</li>
              <li>Click <strong>Open Google Drive</strong> to open your drive in a new tab.</li>
              <li>Drag & drop the zip file directly into your Google Drive folder or team shared drive.</li>
            </ol>
          </div>

          {/* Technical Documentation PDF Card */}
          <div className="p-4 rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50/80 to-amber-50/60 transition space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-slate-900">Technical Documentation (PDF Manual)</h4>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                      PDF • 6 Pages
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Complete multi-page official technical manual detailing all features, geotechnical algorithms, Gemini 2.5 AI logic, Supabase architecture, and backend API routes.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-1 flex items-center gap-2">
              <button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="py-2 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloadingPdf ? 'Generating PDF...' : 'Download Technical Manual (PDF)'}</span>
              </button>
              <a
                href="/NER_GeoShield_Technical_Documentation.pdf"
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs flex items-center gap-1.5 transition"
              >
                <span>View in Tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Download Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Project ZIP */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Archive className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900">Complete Codebase</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Full React + Vite + Express TypeScript project with all components, GIS maps, models & server.
                </p>
              </div>

              <button
                onClick={handleDownloadZip}
                disabled={downloadingZip}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloadingZip ? 'Packaging Zip...' : 'Download ZIP'}</span>
              </button>
            </div>

            {/* Snapshot Data JSON */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileJson className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-slate-900">Project Snapshot Data</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Export all GIS hazard zones, sensors, road blocks, relief camps, triage incidents, and broadcast logs.
                </p>
              </div>

              <button
                onClick={handleDownloadJson}
                disabled={downloadingJson}
                className="w-full py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloadingJson ? 'Exporting JSON...' : 'Download JSON'}</span>
              </button>
            </div>
          </div>

          {/* Cloud Action */}
          <div className="pt-2">
            <button
              onClick={openGoogleDriveUpload}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Cloud className="w-4 h-4 text-blue-400" />
              <span>Open Google Drive (Upload Files)</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* AI Studio Export Note */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>AI Studio Native Export:</strong> You can also export this project anytime via AI Studio's top-level <strong>Settings &gt; Export to GitHub / ZIP</strong>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
