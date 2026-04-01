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
const CONNECTOR_PAIRS = [[0,1],[1,2],[2,3],[3,4],[4,5]];

type Tool = "select" | "hand";

export function StoryboardCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [frames, setFrames] = useState<FrameData[]>(initialFrames);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<Tool>("select");
  const [dragging, setDragging] = useState<string | null>(null);
  const [panning, setPanning] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);

  // Zoom with scroll wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(z => Math.min(3, Math.max(0.2, z + delta)));
    } else {
      setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  }, []);

  // Mouse down — start drag or pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && tool === "hand")) {
      setPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault();
    } else if (e.button === 0 && tool === "select") {
      setSelectedFrame(null);
    }
  }, [tool, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
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
  }, [panning, panStart, dragging, dragOffset, pan, zoom]);

  const handleMouseUp = useCallback(() => {
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
          // Swap positions in array order, then auto-layout
          setFrames(prev => {
            const arr = [...prev];
            const [removed] = arr.splice(draggedIdx, 1);
            arr.splice(closestIdx, 0, removed);
            // Re-layout after reorder
            const cols = 3;
            const gapX = 340;
            const gapY = 280;
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

  // Connector lines between frames
  const connectors = CONNECTOR_PAIRS.map(([a, b]) => {
    if (!frames[a] || !frames[b]) return null;
    const fa = frames[a], fb = frames[b];
    const x1 = fa.x + FRAME_W;
    const y1 = fa.y + FRAME_H / 2;
    const x2 = fb.x;
    const y2 = fb.y + FRAME_H / 2;
    return { x1, y1, x2, y2, id: `${a}-${b}` };
  }).filter(Boolean);

  return (
    <div className="h-full w-full flex flex-col bg-background overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-card/80 backdrop-blur-sm z-10 pt-14">
        <div className="flex items-center gap-1 rounded-lg bg-secondary/60 p-0.5">
          <button
            onClick={() => setTool("select")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              tool === "select" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            title="Select (V)"
          >
            <MousePointer className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool("hand")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              tool === "hand" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            title="Pan (Space)"
          >
            <Hand className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-5 bg-border mx-2" />

        <div className="flex items-center gap-1">
          <button onClick={() => setZoom(z => Math.max(0.2, z - 0.15))} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-muted-foreground w-12 text-center font-mono">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(3, z + 0.15))} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-5 bg-border mx-2" />

        <button onClick={fitToScreen} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors" title="Fit to screen">
          <Maximize className="w-4 h-4" />
        </button>
        <button onClick={autoLayout} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors" title="Auto layout">
          <Grid3X3 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-border mx-2" />

        <button onClick={addFrame} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Add Frame
        </button>

        <div className="ml-auto text-xs text-muted-foreground">
          {frames.length} frames
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className={cn(
          "flex-1 relative overflow-hidden",
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
          <svg className="absolute inset-0 w-[4000px] h-[4000px] pointer-events-none">
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="hsl(var(--muted-foreground))" opacity="0.4" />
              </marker>
            </defs>
            {connectors.map(c => c && (
              <g key={c.id}>
                <path
                  d={`M ${c.x1} ${c.y1} C ${c.x1 + 40} ${c.y1}, ${c.x2 - 40} ${c.y2}, ${c.x2} ${c.y2}`}
                  stroke="hsl(var(--muted-foreground))"
                  strokeOpacity="0.25"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                />
              </g>
            ))}
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
                  "absolute rounded-xl overflow-hidden border-2 transition-shadow duration-150 select-none group",
                  selectedFrame === frame.id
                    ? "border-primary shadow-lg shadow-primary/20"
                    : "border-border hover:border-muted-foreground/40",
                  dragging === frame.id && "opacity-90",
                )}
                style={{
                  left: frame.x,
                  top: frame.y,
                  width: FRAME_W,
                }}
                onMouseDown={(e) => startFrameDrag(e, frame)}
              >
                {/* Frame number badge */}
                <div className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  {idx + 1}
                </div>
                {/* Shot type badge */}
                <div className="absolute top-2 right-2 z-10 bg-primary/90 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  {frame.shot}
                </div>

                {/* Image */}
                <div className="w-full h-[150px] bg-secondary overflow-hidden">
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
                <div className="bg-card p-2.5 space-y-1">
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
