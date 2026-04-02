// ─── Production Canvas Types ─────────────────────────────────
import type { CharacterData } from "./components/CharacterDetailsPanel";

// Actor type aliases CharacterData from the shared panel
export type Actor = CharacterData;

export type ShotStatus = "empty" | "generating" | "preview" | "approved" | "animating" | "video_ready";

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
  location?: string | string[];
  zoneId: string;
  order?: number;
  generatedImages?: string[];
  shotStatus?: ShotStatus;
  animationProgress?: number;
  videoDuration?: string;
}

export interface CastNode {
  id: string;
  actorId: string;
  x: number;
  y: number;
  zoneId: string;
  order?: number;
}

export interface LocationData {
  id: string;
  name: string;
  description: string;
  setting: string;
  timeOfDay: string;
  weather: string;
  era: string;
  mood: string;
  portrait: string;
  generatedImages: { id: string; src: string; description: string }[];
  selectedImageId: string | null;
}

export interface LocationNode {
  id: string;
  locationId: string;
  x: number;
  y: number;
  zoneId: string;
  order?: number;
}

export interface ScriptNode {
  id: string;
  heading: string;
  body: string;
  x: number;
  y: number;
  zoneId: string;
  order: number;
}

export interface Zone {
  id: string;
  label: string;
  type: ZoneType;
  x: number;
  y: number;
  color: string;
}

export type ZoneType = "casting" | "shots" | "locations" | "script" | "production";

export interface Connection {
  from: string;
  to: string;
}

export interface ZoneConnectorConfig {
  key: "casting" | "script" | "locations" | "production";
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
  locations: LocationData[];
  zones: Zone[];
  frames: FrameData[];
  castNodes: CastNode[];
  locationNodes: LocationNode[];
  scriptNodes: ScriptNode[];
  timelineNodes: import("./components/TimelineNode").TimelineNodeData[];
  previewNodes: import("./components/PreviewMonitorNode").PreviewNodeData[];
  connections: Connection[];
  zoneCols?: Record<string, number>;
  shotAspectRatio?: string;
  zoom: number;
  pan: { x: number; y: number };
}