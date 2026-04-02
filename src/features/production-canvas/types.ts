// ─── Production Canvas Types ─────────────────────────────────
import type { CharacterData } from "./components/CharacterDetailsPanel";

// Actor type aliases CharacterData from the shared panel
export type Actor = CharacterData;

export interface FrameData {
  id: string;
  x: number;
  y: number;
  image: string;
  scene: string;
  shot: string;
  description: string;
  duration: string;
  actors: string[];
  location?: string;
  zoneId: string;
}

export interface CastNode {
  id: string;
  actorId: string;
  x: number;
  y: number;
  zoneId: string;
}

export interface LocationNode {
  id: string;
  locationName: string;
  x: number;
  y: number;
  zoneId: string;
}

export interface ScriptNode {
  id: string;
  heading: string;
  body: string;
  x: number;
  y: number;
  zoneId: string;
}

export interface ScreenplayNode {
  id: string;
  content: string; // HTML content from contentEditable
  x: number;
  y: number;
  zoneId: string;
}

export interface Zone {
  id: string;
  label: string;
  type: ZoneType;
  x: number;
  y: number;
  color: string;
}

export type ZoneType = "casting" | "shots" | "locations" | "script" | "production" | "screenplay";

export interface Connection {
  from: string;
  to: string;
}

export interface ZoneConnectorConfig {
  key: "casting" | "script" | "locations" | "production" | "screenplay";
  color: string;
  label: string;
  side: "left" | "right";
  yFrac: number;
}

export type SelectedItem =
  | { type: "frame"; id: string }
  | { type: "cast"; id: string }
  | { type: "location"; id: string }
  | { type: "script"; id: string }
  | { type: "screenplay"; id: string }
  | { type: "zone"; id: string }
  | { type: "preview"; id: string }
  | null;

export type Tool = "select" | "hand";

export interface CanvasMenuState {
  x: number;
  y: number;
  worldX: number;
  worldY: number;
  zoneId?: string;
}

export interface PickerPosition {
  x: number;
  y: number;
  worldX: number;
  worldY: number;
  zoneId: string;
}

export interface ZoneBounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ConnectorData {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  from: string;
  to: string;
  isZoneConn: boolean;
  color: string;
}

/** Serializable canvas state for persistence */
export interface CanvasState {
  actors: Actor[];
  zones: Zone[];
  frames: FrameData[];
  castNodes: CastNode[];
  locationNodes: LocationNode[];
  scriptNodes: ScriptNode[];
  timelineNodes: import("./components/TimelineNode").TimelineNodeData[];
  previewNodes: import("./components/PreviewMonitorNode").PreviewNodeData[];
  connections: Connection[];
  zoom: number;
  pan: { x: number; y: number };
}