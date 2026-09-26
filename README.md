# GeoShield
🏔️ GeoShield AI — North Eastern Region (NER) Early Warning & Landslide Risk Monitoring System
![Image](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)
![Image](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Image](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)
![Image](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?logo=tailwindcss&logoColor=white)
![Image](https://img.shields.io/badge/Google_Gemini-2.5%20%2F%20Flash-4285F4?logo=google&logoColor=white)
![Image](https://img.shields.io/badge/Leaflet-1.9.4-199900?logo=leaflet&logoColor=white)
![Image](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?logo=supabase&logoColor=white)
![Image](https://img.shields.io/badge/License-MIT-yellow.svg)
GeoShield AI is a mission-critical, AI-driven disaster risk reduction and early warning platform engineered for the vulnerable hilly terrain of India's North Eastern Region (NER) — spanning Assam, Meghalaya, Mizoram, Sikkim, Arunachal Pradesh, Nagaland, Manipur, and Tripura. It integrates real-time geospatial IoT telemetry, geotechnical slope stability nowcasting, dynamic hazard-aware evacuation routing, crowdsourced incident verification, and multi-channel emergency broadcast alerts (Class 0 Flash SMS, WhatsApp Business, in-app acoustic siren, and Web Push).
📑 Table of Contents
Executive Summary
Key Features & System Modules
1. GIS Command Center (Live GIS)
2. Predictive Risk Nowcasting
3. Hazard-Aware Safe Corridor Routing
4. Incident Triage & Crowdsourced Reporting
5. Multi-Channel Alert Dissemination
6. Multilingual Agro-Weather & Evacuation Assistant
System Architecture
Technology Stack
API Endpoints Reference
Directory Structure
Getting Started
Prerequisites
Environment Variables Configuration
Installation & Local Run
Production Build
Multi-Channel Gateway Setup
Regional Language & Voice Accessibility
Contributing
License
🌍 Executive Summary
The Eastern Himalayas and North Eastern Region of India endure some of the highest precipitation rates globally, resulting in chronic monsoon-induced landslides, slope liquefaction, road collapses, and isolated hill communities.
GeoShield AI bridges the critical gap between raw geotechnical telemetry and rapid public action:
Instant Factor of Safety (FoS) computation via the Infinite Slope geotechnical equilibrium model combined with live pore-water pressure and antecedent rainfall data.
Dynamic hazard obstacle avoidance that continuously reroutes emergency convoys and fleeing civilians away from obstructed highways (such as NH-29 or NH-102) to the nearest open relief shelters.
Zero-lag multi-channel alerting utilizing telecom Class 0 Flash SMS (which overlays recipient phone screens without unlocking), Meta WhatsApp interactive cards, and high-frequency in-app disaster siren synthesizers.
Linguistic and accessibility inclusion supporting local North Eastern languages (Assamese, Bengali, Hindi, English) with bi-directional voice recognition and speech synthesis for local farmers and rural communities.
🚀 Key Features & System Modules
1. GIS Command Center (Live GIS)
Interactive Multi-Layered Geospatial Canvas: Built with Leaflet, supporting high-resolution ESRI World Imagery, CARTO Positron vector tiles, and OpenStreetMap basemaps.
IoT Sensor Telemetry Overlay: Visualizes live piezometer pore-water pressure (
), tiltmeter displacement (
), and tipping-bucket rain gauge rates (
).
Dynamic Hazard Polygons: Real-time rendering of Critical (Red), High (Amber), and Moderate (Yellow) vulnerability zones with radius buffers and population density markers.
Relief Camp Status & Capacity: Displays capacity saturation, medical resource availability, and operational status of emergency shelters.
2. Predictive Risk Nowcasting
Infinite Slope Geotechnical Equilibrium:

Calculates real-time Factor of Safety based on cohesion (
), soil unit weight (
), slope angle (
), friction angle (
), and pore pressure (
).
Rainfall-Runoff & Saturation Thresholding: Ingests cumulative 24h/72h rainfall data to model impending soil liquefaction.
AI-Synthesized Geospatial Threat Nowcast: Uses Google Gemini 2.5/Flash with structured prompt engineering to generate district-by-district risk projections and time-to-failure estimates.
3. Hazard-Aware Safe Corridor Routing
Obstacle-Avoiding Dijkstra/Graph Routing: Computes shortest traversable paths from user location or incident sites to verified relief shelters while strictly penalizing or circumventing blocked roads.
Live Elevation & Slope Incline Profiles: Generates high-resolution topographical gradient charts to warn rescue drivers of steep grades and high-risk cuttings.
Segment-Level Clearance Indicators: Provides turn-by-turn road statuses with highway designations (e.g., NH-29 Dimapur-Kohima, NH-102 Imphal-Moreh).
4. Incident Triage & Crowdsourced Reporting
Field Observer Dispatch & Citizen Uploads: Enables on-ground emergency teams and citizens to report mudslides, structural cracks, fallen debris, and flash floods with geolocation and photo attachments.
Automated AI Damage Assessment: Automatically analyzes damage magnitude, validates GPS coordinates, and flags potential duplicate sightings within a 500m radius.
Authority Verification Workflow: ASDMA/NDRF officers can verify, escalate, or reject incoming reports, which immediately update the operational GIS layer.
5. Multi-Channel Alert Dissemination
Class 0 Telecom Flash SMS: Dispatches carrier-grade flash SMS via Twilio / Exotel gateways that immediately take over recipient screens without requiring phone unlocking.
WhatsApp Business Cloud API (Meta Graph API v21.0): Broadcasts rich interactive cards with disaster severity badges, recommended actions, and one-tap acknowledgment buttons.
High-Priority In-App Siren & Web Push: Triggers a dual-tone acoustic disaster siren (800 Hz – 1200 Hz sweep) synthesized in real-time via the HTML5 Web Audio API, paired with Server-Sent Events (SSE) push banners.
Sanitized Live Telemetry & Carrier Receipts: Displays full audit logs, gateway transaction IDs, and verified advisory message bodies.
6. Multilingual Agro-Weather & Evacuation Assistant
Voice-First Accessibility: Integrated Web Speech API (SpeechRecognition & SpeechSynthesis) for seamless hands-free operation in noisy field conditions.
Regional Language Synthesis: Native support for Assamese (অসমীয়া), Hindi (हिन्दी), Bengali (বাংলা), and English.
Farmer Advisory & Crop Protection: Delivers actionable advice on terrace cultivation drainage, livestock relocation, and landslide risk precautions during heavy downpours.
🏛️ System Architecture
code
Text
+---------------------------------------+
                                  |         GeoShield AI Frontend         |
                                  |  (React 19 + TypeScript + Vite + CSS) |
                                  +---------------------------------------+
                                      |               |               |
               Interactive Web Map    |               | User Audio    | Live SSE Events
               (Leaflet + Tile API)   |               | (Web Speech)  | & Carrier Push
                                      v               v               v
+---------------------------------------------------------------------------------+
|                        Node.js & Express Application Layer                     |
|                               (server.ts / tsx)                                 |
+---------------------------------------------------------------------------------+
         |                          |                           |
         v                          v                           v
+------------------+     +--------------------+     +-------------------------+
|  Gemini AI Core  |     |  Supabase Backend  |     |  Multi-Channel Dispatch |
| (@google/genai)  |     |  (PostgreSQL/Auth) |     |  (server/dispatch.ts)   |
+------------------+     +--------------------+     +-------------------------+
         |                          |                  |          |          |
         | AI Fallback Chain        | Sync & Profiles  | Flash    | WhatsApp | SSE Push
         | gemini-3.8-flash         | Incidents & Logs | SMS      | Business | & Audio
         | gemini-flash-latest      |                  | (Twilio) | (Meta)   | Siren
         | gemini-3.1-flash-lite    |                  v          v          v
🛠️ Technology Stack
Layer	Technologies
Frontend Framework	React 19, TypeScript 5.8, Vite 6.2
Styling & Animation	Tailwind CSS v4, Motion (Framer Motion), Lucide React
Geospatial & Mapping	Leaflet 1.9, ESRI World Imagery, CARTO Basemaps, OpenStreetMap
Backend Server	Node.js, Express 4.21, Server-Sent Events (SSE), tsx
Artificial Intelligence	Google Gemini API (@google/genai) with dynamic multi-tier model fallback
Database & Auth	Supabase (PostgreSQL 15, Row Level Security, Auth)
Emergency Gateways	Twilio REST API / Exotel, Meta WhatsApp Business Cloud API, Firebase Cloud Messaging (FCM)
Audio & Speech Engine	Web Audio API (OscillatorNode siren synthesis), Web Speech Recognition & Synthesis API
PDF Reporting	PDFKit for automated incident & readiness summary generation
📡 API Endpoints Reference
AI Analysis & Predictive Services
POST /api/nowcast — Computes Factor of Safety (FoS) and generates Gemini-powered situational risk assessments for selected hazard sectors.
POST /api/assistant/chat — Conversational assistant endpoint for multilingual agro-weather inquiries and evacuation guidance.
POST /api/triage/analyze-image — Multimodal vision analysis of citizen damage images for hazard classification.
Navigation & Routing
POST /api/route — Evaluates start/destination coordinates, scans for blocked road sectors, and returns an optimal safe evacuation route with elevation profile.
Reports & Incident Management
GET /api/reports — Retrieves all crowdsourced and verified incident reports.
POST /api/reports — Submits a new incident report with geolocation, photos, and severity classification.
PATCH /api/reports/:id/verify — Authorizes ASDMA/NDRF verification and marks incidents as active or resolved.
Multi-Channel Alert Dispatch
POST /api/alerts/broadcast — Triggers a multi-channel emergency alert across Flash SMS, WhatsApp, and in-app sirens.
GET /api/alerts/live-stream — Server-Sent Events (SSE) stream for real-time broadcast pushes and emergency audio triggers.
GET /api/alerts/gateways — Returns operational status, latency, and credentials verification for external messaging gateways.
Data Sync & Exports
GET /api/supabase/status — Checks Supabase connectivity, auth state, and database table health.
POST /api/supabase/sync — Synchronizes user profiles and incident reports to Supabase tables.
GET /api/export/pdf — Generates a downloadable situational disaster bulletin PDF.
📁 Directory Structure
code
Text
geoshield-ner/
├── .env.example                     # Environment configuration template
├── package.json                     # Project dependencies & build scripts
├── tsconfig.json                    # TypeScript compiler configuration
├── vite.config.ts                   # Vite client build configuration
├── metadata.json                    # Application metadata & frame permissions
├── server.ts                        # Main Express backend server & API routes
├── server/
│   └── dispatchService.ts          # Telecom Flash SMS, WhatsApp & FCM dispatch logic
├── src/
│   ├── main.tsx                     # Application React entry point
│   ├── App.tsx                      # Root application layout & state orchestrator
│   ├── index.css                    # Tailwind CSS v4 directives & typography rules
│   ├── types.ts                     # Core TypeScript domain models & interfaces
│   ├── components/
│   │   ├── CommandCenterMap.tsx     # Leaflet geospatial map engine
│   │   ├── RiskNowcastingPanel.tsx  # Geotechnical FoS & rainfall nowcasting
│   │   ├── HazardRoutingPanel.tsx   # Safe corridor routing & elevation profile
│   │   ├── IncidentTriagePanel.tsx  # Field reports triage & verification
│   │   ├── AlertDispatchPanel.tsx   # Multi-channel alert dispatch center
│   │   ├── AgroWeatherAssistant.tsx # Multilingual voice-enabled farmer assistant
│   │   ├── Sidebar.tsx              # Disaster lifecycle module navigation
│   │   ├── Navbar.tsx               # Status bar, language selector & auth modal
│   │   ├── AuthModal.tsx            # Authority login & registration modal
│   │   ├── EmergencyInAppBanner.tsx # Top emergency alert banner
│   │   ├── FullScreenSirenOverlay.tsx# Full-screen audio-visual siren overlay
│   │   ├── SupabaseHubModal.tsx     # Supabase connection & sync hub
│   │   └── ExportModal.tsx          # PDF report export generator
│   ├── context/
│   │   └── LanguageContext.tsx      # Language state provider (EN, AS, HI, BN)
│   ├── data/
│   │   └── mockNerData.ts           # Preloaded NER hazard zones, sensors & shelters
│   ├── lib/
│   │   └── supabaseClient.ts        # Supabase JS client configuration
│   └── utils/
│       ├── audio.ts                 # Web Audio API emergency siren synthesizer
│       └── speech.ts                # Web Speech STT/TTS helper methods
🚦 Getting Started
Prerequisites
Node.js: v18.0.0 or higher
npm or bun: Package manager
Environment Variables Configuration
Create a .env file in the root directory by copying .env.example:
code
Bash
cp .env.example .env
Populate the required variables:
code
Ini
# Google Gemini API Key (Required for AI nowcasting & assistant)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration (Optional for cloud sync; fallback harness included)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_anon_key
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# CARTO Basemap Key (Optional; removes raster watermark)
VITE_CARTO_API_KEY=your_carto_key

# Telecom Flash SMS (Twilio or Exotel)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# WhatsApp Business Cloud API (Meta Graph API)
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_meta_system_user_token
WHATSAPP_TEMPLATE_NAME=emergency_disaster_alert_v1
Note: If external telecom credentials are not supplied, GeoShield AI automatically activates its Simulated Test Harness, allowing full end-to-end evaluation of SMS, WhatsApp, and siren flows with realistic carrier latency and delivery telemetry.
Installation & Local Run
Install dependencies:
code
Bash
npm install
Start the development server (runs both Vite and Express backend concurrently on port 3000):
code
Bash
npm run dev
Open the application:
Open http://localhost:3000 in your browser.
Production Build
Build the production bundle:
code
Bash
npm run build
Start the production server:
code
Bash
npm start
📢 Multi-Channel Gateway Setup
Twilio Flash SMS
To enable real SMS delivery:
Obtain a Twilio Account SID, Auth Token, and Active Phone Number from the Twilio Console.
For trial accounts, register your test mobile numbers under Verified Caller IDs.
GeoShield AI automatically formats Class 0 alert bodies and logs delivery status with carrier latency receipts.
Meta WhatsApp Business Cloud API
Register a Meta Developer App under Business Messaging.
Create an emergency notification template named emergency_disaster_alert_v1.
Add WHATSAPP_PHONE_NUMBER_ID and a Permanent System User Token to .env.
🗣️ Regional Language & Voice Accessibility
GeoShield AI is built from the ground up for linguistic accessibility in Northeast India:
Assamese (অসমীয়া): Full UI translations and native speech recognition.
Hindi (हिन्दी): Standard national language support with regional vocabulary.
Bengali (বাংলা): Widely spoken across Assam (Barak Valley) and Tripura.
English: Standard disaster agency operational terminology.
Users can toggle languages instantly from the top navigation bar or trigger speech queries through the Agro-Weather Assistant microphone interface.
🤝 Contributing
Contributions to GeoShield AI are welcomed from disaster management practitioners, geotechnical engineers, GIS specialists, and software developers!
Fork the Repository
Create a Feature Branch (git checkout -b feature/HydrologicalSensorIntegration)
Commit your changes (git commit -m 'Add support for ultrasonic stream gauges')
Push to the Branch (git push origin feature/HydrologicalSensorIntegration)
Open a Pull Request
📄 License
This project is licensed under the MIT License — see the LICENSE file for details.
<div align="center">
<sub>Engineered with dedication for disaster resilience in the North Eastern Region of India.</sub>
</div>
