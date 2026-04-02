// ─── Production Canvas Constants & Config ────────────────────
// All dimensions and layout values are configurable here.
// No magic numbers in components — everything references this file.

import frame1 from "@/assets/storyboard/frame-1.jpg";
import frame2 from "@/assets/storyboard/frame-2.jpg";
import frame3 from "@/assets/storyboard/frame-3.jpg";
import frame4 from "@/assets/storyboard/frame-4.jpg";
import frame5 from "@/assets/storyboard/frame-5.jpg";
import frame6 from "@/assets/storyboard/frame-6.jpg";

import actorMarlowe from "@/assets/actors/marlowe.png";
import actorVivian from "@/assets/actors/vivian.png";
import actorEddie from "@/assets/actors/eddie.png";

import locOffice from "@/assets/locations/office.jpg";
import locStreet from "@/assets/locations/street.jpg";
import locJazzClub from "@/assets/locations/jazz-club.jpg";
import locBridge from "@/assets/locations/bridge.jpg";

import shotWide from "@/assets/shots/wide.jpg";
import shotMedium from "@/assets/shots/medium.jpg";
import shotCloseup from "@/assets/shots/closeup.jpg";
import shotECU from "@/assets/shots/extreme-closeup.jpg";
import shotOTS from "@/assets/shots/ots.jpg";
import shotPOV from "@/assets/shots/pov.jpg";
import shotDynamic from "@/assets/shots/dynamic.jpg";
import shotLow from "@/assets/shots/low-angle.jpg";
import shotHigh from "@/assets/shots/high-angle.jpg";
import shotAerial from "@/assets/shots/aerial.jpg";

import locDetailOffice from "@/assets/locations/interior-office.jpg";
import locDetailStreet from "@/assets/locations/exterior-street.jpg";
import locDetailClub from "@/assets/locations/interior-club.jpg";
import locDetailBridge from "@/assets/locations/exterior-bridge.jpg";
import locDetailPenthouse from "@/assets/locations/interior-penthouse.jpg";
import locDetailWarehouse from "@/assets/locations/interior-warehouse.jpg";
import locDetailRestaurant from "@/assets/locations/interior-restaurant.jpg";
import locDetailCar from "@/assets/locations/interior-car.jpg";

import type {
  Actor, FrameData, CastNode, LocationNode, ScriptNode,
  Zone, Connection, ZoneConnectorConfig, ZoneType,
} from "./types";

// ─── Dimensions ─────────────────────────────────────────────
export const FRAME_W = 260;
export const IMAGE_H = 146;
export const FRAME_H = IMAGE_H + 70;
export const PORT_Y = FRAME_H / 2;
export const CAST_W = 160;
export const CAST_H = 260;
export const LOC_W = 180;
export const LOC_H = 140;
export const SCRIPT_W = 280;
export const SCRIPT_H = 160;
export const DRAWER_W = 360;
export const TIMELINE_W = 800;
export const TIMELINE_H = 560;
export const TIMELINE_PREVIEW_H = 260;
export const TIMELINE_TRACK_H = 44;
export const TIMELINE_HEADER_H = 36;
export const TIMELINE_RULER_H = 24;
export const PREVIEW_MON_W = 640;
export const PREVIEW_MON_H = 480;

// ─── Zone Layout ────────────────────────────────────────────
export const ZONE_PAD = 40;
export const ZONE_LABEL_H = 40;
export const MIN_ZONE_W = 300;
export const MIN_ZONE_H = 200;

// ─── Canvas Interaction ─────────────────────────────────────
export const ZOOM_MIN = 0.15;
export const ZOOM_MAX = 3;
export const ZOOM_STEP = 0.1;
export const GRID_SIZE = 32;
export const AUTOSAVE_DEBOUNCE_MS = 800;
export const FIT_DELAY_MS = 150;
export const CONNECTOR_SVG_OFFSET = 2500;
export const CONNECTOR_SVG_SIZE = 10000;
export const CONNECTION_PORT_SEPARATOR = "::";

// ─── Duration Options ───────────────────────────────────────
export const DURATION_OPTIONS = ["2s", "3s", "4s", "5s", "6s", "8s"] as const;

