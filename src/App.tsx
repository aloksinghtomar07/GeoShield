import React, { useState, useEffect } from 'react';
import { 
  HazardZone, 
  SensorNode, 
  RoadSegment, 
  ReliefCamp, 
  IncidentReport, 
  EarlyWarningAlert, 
  User 
} from './types';
import { 
  INITIAL_HAZARD_ZONES, 
  INITIAL_SENSORS, 
  INITIAL_ROAD_SEGMENTS, 
  INITIAL_RELIEF_CAMPS, 
  INITIAL_INCIDENT_REPORTS, 
  INITIAL_EARLY_WARNINGS 
} from './data/mockNerData';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { CommandCenterMap } from './components/CommandCenterMap';
import { RiskNowcastingPanel } from './components/RiskNowcastingPanel';
import { HazardRoutingPanel } from './components/HazardRoutingPanel';
import { IncidentTriagePanel } from './components/IncidentTriagePanel';
import { AlertDispatchPanel } from './components/AlertDispatchPanel';
import { AgroWeatherAssistant } from './components/AgroWeatherAssistant';
import { AuthModal } from './components/AuthModal';
import { FullScreenSirenOverlay } from './components/FullScreenSirenOverlay';
import { ExportModal } from './components/ExportModal';
import { SupabaseHubModal } from './components/SupabaseHubModal';
import { emergencySirenPlayer } from './utils/audio';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<
    'gis_map' | 'predictive_nowcasting' | 'hazard_routing' | 'incident_triage' | 'alert_dispatch' | 'agro_weather'
  >('gis_map');

  // Domain Data State
  const [hazardZones, setHazardZones] = useState<HazardZone[]>(INITIAL_HAZARD_ZONES);
  const [sensors] = useState<SensorNode[]>(INITIAL_SENSORS);
  const [roads, setRoads] = useState<RoadSegment[]>(INITIAL_ROAD_SEGMENTS);
  const [camps] = useState<ReliefCamp[]>(INITIAL_RELIEF_CAMPS);
  const [reports, setReports] = useState<IncidentReport[]>(INITIAL_INCIDENT_REPORTS);
  const [alerts, setAlerts] = useState<EarlyWarningAlert[]>(INITIAL_EARLY_WARNINGS);

  // User & Auth State
  const [user, setUser] = useState<User | null>({
    id: 'u-1',
    name: 'Dr. Mukul Sharma',
    email: 'mukul.sharma@ner-disaster.gov.in',
    role: 'authority',
    agency: 'Assam State Disaster Management Authority (ASDMA)',
    phone: '+91 94350 12345',
    verifiedReportsCount: 24,
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // App Settings & Controls
  const [language, setLanguage] = useState<'en' | 'hi' | 'as' | 'bn'>('en');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [selectedZone, setSelectedZone] = useState<HazardZone>(INITIAL_HAZARD_ZONES[0]);

  // Load server reports on mount
  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((data) => {
        if (data.reports && data.reports.length > 0) {
          setReports(data.reports);
        }
      })
      .catch((err) => console.log('Using local reports:', err));
  }, []);

  // Audio Siren Trigger & Stop
  const handleToggleSiren = () => {
    if (isSirenActive) {
      emergencySirenPlayer.stop();
      setIsSirenActive(false);
    } else {
      emergencySirenPlayer.start();
      setIsSirenActive(true);
    }
  };

  const handleStopSiren = () => {
    emergencySirenPlayer.stop();
    setIsSirenActive(false);
  };

  // Add a newly submitted report
  const handleAddNewReport = (newReport: IncidentReport) => {
    setReports((prev) => [newReport, ...prev]);
  };

  // Update report status (e.g. SDRF dispatch)
  const handleUpdateReportStatus = (
    id: string,
    status: 'REPORTED' | 'DISPATCHED' | 'RESOLVED',
    assignedUnit?: string
  ) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status, assignedRescueUnit: assignedUnit || r.assignedRescueUnit } : r
      )
    );
  };

  // Broadcast Alert
  const handleBroadcastAlert = (newAlert: Partial<EarlyWarningAlert>) => {
    const created: EarlyWarningAlert = {
      id: newAlert.id || `ALT-${Date.now().toString().slice(-4)}`,
      tier: newAlert.tier || 1,
      title: newAlert.title || 'Disaster Warning',
      hazardType: newAlert.hazardType || 'Landslide Debris Flow',
      targetDistrict: newAlert.targetDistrict || 'East Jaintia Hills',
      severity: newAlert.severity || 'CRITICAL',
      issuedAt: 'Just now',
      timeWindow: newAlert.timeWindow || 'Next 30 Minutes',
      messageBody: newAlert.messageBody || 'Critical evacuation advisory issued.',
      affectedPopulationEstimate: 14500,
      dispatchedChannels: newAlert.dispatchedChannels || ['whatsapp', 'sms', 'siren'],
    };
    setAlerts((prev) => [created, ...prev]);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800">
      {/* 1. Dark Navy Sidebar on Left */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectTab={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={() => setUser(null)}
        onOpenExport={() => setIsExportModalOpen(true)}
        isOfflineMode={isOfflineMode}
        onToggleOffline={() => setIsOfflineMode(!isOfflineMode)}
        criticalCount={hazardZones.filter(z => z.riskLevel === 'CRITICAL').length}
      />

      {/* 2. Main Content Area on Right */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          isOfflineMode={isOfflineMode}
          onToggleOffline={() => setIsOfflineMode(!isOfflineMode)}
          isSirenActive={isSirenActive}
          isSirenPlaying={isSirenActive}
          onToggleSiren={handleToggleSiren}
          onTriggerSiren={handleToggleSiren}
          currentLanguage={language}
          onSelectLanguage={setLanguage}
          user={user}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenExport={() => setIsExportModalOpen(true)}
          onOpenSupabaseHub={() => setIsSupabaseModalOpen(true)}
          unreadAlertsCount={alerts.length}
        />

        {/* Dynamic Main Body Content */}
        <main className="flex-1 overflow-y-auto bg-slate-100">
          {activeTab === 'gis_map' && (
            <CommandCenterMap
              hazardZones={hazardZones}
              sensors={sensors}
              roads={roads}
              reliefCamps={camps}
              reports={reports}
              onSelectZone={(zone) => setSelectedZone(zone)}
              onNavigateToRouting={() => setActiveTab('hazard_routing')}
              onRequestXai={(zone) => {
                setSelectedZone(zone);
                setActiveTab('predictive_nowcasting');
              }}
            />
          )}

          {activeTab === 'predictive_nowcasting' && (
            <RiskNowcastingPanel
              hazardZones={hazardZones}
              onSelectZone={(zone) => setSelectedZone(zone)}
              onTriggerAlert={(zone) => {
                handleBroadcastAlert({
                  tier: 1,
                  title: `IMMINENT LANDSLIDE DEBRIS TRIGGER: ${zone.name}`,
                  targetDistrict: `${zone.district}, ${zone.state}`,
                  messageBody: `CRITICAL: Geotechnical failure probability reached ${zone.riskScore}%. Immediate evacuation recommended for roadside settlements.`,
                  severity: 'CRITICAL',
                });
                setActiveTab('alert_dispatch');
              }}
            />
          )}

          {activeTab === 'hazard_routing' && (
            <HazardRoutingPanel
              roads={roads}
              reliefCamps={camps}
              isOfflineMode={isOfflineMode}
              onToggleOffline={() => setIsOfflineMode(!isOfflineMode)}
              onTriggerSiren={handleToggleSiren}
            />
          )}

          {activeTab === 'incident_triage' && (
            <IncidentTriagePanel
              reports={reports}
              user={user}
              onAddNewReport={handleAddNewReport}
              onUpdateReportStatus={handleUpdateReportStatus}
            />
          )}

          {activeTab === 'alert_dispatch' && (
            <AlertDispatchPanel
              alerts={alerts}
              onBroadcastAlert={handleBroadcastAlert}
              onTriggerSiren={handleToggleSiren}
              user={user}
            />
          )}

          {activeTab === 'agro_weather' && (
            <AgroWeatherAssistant
              currentLanguage={language}
              onSelectLanguage={setLanguage}
            />
          )}
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(loggedInUser) => setUser(loggedInUser)}
      />

      {/* Emergency Full-Screen Siren Overlay */}
      <FullScreenSirenOverlay
        isOpen={isSirenActive}
        onClose={handleStopSiren}
        onNavigateToCamp={() => {
          handleStopSiren();
          setActiveTab('hazard_routing');
        }}
      />

      {/* Export & Save to Google Drive Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Supabase Backend Command Hub & Real-time Synchronization Modal */}
      <SupabaseHubModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
}
