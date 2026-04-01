import React, { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ZoomIn, ZoomOut, Maximize, Plus, MousePointer, Hand, Grid3X3,
} from "lucide-react";
import { FrameContextMenu } from "./FrameContextMenu";

import frame1 from "@/assets/storyboard/frame-1.jpg";
import frame2 from "@/assets/storyboard/frame-2.jpg";
import frame3 from "@/assets/storyboard/frame-3.jpg";
import frame4 from "@/assets/storyboard/frame-4.jpg";
import frame5 from "@/assets/storyboard/frame-5.jpg";
import frame6 from "@/assets/storyboard/frame-6.jpg";

interface FrameData {
  id: string;
  x: number;
  y: number;
  image: string;
  scene: string;
  shot: string;
  description: string;
  duration: string;
}

interface Connection {
  from: string; // frame id
  to: string;   // frame id
}

const initialFrames: FrameData[] = [
  { id: "f1", x: 80, y: 80, image: frame1, scene: "SC 1", shot: "WIDE", description: "Marlowe sits at his desk, smoke curling from a cigarette.", duration: "4s" },
  { id: "f2", x: 420, y: 80, image: frame2, scene: "SC 1", shot: "MED", description: "Vivian appears in the rain-soaked alley.", duration: "3s" },
  { id: "f3", x: 760, y: 80, image: frame3, scene: "SC 2", shot: "WIDE", description: "The Blue Note Jazz Club — establishing shot.", duration: "5s" },
  { id: "f4", x: 80, y: 360, image: frame4, scene: "SC 2", shot: "CU", description: "Marlowe examines a photograph under his desk lamp.", duration: "3s" },
  { id: "f5", x: 420, y: 360, image: frame5, scene: "SC 3", shot: "WIDE", description: "Two silhouettes meet on the foggy bridge.", duration: "6s" },
  { id: "f6", x: 760, y: 360, image: frame6, scene: "SC 3", shot: "DYNAMIC", description: "Car chase through wet city streets.", duration: "4s" },
];

const FRAME_W = 280;
const FRAME_H = 230;
const PORT_RADIUS = 6;

const initialConnections: Connection[] = [
  { from: "f1", to: "f2" },
  { from: "f2", to: "f3" },
  { from: "f3", to: "f4" },
  { from: "f4", to: "f5" },
  { from: "f5", to: "f6" },
];

type Tool = "select" | "hand";

