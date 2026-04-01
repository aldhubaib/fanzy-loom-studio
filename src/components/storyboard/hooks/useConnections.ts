import { useState, useCallback, useRef } from "react";
import type { FrameData, CastNode, LocationNode, Connection } from "../types";
import { FRAME_W, CAST_W, CAST_H, LOC_W, LOC_H, PORT_Y } from "../constants";

interface UseConnectionsProps {
  frames: FrameData[];
  castNodes: CastNode[];
  locationNodes: LocationNode[];
  pan: { x: number; y: number };
  zoom: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function useConnections({
  frames, castNodes, locationNodes, pan, zoom, containerRef,
}: UseConnectionsProps) {
  const [connections, setConnections] = useState<Connection[]>([
    { from: "f1", to: "f2" },
    { from: "f2", to: "f3" },
    { from: "f3", to: "f4" },
    { from: "f4", to: "f5" },
    { from: "f5", to: "f6" },
  ]);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [connectingMouse, setConnectingMouse] = useState({ x: 0, y: 0 });

  const getPortPos = useCallback((nodeId: string, side: "left" | "right") => {
    const f = frames.find(fr => fr.id === nodeId);
    if (f) return { x: side === "right" ? f.x + FRAME_W : f.x, y: f.y + PORT_Y };
    const cn = castNodes.find(n => n.id === nodeId);
    if (cn) return { x: side === "right" ? cn.x + CAST_W : cn.x, y: cn.y + CAST_H / 2 };
    const ln = locationNodes.find(n => n.id === nodeId);
    if (ln) return { x: side === "right" ? ln.x + LOC_W : ln.x, y: ln.y + LOC_H / 2 };
    return { x: 0, y: 0 };
  }, [frames, castNodes, locationNodes]);

  const connectors = connections.map(c => {
    const p1 = getPortPos(c.from, "right");
    const p2 = getPortPos(c.to, "left");
    return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, id: `${c.from}-${c.to}`, from: c.from, to: c.to };
  });

  const startConnect = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setConnectingFrom(nodeId);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setConnectingMouse({
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
    });
  }, [pan, zoom, containerRef]);

  const endConnect = useCallback((nodeId: string) => {
    if (connectingFrom && connectingFrom !== nodeId) {
      const exists = connections.some(c => c.from === connectingFrom && c.to === nodeId);
      if (!exists) {
        setConnections(prev => [...prev, { from: connectingFrom, to: nodeId }]);
      }
    }
    setConnectingFrom(null);
  }, [connectingFrom, connections]);

  const deleteConnection = useCallback((from: string, to: string) => {
    setConnections(prev => prev.filter(c => !(c.from === from && c.to === to)));
  }, []);

  const updateConnectingMouse = useCallback((e: React.MouseEvent) => {
    if (!connectingFrom) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setConnectingMouse({
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
    });
  }, [connectingFrom, pan, zoom, containerRef]);

  const removeConnectionsForNode = useCallback((nodeId: string) => {
    setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
  }, []);

  return {
    connections, setConnections,
    connectingFrom, setConnectingFrom,
    connectingMouse,
    connectors,
    getPortPos,
    startConnect, endConnect, deleteConnection,
    updateConnectingMouse,
    removeConnectionsForNode,
  };
}
