// ─── Canvas State Management Hook ───────────────────────────
// Centralises all state, persistence, and computed values for the
// production canvas so the page component stays lean.

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import type {
  Actor, FrameData, CastNode, LocationNode, ScriptNode,
  Zone, Connection, Tool, SelectedItem, ZoneBounds,
  CanvasMenuState, PickerPosition, ConnectorData, ZoneType,
} from "../types";
import {
  FRAME_W, FRAME_H, CAST_W, CAST_H, LOC_W, LOC_H,
  SCRIPT_W, SCRIPT_H, TIMELINE_W, ZONE_PAD, ZONE_LABEL_H, DRAWER_W,
  ZOOM_MIN, ZOOM_MAX, ZOOM_STEP, AUTOSAVE_DEBOUNCE_MS, FIT_DELAY_MS,
  ZONE_CONNECTOR_CONFIGS, actorRoster,
  initialZones, initialFrames, initialCastNodes,
  initialLocationNodes, initialScriptNodes, initialConnections,
  initialTimelineNodes, initialPreviewNodes,
} from "../constants";
import type { TimelineNodeData } from "../components/TimelineNode";
import type { PreviewNodeData } from "../components/PreviewMonitorNode";
import {
  computeZoneBounds, loadCanvasState, saveCanvasState,
  makeZonePortId, getConnectionBaseId, getConnectionPortKey,
  getPortPosition, getZoneColor as resolveZoneColor,
} from "../utils";