// ─── Zone Connector Configs ─────────────────────────────────
export const ZONE_CONNECTOR_CONFIGS = {
  casting: [
    { key: "casting", color: "190 80% 50%", label: "Connect to Shots", side: "right", yFrac: 0.5 },
  ],
  shots: [
    { key: "script", color: "280 60% 55%", label: "Script", side: "left", yFrac: 0.22 },
    { key: "casting", color: "190 80% 50%", label: "Casting", side: "left", yFrac: 0.5 },
    { key: "locations", color: "150 60% 45%", label: "Locations", side: "left", yFrac: 0.78 },
    { key: "production", color: "350 75% 55%", label: "Production", side: "right", yFrac: 0.5 },
  ],
  locations: [
    { key: "locations", color: "150 60% 45%", label: "Connect to Shots", side: "right", yFrac: 0.5 },
  ],
  script: [
    { key: "script", color: "280 60% 55%", label: "Connect to Shots", side: "right", yFrac: 0.5 },
  ],
  production: [
    { key: "production", color: "30 90% 55%", label: "Connect to Shots", side: "left", yFrac: 0.5 },
  ],
} satisfies Record<ZoneType, ZoneConnectorConfig[]>;

// ─── Zone Colors ────────────────────────────────────────────
export const ZONE_COLORS: Record<ZoneType, string> = {
  casting: "190 80% 50%",
  shots: "220 70% 55%",
  locations: "150 60% 45%",
  script: "280 60% 55%",
  production: "350 75% 55%",
};

export const ZONE_LABELS: Record<ZoneType, string> = {
  casting: "Casting",
  shots: "Shots",
  locations: "Locations",
  script: "Script",
  production: "Production",
};

// ─── Assets Maps ────────────────────────────────────────────
export const locationImages: Record<string, string> = {
  "Office": locOffice,
  "Street": locStreet,
  "Jazz Club": locJazzClub,
  "Bridge": locBridge,
};

export const locationDetailOptions = [
  { value: "Office", label: "Office", img: locDetailOffice },
  { value: "Street", label: "Street", img: locDetailStreet },
  { value: "Jazz Club", label: "Jazz Club", img: locDetailClub },
  { value: "Bridge", label: "Bridge", img: locDetailBridge },
  { value: "Penthouse", label: "Penthouse", img: locDetailPenthouse },
  { value: "Warehouse", label: "Warehouse", img: locDetailWarehouse },
  { value: "Restaurant", label: "Restaurant", img: locDetailRestaurant },
  { value: "Car", label: "Car Interior", img: locDetailCar },
] as const;

export const shotTypes = [
  { value: "WIDE", label: "Wide", img: shotWide },
  { value: "MED", label: "Medium", img: shotMedium },
  { value: "CU", label: "Close-Up", img: shotCloseup },
  { value: "ECU", label: "Extreme CU", img: shotECU },
  { value: "OTS", label: "Over Shoulder", img: shotOTS },
  { value: "POV", label: "POV", img: shotPOV },
  { value: "DYNAMIC", label: "Dynamic", img: shotDynamic },
  { value: "LOW", label: "Low Angle", img: shotLow },
  { value: "HIGH", label: "High Angle", img: shotHigh },
  { value: "AERIAL", label: "Aerial", img: shotAerial },
] as const;

// ─── Actor Roster ───────────────────────────────────────────
export const actorRoster: Actor[] = [
  { id: "a1", name: "Jack Marlowe", portrait: actorMarlowe, role: "Protagonist", description: "A world-weary private detective.", gender: "Male", ageRange: "Middle Age (31-55)", ethnicity: "Caucasian", bodyType: "Average", height: "Tall", hairColor: "Dark Brown", hairStyle: "Short", eyeColor: "Brown", skinTone: "Light", clothing: "Formal", distinguishingFeatures: "Facial Scar", generatedPortraits: [{ id: "g1a", src: actorMarlowe, description: "Detective — classic noir" }], selectedPortraitId: "g1a" },
  { id: "a2", name: "Vivian Lake", portrait: actorVivian, role: "Supporting", description: "A mysterious woman with a missing person case.", gender: "Female", ageRange: "Young Adult (18-30)", ethnicity: "Caucasian", bodyType: "Slim", height: "Average", hairColor: "Dark Brown", hairStyle: "Long", eyeColor: "Green", skinTone: "Very Light", clothing: "High Fashion", distinguishingFeatures: "None", generatedPortraits: [{ id: "g2a", src: actorVivian, description: "Vivian — classic look" }], selectedPortraitId: "g2a" },
  { id: "a3", name: "Eddie", portrait: actorEddie, role: "Supporting", description: "Marlowe's street-smart informant.", gender: "Male", ageRange: "Young Adult (18-30)", ethnicity: "African", bodyType: "Average", height: "Average", hairColor: "Black", hairStyle: "Short", eyeColor: "Brown", skinTone: "Dark", clothing: "Streetwear", distinguishingFeatures: "None", generatedPortraits: [{ id: "g3a", src: actorEddie, description: "Eddie — street look" }], selectedPortraitId: "g3a" },
];

