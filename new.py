"""
GeoShield AI — Feature & Backend Integration Documentation
Generates an accurate technical manual PDF based on the actual
React/Vite frontend + Express/Gemini backend source code.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
    HRFlowable, KeepTogether, ListFlowable, ListItem
)
from reportlab.pdfgen import canvas as pdfcanvas

# ---------------------------------------------------------------------------
# Palette
# ---------------------------------------------------------------------------
NAVY = colors.HexColor('#0f172a')
BLUE = colors.HexColor('#1d4ed8')
TEAL = colors.HexColor('#0d9488')
AMBER = colors.HexColor('#b45309')
ROSE = colors.HexColor('#be123c')
SLATE = colors.HexColor('#334155')
MUTED = colors.HexColor('#64748b')
LIGHT = colors.HexColor('#f1f5f9')
LIGHT2 = colors.HexColor('#f8fafc')
BORDER = colors.HexColor('#cbd5e1')
CODEBG = colors.HexColor('#0f172a')
CODEFG = colors.HexColor('#7dd3fc')
WHITE = colors.white

PAGE_W, PAGE_H = A4

styles = getSampleStyleSheet()

styles.add(ParagraphStyle(name='DocTitle', fontName='Helvetica-Bold', fontSize=25,
                           textColor=WHITE, leading=30))
styles.add(ParagraphStyle(name='DocSubtitle', fontName='Helvetica', fontSize=12.5,
                           textColor=colors.HexColor('#cbd5e1'), leading=17))
styles.add(ParagraphStyle(name='H1', fontName='Helvetica-Bold', fontSize=16,
                           textColor=NAVY, spaceBefore=4, spaceAfter=8, leading=20))
styles.add(ParagraphStyle(name='H2', fontName='Helvetica-Bold', fontSize=11.5,
                           textColor=BLUE, spaceBefore=10, spaceAfter=5, leading=15))
styles.add(ParagraphStyle(name='Body', fontName='Helvetica', fontSize=9.4,
                           textColor=SLATE, leading=13.6, alignment=TA_JUSTIFY,
                           spaceAfter=6))
styles.add(ParagraphStyle(name='BodyTight', fontName='Helvetica', fontSize=9,
                           textColor=SLATE, leading=12.6, alignment=TA_JUSTIFY))
styles.add(ParagraphStyle(name='Bullet', fontName='Helvetica', fontSize=9,
                           textColor=SLATE, leading=13, alignment=TA_LEFT))
styles.add(ParagraphStyle(name='Kicker', fontName='Helvetica-Bold', fontSize=8,
                           textColor=MUTED, leading=10))
styles.add(ParagraphStyle(name='TinyWhite', fontName='Helvetica', fontSize=8,
                           textColor=colors.HexColor('#93c5fd')))
styles.add(ParagraphStyle(name='CellHead', fontName='Helvetica-Bold', fontSize=8,
                           textColor=WHITE, leading=11))
styles.add(ParagraphStyle(name='Cell', fontName='Helvetica', fontSize=8,
                           textColor=SLATE, leading=11.5))
styles.add(ParagraphStyle(name='CellBold', fontName='Helvetica-Bold', fontSize=8,
                           textColor=NAVY, leading=11.5))
styles.add(ParagraphStyle(name='Code', fontName='Courier', fontSize=8,
                           textColor=CODEFG, leading=12.5))
styles.add(ParagraphStyle(name='AdvHead', fontName='Helvetica-Bold', fontSize=9,
                           textColor=colors.HexColor('#166534'), leading=12))
styles.add(ParagraphStyle(name='FeatureKicker', fontName='Helvetica-Bold', fontSize=8.5,
                           textColor=WHITE, leading=11))
styles.add(ParagraphStyle(name='FeatureTitleWhite', fontName='Helvetica-Bold', fontSize=15,
                           textColor=WHITE, leading=18))
styles.add(ParagraphStyle(name='TOCItem', fontName='Helvetica', fontSize=10,
                           textColor=SLATE, leading=16))
styles.add(ParagraphStyle(name='TOCNum', fontName='Helvetica-Bold', fontSize=10,
                           textColor=BLUE, leading=16))

story = []

def rule(color=BORDER, thickness=0.6, space_before=4, space_after=8):
    story.append(Spacer(1, space_before))
    story.append(HRFlowable(width="100%", thickness=thickness, color=color))
    story.append(Spacer(1, space_after))

def section_banner(kicker, title, band_color=NAVY):
    t = Table([[Paragraph(kicker, styles['FeatureKicker'])],
               [Paragraph(title, styles['FeatureTitleWhite'])]],
              colWidths=[17*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), band_color),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('TOPPADDING', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 2),
        ('TOPPADDING', (0, 1), (-1, 1), 2),
        ('BOTTOMPADDING', (0, 1), (-1, 1), 12),
    ]))
    story.append(t)
    story.append(Spacer(1, 12))

def sub_head(text):
    story.append(Paragraph(text, styles['H2']))

def para(text):
    story.append(Paragraph(text, styles['Body']))

def code_block(lines, height_pad=8):
    rows = [[Paragraph(l.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'), styles['Code'])] for l in lines]
    t = Table(rows, colWidths=[17*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), CODEBG),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#334155')),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

def kv_box(rows, title, fill=LIGHT2, border=BORDER, title_color=NAVY):
    """rows: list of (label, value) strings"""
    data = [[Paragraph(f'<b>{title}</b>', ParagraphStyle('kvtitle', fontName='Helvetica-Bold',
             fontSize=9, textColor=title_color)), '']]
    body_rows = []
    for label, value in rows:
        body_rows.append([Paragraph(f'<b>{label}</b>', styles['Cell']),
                           Paragraph(value, styles['Cell'])])
    t = Table([[Paragraph(f'<b>{title}</b>', ParagraphStyle('kvt', fontName='Helvetica-Bold', fontSize=9.2, textColor=title_color))]] , colWidths=[17*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), fill),
        ('BOX', (0,0), (-1,-1), 0.7, border),
        ('TOPPADDING', (0,0),(-1,-1), 6),
        ('BOTTOMPADDING', (0,0),(-1,-1), 2),
        ('LEFTPADDING', (0,0),(-1,-1), 10),
    ]))
    story.append(t)
    t2 = Table(body_rows, colWidths=[4.2*cm, 12.8*cm])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), fill),
        ('LINEBELOW', (0,0), (-1,-1), 0, fill),
        ('BOX', (0,0), (-1,-1), 0.7, border),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t2)
    story.append(Spacer(1, 10))

def advantages_box(items):
    body = []
    for it in items:
        body.append([Paragraph('✓', ParagraphStyle('chk', fontName='Helvetica-Bold', fontSize=9,
                     textColor=colors.HexColor('#16a34a'))),
                     Paragraph(it, styles['Cell'])])
    t = Table(body, colWidths=[0.7*cm, 16.3*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f0fdf4')),
        ('BOX', (0,0), (-1,-1), 0.7, colors.HexColor('#bbf7d0')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(Paragraph('Advantages for the NER Landslide & Flood Early-Warning Problem', styles['AdvHead']))
    story.append(Spacer(1, 4))
    story.append(t)
    story.append(Spacer(1, 12))

def api_table(rows, header=('METHOD', 'ENDPOINT', 'CALLED BY', 'PURPOSE')):
    data = [[Paragraph(h, styles['CellHead']) for h in header]]
    for r in rows:
        data.append([Paragraph(r[0], ParagraphStyle('m', fontName='Helvetica-Bold', fontSize=8,
                    textColor=BLUE if r[0]=='GET' else (TEAL if r[0]=='POST' else AMBER))),
                    Paragraph(f'<font face="Courier-Bold">{r[1]}</font>', styles['Cell']),
                    Paragraph(r[2], styles['Cell']),
                    Paragraph(r[3], styles['Cell'])]
        )
    t = Table(data, colWidths=[1.7*cm, 5.3*cm, 3.8*cm, 6.2*cm], repeatRows=1)
    style = [
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]
    for i in range(1, len(data)):
        if i % 2 == 0:
            style.append(('BACKGROUND', (0, i), (-1, i), LIGHT2))
    t.setStyle(TableStyle(style))
    story.append(t)
    story.append(Spacer(1, 10))

# ===========================================================================
# COVER PAGE
# ===========================================================================
cover_band = Table([[Paragraph('GEOSHIELD AI &nbsp;•&nbsp; NORTH EASTERN REGION (NER)', styles['TinyWhite'])],
                     [Paragraph('GeoShield AI', styles['DocTitle'])],
                     [Paragraph('Landslide &amp; Flood Early-Warning and Disaster Intelligence Platform<br/>'
                                 'Feature Guide &amp; Backend / API Integration Manual', styles['DocSubtitle'])]],
                    colWidths=[17*cm])
cover_band.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), NAVY),
    ('LEFTPADDING', (0,0), (-1,-1), 16),
    ('RIGHTPADDING', (0,0), (-1,-1), 16),
    ('TOPPADDING', (0,0), (0,0), 22),
    ('BOTTOMPADDING', (0,0), (0,0), 6),
    ('TOPPADDING', (0,1), (0,1), 2),
    ('BOTTOMPADDING', (0,1), (0,1), 10),
    ('TOPPADDING', (0,2), (0,2), 2),
    ('BOTTOMPADDING', (0,2), (0,2), 22),
]))
story.append(cover_band)
story.append(Spacer(1, 16))

kv_box([
    ('Application', 'GeoShield AI — "NER Disaster Intelligence Command" (v2.6 NER)'),
    ('Coverage', 'Assam, Meghalaya, Sikkim, Nagaland, Arunachal Pradesh, Mizoram, Manipur, Tripura (8 NER states)'),
    ('Frontend Stack', 'React 19 + TypeScript, Vite 6, Tailwind CSS v4, Leaflet 1.9 (GIS mapping), lucide-react icons'),
    ('Backend Stack', 'Node.js + Express 4 (server.ts), single REST API surface on port 3000, in-memory data store'),
    ('AI Provider', 'Google Gemini (@google/genai SDK) — model "gemini-3.8-flash", used for computer vision, XAI reasoning and multilingual chat'),
    ('Document Purpose', 'Explains every application feature, exactly how it talks to the backend/API, how its logic works internally, and why it matters for landslide/flood disaster management in the NER'),
], title='Document Overview')

para(
    'GeoShield AI is a single-page disaster-management console built for state and district disaster '
    'authorities (SDMA/NDMA/SDRF) operating in the North Eastern Region of India — a zone of steep young '
    'fold-mountain terrain, monsoon rainfall above 3,000&nbsp;mm/year, and chronic landslide and flash-flood '
    'risk on lifeline corridors such as NH-06 and NH-29. The application is organised around the disaster '
    'management lifecycle — <b>pre-disaster</b> (GIS monitoring, nowcasting), <b>during-disaster</b> '
    '(evacuation routing, alert dispatch), and <b>post-disaster</b> (field triage) — plus a citizen-facing '
    'assistant. Every screen is a React component in <font face="Courier">src/components/</font>, and each '
    'is driven by <font face="Courier">src/App.tsx</font>, which owns shared state and renders the active '
    'module based on the sidebar selection.'
)

sub_head('How the System Is Wired Together')
para(
    'The frontend never talks to Gemini directly — all AI calls are proxied through the Express backend '
    '(<font face="Courier">server.ts</font>), which holds the <font face="Courier">GEMINI_API_KEY</font> '
    'server-side and exposes a small set of JSON REST endpoints under <font face="Courier">/api/*</font>. '
    'The backend currently keeps its data (users, incident reports, alerts, dispatch logs) in in-memory '
    'arrays seeded with realistic NER demo data, so every POST request mutates server memory for the '
    'lifetime of the process. Six feature modules and an authentication flow consume this API surface; '
    'each is documented on its own page below, followed by a complete endpoint reference matrix.'
)

story.append(PageBreak())

# ===========================================================================
# TABLE OF CONTENTS
# ===========================================================================
sub_head('Table of Contents')
toc_rows = [
    ('1', 'GIS Command Center — Multi-Layer Hazard Map'),
    ('2', 'Predictive Nowcasting & Explainable AI (XAI)'),
    ('3', 'Hazard-Aware Evacuation Routing'),
    ('4', 'Field Triage & AI Verification (Computer Vision)'),
    ('5', 'Multi-Tier Alert Dispatch & Delivery Log'),
    ('6', 'Agro-WeatherGPT Multilingual Assistant'),
    ('7', 'Authentication & Role-Based Access'),
    ('8', 'System Architecture Diagram (Request Flow)'),
    ('9', 'Complete Backend API Reference'),
    ('10', 'Summary: Advantages Matrix'),
]
toc_data = [[Paragraph(n, styles['TOCNum']), Paragraph(t, styles['TOCItem'])] for n, t in toc_rows]
toc_table = Table(toc_data, colWidths=[1.2*cm, 15.8*cm])
toc_table.setStyle(TableStyle([
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('LINEBELOW', (0,0), (-1,-2), 0.4, BORDER),
]))
story.append(toc_table)
story.append(PageBreak())

# ===========================================================================
# FEATURE 1 — GIS COMMAND CENTER
# ===========================================================================
section_banner('MODULE 01 · PRE-DISASTER · LIVE GIS', '1.&nbsp; GIS Command Center — Multi-Layer Hazard Map', NAVY)

para(
    'The GIS Command Center (<font face="Courier">CommandCenterMap.tsx</font>) is the default landing screen '
    'and situational-awareness hub. It renders an interactive Leaflet map (<font face="Courier">leaflet@1.9.4</font>, '
    'loaded via the CSS link in <font face="Courier">index.html</font>) centred on the NER, with togglable overlays for '
    'Landslide Risk Polygons, Soil &amp; Pore-Pressure Sensors, Road Closures, Relief Shelters, Citizen Reports and an '
    'IMD Doppler Radar layer, plus Street / DEM-Topo / Satellite basemap switching and quick-jump buttons for named '
    'hazard corridors (Sonapur NH-06, Haflong, Dzongu, Kohima Ridge, Guwahati Basin).'
)

sub_head('How It Connects to the Backend')
para(
    'The map itself is a <b>client-side visualization layer</b> — hazard-zone polygons, sensor markers, road '
    'segments and relief camps are supplied as React props from <font face="Courier">App.tsx</font>, which '
    'initializes them from the static seed dataset in <font face="Courier">src/data/mockNerData.ts</font> '
    '(typed against the shared interfaces in <font face="Courier">types.ts</font>: '
    '<font face="Courier">HazardZone</font>, <font face="Courier">SensorNode</font>, '
    '<font face="Courier">RoadSegment</font>, <font face="Courier">ReliefCamp</font>). The one live network call '
    'the map screen depends on happens once, on initial app mount:'
)
code_block([
    "// src/App.tsx — runs once on mount",
    "useEffect(() => {",
    "  fetch('/api/reports')",
    "    .then(res => res.json())",
    "    .then(data => { if (data.reports?.length) setReports(data.reports); })",
    "    .catch(err => console.log('Using local reports:', err));",
    "}, []);",
])
para(
    'This hydrates the "Citizen Reports" marker layer with whatever incident reports currently live in the '
    'Express in-memory store (seeded plus anything submitted via the Field Triage module), so freshly '
    'submitted hazard reports immediately appear as pins on the GIS map. Clicking a hazard-zone polygon fires '
    '<font face="Courier">onSelectZone</font> / <font face="Courier">onRequestXai</font> callbacks that hand the selected '
    'zone up to <font face="Courier">App.tsx</font>, which switches the active tab to the Predictive Nowcasting '
    'module — this is how the map and the AI-explanation module are chained together in the UI.'
)

sub_head('How It Works Internally')
para(
    'Risk polygons are colour-coded from each zone\'s pre-computed <font face="Courier">riskLevel</font> '
    '(CRITICAL / HIGH / MODERATE / LOW) and rendered with radii derived from '
    '<font face="Courier">radiusKm</font>. Sensor markers use <font face="Courier">status</font> '
    '(ONLINE / WARNING / ALERT / OFFLINE) to drive marker colour, and road segments use '
    '<font face="Courier">status</font> plus <font face="Courier">waterDepthCm</font> to flag closures. All of '
    'this is pure client-side rendering logic — no map tile server or GIS backend call is made beyond the '
    'public OpenStreetMap/Leaflet basemap tiles.'
)

advantages_box([
    'Gives a District Magistrate or SDMA duty officer a single unified operating picture instead of separate paper maps, sensor spreadsheets and phone-call updates — critical when minutes matter for a slope failure.',
    'Overlay toggling lets responders isolate exactly the hazard layer relevant to the decision at hand (e.g. only road closures when planning a convoy route).',
    'Because reports are pulled live from the same backend store used by the Field Triage module, a citizen-submitted photo of a fresh landslide appears on the command map within one refresh — closing the loop between ground truth and command visibility.',
    'Quick-sector buttons encode institutional knowledge (which corridors are chronically vulnerable) directly into the UI, reducing time-to-first-look during an active event.',
])
story.append(PageBreak())

# ===========================================================================
# FEATURE 2 — PREDICTIVE NOWCASTING & XAI
# ===========================================================================
section_banner('MODULE 02 · PRE-DISASTER · GEMINI AI', '2.&nbsp; Predictive Nowcasting &amp; Explainable AI (XAI)', BLUE)

para(
    'The Nowcasting panel (<font face="Courier">RiskNowcastingPanel.tsx</font>) is a "what-if" geotechnical '
    'simulator. For a selected hazard corridor (e.g. Sonapur Slope Sector, NH-06) it shows live-style '
    'telemetry — soil moisture inflow, INSAT-3D imagery reference, Doppler radar status — and lets the '
    'operator drag sliders for soil saturation, predicted 6-hour rainfall and slope angle to simulate '
    'scenario risk before it happens.'
)

sub_head('How It Connects to the Backend')
para(
    'The probability score itself is computed <b>entirely client-side</b> with a simplified shear-strength '
    'style heuristic so the UI is instantly responsive as the operator drags a slider:'
)
code_block([
    "// src/components/RiskNowcastingPanel.tsx",
    "const calculatedRisk = Math.min(99, Math.round(",
    "  (simSoilSaturation * 0.45) + (simSlopeAngle * 0.72) + (simRainNext6h * 0.38)",
    "));",
])
para(
    'Once the operator is satisfied with a scenario, pressing "Generate AI Explanation" sends the current '
    'slider values and zone metadata to the backend, which asks Gemini to produce a plain-language forensic '
    'rationale — this is the "Explainable AI" step that turns a raw percentage into a decision-ready statement:'
)
code_block([
    "POST /api/ai/xai-explain",
    "body: { zoneName, district, slopeAngle, soilSaturation,",
    "        rain24h, predictedRain6h, geology }",
    "",
    "// server.ts calls ai.models.generateContent({ model: 'gemini-3.8-flash', ... })",
    "// prompt asks for: physical probability breakdown, time-to-failure window,",
    "// and a recommended action for District Magistrates (road closure / evacuation)",
    "// response: { explanation: string }",
])
para(
    'If no <font face="Courier">GEMINI_API_KEY</font> is configured, or the Gemini call throws, the server '
    'falls back to a deterministic formula-based explanation string computed from the same inputs — so the '
    'feature degrades gracefully rather than failing when the AI backend is unreachable. A "Trigger Emergency '
    'Alert" button on this panel calls <font face="Courier">onTriggerAlert</font>, which pre-fills a Tier-1 '
    'critical alert in <font face="Courier">App.tsx</font> and jumps the operator straight to the Alert '
    'Dispatch module — chaining nowcasting directly into action.'
)

advantages_box([
    'Converts an opaque "88% risk" number into a scientifically framed, human-readable justification (saturation + slope + rainfall + geology + time-to-failure), which is what a District Magistrate actually needs to justify ordering an evacuation.',
    'Instant client-side scoring means officers can stress-test "what if it rains 40mm more" scenarios with zero network latency, while the heavier Gemini reasoning is only invoked on demand.',
    'Server-side API-key handling keeps the Gemini credential off the browser entirely — the frontend never sees or stores the key.',
    'Graceful fallback logic means the nowcasting workflow keeps functioning (with a slightly less rich explanation) even during connectivity loss to the AI provider — important for an emergency-response tool.',
])
story.append(PageBreak())

# ===========================================================================
# FEATURE 3 — HAZARD-AWARE ROUTING
# ===========================================================================
section_banner('MODULE 03 · DURING-DISASTER · OFFLINE-CAPABLE', '3.&nbsp; Hazard-Aware Evacuation Routing &amp; Safe Corridors', TEAL)

para(
    'The Routing panel (<font face="Courier">HazardRoutingPanel.tsx</font>) lets a responder or evacuee pick a '
    'current location and a destination relief camp, choose a vehicle type (SUV / ambulance / heavy truck), '
    'and get a recommended safe path that avoids roads flagged as submerged (&gt;30cm) or blocked by active '
    'slope failure. It also exposes an "Online Sync" indicator badge and a manual "Simulate Offline" toggle.'
)

sub_head('How It Connects to the Backend')
para(
    'This module makes <b>no live network call in the current build</b> — routing runs entirely against the '
    'road-network and relief-camp data already loaded into React state '
    '(<font face="Courier">roads</font>, <font face="Courier">reliefCamps</font> props, sourced from '
    '<font face="Courier">mockNerData.ts</font> via <font face="Courier">App.tsx</font>). Each '
    '<font face="Courier">RoadSegment</font> record carries <font face="Courier">status</font> '
    '(OPEN/WARNING/IMPASSABLE), <font face="Courier">waterDepthCm</font>, <font face="Courier">debrisSeverity</font> '
    'and <font face="Courier">isSafeForHeavyVehicles</font>, and each <font face="Courier">ReliefCamp</font> carries '
    'capacity, current occupancy, amenities and a radio frequency for field comms — the panel filters/ranks '
    'these client-side to present a recommended corridor. The "Live Cloud pgRouting Engine — ONLINE" badge in '
    'the UI communicates the <i>architectural intent</i> (a PostGIS/pgRouting-backed shortest-path service is '
    'the natural production backend for this feature) while the demo build runs the equivalent rule-based '
    'penalty logic in the browser.'
)
sub_head('How It Works Internally')
para(
    'The panel disqualifies any road segment whose <font face="Courier">status</font> is IMPASSABLE or whose '
    '<font face="Courier">waterDepthCm</font> exceeds the safe threshold for the selected vehicle type, then '
    'surfaces the best remaining corridor together with the nearest relief camp that still has free bed '
    'capacity. The "Simulate Offline" control demonstrates the offline-first design goal: because the '
    'underlying data is already resident in the browser, route recommendations keep working even with no '
    'network connectivity — essential in NER terrain where cellular coverage frequently drops during storms.'
)

advantages_box([
    'Actively penalises the two failure modes that kill evacuees on hill highways — water-submerged crossings and slope-failure debris — instead of just showing the shortest path.',
    'Vehicle-aware routing (ambulance vs. heavy truck vs. SUV) reflects the real operational constraint that not every relief vehicle can use every road.',
    'Because all routing data is already client-resident, the feature keeps working when cellular/backhaul connectivity fails mid-disaster, which is exactly when GPS navigation apps built on live tile/routing servers stop working.',
    'Surfacing live relief-camp bed capacity alongside the route prevents responders from directing evacuees to an already-full shelter.',
])
story.append(PageBreak())

# ===========================================================================
# FEATURE 4 — FIELD TRIAGE (COMPUTER VISION)
# ===========================================================================
section_banner('MODULE 04 · POST-DISASTER · GEMINI VISION', '4.&nbsp; Field Triage &amp; AI-Verified Incident Reporting', ROSE)

para(
    'The Field Triage panel (<font face="Courier">IncidentTriagePanel.tsx</font>) is the crowdsourcing / '
    'field-reporting module. Citizens and field officials submit a geo-tagged photo report (category, '
    'coordinates, location name, description, photo) which the backend runs through Gemini computer vision '
    'to filter out spam/irrelevant images and auto-assign a severity tier, producing an "SDRF Rescue Priority '
    'Queue" ranked P1_CRITICAL / P2_HIGH / P3_MODERATE.'
)

sub_head('How It Connects to the Backend')
code_block([
    "GET  /api/reports          -> { reports: IncidentReport[] }   (loads the triage queue)",
    "POST /api/reports          -> { report: IncidentReport }      (submits a new field report)",
    "PATCH /api/reports/:id/status -> { report }                   (SDRF dispatch / resolve)",
])
para(
    'On submit, the photo is embedded in the JSON payload as a base64 <font face="Courier">data:image/...</font> '
    'URL. On the server, if a photo was attached and a Gemini API key is configured, the report handler sends '
    'the image inline to Gemini multimodal generation:'
)
code_block([
    "// server.ts — POST /api/reports",
    "ai.models.generateContent({",
    "  model: 'gemini-3.8-flash',",
    "  contents: { parts: [ { inlineData: { mimeType, data: base64Data } },",
    "                        { text: visionPrompt } ] },",
    "  config: { responseMimeType: 'application/json' }",
    "});",
    "// visionPrompt asks Gemini to return JSON:",
    "// { isDisaster, confidence, severity, technicalNotes }",
])
para(
    'The parsed JSON becomes the report\'s <font face="Courier">aiSpamStatus</font> '
    '(VERIFIED_DISASTER / SUSPECTED_SPAM), <font face="Courier">aiConfidence</font>, '
    '<font face="Courier">severity</font> and <font face="Courier">aiNotes</font> fields. If no photo, no API '
    'key, or a Gemini error occurs, the endpoint falls back to a heuristic classification based on the report\'s '
    '<font face="Courier">category</font> (e.g. <font face="Courier">flash_flood</font>/<font face="Courier">crack</font> '
    'categories default to P1_CRITICAL) so a report is never lost or blocked by an AI outage. Every accepted '
    'report is prepended to the server\'s in-memory <font face="Courier">incidentReports</font> array and is '
    'immediately visible to the GIS map, the triage queue, and any other connected client on the next '
    '<font face="Courier">GET /api/reports</font>.'
)

advantages_box([
    'Computer-vision anti-spam filtering removes the single biggest weakness of crowdsourced disaster reporting — fake photos, memes or unrelated images clogging a rescue-priority queue during a live emergency.',
    'Automatic P1/P2/P3 severity tagging means SDRF/NDRF dispatchers see a pre-triaged queue instead of having to read every raw submission before deciding where to send a team first.',
    'A concise, standardized AI observation note (e.g. "fresh shearing along bedrock interface") gives non-specialist field officials access to a geotechnical-style assessment they could not otherwise produce.',
    'Deterministic fallback classification ensures the reporting pipeline never blocks citizens from submitting a report just because the AI provider is temporarily unavailable.',
])
story.append(PageBreak())

# ===========================================================================
# FEATURE 5 — ALERT DISPATCH
# ===========================================================================
section_banner('MODULE 05 · DURING-DISASTER · MULTI-CHANNEL CAP', '5.&nbsp; Multi-Tier Alert Dispatch &amp; Warning Log', AMBER)

para(
    'The Alert Dispatch module (<font face="Courier">AlertDispatchPanel.tsx</font> + '
    '<font face="Courier">DispatchedAlertLogPanel.tsx</font>) is the outbound-communication centre. An authority '
    'user composes a Tier&nbsp;1 (Imminent, 15-30 min), Tier&nbsp;2 (High Warning, 2-6 hr) or Tier&nbsp;3 '
    '(Routine Advisory, 24 hr) warning, selects target demographic groups and dispatch channels '
    '(WhatsApp / SMS / Siren / In-App), and broadcasts it — after which it is logged with per-channel '
    'delivery metrics in a persistent audit trail.'
)

sub_head('How It Connects to the Backend')
code_block([
    "POST /api/alerts/broadcast   -> { alert, log, status }   (compose & dispatch a new warning)",
    "GET  /api/alerts             -> { alerts: EarlyWarningAlert[] }        (active alert queue)",
    "GET  /api/alerts/logs        -> { logs: DispatchedAlertLog[] }         (historical dispatch log)",
    "POST /api/alerts/logs        -> { log }                                (append a custom log record)",
    "PATCH /api/alerts/logs/:id/status -> { log }   (update delivery status / bump live acknowledgements)",
])
para(
    'When <font face="Courier">/api/alerts/broadcast</font> is called, the server does not just echo the '
    'payload back — it synthesizes a realistic delivery simulation: for every selected channel it computes a '
    'target-audience share (WhatsApp ≈85% of affected population, SMS ≈98%, Siren ≈25%, In-App ≈40%), applies '
    'a randomized 98.5-99.9% delivery rate and a channel-specific gateway latency, and stores the resulting '
    '<font face="Courier">channelMetrics</font> array on a new <font face="Courier">DispatchedAlertLog</font> '
    'record. That record is what powers the "Persistent Log" delivery-audit view. Tier-1 alerts whose channel '
    'list includes <font face="Courier">siren</font> additionally set '
    '<font face="Courier">isSirenTriggered: true</font>, which the frontend uses to fire '
    '<font face="Courier">FullScreenSirenOverlay.tsx</font> and play a synthesized dual-tone emergency siren '
    'via the Web Audio API helper in <font face="Courier">src/utils/audio.ts</font>. The log panel also caches '
    'the last-fetched logs to <font face="Courier">localStorage</font> as an additional offline-resilience layer.'
)

advantages_box([
    'Encodes the Common Alerting Protocol (CAP) principle of tiered, targeted warnings (imminent vs. advisory) instead of one blunt broadcast to everyone.',
    'Multi-channel fan-out (WhatsApp + SMS + Siren + In-App) maximizes the chance a warning actually reaches people in low-connectivity hill terrain, where any single channel may fail.',
    'The automatic delivery-metrics log gives authorities an auditable record of exactly who was warned, when, and through which channel — important for after-action review and accountability.',
    'Client-triggered audible siren overlay converts a data event into an unmissable, device-level emergency alert for anyone with the app open on a phone in the field.',
])
story.append(PageBreak())

# ===========================================================================
# FEATURE 6 — AGRO-WEATHERGPT
# ===========================================================================
section_banner('MODULE 06 · CITIZEN VOICE · MULTILINGUAL GEMINI CHAT', '6.&nbsp; Agro-WeatherGPT — Multilingual Climate &amp; Safety Assistant', TEAL)

para(
    'Agro-WeatherGPT (<font face="Courier">AgroWeatherAssistant.tsx</font>) is a conversational assistant aimed '
    'at farmers, truck drivers and ordinary citizens, available in English, Hindi, Assamese and Bengali via a '
    'language switcher, with text-to-speech playback ("Listen Audio") using the browser\'s '
    '<font face="Courier">speechSynthesis</font> API.'
)

sub_head('How It Connects to the Backend')
code_block([
    "POST /api/ai/agro-chat",
    "body: { message: string, language: 'en' | 'hi' | 'as' | 'bn', history: [] }",
    "response: { reply: string }",
])
para(
    'The server builds a Gemini chat session with a system instruction that fixes the assistant\'s persona '
    '("climate, meteorological nowcasting, and landslide safety assistant for the NER"), injects the requested '
    'language\'s instruction (e.g. "Respond in clear Assamese"), and calls '
    '<font face="Courier">ai.chats.create({ model: "gemini-3.8-flash", config: { systemInstruction } })</font> '
    'followed by <font face="Courier">chat.sendMessage({ message })</font>. Responses are capped conversationally '
    'to under ~120 words to stay readable on a phone in the field. If Gemini is unavailable, the endpoint '
    'returns one of four pre-written, language-matched fallback advisories (English/Hindi/Assamese/Bengali) '
    'describing current rainfall and slope-safety guidance, so the citizen-facing assistant never goes silent.'
)

advantages_box([
    'Multilingual support removes the language barrier that stops many rural NER residents from understanding English-only weather/hazard bulletins.',
    'A safety-focused, conversational format is more accessible to non-technical users than reading a raw hazard-zone dashboard.',
    'Text-to-speech playback extends usability to low-literacy users and hands-free/driving scenarios (e.g. a truck driver checking NH-06 conditions).',
    'Per-language deterministic fallbacks keep the assistant useful even without live AI connectivity, rather than showing an error in a moment a farmer needs guidance.',
])
story.append(PageBreak())

# ===========================================================================
# FEATURE 7 — AUTH
# ===========================================================================
section_banner('SUPPORTING MODULE · IDENTITY', '7.&nbsp; Authentication &amp; Role-Based Access', SLATE)

para(
    '<font face="Courier">AuthModal.tsx</font> handles both sign-in and sign-up in a single modal, toggling '
    'which backend endpoint it targets:'
)
code_block([
    "POST /api/auth/login     body: { email, password }",
    "POST /api/auth/register  body: { name, email, password, role, agency, phone }",
    "response (both): { user: { id, name, email, role, agency, phone, createdAt }, token }",
])
para(
    'Three roles are modeled — <font face="Courier">authority</font> (e.g. an SDMA officer, who can broadcast '
    'alerts and dispatch SDRF units), <font face="Courier">responder</font> (e.g. an SDRF quick-response team '
    'member) and <font face="Courier">citizen</font> (community reporter). The server seeds three demo accounts '
    'covering each role. Login is intentionally lenient in the demo build — an unrecognised email/password still '
    'resolves to a usable demo session — favouring frictionless access for demonstration and training over strict '
    'credential enforcement; a production deployment would replace the plaintext '
    '<font face="Courier">passwordHash</font> field and this fallback with real hashing (e.g. bcrypt) and '
    'proper session/JWT validation. The returned <font face="Courier">user</font> object is stored in '
    '<font face="Courier">App.tsx</font> state and threaded through to every module so the UI can adapt (e.g. '
    'the dispatcher name recorded on a broadcast alert, or gating who can trigger Tier-1 warnings).'
)
advantages_box([
    'Role modeling (authority / responder / citizen) mirrors the real chain of command in disaster response, so the same app can serve a DM\'s office, an SDRF field team, and the general public with appropriately scoped actions.',
    'Attaching the authenticated dispatcher\'s name and agency to every broadcast alert and dispatch log preserves accountability for who issued which warning.',
])
story.append(PageBreak())

# ===========================================================================
# ARCHITECTURE DIAGRAM (drawn as simple flow using tables)
# ===========================================================================
sub_head('8. System Architecture — Request Flow')
para(
    'All AI-backed features share the same request shape: the React component calls a same-origin '
    '<font face="Courier">/api/...</font> route with <font face="Courier">fetch()</font>; Express parses the '
    'JSON body, optionally calls Gemini via the shared <font face="Courier">getGeminiClient()</font> helper '
    '(which reads <font face="Courier">GEMINI_API_KEY</font> from the environment and returns '
    '<font face="Courier">null</font> if unset), and always returns a JSON response — falling back to a '
    'deterministic canned answer if the AI call fails or is unavailable, so the UI never hard-fails.'
)
flow = Table([
    [Paragraph('<b>React Component</b><br/>(e.g. RiskNowcastingPanel.tsx)', styles['Cell']),
     Paragraph('→', ParagraphStyle('arrow', fontSize=14, alignment=TA_CENTER, textColor=BLUE)),
     Paragraph('<b>fetch(\'/api/...\')</b><br/>JSON POST/GET/PATCH', styles['Cell']),
     Paragraph('→', ParagraphStyle('arrow2', fontSize=14, alignment=TA_CENTER, textColor=BLUE)),
     Paragraph('<b>Express Route</b><br/>server.ts handler', styles['Cell']),
     Paragraph('→', ParagraphStyle('arrow3', fontSize=14, alignment=TA_CENTER, textColor=BLUE)),
     Paragraph('<b>getGeminiClient()</b><br/>gemini-3.8-flash (or fallback)', styles['Cell'])],
], colWidths=[3.6*cm, 0.9*cm, 3.6*cm, 0.9*cm, 3.6*cm, 0.9*cm, 3.5*cm])
flow.setStyle(TableStyle([
    ('BOX', (0,0), (0,0), 0.7, BORDER), ('BOX', (2,0),(2,0), 0.7, BORDER),
    ('BOX', (4,0), (4,0), 0.7, BORDER), ('BOX', (6,0), (6,0), 0.7, BORDER),
    ('BACKGROUND', (0,0), (0,0), LIGHT2), ('BACKGROUND', (2,0), (2,0), LIGHT2),
    ('BACKGROUND', (4,0), (4,0), LIGHT2), ('BACKGROUND', (6,0), (6,0), colors.HexColor('#ecfdf5')),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('TOPPADDING', (0,0), (-1,-1), 8), ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ('LEFTPADDING', (0,0), (-1,-1), 6), ('RIGHTPADDING', (0,0), (-1,-1), 6),
]))
story.append(flow)
story.append(Spacer(1, 10))
para(
    'Non-AI features (GIS map overlays, Hazard-Aware Routing) skip the Gemini hop entirely and operate on data '
    'already loaded into React state from <font face="Courier">mockNerData.ts</font>, or persisted server-side '
    'in the same-process in-memory store (incident reports, alerts, dispatch logs) that <font face="Courier">GET</font> '
    'endpoints read back on demand.'
)
story.append(PageBreak())

# ===========================================================================
# API REFERENCE MATRIX
# ===========================================================================
sub_head('9. Complete Backend API Reference (server.ts, port 3000)')
para('Verified directly against the current <font face="Courier">server.ts</font> source — every route below is live in this build.')

api_rows = [
    ('GET', '/api/health', 'Ops / uptime checks', 'Returns { status, service, time } liveness probe.'),
    ('POST', '/api/auth/login', 'AuthModal (sign in)', 'Validates email/password against seeded users; returns user + session token.'),
    ('POST', '/api/auth/register', 'AuthModal (sign up)', 'Creates a new authority/responder/citizen account.'),
    ('GET', '/api/reports', 'App.tsx (on mount), IncidentTriagePanel', 'Returns all incident reports currently held in memory.'),
    ('POST', '/api/reports', 'IncidentTriagePanel (submit)', 'Creates a report; runs Gemini Vision anti-spam + severity classification if a photo + API key are present.'),
    ('PATCH', '/api/reports/:id/status', 'IncidentTriagePanel (SDRF dispatch)', 'Updates a report\'s status (REPORTED/DISPATCHED/RESOLVED) and assigned rescue unit.'),
    ('POST', '/api/ai/xai-explain', 'RiskNowcastingPanel', 'Sends geotechnical parameters to Gemini; returns a plain-language forensic risk explanation.'),
    ('POST', '/api/ai/agro-chat', 'AgroWeatherAssistant', 'Multilingual Gemini chat for weather/landslide/agri safety guidance.'),
    ('POST', '/api/alerts/broadcast', 'AlertDispatchPanel', 'Creates + queues a new tiered alert and auto-generates a delivery-metrics log record.'),
    ('GET', '/api/alerts', 'Alert queue consumers', 'Returns the active EarlyWarningAlert queue.'),
    ('GET', '/api/alerts/logs', 'AlertDispatchPanel, DispatchedAlertLogPanel', 'Returns the historical, persistent dispatch/delivery audit log.'),
    ('POST', '/api/alerts/logs', 'Custom log ingestion', 'Appends a manually constructed dispatch log record.'),
    ('PATCH', '/api/alerts/logs/:id/status', 'DispatchedAlertLogPanel', 'Updates delivery status or increments live acknowledgement counts on a log entry.'),
]
api_table(api_rows)

kv_box([
    ('AI Model Used', 'gemini-3.8-flash for all three AI paths — computer vision, XAI text reasoning, and multilingual chat'),
    ('AI Client Setup', 'getGeminiClient() in server.ts lazily instantiates GoogleGenAI with process.env.GEMINI_API_KEY; returns null (triggering fallback logic) if unset'),
    ('Failure Handling', 'Every AI-backed route wraps the Gemini call in try/catch and falls back to a deterministic, still-useful response — no endpoint hard-fails to the client'),
    ('Data Persistence', 'In-memory arrays (users, incidentReports, alertsQueue, alertDispatchLogs) inside the Node process — reset on server restart; suitable for demo/hackathon, would need a database for production'),
    ('Dev/Prod Serving', 'Vite dev middleware in development; static dist/ + SPA fallback route when NODE_ENV=production'),
], title='Backend Runtime Notes')
story.append(PageBreak())

# ===========================================================================
# ADVANTAGES SUMMARY MATRIX
# ===========================================================================
sub_head('10. Summary — Why This Architecture Fits the NER Disaster Problem')
para(
    'The North Eastern Region\'s core disaster-management challenges are: (1) fragmented information across '
    'sensors, radar, field reports and word-of-mouth; (2) opaque risk scores that officials cannot act on '
    'with confidence; (3) unreliable connectivity during the exact storms that cause landslides; (4) language '
    'and literacy barriers for citizen-facing communication; and (5) slow, ad-hoc warning dissemination. The '
    'table below maps each feature to the problem it targets.'
)

summary_rows = [
    ('GIS Command Center', 'Fragmented information', 'Unifies sensors, reports, roads and shelters on one live map.'),
    ('Nowcasting & XAI', 'Opaque risk scores', 'Turns a raw % into a Gemini-generated, physically-grounded justification for action.'),
    ('Hazard-Aware Routing', 'Unsafe/blind evacuation', 'Actively routes around flooded/blocked roads; works offline when networks fail.'),
    ('Field Triage (CV)', 'Noisy crowdsourced reports', 'Gemini Vision filters spam and pre-triages severity for faster SDRF dispatch.'),
    ('Alert Dispatch', 'Slow, single-channel warnings', 'Tiered, multi-channel (WhatsApp/SMS/Siren/App) broadcast with delivery audit trail.'),
    ('Agro-WeatherGPT', 'Language/literacy barriers', 'Multilingual, spoken, safety-focused assistant for farmers and drivers.'),
]
sd = [[Paragraph(h, styles['CellHead']) for h in ('FEATURE', 'PROBLEM ADDRESSED', 'MECHANISM')]]
for r in summary_rows:
    sd.append([Paragraph(f'<b>{r[0]}</b>', styles['CellBold']), Paragraph(r[1], styles['Cell']), Paragraph(r[2], styles['Cell'])])
st = Table(sd, colWidths=[4*cm, 4.5*cm, 8.5*cm], repeatRows=1)
sstyle = [
    ('BACKGROUND', (0,0), (-1,0), NAVY),
    ('GRID', (0,0), (-1,-1), 0.5, BORDER),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
]
for i in range(1, len(sd)):
    if i % 2 == 0:
        sstyle.append(('BACKGROUND', (0,i), (-1,i), LIGHT2))
st.setStyle(TableStyle(sstyle))
story.append(st)
story.append(Spacer(1, 14))

para(
    'Taken together, the app follows a consistent, resilient pattern: <b>fast, deterministic client-side '
    'logic for anything that must work instantly or offline</b> (map rendering, risk-score sliders, routing), '
    'combined with <b>server-mediated Gemini calls for anything that benefits from generative reasoning or '
    'multimodal understanding</b> (XAI explanations, image-based spam/severity triage, multilingual '
    'conversation) — and every AI call has a non-AI fallback so the tool keeps functioning for emergency '
    'responders even when the AI provider is unreachable.'
)

# ===========================================================================
# PAGE TEMPLATE / HEADER-FOOTER
# ===========================================================================
def draw_page_furniture(c: pdfcanvas.Canvas, doc):
    c.saveState()
    # header rule + label (skip on cover page 1)
    if doc.page > 1:
        c.setStrokeColor(BORDER)
        c.setLineWidth(0.6)
        c.line(1.6*cm, PAGE_H - 1.3*cm, PAGE_W - 1.6*cm, PAGE_H - 1.3*cm)
        c.setFont('Helvetica-Bold', 7.5)
        c.setFillColor(MUTED)
        c.drawString(1.6*cm, PAGE_H - 1.15*cm, 'GEOSHIELD AI — FEATURE & BACKEND INTEGRATION MANUAL')
        c.drawRightString(PAGE_W - 1.6*cm, PAGE_H - 1.15*cm, 'NER Disaster Intelligence Platform')
    # footer
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.6)
    c.line(1.6*cm, 1.35*cm, PAGE_W - 1.6*cm, 1.35*cm)
    c.setFont('Helvetica', 7.5)
    c.setFillColor(MUTED)
    c.drawString(1.6*cm, 1.05*cm, 'Generated technical documentation — reflects current source code (App.tsx, server.ts, components/*)')
    c.setFont('Helvetica-Bold', 7.5)
    c.drawRightString(PAGE_W - 1.6*cm, 1.05*cm, f'Page {doc.page}')
    c.restoreState()

doc = SimpleDocTemplate(
    "/mnt/user-data/outputs/GeoShield_AI_Feature_Backend_Documentation.pdf",
    pagesize=A4,
    topMargin=1.9*cm, bottomMargin=1.8*cm, leftMargin=1.6*cm, rightMargin=1.6*cm,
    title="GeoShield AI — Feature & Backend Integration Manual",
    author="GeoShield AI Documentation",
)
doc.build(story, onFirstPage=draw_page_furniture, onLaterPages=draw_page_furniture)
print("PDF generated.")