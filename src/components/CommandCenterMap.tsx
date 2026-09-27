import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  HazardZone, 
  SensorNode, 
  RoadSegment, 
  ReliefCamp, 
  IncidentReport 
} from '../types';
import { 
  Layers, 
  MapPin, 
  AlertTriangle, 
  Radio, 
  Compass, 
  Info, 
  ShieldAlert, 
  Navigation, 
  Maximize2, 
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Phone
} from 'lucide-react';

interface CommandCenterMapProps {
  hazardZones: HazardZone[];
  sensors: SensorNode[];
  roads: RoadSegment[];
  reliefCamps: ReliefCamp[];
  reports: IncidentReport[];
  onSelectZone: (zone: HazardZone) => void;
  onNavigateToRouting: (destinationCoords?: [number, number]) => void;
  onRequestXai: (zone: HazardZone) => void;
}

export const CommandCenterMap: React.FC<CommandCenterMapProps> = ({
  hazardZones,
  sensors,
  roads,
  reliefCamps,
  reports,
  onSelectZone,
  onNavigateToRouting,
  onRequestXai,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer toggles
  const [showHazardZones, setShowHazardZones] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [showCamps, setShowCamps] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [showRadarOverlay, setShowRadarOverlay] = useState(false);
  const [mapStyle, setMapStyle] = useState<'streets' | 'topo' | 'satellite'>('streets');

  // Inspector state
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'zone' | 'sensor' | 'road' | 'camp' | 'report';
    data: any;
  } | null>(null);

  // Group layer references for clean toggling
  const layerGroupsRef = useRef<{
    zones: L.LayerGroup;
    sensors: L.LayerGroup;
    roads: L.LayerGroup;
    camps: L.LayerGroup;
    reports: L.LayerGroup;
    radar: L.LayerGroup;
    tileLayer: L.TileLayer | null;
  }>({
    zones: L.layerGroup(),
    sensors: L.layerGroup(),
    roads: L.layerGroup(),
    camps: L.layerGroup(),
    reports: L.layerGroup(),
    radar: L.layerGroup(),
    tileLayer: null,
  });

  // Tile layer URLs
  const tileLayers = {
    streets: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    topo: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered on Meghalaya / Assam corridor in North East India
    const map = L.map(mapContainerRef.current, {
      center: [25.5788, 92.1500],
      zoom: 8,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const baseTile = L.tileLayer(tileLayers.streets, {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 18,
    }).addTo(map);

    layerGroupsRef.current.tileLayer = baseTile;

    // Add layer groups to map
    layerGroupsRef.current.zones.addTo(map);
    layerGroupsRef.current.sensors.addTo(map);
    layerGroupsRef.current.roads.addTo(map);
    layerGroupsRef.current.camps.addTo(map);
    layerGroupsRef.current.reports.addTo(map);
    layerGroupsRef.current.radar.addTo(map);

    mapInstanceRef.current = map;

    // Default select first critical zone
    if (hazardZones.length > 0) {
      setSelectedEntity({ type: 'zone', data: hazardZones[0] });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile on Style Change
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupsRef.current.tileLayer) return;
    mapInstanceRef.current.removeLayer(layerGroupsRef.current.tileLayer);
    const newTile = L.tileLayer(tileLayers[mapStyle], {
      attribution: '&copy; OpenStreetMap, CartoDB, ESRI',
      maxZoom: 18,
    }).addTo(mapInstanceRef.current);
    layerGroupsRef.current.tileLayer = newTile;
  }, [mapStyle]);

  // Render Hazard Zones
  useEffect(() => {
    const group = layerGroupsRef.current.zones;
    group.clearLayers();
    if (!showHazardZones) return;

    hazardZones.forEach((zone) => {
      const color = zone.riskLevel === 'CRITICAL' ? '#EF4444' : zone.riskLevel === 'HIGH' ? '#F97316' : '#EAB308';
      
      const circle = L.circle([zone.lat, zone.lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.25,
        weight: 2,
        radius: zone.radiusKm * 1000,
      });

      circle.on('click', () => {
        setSelectedEntity({ type: 'zone', data: zone });
        onSelectZone(zone);
      });

      // Pulse center icon
      const centerIcon = L.divIcon({
        className: 'custom-hazard-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full opacity-75" style="background-color: ${color}"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 border-2 border-white shadow-md flex items-center justify-center text-[9px] font-bold text-white" style="background-color: ${color}">
              !
            </span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([zone.lat, zone.lng], { icon: centerIcon });
      marker.on('click', () => {
        setSelectedEntity({ type: 'zone', data: zone });
        onSelectZone(zone);
      });

      group.addLayer(circle);
      group.addLayer(marker);
    });
  }, [hazardZones, showHazardZones]);

  // Render Sensors
  useEffect(() => {
    const group = layerGroupsRef.current.sensors;
    group.clearLayers();
    if (!showSensors) return;

    sensors.forEach((sensor) => {
      const statusColor = sensor.status === 'ALERT' ? '#EF4444' : sensor.status === 'WARNING' ? '#F59E0B' : '#10B981';
      
      const sensorIcon = L.divIcon({
        className: 'custom-sensor-marker',
        html: `
          <div class="p-1 rounded-md bg-white border-2 shadow-md flex items-center gap-1 text-[10px] font-mono font-bold" style="border-color: ${statusColor}">
            <div class="w-2 h-2 rounded-full" style="background-color: ${statusColor}"></div>
            <span>${sensor.soilMoisturePct}%</span>
          </div>
        `,
        iconSize: [46, 20],
        iconAnchor: [23, 10],
      });

      const marker = L.marker([sensor.lat, sensor.lng], { icon: sensorIcon });
      marker.on('click', () => {
        setSelectedEntity({ type: 'sensor', data: sensor });
      });

      group.addLayer(marker);
    });
  }, [sensors, showSensors]);

  // Render Road Segments
  useEffect(() => {
    const group = layerGroupsRef.current.roads;
    group.clearLayers();
    if (!showRoads) return;

    roads.forEach((road) => {
      const color = road.status === 'IMPASSABLE' ? '#DC2626' : road.status === 'WARNING' ? '#D97706' : '#16A34A';
      const weight = road.status === 'IMPASSABLE' ? 5 : 4;
      const dashArray = road.status === 'IMPASSABLE' ? '6, 6' : undefined;

      const polyline = L.polyline([road.startCoords, road.endCoords], {
        color,
        weight,
        opacity: 0.9,
        dashArray,
      });

      polyline.on('click', () => {
        setSelectedEntity({ type: 'road', data: road });
      });

      group.addLayer(polyline);
    });
  }, [roads, showRoads]);

  // Render Relief Camps
  useEffect(() => {
    const group = layerGroupsRef.current.camps;
    group.clearLayers();
    if (!showCamps) return;

    reliefCamps.forEach((camp) => {
      const campIcon = L.divIcon({
        className: 'custom-camp-marker',
        html: `
          <div class="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow-md flex items-center justify-center text-white text-[11px] font-bold">
            H
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([camp.lat, camp.lng], { icon: campIcon });
      marker.on('click', () => {
        setSelectedEntity({ type: 'camp', data: camp });
      });

      group.addLayer(marker);
    });
  }, [reliefCamps, showCamps]);

  // Render Citizen Incident Reports
  useEffect(() => {
    const group = layerGroupsRef.current.reports;
    group.clearLayers();
    if (!showReports) return;

    reports.forEach((report) => {
      const reportIcon = L.divIcon({
        className: 'custom-report-marker',
        html: `
          <div class="w-6 h-6 rounded-md bg-purple-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px]">
            📸
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([report.lat, report.lng], { icon: reportIcon });
      marker.on('click', () => {
        setSelectedEntity({ type: 'report', data: report });
      });

      group.addLayer(marker);
    });
  }, [reports, showReports]);

  // Render Simulated Doppler Radar Overlay
  useEffect(() => {
    const group = layerGroupsRef.current.radar;
    group.clearLayers();
    if (!showRadarOverlay) return;

    // Simulated Doppler radar clouds over Cherrapunji/East Jaintia hills
    const radarCircle1 = L.circle([25.27, 92.0], {
      color: '#3B82F6',
      fillColor: '#3B82F6',
      fillOpacity: 0.35,
      radius: 45000,
      weight: 1,
    });
    const radarCircle2 = L.circle([25.15, 92.4], {
      color: '#EF4444',
      fillColor: '#EF4444',
      fillOpacity: 0.45,
      radius: 25000,
      weight: 1,
    });

    group.addLayer(radarCircle1);
    group.addLayer(radarCircle2);
  }, [showRadarOverlay]);

  // Sector Quick Fly-To
  const flyToSector = (lat: number, lng: number, zoom: number = 11) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1.2 });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-105px)] flex flex-col overflow-hidden bg-slate-100">
      {/* Map Control Bar */}
      <div className="bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 py-2.5 z-20 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* Layer Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider mr-1">
            Overlays:
          </span>
          <button
            onClick={() => setShowHazardZones(!showHazardZones)}
            className={`px-2.5 py-1 rounded-md border font-medium transition ${
              showHazardZones 
                ? 'bg-rose-50 border-rose-300 text-rose-800' 
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            ● Landslide Risk Polygons
          </button>
          <button
            onClick={() => setShowSensors(!showSensors)}
            className={`px-2.5 py-1 rounded-md border font-medium transition ${
              showSensors 
                ? 'bg-blue-50 border-blue-300 text-blue-800' 
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            ● Soil & Pore Sensors ({sensors.length})
          </button>
          <button
            onClick={() => setShowRoads(!showRoads)}
            className={`px-2.5 py-1 rounded-md border font-medium transition ${
              showRoads 
                ? 'bg-amber-50 border-amber-300 text-amber-800' 
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            ● Road Closures ({roads.filter(r => r.status === 'IMPASSABLE').length} Cut)
          </button>
          <button
            onClick={() => setShowCamps(!showCamps)}
            className={`px-2.5 py-1 rounded-md border font-medium transition ${
              showCamps 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            ● Relief Shelters ({reliefCamps.length})
          </button>
          <button
            onClick={() => setShowReports(!showReports)}
            className={`px-2.5 py-1 rounded-md border font-medium transition ${
              showReports 
                ? 'bg-purple-50 border-purple-300 text-purple-800' 
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            ● Citizen Reports ({reports.length})
          </button>
          <button
            onClick={() => setShowRadarOverlay(!showRadarOverlay)}
            className={`px-2.5 py-1 rounded-md border font-medium transition ${
              showRadarOverlay 
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs' 
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            🛰️ IMD Doppler Radar Layer
          </button>
        </div>

        {/* Base Map Style & Sectors */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs">
            <button
              onClick={() => setMapStyle('streets')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium ${mapStyle === 'streets' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}
            >
              Street
            </button>
            <button
              onClick={() => setMapStyle('topo')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium ${mapStyle === 'topo' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}
            >
              DEM Topo
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium ${mapStyle === 'satellite' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}
            >
              Satellite
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Container & Floating Panels */}
      <div className="relative flex-1 w-full h-full">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Sector Quick-Nav Floating Strip */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-1.5 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/60 shadow-lg text-white text-xs">
          <span className="px-2 py-1 text-[11px] font-bold text-slate-400">Quick Sectors:</span>
          <button
            onClick={() => flyToSector(25.1122, 92.3601, 12)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 font-medium transition"
          >
            Sonapur (NH-06)
          </button>
          <button
            onClick={() => flyToSector(25.1697, 93.0183, 11)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium transition"
          >
            Haflong (Dima Hasao)
          </button>
          <button
            onClick={() => flyToSector(27.5028, 88.5298, 11)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 font-medium transition"
          >
            Dzongu (Sikkim)
          </button>
          <button
            onClick={() => flyToSector(25.6751, 94.1086, 11)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 font-medium transition"
          >
            Kohima Ridge
          </button>
          <button
            onClick={() => flyToSector(26.1445, 91.7362, 11)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 font-medium transition"
          >
            Guwahati Basin
          </button>
        </div>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-6 left-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-lg border border-slate-200 shadow-md text-xs text-slate-700 w-56">
          <h4 className="font-bold text-slate-900 mb-2 flex items-center justify-between text-[11px] uppercase tracking-wider">
            <span>GIS Map Legend</span>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </h4>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 border border-rose-700"></span>
              <span>Critical Hazard Zone (&gt;80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-700"></span>
              <span>High Risk Zone (60–80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 bg-red-600 border-dashed border-red-800"></span>
              <span>Impassable / Blocked Road (&gt;30cm)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-blue-600"></span>
              <span>Infiltration & Piezometer Sensor</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[8px] font-bold">H</span>
              <span>Relief Camp / Safe Shelter</span>
            </div>
          </div>
        </div>

        {/* Selected Entity Inspector Side Drawer */}
        {selectedEntity && (
          <div className="absolute top-4 right-4 z-20 w-96 max-h-[calc(100%-32px)] bg-white rounded-xl shadow-2xl border border-slate-200/90 overflow-y-auto p-4 flex flex-col gap-3.5 animate-in fade-in slide-in-from-right-4 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {selectedEntity.type === 'zone' ? 'Landslide Risk Polygon'
                    : selectedEntity.type === 'sensor' ? 'IoT Infiltration Sensor'
                    : selectedEntity.type === 'road' ? 'Road Connectivity Segment'
                    : selectedEntity.type === 'camp' ? 'Emergency Relief Camp'
                    : 'Field Damage Report'}
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">
                  {selectedEntity.data.name || selectedEntity.data.title || selectedEntity.data.locationName}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedEntity.data.district || selectedEntity.data.location || 'North Eastern Region'}
                </p>
              </div>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Entity Specific Details */}
            {selectedEntity.type === 'zone' && (() => {
              const zone: HazardZone = selectedEntity.data;
              return (
                <div className="space-y-3 text-xs">
                  {/* Risk Score Pill */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                    <div>
                      <div className="text-[11px] font-medium text-rose-800">Landslide Probability Index</div>
                      <div className="text-2xl font-black text-rose-600">{zone.riskScore}%</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-rose-600 text-white">
                      {zone.riskLevel}
                    </span>
                  </div>

                  {/* Physical Parameters Grid */}
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Soil Saturation</span>
                      <span className="font-bold text-sm text-slate-800">{zone.soilSaturationPct}%</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Slope Incline</span>
                      <span className="font-bold text-sm text-slate-800">{zone.slopeAngleDeg}°</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Rainfall (Last 24h)</span>
                      <span className="font-bold text-sm text-slate-800">{zone.rainLast24hMm} mm</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Next 6h Forecast</span>
                      <span className="font-bold text-sm text-blue-600">+{zone.predictedRainNext6hMm} mm</span>
                    </div>
                  </div>

                  {/* Geology */}
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                      Substratum Geology (CartoDEM)
                    </span>
                    <p className="text-slate-700 text-xs font-medium">{zone.geology}</p>
                  </div>

                  {/* Explainable AI Box */}
                  <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-blue-900 flex items-center gap-1.5 text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        Explainable AI (XAI) Nowcast
                      </span>
                    </div>
                    <p className="text-slate-700 text-xs leading-relaxed">
                      {zone.xaiReasoning}
                    </p>
                  </div>

                  {/* Affected Villages */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">
                      Vulnerable Habitations:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {zone.vulnerableVillages.map((v, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] text-slate-700">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={() => onRequestXai(zone)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-xs transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Re-analyze with Gemini XAI</span>
                    </button>
                    <button
                      onClick={() => onNavigateToRouting([zone.lat, zone.lng])}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition"
                    >
                      <Navigation className="w-3.5 h-3.5 text-slate-600" />
                      <span>Calculate Safe Corridors Away From Zone</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {selectedEntity.type === 'sensor' && (() => {
              const sensor: SensorNode = selectedEntity.data;
              return (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div>
                      <div className="text-[10px] text-slate-400">Node ID: {sensor.id}</div>
                      <div className="font-bold text-sm text-slate-900">{sensor.name}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      sensor.status === 'ALERT' ? 'bg-red-100 text-red-700' : sensor.status === 'WARNING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {sensor.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div className="p-2.5 rounded bg-blue-50 border border-blue-100">
                      <span className="text-[10px] text-blue-700 block">Soil Moisture</span>
                      <span className="font-bold text-lg text-blue-900">{sensor.soilMoisturePct}%</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block">Pore Water Pressure</span>
                      <span className="font-bold text-lg text-slate-900">{sensor.porePressureKPa} kPa</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block">Inclinometer Tilt</span>
                      <span className="font-bold text-lg text-slate-900">{sensor.slopeTiltDeg}°</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block">Solar Battery</span>
                      <span className="font-bold text-lg text-emerald-600">{sensor.batteryPct}%</span>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-50 rounded text-slate-500 text-[11px] flex items-center justify-between">
                    <span>Telemetry ping: {sensor.lastPing}</span>
                    <span>LoRaWAN 865 MHz</span>
                  </div>
                </div>
              );
            })()}

            {selectedEntity.type === 'road' && (() => {
              const road: RoadSegment = selectedEntity.data;
              return (
                <div className="space-y-3 text-xs">
                  <div className={`p-3 rounded-lg border ${
                    road.status === 'IMPASSABLE' ? 'bg-red-50 border-red-200 text-red-900' : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    <div className="font-bold text-sm">
                      {road.status === 'IMPASSABLE' ? '⛔ ROAD SEVERED / IMPASSABLE' : '⚠️ HAZARD CAUTION'}
                    </div>
                    <div className="text-xs mt-1">
                      Water depth: <strong>{road.waterDepthCm} cm</strong> | Debris: <strong>{road.debrisSeverity}</strong>
                    </div>
                  </div>

                  <p className="text-slate-600 text-xs">
                    Last observed: {road.lastReported}
                  </p>

                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700">
                    <span className="font-bold block mb-1">Heavy Vehicle Clearance:</span>
                    <span className={road.isSafeForHeavyVehicles ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                      {road.isSafeForHeavyVehicles ? '✓ Permitted with escort' : '✕ Strict Prohibition: Risk of rollover / subgrade collapse'}
                    </span>
                  </div>

                  <button
                    onClick={() => onNavigateToRouting(road.startCoords)}
                    className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Find Alternative Corridors</span>
                  </button>
                </div>
              );
            })()}

            {selectedEntity.type === 'camp' && (() => {
              const camp: ReliefCamp = selectedEntity.data;
              return (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">Occupancy Status</span>
                      <span className="font-bold text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        {Math.round((camp.currentOccupancy / camp.capacity) * 100)}% Full
                      </span>
                    </div>
                    <div className="mt-2 text-xs">
                      Capacity: <strong>{camp.capacity}</strong> persons | Current: <strong>{camp.currentOccupancy}</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-700 text-xs">Emergency Facilities:</span>
                    <div className="flex flex-wrap gap-1">
                      {camp.amenities.map((a, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-100 rounded text-[11px] text-slate-700 border border-slate-200">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900 text-white space-y-1 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Radio Frequency:</span>
                      <span className="text-amber-400 font-bold">{camp.radioFrequencyMhz}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Emergency Desk:</span>
                      <span className="text-blue-300 font-bold">{camp.contactNumber}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateToRouting([camp.lat, camp.lng])}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Navigate Evacuees to Shelter</span>
                  </button>
                </div>
              );
            })()}

            {selectedEntity.type === 'report' && (() => {
              const rep: IncidentReport = selectedEntity.data;
              return (
                <div className="space-y-3 text-xs">
                  {rep.imageUrl && (
                    <div className="rounded-lg overflow-hidden border border-slate-200 max-h-48">
                      <img src={rep.imageUrl} alt={rep.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="p-2.5 rounded bg-purple-50 border border-purple-200 text-purple-900">
                    <div className="flex items-center justify-between font-bold text-xs">
                      <span>AI Verification:</span>
                      <span className="text-purple-700 font-extrabold">{rep.aiSpamStatus}</span>
                    </div>
                    <p className="text-[11px] mt-1 text-slate-700">{rep.aiNotes}</p>
                  </div>

                  <p className="text-slate-700 text-xs">{rep.description}</p>

                  <div className="text-[11px] text-slate-500 border-t pt-2">
                    Reported by: <strong>{rep.reportedBy}</strong> ({rep.reporterRole}) • {rep.timestamp}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