// ─── Initial Data ───────────────────────────────────────────
export const initialZones: Zone[] = [
  { id: "z-casting", label: "Casting", type: "casting", x: -500, y: 0, color: "190 80% 50%" },
  { id: "z-shots", label: "Shots", type: "shots", x: 40, y: 0, color: "var(--primary)" },
  { id: "z-locations", label: "Locations", type: "locations", x: 1200, y: 0, color: "150 60% 45%" },
  { id: "z-script", label: "Script", type: "script", x: 40, y: -500, color: "280 60% 55%" },
  { id: "z-production", label: "Production", type: "production", x: 1200, y: 600, color: "30 90% 55%" },
];

export const initialFrames: FrameData[] = [
  { id: "f1", x: 80, y: 80, image: frame1, scene: "SC 1", shot: "WIDE", description: "Marlowe sits at his desk, smoke curling from a cigarette.", duration: "4s", actors: ["a1"], location: "Office", zoneId: "z-shots" },
  { id: "f2", x: 400, y: 80, image: frame2, scene: "SC 1", shot: "MED", description: "Vivian appears in the rain-soaked alley.", duration: "3s", actors: ["a2"], zoneId: "z-shots" },
  { id: "f3", x: 720, y: 80, image: frame3, scene: "SC 2", shot: "WIDE", description: "The Blue Note Jazz Club — establishing shot.", duration: "5s", actors: ["a3"], location: "Jazz Club", zoneId: "z-shots" },
  { id: "f4", x: 80, y: 340, image: frame4, scene: "SC 2", shot: "CU", description: "Marlowe examines a photograph under his desk lamp.", duration: "3s", actors: ["a1"], location: "Office", zoneId: "z-shots" },
  { id: "f5", x: 400, y: 340, image: frame5, scene: "SC 3", shot: "WIDE", description: "Two silhouettes meet on the foggy bridge.", duration: "6s", actors: ["a1", "a2"], location: "Bridge", zoneId: "z-shots" },
  { id: "f6", x: 720, y: 340, image: frame6, scene: "SC 3", shot: "DYNAMIC", description: "Car chase through wet city streets.", duration: "4s", actors: ["a1"], location: "Street", zoneId: "z-shots" },
];

export const initialCastNodes: CastNode[] = [
  { id: "cn1", actorId: "a1", x: -460, y: 80, zoneId: "z-casting" },
  { id: "cn2", actorId: "a2", x: -260, y: 80, zoneId: "z-casting" },
  { id: "cn3", actorId: "a3", x: -460, y: 340, zoneId: "z-casting" },
];

export const initialLocationNodes: LocationNode[] = [
  { id: "ln1", locationName: "Office", x: 1240, y: 80, zoneId: "z-locations" },
  { id: "ln2", locationName: "Bridge", x: 1460, y: 80, zoneId: "z-locations" },
  { id: "ln3", locationName: "Jazz Club", x: 1240, y: 260, zoneId: "z-locations" },
  { id: "ln4", locationName: "Street", x: 1460, y: 260, zoneId: "z-locations" },
];

export const initialScriptNodes: ScriptNode[] = [
  { id: "sn1", heading: "INT. MARLOWE'S OFFICE - NIGHT", body: "Marlowe sits at his desk, the room thick with cigarette smoke. A knock at the door.", x: 80, y: -460, zoneId: "z-script" },
  { id: "sn2", heading: "EXT. RAIN-SLICKED ALLEY - NIGHT", body: "Vivian emerges from the shadows, heels clicking on wet pavement.", x: 400, y: -460, zoneId: "z-script" },
  { id: "sn3", heading: "INT. THE BLUE NOTE JAZZ CLUB - NIGHT", body: "A saxophone wails. Eddie leans against the bar, watching the door.", x: 720, y: -460, zoneId: "z-script" },
];

export const initialConnections: Connection[] = [
  { from: "f1", to: "f2" }, { from: "f2", to: "f3" },
  { from: "f3", to: "f4" }, { from: "f4", to: "f5" }, { from: "f5", to: "f6" },
  { from: `z-casting${CONNECTION_PORT_SEPARATOR}casting`, to: `z-shots${CONNECTION_PORT_SEPARATOR}casting` },
  { from: `z-locations${CONNECTION_PORT_SEPARATOR}locations`, to: `z-shots${CONNECTION_PORT_SEPARATOR}locations` },
  { from: `z-script${CONNECTION_PORT_SEPARATOR}script`, to: `z-shots${CONNECTION_PORT_SEPARATOR}script` },
  { from: `z-shots${CONNECTION_PORT_SEPARATOR}production`, to: `z-production${CONNECTION_PORT_SEPARATOR}production` },
];

export const initialTimelineNodes: import("./components/TimelineNode").TimelineNodeData[] = [
  { id: "tn1", x: 1240, y: 640, zoneId: "z-production" },
];

export const initialPreviewNodes: import("./components/PreviewMonitorNode").PreviewNodeData[] = [];