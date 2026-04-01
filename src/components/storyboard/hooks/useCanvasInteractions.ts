import { useState, useCallback, useEffect, useRef } from "react";
import type { FrameData, CastNode, LocationNode, Tool } from "../types";
import { FRAME_W, FRAME_H_BASE, GRID_COLS, GAP_X, GAP_Y } from "../constants";

interface UseCanvasInteractionsProps {
  frames: FrameData[];
  setFrames: React.Dispatch<React.SetStateAction<FrameData[]>>;
  castNodes: CastNode[];
  setCastNodes: React.Dispatch<React.SetStateAction<CastNode[]>>;
  locationNodes: LocationNode[];
  setLocationNodes: React.Dispatch<React.SetStateAction<LocationNode[]>>;
}

export function useCanvasInteractions({
  frames, setFrames, castNodes, setCastNodes, locationNodes, setLocationNodes,
}: UseCanvasInteractionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<Tool>("select");
  const [dragging, setDragging] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [panning, setPanning] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
  const [ctrlZooming, setCtrlZooming] = useState(false);
  const [ctrlZoomStartY, setCtrlZoomStartY] = useState(0);
  const [ctrlZoomStartZoom, setCtrlZoomStartZoom] = useState(1);

  const getWorldPos = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    };
  }, [pan, zoom]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(prev => {
        const next = Math.min(3, Math.max(0.2, prev + delta));
        const scale = next / prev;
        setPan(p => ({
          x: mouseX - scale * (mouseX - p.x),
          y: mouseY - scale * (mouseY - p.y),
        }));
        return next;
      });
    } else {
      setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 && (e.ctrlKey || e.metaKey)) {
      setCtrlZooming(true);
      setCtrlZoomStartY(e.clientY);
      setCtrlZoomStartZoom(zoom);
      e.preventDefault();
      return;
    }
    if (e.button === 1 || (e.button === 0 && tool === "hand")) {
      setPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault();
    } else if (e.button === 0 && tool === "select") {
      setSelectedFrame(null);
    }
  }, [tool, pan, zoom]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (ctrlZooming) {
      const deltaY = ctrlZoomStartY - e.clientY;
      setZoom(Math.min(3, Math.max(0.2, ctrlZoomStartZoom + deltaY * 0.005)));
      return;
    }
    if (panning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
    if (dragging) {
      const pos = getWorldPos(e.clientX, e.clientY);
      setFrames(prev => prev.map(f => f.id === dragging
        ? { ...f, x: pos.x - dragOffset.x, y: pos.y - dragOffset.y }
        : f
      ));
    }
    if (draggingNode) {
      const pos = getWorldPos(e.clientX, e.clientY);
      const x = pos.x - dragOffset.x;
      const y = pos.y - dragOffset.y;
      setCastNodes(prev => prev.map(n => n.id === draggingNode ? { ...n, x, y } : n));
      setLocationNodes(prev => prev.map(n => n.id === draggingNode ? { ...n, x, y } : n));
    }
  }, [panning, panStart, dragging, draggingNode, dragOffset, getWorldPos, ctrlZooming, ctrlZoomStartY, ctrlZoomStartZoom, setFrames, setCastNodes, setLocationNodes]);

  const handleMouseUp = useCallback(() => {
    setCtrlZooming(false);
    setPanning(false);
    if (dragging) {
      // Snap-to-reorder
      const draggedIdx = frames.findIndex(f => f.id === dragging);
      const draggedFrame = frames[draggedIdx];
      if (draggedFrame) {
        const cx = draggedFrame.x + FRAME_W / 2;
        const cy = draggedFrame.y + FRAME_H_BASE / 2;
        let closestIdx = -1;
        let closestDist = Infinity;
        frames.forEach((f, i) => {
          if (i === draggedIdx) return;
          const dist = Math.hypot(cx - (f.x + FRAME_W / 2), cy - (f.y + FRAME_H_BASE / 2));
          if (dist < FRAME_W * 0.6 && dist < closestDist) {
            closestDist = dist;
            closestIdx = i;
          }
        });
        if (closestIdx >= 0) {
          setFrames(prev => {
            const arr = [...prev];
            const [removed] = arr.splice(draggedIdx, 1);
            arr.splice(closestIdx, 0, removed);
            return arr.map((f, i) => ({
              ...f,
              x: 80 + (i % GRID_COLS) * GAP_X,
              y: 80 + Math.floor(i / GRID_COLS) * GAP_Y,
            }));
          });
        }
      }
      setDragging(null);
    }
    setDraggingNode(null);
  }, [dragging, frames, setFrames]);

  const startFrameDrag = useCallback((e: React.MouseEvent, frame: FrameData) => {
    if (tool !== "select" || e.button !== 0) return;
    e.stopPropagation();
    const pos = getWorldPos(e.clientX, e.clientY);

    if (e.altKey) {
      const newId = `f${Date.now()}`;
      const clone: FrameData = { ...frame, id: newId, actors: [...frame.actors] };
      setFrames(prev => [...prev, clone]);
      setDragOffset({ x: pos.x - clone.x, y: pos.y - clone.y });
      setDragging(newId);
      setSelectedFrame(newId);
      return;
    }

    setDragOffset({ x: pos.x - frame.x, y: pos.y - frame.y });
    setDragging(frame.id);
    setSelectedFrame(frame.id);
  }, [tool, getWorldPos, setFrames]);

  const startNodeDrag = useCallback((e: React.MouseEvent, node: { id: string; x: number; y: number }) => {
    if (tool !== "select" || e.button !== 0) return;
    e.stopPropagation();
    const pos = getWorldPos(e.clientX, e.clientY);
    setDragOffset({ x: pos.x - node.x, y: pos.y - node.y });
    setDraggingNode(node.id);
    setSelectedFrame(node.id);
  }, [tool, getWorldPos]);

  const fitToScreen = useCallback((frameHeights?: Record<string, number>) => {
    if (!containerRef.current || frames.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const getH = (id: string) => frameHeights?.[id] ?? FRAME_H_BASE;
    const minX = Math.min(...frames.map(f => f.x));
    const minY = Math.min(...frames.map(f => f.y));
    const maxX = Math.max(...frames.map(f => f.x + FRAME_W));
    const maxY = Math.max(...frames.map(f => f.y + getH(f.id)));
    const contentW = maxX - minX + 100;
    const contentH = maxY - minY + 100;
    const newZoom = Math.min(rect.width / contentW, rect.height / contentH, 1.5);
    setZoom(newZoom);
    setPan({
      x: (rect.width - contentW * newZoom) / 2 - minX * newZoom + 50 * newZoom,
      y: (rect.height - contentH * newZoom) / 2 - minY * newZoom + 50 * newZoom,
    });
  }, [frames]);

  const autoLayout = useCallback(() => {
    setFrames(prev => prev.map((f, i) => ({
      ...f,
      x: 80 + (i % GRID_COLS) * GAP_X,
      y: 80 + Math.floor(i / GRID_COLS) * GAP_Y,
    })));
  }, [setFrames]);

  // Space bar for hand tool
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) { setTool("hand"); e.preventDefault(); }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") setTool("select");
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  return {
    containerRef,
    zoom, pan, tool, setTool,
    dragging, selectedFrame, setSelectedFrame,
    panning,
    getWorldPos,
    handleWheel, handleMouseDown, handleMouseMove, handleMouseUp,
    startFrameDrag, startNodeDrag,
    fitToScreen, autoLayout,
  };
}
