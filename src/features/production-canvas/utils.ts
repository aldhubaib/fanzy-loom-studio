// ─── Production Canvas Utility Functions ─────────────────────
import type {
  Zone, FrameData, CastNode, LocationNode, ScriptNode,
  ZoneBounds, ZoneConnectorConfig, CanvasState,
} from "./types";
import type { TimelineNodeData } from "./components/TimelineNode";
import type { PreviewNodeData } from "./components/PreviewMonitorNode";
import {
  FRAME_W, FRAME_H, CAST_W, CAST_H, LOC_W, LOC_H,
  SCRIPT_W, SCRIPT_H, TIMELINE_W, TIMELINE_H,
  ZONE_PAD, ZONE_LABEL_H,
  MIN_ZONE_W, MIN_ZONE_H, CONNECTION_PORT_SEPARATOR,
  ZONE_CONNECTOR_CONFIGS,
} from "./constants";

// ─── Connection Helpers ─────────────────────────────────────
export const makeZonePortId = (
  zoneId: string,
  portKey: ZoneConnectorConfig["key"],
): string => `${zoneId}${CONNECTION_PORT_SEPARATOR}${portKey}`;

export const getConnectionBaseId = (endpoint: string): string =>
  endpoint.split(CONNECTION_PORT_SEPARATOR)[0];

export const getConnectionPortKey = (
  endpoint: string,
): ZoneConnectorConfig["key"] | undefined => {
  if (!endpoint.includes(CONNECTION_PORT_SEPARATOR)) return undefined;
  return endpoint.split(CONNECTION_PORT_SEPARATOR)[1] as ZoneConnectorConfig["key"];
};

// ─── Zone Bounds ────────────────────────────────────────────
export function computeZoneBounds(
  zone: Zone,
  frames: FrameData[],
  castNodes: CastNode[],
  locationNodes: LocationNode[],
  scriptNodes: ScriptNode[] = [],
  timelineNodes: TimelineNodeData[] = [],
  previewNodes: PreviewNodeData[] = [],
): ZoneBounds {
  const children: { x: number; y: number; w: number; h: number }[] = [];

  const sizeMap: Record<string, { w: number; h: number }> = {
    shots: { w: FRAME_W, h: FRAME_H },
    casting: { w: CAST_W, h: CAST_H },
    locations: { w: LOC_W, h: LOC_H },
    script: { w: SCRIPT_W, h: SCRIPT_H },
    production: { w: TIMELINE_W, h: TIMELINE_H },
  };

  const nodeMap: Record<string, Array<{ x: number; y: number; zoneId?: string }>> = {
    shots: frames,
    casting: castNodes,
    locations: locationNodes,
    script: scriptNodes,
    production: timelineNodes,
  };

  const nodes = nodeMap[zone.type] ?? [];
  const size = sizeMap[zone.type] ?? { w: FRAME_W, h: FRAME_H };

  nodes
    .filter((n: any) => n.zoneId === zone.id)
    .forEach((n) => children.push({ x: n.x, y: n.y, ...size }));

  if (children.length === 0) {
    return { x: zone.x, y: zone.y, w: MIN_ZONE_W, h: MIN_ZONE_H };
  }

  const minX = Math.min(...children.map((c) => c.x)) - ZONE_PAD;
  const minY = Math.min(...children.map((c) => c.y)) - ZONE_PAD - ZONE_LABEL_H;
  const maxX = Math.max(...children.map((c) => c.x + c.w)) + ZONE_PAD;
  const maxY = Math.max(...children.map((c) => c.y + c.h)) + ZONE_PAD;

  return {
    x: minX,
    y: minY,
    w: Math.max(MIN_ZONE_W, maxX - minX),
    h: Math.max(MIN_ZONE_H, maxY - minY),
  };
}

