export type DisasterPhase = 'pre' | 'during' | 'post';

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export type UserRole = 'authority' | 'responder' | 'citizen';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agency?: string;
  region?: string;
  phone?: string;
  createdAt?: string;
  verifiedReportsCount?: number;
}

export interface HazardZone {
  id: string;
  name: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  radiusKm: number;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  soilSaturationPct: number;
  rainLast24hMm: number;
  predictedRainNext6hMm: number;
  slopeAngleDeg: number;
  geology: string; // e.g. "Fractured Shales & Sandstone"
  xaiReasoning: string;
  vulnerableVillages: string[];
  affectedRoads: string[];
  lastUpdated: string;
  evacuationRecommended: boolean;
}

export interface SensorNode {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  soilMoisturePct: number;
  porePressureKPa: number;
  slopeTiltDeg: number;
  batteryPct: number;
  status: 'ONLINE' | 'WARNING' | 'ALERT' | 'OFFLINE';
  lastPing: string;
}

export interface RoadSegment {
  id: string;
  name: string; // e.g. "NH-06 Silchar-Shillong Highway Km 48"
  startCoords: [number, number];
  endCoords: [number, number];
  status: 'OPEN' | 'WARNING' | 'IMPASSABLE';
  waterDepthCm: number;
  debrisSeverity?: 'none' | 'minor' | 'blocking';
  isSafeForHeavyVehicles: boolean;
  alternativeRouteId?: string;
  lastReported: string;
}

export interface ReliefCamp {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  capacity: number;
  currentOccupancy: number;
  amenities: string[];
  contactNumber: string;
  radioFrequencyMhz: string;
  isAccessible: boolean;
}

export interface IncidentReport {
  id: string;
  title: string;
  category: 'crack' | 'slope_movement' | 'rockfall' | 'flash_flood' | 'blocked_road';
  lat: number;
  lng: number;
  locationName: string;
  description: string;
  imageUrl?: string;
  isAiVerified: boolean;
  aiSpamStatus: 'VERIFIED_DISASTER' | 'SUSPECTED_SPAM' | 'PENDING_ANALYSIS';
  aiConfidence: number;
  aiNotes?: string;
  severity: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MODERATE';
  status: 'REPORTED' | 'DISPATCHED' | 'RESOLVED';
  reportedBy: string;
  reporterRole: string;
  timestamp: string;
  assignedUnit?: string;
}

export interface EarlyWarningAlert {
  id: string;
  tier: 1 | 2 | 3;
  title: string;
  hazardType: 'Flash Flood' | 'Landslide Debris Flow' | 'High Rain & Saturation' | 'Weather Advisory';
  targetDistrict: string;
  targetGroups?: string[];
  severity: RiskLevel;
  issuedAt: string;
  timeWindow: string; // e.g. "Next 15-30 mins" or "2-6 Hours"
  messageBody: string;
  dispatchedChannels: ('whatsapp' | 'sms' | 'siren' | 'in_app')[];
  affectedPopulationEstimate: number;
  isSirenTriggered?: boolean;
}

export type AlertDeliveryStatus = 'DELIVERED' | 'TRANSMITTING' | 'CONFIRMED_ACK' | 'PARTIAL';

export interface ChannelDeliveryMetrics {
  channel: 'whatsapp' | 'sms' | 'siren' | 'in_app';
  status: 'DELIVERED' | 'SENDING' | 'QUEUED' | 'ACTIVE';
  targetCount: number;
  deliveredCount: number;
  deliveryRatePercent: number;
  gatewayLatencyMs: number;
}

export interface DispatchedAlertLog {
  id: string;
  alertId: string;
  tier: 1 | 2 | 3;
  title: string;
  hazardType: string;
  targetDistrict: string;
  targetGroups: string[];
  severity: RiskLevel;
  issuedAt: string;
  timestampISO: string;
  timeWindow: string;
  messageBody: string;
  dispatchedBy: string;
  dispatchedChannels: ('whatsapp' | 'sms' | 'siren' | 'in_app')[];
  deliveryStatus: AlertDeliveryStatus;
  overallDeliveryPercent: number;
  totalRecipients: number;
  deliveredRecipients: number;
  acknowledgements: number;
  channelMetrics: ChannelDeliveryMetrics[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  language?: 'en' | 'as' | 'bn' | 'hi';
  suggestedAction?: string;
}