export function StoryboardCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [frames, setFrames] = useState<FrameData[]>(initialFrames);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<Tool>("select");
  const [dragging, setDragging] = useState<string | null>(null);
  const [panning, setPanning] = useState(false);
  const [ctrlZooming, setCtrlZooming] = useState(false);
  const [ctrlZoomStartY, setCtrlZoomStartY] = useState(0);
  const [ctrlZoomStartZoom, setCtrlZoomStartZoom] = useState(1);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [connectingMouse, setConnectingMouse] = useState({ x: 0, y: 0 });

  // Zoom with scroll wheel — zoom towards mouse position
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(prevZoom => {
        const newZoom = Math.min(3, Math.max(0.2, prevZoom + delta));
        const scale = newZoom / prevZoom;
        setPan(p => ({
          x: mouseX - scale * (mouseX - p.x),
          y: mouseY - scale * (mouseY - p.y),
        }));
        return newZoom;
      });
    } else {
      setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  }, []);

  // Mouse down — start drag, pan, or ctrl+drag zoom
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 && (e.ctrlKey || e.metaKey)) {
      // Ctrl+drag to zoom
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
      const newZoom = Math.min(3, Math.max(0.2, ctrlZoomStartZoom + deltaY * 0.005));
      setZoom(newZoom);
      return;
    }
    if (connectingFrom) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setConnectingMouse({
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom,
      });
    }
    if (panning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
    if (dragging) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left - pan.x) / zoom - dragOffset.x;
      const y = (e.clientY - rect.top - pan.y) / zoom - dragOffset.y;
      setFrames(prev => prev.map(f => f.id === dragging ? { ...f, x, y } : f));
    }
  }, [panning, panStart, dragging, dragOffset, pan, zoom, ctrlZooming, ctrlZoomStartY, ctrlZoomStartZoom, connectingFrom]);

  const handleMouseUp = useCallback(() => {
    setCtrlZooming(false);
    setPanning(false);
    if (dragging) {
      // Snap-to-reorder: find if dragged frame overlaps another frame's position
      const draggedIdx = frames.findIndex(f => f.id === dragging);
      const draggedFrame = frames[draggedIdx];
      if (draggedFrame) {
        const dragCenterX = draggedFrame.x + FRAME_W / 2;
        const dragCenterY = draggedFrame.y + FRAME_H / 2;
        let closestIdx = -1;
        let closestDist = Infinity;
        frames.forEach((f, i) => {
          if (i === draggedIdx) return;
          const cx = f.x + FRAME_W / 2;
          const cy = f.y + FRAME_H / 2;
          const dist = Math.hypot(dragCenterX - cx, dragCenterY - cy);
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
            const cols = 3, gapX = 340, gapY = 280;
            return arr.map((f, i) => ({
              ...f,
              x: 80 + (i % cols) * gapX,
              y: 80 + Math.floor(i / cols) * gapY,
            }));
          });
        }
      }
      setDragging(null);
    }
    setConnectingFrom(null);
  }, [dragging, frames]);

  const startFrameDrag = useCallback((e: React.MouseEvent, frame: FrameData) => {
    if (tool !== "select") return;
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;
    setDragOffset({ x: mouseX - frame.x, y: mouseY - frame.y });
    setDragging(frame.id);
    setSelectedFrame(frame.id);
  }, [tool, pan, zoom]);

  const fitToScreen = useCallback(() => {
    if (!containerRef.current || frames.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const minX = Math.min(...frames.map(f => f.x));
    const minY = Math.min(...frames.map(f => f.y));
    const maxX = Math.max(...frames.map(f => f.x + FRAME_W));
    const maxY = Math.max(...frames.map(f => f.y + FRAME_H));
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
    const cols = 3;
    const gapX = 340;
    const gapY = 280;
    setFrames(prev => prev.map((f, i) => ({
      ...f,
      x: 80 + (i % cols) * gapX,
      y: 80 + Math.floor(i / cols) * gapY,
    })));
  }, []);

  const addFrame = useCallback(() => {
    const newId = `f${Date.now()}`;
    const lastFrame = frames[frames.length - 1];
    setFrames(prev => [...prev, {
      id: newId,
      x: lastFrame ? lastFrame.x + 340 : 80,
      y: lastFrame ? lastFrame.y : 80,
      image: "",
      scene: `SC ${Math.ceil((frames.length + 1) / 2)}`,
      shot: "WIDE",
      description: "New frame — click to edit",
      duration: "3s",
    }]);
    setSelectedFrame(newId);
  }, [frames]);

  const moveFrame = useCallback((fromIdx: number, toIdx: number) => {
    setFrames(prev => {
      const arr = [...prev];
      const [removed] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, removed);
      const cols = 3, gapX = 340, gapY = 280;
      return arr.map((f, i) => ({ ...f, x: 80 + (i % cols) * gapX, y: 80 + Math.floor(i / cols) * gapY }));
    });
  }, []);

  const duplicateFrame = useCallback((idx: number) => {
    setFrames(prev => {
      const dup = { ...prev[idx], id: `f${Date.now()}` };
      const arr = [...prev];
      arr.splice(idx + 1, 0, dup);
      const cols = 3, gapX = 340, gapY = 280;
      return arr.map((f, i) => ({ ...f, x: 80 + (i % cols) * gapX, y: 80 + Math.floor(i / cols) * gapY }));
    });
  }, []);

  const deleteFrame = useCallback((idx: number) => {
    setFrames(prev => {
      const arr = prev.filter((_, i) => i !== idx);
      const cols = 3, gapX = 340, gapY = 280;
      return arr.map((f, i) => ({ ...f, x: 80 + (i % cols) * gapX, y: 80 + Math.floor(i / cols) * gapY }));
    });
    setSelectedFrame(null);
  }, []);

  // Fit on mount
  useEffect(() => {
    const t = setTimeout(fitToScreen, 100);
    return () => clearTimeout(t);
  }, []);

  // Space bar for hand tool
  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.code === "Space" && !e.repeat) { setTool("hand"); e.preventDefault(); }};
    const up = (e: KeyboardEvent) => { if (e.code === "Space") setTool("select"); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  // Helper to get port center positions (matching the CSS -left-[7px] / -right-[7px] + w-3.5 = 14px, center at 7px out)
  const getPortPos = useCallback((frameId: string, side: "left" | "right") => {
    const f = frames.find(fr => fr.id === frameId);
    if (!f) return { x: 0, y: 0 };
    return {
      x: side === "right" ? f.x + FRAME_W : f.x,
      y: f.y + FRAME_H / 2,
    };
  }, [frames]);

  // Connector lines from connections state
  const connectors = connections.map(c => {
    const p1 = getPortPos(c.from, "right");
    const p2 = getPortPos(c.to, "left");
    return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, id: `${c.from}-${c.to}`, from: c.from, to: c.to };
  });

  // Start connecting from a port
  const startConnect = useCallback((e: React.MouseEvent, frameId: string) => {
    e.stopPropagation();
    setConnectingFrom(frameId);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setConnectingMouse({
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
    });
  }, [pan, zoom]);

  const endConnect = useCallback((frameId: string) => {
    if (connectingFrom && connectingFrom !== frameId) {
      // Don't duplicate
      const exists = connections.some(c => c.from === connectingFrom && c.to === frameId);
      if (!exists) {
        setConnections(prev => [...prev, { from: connectingFrom, to: frameId }]);
      }
    }
    setConnectingFrom(null);
  }, [connectingFrom, connections]);

  // Delete a connection
  const deleteConnection = useCallback((from: string, to: string) => {
    setConnections(prev => prev.filter(c => !(c.from === from && c.to === to)));
  }, []);

  return (
    <div className="h-full w-full relative bg-background overflow-hidden">
      {/* Floating vertical toolbar */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 z-20 flex flex-col items-center gap-1 p-1.5 rounded-2xl bg-card/90 backdrop-blur-md border border-border shadow-2xl">
        <button onClick={addFrame} className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors" title="Add Frame">
          <Plus className="w-4 h-4" />
        </button>

        <div className="w-6 h-px bg-border my-0.5" />

        <button
          onClick={() => setTool("select")}
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
            tool === "select" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          )}
          title="Select (V)"
        >
          <MousePointer className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTool("hand")}
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
            tool === "hand" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          )}
          title="Pan (Space)"
        >
          <Hand className="w-4 h-4" />
        </button>

        <div className="w-6 h-px bg-border my-0.5" />

        <button onClick={autoLayout} className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors" title="Auto layout">
          <Grid3X3 className="w-4 h-4" />
        </button>
        <button onClick={fitToScreen} className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors" title="Fit to screen">
          <Maximize className="w-4 h-4" />
        </button>

      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className={cn(
          "absolute inset-0",
          tool === "hand" || panning ? "cursor-grab" : "cursor-default",
          panning && "cursor-grabbing",
        )}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
            backgroundPosition: `${pan.x % (24 * zoom)}px ${pan.y % (24 * zoom)}px`,
          }}
        />

        {/* Transform layer */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {/* Connectors SVG */}
          <svg className="absolute inset-0 w-[4000px] h-[4000px]" style={{ pointerEvents: "none" }}>
            {connectors.map(c => {
              const dx = Math.abs(c.x2 - c.x1);
              const dy = Math.abs(c.y2 - c.y1);
              const curvature = Math.max(60, Math.min(dx * 0.4, 200));
              return (
                <g key={c.id} style={{ pointerEvents: "auto", cursor: "pointer" }} onClick={() => deleteConnection(c.from, c.to)}>
                  <path
                    d={`M ${c.x1} ${c.y1} C ${c.x1 + curvature} ${c.y1}, ${c.x2 - curvature} ${c.y2}, ${c.x2} ${c.y2}`}
                    stroke="transparent"
                    strokeWidth="16"
                    fill="none"
                  />
                  <path
                    d={`M ${c.x1} ${c.y1} C ${c.x1 + curvature} ${c.y1}, ${c.x2 - curvature} ${c.y2}, ${c.x2} ${c.y2}`}
                    stroke="hsl(var(--primary))"
                    strokeOpacity="0.45"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>
              );
            })}
            {/* Active connecting wire */}
            {connectingFrom && (() => {
              const p = getPortPos(connectingFrom, "right");
              const dx = Math.abs(connectingMouse.x - p.x);
              const curvature = Math.max(60, Math.min(dx * 0.4, 200));
              return (
                <path
                  d={`M ${p.x} ${p.y} C ${p.x + curvature} ${p.y}, ${connectingMouse.x - curvature} ${connectingMouse.y}, ${connectingMouse.x} ${connectingMouse.y}`}
                  stroke="hsl(var(--primary))"
                  strokeOpacity="0.7"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="8 6"
                  fill="none"
                />
              );
            })()}
          </svg>

          {/* Frames */}
          {frames.map((frame, idx) => (
            <FrameContextMenu
              key={frame.id}
              frameIndex={idx}
              totalFrames={frames.length}
              onMoveLeft={() => moveFrame(idx, idx - 1)}
              onMoveRight={() => moveFrame(idx, idx + 1)}
              onMoveToStart={() => moveFrame(idx, 0)}
              onMoveToEnd={() => moveFrame(idx, frames.length - 1)}
              onDuplicate={() => duplicateFrame(idx)}
              onDelete={() => deleteFrame(idx)}
            >
              <div
                className={cn(
                  "absolute rounded-xl border-2 transition-shadow duration-150 select-none group",
                  selectedFrame === frame.id
                    ? "border-primary shadow-lg shadow-primary/20"
                    : "border-border hover:border-muted-foreground/40",
                  dragging === frame.id && "opacity-90",
                )}
                style={{
                  left: frame.x,
                  top: frame.y,
                  width: FRAME_W,
                  height: FRAME_H,
                }}
                onMouseDown={(e) => startFrameDrag(e, frame)}
              >
                {/* Left port (input) */}
                <div
                  className="absolute -left-[9px] top-1/2 -translate-y-1/2 z-20 w-[18px] h-[18px] rounded-full border-[2.5px] border-primary/60 bg-card hover:bg-primary hover:border-primary hover:scale-110 transition-all cursor-crosshair shadow-md"
                  onMouseUp={(e) => { e.stopPropagation(); endConnect(frame.id); }}
                  onMouseDown={(e) => e.stopPropagation()}
                />
                {/* Right port (output) */}
                <div
                  className="absolute -right-[9px] top-1/2 -translate-y-1/2 z-20 w-[18px] h-[18px] rounded-full border-[2.5px] border-primary/60 bg-card hover:bg-primary hover:border-primary hover:scale-110 transition-all cursor-crosshair shadow-md"
                  onMouseDown={(e) => { e.stopPropagation(); startConnect(e, frame.id); }}
                />

                {/* Frame number badge */}
                <div className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  {idx + 1}
                </div>
                {/* Shot type badge */}
                <div className="absolute top-2 right-2 z-10 bg-primary/90 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  {frame.shot}
                </div>

                {/* Image */}
                <div className="w-full h-[150px] bg-secondary overflow-hidden rounded-t-[10px]">
                  {frame.image ? (
                    <img
                      src={frame.image}
                      alt={frame.description}
                      className="w-full h-full object-cover"
                      draggable={false}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                      <Plus className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="bg-card p-2.5 space-y-1 rounded-b-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-primary">{frame.scene}</span>
                    <span className="text-[10px] text-muted-foreground">{frame.duration}</span>
                  </div>
                  <p className="text-[11px] text-foreground/80 leading-tight line-clamp-2">
                    {frame.description}
                  </p>
                </div>
              </div>
            </FrameContextMenu>
          ))}
        </div>

        {/* Minimap */}
        <div className="absolute bottom-4 right-4 w-[160px] h-[100px] bg-card/90 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 1200 700">
            {frames.map(f => (
              <rect
                key={f.id}
                x={f.x}
                y={f.y}
                width={FRAME_W}
                height={FRAME_H}
                rx={6}
                fill={selectedFrame === f.id ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                fillOpacity={selectedFrame === f.id ? 0.6 : 0.2}
                stroke="hsl(var(--muted-foreground))"
                strokeOpacity={0.3}
                strokeWidth={2}
              />
            ))}
            {/* Viewport indicator */}
            {containerRef.current && (
              <rect
                x={-pan.x / zoom}
                y={-pan.y / zoom}
                width={containerRef.current.clientWidth / zoom}
                height={containerRef.current.clientHeight / zoom}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                rx={4}
                strokeOpacity={0.5}
              />
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