// ─── Port Position ──────────────────────────────────────────
export function getPortPosition(
  nodeId: string,
  side: "left" | "right",
  zones: Zone[],
  zoneBounds: Record<string, ZoneBounds>,
  frames: FrameData[],
  castNodes: CastNode[],
  locationNodes: LocationNode[],
  scriptNodes: ScriptNode[],
  timelineNodes: TimelineNodeData[] = [],
): { x: number; y: number } {
  const baseId = getConnectionBaseId(nodeId);
  const portKey = getConnectionPortKey(nodeId);
  const zone = zones.find((z) => z.id === baseId);
  const zb = zoneBounds[baseId];

  if (zone && zb) {
    const port = ZONE_CONNECTOR_CONFIGS[zone.type].find(
      (config) => config.key === portKey,
    );
    if (port) {
      return {
        x: port.side === "right" ? zb.x + zb.w : zb.x,
        y: zb.y + zb.h * port.yFrac,
      };
    }
    return { x: side === "right" ? zb.x + zb.w : zb.x, y: zb.y + zb.h / 2 };
  }

  const f = frames.find((fr) => fr.id === baseId);
  if (f) return { x: side === "right" ? f.x + FRAME_W : f.x, y: f.y + FRAME_H / 2 };

  const cn = castNodes.find((n) => n.id === baseId);
  if (cn) return { x: side === "right" ? cn.x + CAST_W : cn.x, y: cn.y + CAST_H / 2 };

  const ln = locationNodes.find((n) => n.id === baseId);
  if (ln) return { x: side === "right" ? ln.x + LOC_W : ln.x, y: ln.y + LOC_H / 2 };

  const sn = scriptNodes.find((n) => n.id === baseId);
  if (sn) return { x: side === "right" ? sn.x + SCRIPT_W : sn.x, y: sn.y + SCRIPT_H / 2 };

  const tn = timelineNodes.find((n) => n.id === baseId);
  if (tn) return { x: side === "right" ? tn.x + TIMELINE_W : tn.x, y: tn.y + TIMELINE_H / 2 };

  return { x: 0, y: 0 };
}

// ─── Persistence ────────────────────────────────────────────
export function loadCanvasState(key: string): CanvasState | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Basic shape validation
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray(parsed.frames) ||
      !Array.isArray(parsed.zones)
    ) {
      console.warn("[Canvas] Invalid saved state shape, resetting.");
      localStorage.removeItem(key);
      return null;
    }
    return parsed as CanvasState;
  } catch (err) {
    console.error("[Canvas] Failed to load saved state:", err);
    localStorage.removeItem(key);
    return null;
  }
}

export function saveCanvasState(key: string, state: CanvasState): void {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (err) {
    console.warn("[Canvas] Failed to save state (quota?):", err);
  }
}

// ─── Zone Color Resolver ────────────────────────────────────
export function getZoneColor(
  nodeId: string,
  zones: Zone[],
  castNodes: CastNode[],
  locationNodes: LocationNode[],
  scriptNodes: ScriptNode[],
): string {
  const baseId = getConnectionBaseId(nodeId);
  const portKey = getConnectionPortKey(nodeId);
  const zone = zones.find((z) => z.id === baseId);

  if (zone) {
    const port = ZONE_CONNECTOR_CONFIGS[zone.type].find(
      (config) => config.key === portKey,
    );
    return port?.color ?? zone.color;
  }

  const castNode = castNodes.find((n) => n.id === baseId);
  if (castNode) {
    const z = zones.find((zz) => zz.id === castNode.zoneId);
    if (z) return z.color;
  }
  const locNode = locationNodes.find((n) => n.id === baseId);
  if (locNode) {
    const z = zones.find((zz) => zz.id === locNode.zoneId);
    if (z) return z.color;
  }
  const scrNode = scriptNodes.find((n) => n.id === baseId);
  if (scrNode) {
    const z = zones.find((zz) => zz.id === scrNode.zoneId);
    if (z) return z.color;
  }

  return "var(--primary)";
}