export function useCanvasState(projectId: string | undefined) {
  const containerRef = useRef<HTMLDivElement>(null);
  const SAVE_KEY = `canvas-${projectId ?? "default"}`;

  // ── Load saved state ────────────────────────────────────
  const saved = useMemo(() => loadCanvasState(SAVE_KEY), [SAVE_KEY]);

  // ── Core state ──────────────────────────────────────────
  const [actors, setActors] = useState<Actor[]>(saved?.actors ?? actorRoster);
  const [zones, setZones] = useState<Zone[]>(saved?.zones ?? initialZones);
  const [frames, setFrames] = useState<FrameData[]>(saved?.frames ?? initialFrames);
  const [castNodes, setCastNodes] = useState<CastNode[]>(saved?.castNodes ?? initialCastNodes);
  const [locationNodes, setLocationNodes] = useState<LocationNode[]>(saved?.locationNodes ?? initialLocationNodes);
  const [scriptNodes, setScriptNodes] = useState<ScriptNode[]>(saved?.scriptNodes ?? initialScriptNodes);
  const [timelineNodes, setTimelineNodes] = useState<TimelineNodeData[]>(saved?.timelineNodes ?? initialTimelineNodes);
  const [previewNodes, setPreviewNodes] = useState<PreviewNodeData[]>([]);
  const [connections, setConnections] = useState<Connection[]>(saved?.connections ?? initialConnections);

  // ── Viewport ────────────────────────────────────────────
  const [zoom, setZoom] = useState(saved?.zoom ?? 1);
  const [pan, setPan] = useState(saved?.pan ?? { x: 0, y: 0 });
  const [tool, setTool] = useState<Tool>("select");

  // ── Interaction state ───────────────────────────────────
  const [dragging, setDragging] = useState<string | null>(null);
  const [draggingZone, setDraggingZone] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoneDragStart, setZoneDragStart] = useState<{ x: number; y: number } | null>(null);
  const [editingZoneLabel, setEditingZoneLabel] = useState<string | null>(null);
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState<SelectedItem>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [connectingMouse, setConnectingMouse] = useState({ x: 0, y: 0 });

  // ── Menus ───────────────────────────────────────────────
  const [canvasMenu, setCanvasMenu] = useState<CanvasMenuState | null>(null);
  const [castPickerPos, setCastPickerPos] = useState<PickerPosition | null>(null);
  const [locationPickerPos, setLocationPickerPos] = useState<PickerPosition | null>(null);

  // ── Auto-save (debounced) ─────────────────────────────
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveCanvasState(SAVE_KEY, {
        actors, zones, frames, castNodes, locationNodes, scriptNodes, timelineNodes, previewNodes, connections, zoom, pan,
      });
    }, AUTOSAVE_DEBOUNCE_MS);
    return () => clearTimeout(saveTimerRef.current);
  }, [actors, zones, frames, castNodes, locationNodes, scriptNodes, timelineNodes, previewNodes, connections, zoom, pan, SAVE_KEY]);

  // ── Computed zone bounds ──────────────────────────────
  const zoneBounds = useMemo(() => {
    const map: Record<string, ZoneBounds> = {};
    zones.forEach((z) => {
      map[z.id] = computeZoneBounds(z, frames, castNodes, locationNodes, scriptNodes, timelineNodes, previewNodes);
    });
    return map;
  }, [zones, frames, castNodes, locationNodes, scriptNodes, timelineNodes, previewNodes]);

  // ── Connection normalization ──────────────────────────
  useEffect(() => {
    setConnections((prev) => {
      const normalized = prev.map((connection) => {
        const fromId = getConnectionBaseId(connection.from);
        const toId = getConnectionBaseId(connection.to);
        const fromZone = zones.find((z) => z.id === fromId);
        const toZone = zones.find((z) => z.id === toId);
        if (!fromZone || !toZone) return connection;

        const fromPort =
          getConnectionPortKey(connection.from) ??
          (fromZone.type === "shots"
            ? toZone.type === "shots" ? undefined : toZone.type
            : fromZone.type);
        const toPort =
          getConnectionPortKey(connection.to) ??
          (toZone.type === "shots"
            ? fromZone.type === "shots" ? undefined : fromZone.type
            : toZone.type);

        if (!fromPort || !toPort || fromPort !== toPort) return connection;

        if (fromZone.type === "shots" && toZone.type !== "shots") {
          return { from: makeZonePortId(toId, toPort), to: makeZonePortId(fromId, fromPort) };
        }
        if (toZone.type === "shots" && fromZone.type !== "shots") {
          return { from: makeZonePortId(fromId, fromPort), to: makeZonePortId(toId, toPort) };
        }
        return connection;
      });

      const deduped = normalized.filter(
        (c, i, arr) => arr.findIndex((item) => item.from === c.from && item.to === c.to) === i,
      );

      const changed =
        deduped.length !== prev.length ||
        deduped.some((c, i) => c.from !== prev[i]?.from || c.to !== prev[i]?.to);

      return changed ? deduped : prev;
    });
  }, [zones]);

  // ── Connected actors resolver ─────────────────────────
  const getConnectedActors = useCallback(
    (shotsZoneId: string): Actor[] => {
      const castingZoneIds = [
        ...new Set(
          connections.flatMap((c) => {
            const fromId = getConnectionBaseId(c.from);
            const toId = getConnectionBaseId(c.to);
            const fromZone = zones.find((z) => z.id === fromId);
            const toZone = zones.find((z) => z.id === toId);
            if (!fromZone || !toZone) return [];
            if (fromId === shotsZoneId && toZone.type === "casting") return [toId];
            if (toId === shotsZoneId && fromZone.type === "casting") return [fromId];
            return [];
          }),
        ),
      ];
      const actorIds = castNodes
        .filter((n) => castingZoneIds.includes(n.zoneId))
        .map((n) => n.actorId);
      return actors.filter((a) => actorIds.includes(a.id));
    },
    [actors, connections, zones, castNodes],
  );

  // ── Zone finder ───────────────────────────────────────
  const findZoneAt = useCallback(
    (wx: number, wy: number): string | undefined => {
      for (const z of zones) {
        const b = zoneBounds[z.id];
        if (b && wx >= b.x && wx <= b.x + b.w && wy >= b.y && wy <= b.y + b.h) return z.id;
      }
      return undefined;
    },
    [zones, zoneBounds],
  );

  // ── Pan / Zoom ────────────────────────────────────────
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((prev) => {
        const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, prev + delta));
        const scale = next / prev;
        setPan((p) => ({
          x: mouseX - scale * (mouseX - p.x),
          y: mouseY - scale * (mouseY - p.y),
        }));
        return next;
      });
    } else {
      setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && tool === "hand")) {
        setPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        e.preventDefault();
      } else if (e.button === 0 && tool === "select") {
        setSelected(null);
      }
    },
    [tool, pan],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (connectingFrom) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        setConnectingMouse({
          x: (e.clientX - rect.left - pan.x) / zoom,
          y: (e.clientY - rect.top - pan.y) / zoom,
        });
      }
      if (panning) setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      if (draggingZone && zoneDragStart) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const worldX = (e.clientX - rect.left - pan.x) / zoom;
        const worldY = (e.clientY - rect.top - pan.y) / zoom;
        const dx = worldX - zoneDragStart.x;
        const dy = worldY - zoneDragStart.y;
        setZoneDragStart({ x: worldX, y: worldY });
        setFrames((prev) => prev.map((f) => (f.zoneId === draggingZone ? { ...f, x: f.x + dx, y: f.y + dy } : f)));
        setCastNodes((prev) => prev.map((n) => (n.zoneId === draggingZone ? { ...n, x: n.x + dx, y: n.y + dy } : n)));
        setLocationNodes((prev) => prev.map((n) => (n.zoneId === draggingZone ? { ...n, x: n.x + dx, y: n.y + dy } : n)));
        setScriptNodes((prev) => prev.map((n) => (n.zoneId === draggingZone ? { ...n, x: n.x + dx, y: n.y + dy } : n)));
        setTimelineNodes((prev) => prev.map((n) => (n.zoneId === draggingZone ? { ...n, x: n.x + dx, y: n.y + dy } : n)));
        setPreviewNodes((prev) => prev.map((n) => (n.zoneId === draggingZone ? { ...n, x: n.x + dx, y: n.y + dy } : n)));
      }
      if (dragging) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = (e.clientX - rect.left - pan.x) / zoom - dragOffset.x;
        const y = (e.clientY - rect.top - pan.y) / zoom - dragOffset.y;
        setFrames((prev) => prev.map((f) => (f.id === dragging ? { ...f, x, y } : f)));
        setCastNodes((prev) => prev.map((n) => (n.id === dragging ? { ...n, x, y } : n)));
        setLocationNodes((prev) => prev.map((n) => (n.id === dragging ? { ...n, x, y } : n)));
        setScriptNodes((prev) => prev.map((n) => (n.id === dragging ? { ...n, x, y } : n)));
        setTimelineNodes((prev) => prev.map((n) => (n.id === dragging ? { ...n, x, y } : n)));
        setPreviewNodes((prev) => prev.map((n) => (n.id === dragging ? { ...n, x, y } : n)));
      }
    },
    [panning, panStart, dragging, dragOffset, pan, zoom, connectingFrom, draggingZone, zoneDragStart],
  );

  const handleMouseUp = useCallback(() => {
    setPanning(false);
    setDragging(null);
    setDraggingZone(null);
    setZoneDragStart(null);
    setConnectingFrom(null);
  }, []);

  // ── Drag start ────────────────────────────────────────
  const startDrag = useCallback(
    (e: React.MouseEvent, node: { id: string; x: number; y: number }) => {
      if (tool !== "select" || e.button !== 0) return;
      e.stopPropagation();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = (e.clientX - rect.left - pan.x) / zoom;
      const my = (e.clientY - rect.top - pan.y) / zoom;
      setDragOffset({ x: mx - node.x, y: my - node.y });
      setDragging(node.id);
      setSelected(null);
    },
    [tool, pan, zoom],
  );

  // ── Connection drag ───────────────────────────────────
  const startConnect = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setConnectingFrom(id);
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setConnectingMouse({
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom,
      });
    },
    [pan, zoom],
  );

  const endConnect = useCallback(
    (id: string) => {
      if (!connectingFrom || connectingFrom === id) {
        setConnectingFrom(null);
        return;
      }

      let nextFrom = connectingFrom;
      let nextTo = id;

      const fromZone = zones.find((z) => z.id === getConnectionBaseId(connectingFrom));
      const toZone = zones.find((z) => z.id === getConnectionBaseId(id));

      if (fromZone || toZone) {
        if (!fromZone || !toZone) {
          setConnectingFrom(null);
          return;
        }

        const fromPort = getConnectionPortKey(connectingFrom);
        const toPort = getConnectionPortKey(id);

        const validForward =
          toZone.type === "shots" &&
          fromZone.type !== "shots" &&
          !!fromPort &&
          fromPort === toPort &&
          fromZone.type === fromPort;

        const validReverse =
          fromZone.type === "shots" &&
          toZone.type !== "shots" &&
          !!fromPort &&
          fromPort === toPort &&
          toZone.type === fromPort;

        if (!validForward && !validReverse) {
          setConnectingFrom(null);
          return;
        }

        if (validReverse) {
          nextFrom = id;
          nextTo = connectingFrom;
        }
      }

      const exists = connections.some((c) => c.from === nextFrom && c.to === nextTo);
      if (!exists) setConnections((prev) => [...prev, { from: nextFrom, to: nextTo }]);
      setConnectingFrom(null);
    },
    [connectingFrom, connections, zones],
  );

  // ── Connector data ────────────────────────────────────
  const getPortPos = useCallback(
    (nodeId: string, side: "left" | "right") =>
      getPortPosition(nodeId, side, zones, zoneBounds, frames, castNodes, locationNodes, scriptNodes, timelineNodes),
    [zones, zoneBounds, frames, castNodes, locationNodes, scriptNodes, timelineNodes],
  );

  const getNodeZoneColor = useCallback(
    (nodeId: string) => resolveZoneColor(nodeId, zones, castNodes, locationNodes, scriptNodes),
    [zones, castNodes, locationNodes, scriptNodes],
  );

  const connectors: ConnectorData[] = useMemo(
    () =>
      connections.map((c) => {
        const fromId = getConnectionBaseId(c.from);
        const toId = getConnectionBaseId(c.to);
        const p1 = getPortPos(c.from, "right");
        const p2 = getPortPos(c.to, "left");
        const isZoneConn = zones.some((z) => z.id === fromId) || zones.some((z) => z.id === toId);
        const color = getNodeZoneColor(c.from);
        return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, from: c.from, to: c.to, isZoneConn, color };
      }),
    [connections, getPortPos, getNodeZoneColor, zones],
  );

  // ── Fit to screen ─────────────────────────────────────
  const fitToScreen = useCallback(() => {
    if (!containerRef.current) return;
    const allBounds = Object.values(zoneBounds);
    if (allBounds.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const minX = Math.min(...allBounds.map((b) => b.x));
    const minY = Math.min(...allBounds.map((b) => b.y));
    const maxX = Math.max(...allBounds.map((b) => b.x + b.w));
    const maxY = Math.max(...allBounds.map((b) => b.y + b.h));
    const cw = maxX - minX + 120;
    const ch = maxY - minY + 120;
    const drawWidth = selected ? rect.width - DRAWER_W : rect.width;
    const nz = Math.min(drawWidth / cw, rect.height / ch, 1.2);
    setZoom(nz);
    setPan({
      x: (drawWidth - cw * nz) / 2 - minX * nz + 60 * nz,
      y: (rect.height - ch * nz) / 2 - minY * nz + 60 * nz,
    });
  }, [zoneBounds, selected]);

  // ── Add frame ─────────────────────────────────────────
  const addFrame = useCallback(
    (x?: number, y?: number, zoneId?: string) => {
      const targetZone = zoneId || zones.find((z) => z.type === "shots")?.id || "z-shots";
      const zb = zoneBounds[targetZone];
      const id = `f${Date.now()}`;
      const last = frames.filter((f) => f.zoneId === targetZone);
      const lastF = last[last.length - 1];
      setFrames((prev) => [
        ...prev,
        {
          id,
          x: x ?? (lastF ? lastF.x + 300 : zb ? zb.x + ZONE_PAD : 80),
          y: y ?? (lastF ? lastF.y : zb ? zb.y + ZONE_PAD + ZONE_LABEL_H : 80),
          image: "",
          scene: `SC ${Math.ceil((frames.length + 1) / 2)}`,
          shot: "WIDE",
          description: "New frame",
          duration: "3s",
          actors: [],
          zoneId: targetZone,
        },
      ]);
      setSelected({ type: "frame", id });
    },
    [frames, zones, zoneBounds],
  );

  // ── Auto-grid zone nodes ───────────────────────────────
  const autoGridZone = useCallback(
    (zoneId: string) => {
      const zone = zones.find((z) => z.id === zoneId);
      if (!zone) return;

      const GAP = 24;
      const sizeMap: Partial<Record<ZoneType, { w: number; h: number }>> = {
        casting: { w: CAST_W, h: CAST_H },
        locations: { w: LOC_W, h: LOC_H },
        script: { w: SCRIPT_W, h: SCRIPT_H },
      };
      const size = sizeMap[zone.type];
      if (!size) return;

      // Collect nodes for this zone
      const getNodes = (): { x: number; y: number; id: string }[] => {
        if (zone.type === "casting") return castNodes.filter((n) => n.zoneId === zoneId);
        if (zone.type === "locations") return locationNodes.filter((n) => n.zoneId === zoneId);
        if (zone.type === "script") return scriptNodes.filter((n) => n.zoneId === zoneId);
        return [];
      };

      const nodes = getNodes();
      if (nodes.length === 0) return;

      // Calculate grid columns based on count
      const cols = Math.ceil(Math.sqrt(nodes.length));
      
      // Use the zone's anchor position as the starting point
      const startX = zone.x + ZONE_PAD;
      const startY = zone.y + ZONE_PAD + ZONE_LABEL_H;

      const positions = nodes.map((n, i) => ({
        id: n.id,
        x: startX + (i % cols) * (size.w + GAP),
        y: startY + Math.floor(i / cols) * (size.h + GAP),
      }));

      const applyPositions = <T extends { id: string; x: number; y: number }>(
        prev: T[],
      ): T[] =>
        prev.map((n) => {
          const pos = positions.find((p) => p.id === n.id);
          return pos ? { ...n, x: pos.x, y: pos.y } : n;
        });

      if (zone.type === "casting") setCastNodes(applyPositions);
      else if (zone.type === "locations") setLocationNodes(applyPositions);
      else if (zone.type === "script") setScriptNodes(applyPositions);
    },
    [zones, castNodes, locationNodes, scriptNodes],
  );

  // ── Reset canvas ──────────────────────────────────────
  const resetCanvas = useCallback(() => {
    localStorage.removeItem(SAVE_KEY);
    setActors(actorRoster);
    setZones(initialZones);
    setFrames(initialFrames);
    setCastNodes(initialCastNodes);
    setLocationNodes(initialLocationNodes);
    setScriptNodes(initialScriptNodes);
    setTimelineNodes(initialTimelineNodes);
    setPreviewNodes(initialPreviewNodes);
    setConnections(initialConnections);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelected(null);
    setTimeout(fitToScreen, FIT_DELAY_MS);
  }, [SAVE_KEY, fitToScreen]);

  useEffect(() => {
    const d = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        setTool("hand");
        e.preventDefault();
      }
    };
    const u = (e: KeyboardEvent) => {
      if (e.code === "Space") setTool("select");
    };
    window.addEventListener("keydown", d);
    window.addEventListener("keyup", u);
    return () => {
      window.removeEventListener("keydown", d);
      window.removeEventListener("keyup", u);
    };
  }, []);

  // ── Fit on mount ──────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(fitToScreen, FIT_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  // ── Start zone drag ───────────────────────────────────
  const startZoneDrag = useCallback(
    (e: React.MouseEvent, zoneId: string) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      setDraggingZone(zoneId);
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setZoneDragStart({
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom,
      });
    },
    [pan, zoom],
  );

  return {
    // Refs
    containerRef,
    // Core state
    actors, setActors,
    zones, setZones,
    frames, setFrames,
    castNodes, setCastNodes,
    locationNodes, setLocationNodes,
    scriptNodes, setScriptNodes,
    timelineNodes, setTimelineNodes,
    previewNodes, setPreviewNodes,
    connections, setConnections,
    // Viewport
    zoom, setZoom, pan, setPan, tool, setTool,
    // Interaction
    dragging, panning, selected, setSelected,
    connectingFrom, connectingMouse,
    editingZoneLabel, setEditingZoneLabel,
    // Menus
    canvasMenu, setCanvasMenu,
    castPickerPos, setCastPickerPos,
    locationPickerPos, setLocationPickerPos,
    // Computed
    zoneBounds, connectors,
    // Callbacks
    handleWheel, handleMouseDown, handleMouseMove, handleMouseUp,
    startDrag, startConnect, endConnect, startZoneDrag,
    fitToScreen, addFrame, resetCanvas, autoGridZone,
    getConnectedActors, findZoneAt, getPortPos,
  };
}

