import React, { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ZoomIn, ZoomOut, Maximize, Plus, MousePointer, Hand, Grid3X3, X,
  Settings, Sparkles, Images, ChevronDown, ChevronUp, Check,
  ChevronLeft, ChevronRight, Expand,
} from "lucide-react";
import { FrameContextMenu } from "./FrameContextMenu";
import { FrameSettingsPanel } from "./FrameSettingsPanel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

import actorMarlowe from "@/assets/actors/marlowe.png";
import actorVivian from "@/assets/actors/vivian.png";
import actorEddie from "@/assets/actors/eddie.png";

const shotDescriptions: Record<string, string> = {
  "WIDE": "Wide Shot (WS) — Shows the full scene and environment, establishing location and context.",
  "MED": "Medium Shot (MS) — Frames the subject from the waist up, balancing character and environment.",
  "CU": "Close-Up (CU) — Tightly frames the subject's face or a detail, emphasizing emotion or importance.",
  "ECU": "Extreme Close-Up (ECU) — Focuses on a very small detail like eyes or an object.",
  "OTS": "Over-the-Shoulder (OTS) — Shot from behind one character looking at another, common in dialogue.",
  "POV": "Point of View (POV) — Shows the scene from a character's perspective.",
  "DYNAMIC": "Dynamic Shot — A moving camera shot (tracking, dolly, crane) adding energy and motion.",
  "LOW": "Low Angle — Camera looks up at the subject, conveying power or dominance.",
  "HIGH": "High Angle — Camera looks down at the subject, conveying vulnerability.",
  "AERIAL": "Aerial Shot — Captured from above, often via drone, showing a bird's-eye view.",
};

import frame1 from "@/assets/storyboard/frame-1.jpg";
import frame2 from "@/assets/storyboard/frame-2.jpg";
import frame3 from "@/assets/storyboard/frame-3.jpg";
import frame4 from "@/assets/storyboard/frame-4.jpg";
import frame5 from "@/assets/storyboard/frame-5.jpg";
import frame6 from "@/assets/storyboard/frame-6.jpg";

import { FrameData, GeneratedImage, Actor } from "./FrameSettingsPanel";

interface Connection {
  from: string;
  to: string;
}

const actorRoster: Actor[] = [
  { id: "a1", name: "Marlowe", avatar: actorMarlowe },
  { id: "a2", name: "Vivian", avatar: actorVivian },
  { id: "a3", name: "Eddie", avatar: actorEddie },
];

const initialFrames: FrameData[] = [
  {
    id: "f1", x: 80, y: 80, image: frame1, scene: "SC 1", shot: "WIDE",
    description: "Marlowe sits at his desk, smoke curling from a cigarette.", duration: "4s", actors: ["a1"],
    generatedImages: [
      { id: "g1a", src: frame1, description: "Marlowe at desk — wide establishing", actors: ["a1"] },
      { id: "g1b", src: frame4, description: "Marlowe at desk — close-up on face", actors: ["a1"] },
      { id: "g1c", src: frame5, description: "Marlowe and Vivian at desk — alternate", actors: ["a1", "a2"] },
      { id: "g1d", src: frame2, description: "Marlowe at desk — noir lighting", actors: ["a1"] },
      { id: "g1e", src: frame3, description: "Marlowe at desk — jazz club angle", actors: ["a1", "a3"] },
      { id: "g1f", src: frame6, description: "Marlowe at desk — dramatic low angle", actors: ["a1"] },
      { id: "g1g", src: frame5, description: "Marlowe at desk — silhouette", actors: ["a1"] },
      { id: "g1h", src: frame4, description: "Marlowe at desk — overhead shot", actors: ["a1"] },
      { id: "g1i", src: frame3, description: "Marlowe and Eddie at desk", actors: ["a1", "a3"] },
    ],
    selectedImageId: "g1a",
  },
  {
    id: "f2", x: 420, y: 80, image: frame2, scene: "SC 1", shot: "MED",
    description: "Vivian appears in the rain-soaked alley.", duration: "3s", actors: ["a2"],
    generatedImages: [
      { id: "g2a", src: frame2, description: "Vivian in alley — medium shot", actors: ["a2"] },
      { id: "g2b", src: frame3, description: "Vivian enters the jazz club", actors: ["a2", "a3"] },
    ],
    selectedImageId: "g2a",
  },
  {
    id: "f3", x: 760, y: 80, image: frame3, scene: "SC 2", shot: "WIDE",
    description: "The Blue Note Jazz Club — establishing shot.", duration: "5s", actors: ["a3"],
    generatedImages: [], selectedImageId: null,
  },
  {
    id: "f4", x: 80, y: 360, image: frame4, scene: "SC 2", shot: "CU",
    description: "Marlowe examines a photograph under his desk lamp.", duration: "3s", actors: ["a1"],
    generatedImages: [
      { id: "g4a", src: frame4, description: "Marlowe with photo — close-up", actors: ["a1"] },
      { id: "g4b", src: frame1, description: "Marlowe with photo — wide shot", actors: ["a1"] },
      { id: "g4c", src: frame6, description: "Marlowe hands photo to Eddie", actors: ["a1", "a3"] },
      { id: "g4d", src: frame2, description: "Vivian looks at the photo", actors: ["a2"] },
      { id: "g4e", src: frame3, description: "Photo on desk — overhead angle", actors: ["a1"] },
      { id: "g4f", src: frame5, description: "Marlowe studying photo — silhouette", actors: ["a1"] },
      { id: "g4g", src: frame1, description: "Marlowe burns the photo", actors: ["a1"] },
      { id: "g4h", src: frame6, description: "Eddie grabs the photo", actors: ["a3"] },
      { id: "g4i", src: frame2, description: "Vivian and Marlowe argue over photo", actors: ["a1", "a2"] },
      { id: "g4j", src: frame5, description: "Photo falls to the floor — low angle", actors: ["a1"] },
    ],
    selectedImageId: "g4a",
  },
  {
    id: "f5", x: 420, y: 360, image: frame5, scene: "SC 3", shot: "WIDE",
    description: "Two silhouettes meet on the foggy bridge.", duration: "6s", actors: ["a1", "a2"],
    generatedImages: [
      { id: "g5a", src: frame5, description: "Two silhouettes on bridge — wide", actors: ["a1", "a2"] },
      { id: "g5b", src: frame1, description: "Marlowe alone on bridge", actors: ["a1"] },
      { id: "g5c", src: frame2, description: "Vivian alone on bridge", actors: ["a2"] },
      { id: "g5d", src: frame3, description: "Eddie watches from below", actors: ["a3"] },
      { id: "g5e", src: frame6, description: "All three meet on bridge", actors: ["a1", "a2", "a3"] },
      { id: "g5f", src: frame4, description: "Bridge from above — aerial", actors: ["a1", "a2"] },
    ],
    selectedImageId: "g5a",
  },
  {
    id: "f6", x: 760, y: 360, image: frame6, scene: "SC 3", shot: "DYNAMIC",
    description: "Car chase through wet city streets.", duration: "4s", actors: ["a1"],
    generatedImages: [], selectedImageId: null,
  },
];

const FRAME_W = 280;
// Aspect ratio map: ratio string → height for the image area given FRAME_W
const ASPECT_RATIOS: Record<string, number> = {
  "16:9": Math.round(FRAME_W * 9 / 16),    // 158
  "2.39:1": Math.round(FRAME_W / 2.39),     // 117
  "1.85:1": Math.round(FRAME_W / 1.85),     // 151
  "4:3": Math.round(FRAME_W * 3 / 4),       // 210
  "9:16": Math.round(FRAME_W * 16 / 9),     // 498
  "1:1": FRAME_W,                            // 280
};
const CURRENT_ASPECT = "16:9"; // TODO: pull from project concept settings
const IMAGE_H = ASPECT_RATIOS[CURRENT_ASPECT] ?? 158;
const FRAME_H_BASE = IMAGE_H + 80; // image + info section
const PORT_Y = FRAME_H_BASE / 2;

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
  const frameRefs = useRef<Record<string, HTMLDivElement | null>>({});
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
  const [frameHeights, setFrameHeights] = useState<Record<string, number>>({});
  const [canvasMenu, setCanvasMenu] = useState<{ x: number; y: number; worldX: number; worldY: number } | null>(null);
  const [settingsFrame, setSettingsFrame] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ frameId: string; index: number } | null>(null);

  const getFrameHeight = useCallback((frameId: string) => {
    return frameHeights[frameId] ?? FRAME_H_BASE;
  }, [frameHeights]);

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
        const dragCenterY = draggedFrame.y + FRAME_H_BASE / 2;
        let closestIdx = -1;
        let closestDist = Infinity;
        frames.forEach((f, i) => {
          if (i === draggedIdx) return;
          const cx = f.x + FRAME_W / 2;
          const cy = f.y + FRAME_H_BASE / 2;
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

    // Option/Alt + drag = duplicate frame
    if (e.altKey) {
      const newId = `f${Date.now()}`;
      const clone: FrameData = { ...frame, id: newId, x: frame.x, y: frame.y, actors: [...frame.actors] };
      setFrames(prev => [...prev, clone]);
      setDragOffset({ x: mouseX - clone.x, y: mouseY - clone.y });
      setDragging(newId);
      setSelectedFrame(newId);
      return;
    }

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
    const maxY = Math.max(...frames.map(f => f.y + getFrameHeight(f.id)));
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
      actors: [],
      generatedImages: [],
      selectedImageId: null,
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
    const deletedId = frames[idx]?.id;
    setFrames(prev => prev.filter((_, i) => i !== idx));
    if (deletedId) {
      setConnections(prev => prev.filter(c => c.from !== deletedId && c.to !== deletedId));
    }
    setSelectedFrame(null);
  }, [frames]);

  // Fit on mount
  useEffect(() => {
    const t = setTimeout(fitToScreen, 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const observers: ResizeObserver[] = [];
    const nextHeights: Record<string, number> = {};

    frames.forEach(frame => {
      const el = frameRefs.current[frame.id];
      if (!el) return;
      nextHeights[frame.id] = el.offsetHeight;

      const ro = new ResizeObserver(entries => {
        const entry = entries[0];
        if (!entry) return;
        const h = entry.contentRect.height;
        setFrameHeights(prev => (prev[frame.id] === h ? prev : { ...prev, [frame.id]: h }));
      });
      ro.observe(el);
      observers.push(ro);
    });

    setFrameHeights(prev => ({ ...prev, ...nextHeights }));

    return () => {
      observers.forEach(o => o.disconnect());
    };
  }, [frames, connections]);

  // Space bar for hand tool
  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.code === "Space" && !e.repeat) { setTool("hand"); e.preventDefault(); }};
    const up = (e: KeyboardEvent) => { if (e.code === "Space") setTool("select"); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  const getPortPos = useCallback((frameId: string, side: "left" | "right") => {
    const f = frames.find(fr => fr.id === frameId);
    if (!f) return { x: 0, y: 0 };
    return {
      x: side === "right" ? f.x + FRAME_W : f.x,
      y: f.y + PORT_Y,
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
        onContextMenu={(e) => {
          e.preventDefault();
          // Only show canvas menu if right-clicking on empty canvas (not on a frame)
          const target = e.target as HTMLElement;
          if (target.closest('[data-frame]')) return;
          const rect = containerRef.current?.getBoundingClientRect();
          if (!rect) return;
          const worldX = (e.clientX - rect.left - pan.x) / zoom;
          const worldY = (e.clientY - rect.top - pan.y) / zoom;
          setCanvasMenu({ x: e.clientX - rect.left, y: e.clientY - rect.top, worldX, worldY });
        }}
        onWheel={handleWheel}
        onMouseDown={(e) => { setCanvasMenu(null); handleMouseDown(e); }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid pattern background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--foreground) / 0.15) 1px, transparent 1px)`,
            backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
            backgroundPosition: `${pan.x % (32 * zoom)}px ${pan.y % (32 * zoom)}px`,
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
              const curvature = Math.min(140, Math.max(18, dx * 0.35));
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
              const curvature = Math.min(140, Math.max(18, dx * 0.35));
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
                data-frame
                ref={(el) => { frameRefs.current[frame.id] = el; }}
                className={cn(
                  "absolute rounded-xl border-2 bg-card transition-shadow duration-150 select-none group",
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
                {/* Left port (input) */}
                <div
                  className="absolute -left-[9px] -translate-y-1/2 z-20 w-[18px] h-[18px] rounded-full border-[2.5px] border-primary/60 bg-card hover:bg-primary hover:border-primary hover:scale-110 transition-all cursor-crosshair shadow-md"
                  style={{ top: PORT_Y }}
                  onMouseUp={(e) => { e.stopPropagation(); endConnect(frame.id); }}
                  onMouseDown={(e) => e.stopPropagation()}
                />
                {/* Right port (output) */}
                <div
                  className="absolute -right-[9px] -translate-y-1/2 z-20 w-[18px] h-[18px] rounded-full border-[2.5px] border-primary/60 bg-card hover:bg-primary hover:border-primary hover:scale-110 transition-all cursor-crosshair shadow-md"
                  style={{ top: PORT_Y }}
                  onMouseDown={(e) => { e.stopPropagation(); startConnect(e, frame.id); }}
                />

                {/* Frame number badge */}
                <div className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  {idx + 1}
                </div>
                {/* Top-right badges */}
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                  {/* Settings button */}
                  <button
                    className="bg-background/70 backdrop-blur-sm text-foreground/70 hover:text-foreground hover:bg-background/90 w-5 h-5 flex items-center justify-center rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); setSettingsFrame(frame.id); }}
                  >
                    <Settings className="w-3 h-3" />
                  </button>

                  {/* Shot type badge */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className="bg-primary/90 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md hover:bg-primary transition-colors"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {frame.shot}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-3 text-xs" side="top" onMouseDown={(e) => e.stopPropagation()}>
                      <p className="font-bold text-sm mb-1">{frame.shot}</p>
                      <p className="text-muted-foreground">{shotDescriptions[frame.shot] ?? "A camera shot type used in filmmaking."}</p>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="w-full bg-secondary overflow-hidden rounded-t-[10px] relative" style={{ height: IMAGE_H }}>
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
                  {/* Image count overlay */}
                  {frame.generatedImages.length > 0 && (
                    <button
                      className="absolute bottom-1.5 left-1.5 z-10 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 hover:bg-background/95 transition-colors"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setGalleryOpen(galleryOpen === frame.id ? null : frame.id);
                      }}
                    >
                      <Images className="w-3 h-3" />
                      {frame.generatedImages.length}
                      {galleryOpen === frame.id ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                    </button>
                  )}
                </div>

                {/* Expandable gallery strip */}
                {galleryOpen === frame.id && frame.generatedImages.length > 0 && (
                  <div
                    className="bg-secondary/90 relative flex items-stretch"
                    onMouseDown={(e) => e.stopPropagation()}
                    onWheel={(e) => e.stopPropagation()}
                    style={{ maxWidth: FRAME_W }}
                  >
                    {/* Fixed gallery button */}
                    <button
                      className="flex-shrink-0 w-9 flex items-center justify-center bg-card/80 hover:bg-card border-r border-border text-muted-foreground hover:text-foreground transition-colors z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        const activeIdx = frame.generatedImages.findIndex(img => img.id === frame.selectedImageId);
                        setLightbox({ frameId: frame.id, index: activeIdx >= 0 ? activeIdx : 0 });
                      }}
                      title="Open gallery"
                    >
                      <Expand className="w-3.5 h-3.5" />
                    </button>

                    {/* Scrollable thumbnails */}
                    <div
                      className="flex-1 flex items-center gap-1 px-1.5 py-1.5 overflow-x-auto"
                      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                      {frame.generatedImages.map(img => {
                        const isActive = frame.selectedImageId === img.id;
                        return (
                          <button
                            key={img.id}
                            className={`relative rounded overflow-hidden border-2 transition-all flex-shrink-0 w-14 h-10 ${
                              isActive ? "border-primary" : "border-transparent hover:border-muted-foreground/40"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFrames(prev => prev.map(f =>
                                f.id === frame.id
                                  ? { ...f, image: img.src, description: img.description, actors: img.actors, selectedImageId: img.id }
                                  : f
                              ));
                            }}
                          >
                            <img src={img.src} alt={img.description} className="w-full h-full object-cover" draggable={false} />
                            {isActive && (
                              <div className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-1.5 h-1.5 text-primary-foreground" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="bg-card p-2.5 space-y-1.5 rounded-b-[10px] flex-1 overflow-hidden" onMouseDown={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-primary">{frame.scene}</span>
                    <span className="text-[10px] text-muted-foreground">{frame.duration}</span>
                  </div>

                  {/* Actors (read-only) */}
                  {frame.actors.length > 0 && (
                    <div className="flex items-center gap-1">
                      <TooltipProvider delayDuration={200}>
                        {frame.actors.map(actorId => {
                          const actor = actorRoster.find(a => a.id === actorId);
                          if (!actor) return null;
                          return (
                            <Tooltip key={actor.id}>
                              <TooltipTrigger asChild>
                                <div className="w-6 h-6 rounded-full overflow-hidden border-[1.5px] border-border">
                                  <img src={actor.avatar} alt={actor.name} className="w-full h-full object-cover" draggable={false} />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="text-xs">{actor.name}</TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </TooltipProvider>
                    </div>
                  )}

                  <p className="text-[11px] text-foreground/80 leading-tight line-clamp-2">
                    {frame.description}
                  </p>

                  {/* Incoming connection thumbnails */}
                  {(() => {
                    const incoming = connections.filter(c => c.to === frame.id);
                    if (incoming.length === 0) return null;
                    return (
                      <div className="flex gap-1.5 pt-1">
                        {incoming.map(conn => {
                          const srcFrame = frames.find(f => f.id === conn.from);
                          if (!srcFrame || !srcFrame.image) return null;
                          return (
                            <div key={conn.from} className="relative group/thumb w-10 h-7 rounded overflow-hidden border border-border/50 flex-shrink-0">
                              <img src={srcFrame.image} alt={srcFrame.scene} className="w-full h-full object-cover" draggable={false} />
                              <button
                                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConnections(prev => prev.filter(c => !(c.from === conn.from && c.to === conn.to)));
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                <X className="w-3 h-3 text-destructive" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </FrameContextMenu>
          ))}
        </div>

        {/* Canvas context menu */}
        {canvasMenu && (
          <div
            className="absolute z-50 min-w-[180px] bg-popover border border-border rounded-lg shadow-xl py-1 text-sm"
            style={{ left: canvasMenu.x, top: canvasMenu.y }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-secondary/60 transition-colors text-foreground"
              onClick={() => {
                const newId = `f${Date.now()}`;
                setFrames(prev => [...prev, {
                  id: newId, x: canvasMenu.worldX, y: canvasMenu.worldY,
                  image: "", scene: `SC ${Math.ceil((frames.length + 1) / 2)}`, shot: "WIDE",
                  description: "New frame — click to edit", duration: "3s", actors: [],
                  generatedImages: [], selectedImageId: null,
                }]);
                setSelectedFrame(newId);
                setCanvasMenu(null);
              }}
            >
              <Plus className="w-4 h-4" /> Add New Frame
            </button>
            <div className="h-px bg-border my-1" />
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-secondary/60 transition-colors text-foreground"
              onClick={() => { autoLayout(); setCanvasMenu(null); }}
            >
              <Grid3X3 className="w-4 h-4" /> Auto Layout
            </button>
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-secondary/60 transition-colors text-foreground"
              onClick={() => { fitToScreen(); setCanvasMenu(null); }}
            >
              <Maximize className="w-4 h-4" /> Fit to Screen
            </button>
            <div className="h-px bg-border my-1" />
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-secondary/60 transition-colors text-foreground"
              onClick={() => {
                setFrames(prev => prev.map(f => ({ ...f })));
                setSelectedFrame(null);
                setCanvasMenu(null);
              }}
            >
              <MousePointer className="w-4 h-4" /> Select All
            </button>
          </div>
        )}

        {/* Minimap */}
        <div className="absolute bottom-4 right-4 w-[160px] h-[100px] bg-card/90 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 1200 700">
            {frames.map(f => (
              <rect
                key={f.id}
                x={f.x}
                y={f.y}
                width={FRAME_W}
                height={FRAME_H_BASE}
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

      {/* Frame Settings Panel */}
      {settingsFrame && (() => {
        const frame = frames.find(f => f.id === settingsFrame);
        if (!frame) return null;
        return (
          <FrameSettingsPanel
            frame={frame}
            actorRoster={actorRoster}
            onUpdate={(updated) => {
              setFrames(prev => prev.map(f => f.id === updated.id ? updated : f));
            }}
            onClose={() => setSettingsFrame(null)}
          />
        );
      })()}

      {/* Lightbox Gallery */}
      {lightbox && (() => {
        const frame = frames.find(f => f.id === lightbox.frameId);
        if (!frame || frame.generatedImages.length === 0) return null;
        const images = frame.generatedImages;
        const current = images[lightbox.index];
        const currentIdx = lightbox.index;
        return (
          <div className="fixed inset-0 z-[100] bg-black/90 flex" onClick={() => setLightbox(null)}>
            <div className="flex-1 flex items-center justify-center relative" onClick={(e) => e.stopPropagation()}>
              <button className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-background/20 hover:bg-background/40 text-foreground flex items-center justify-center transition-colors" onClick={() => setLightbox(null)}>
                <X className="w-5 h-5" />
              </button>
              <div className="absolute top-4 left-4 bg-background/20 text-foreground text-sm font-bold px-3 py-1 rounded-lg">
                {currentIdx + 1} / {images.length}
              </div>
              {currentIdx > 0 && (
                <button className="absolute left-4 w-10 h-10 rounded-full bg-background/20 hover:bg-background/40 text-foreground flex items-center justify-center transition-colors" onClick={() => setLightbox({ ...lightbox, index: currentIdx - 1 })}>
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <img src={current.src} alt={current.description} className="max-w-[80%] max-h-[85vh] object-contain rounded-lg" />
              {currentIdx < images.length - 1 && (
                <button className="absolute right-4 w-10 h-10 rounded-full bg-background/20 hover:bg-background/40 text-foreground flex items-center justify-center transition-colors" onClick={() => setLightbox({ ...lightbox, index: currentIdx + 1 })}>
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/30 backdrop-blur-sm text-foreground text-xs px-4 py-2 rounded-lg max-w-md text-center">
                {current.description}
              </div>
            </div>
            <div className="w-[180px] bg-card/50 backdrop-blur-sm border-l border-border overflow-y-auto p-2 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
              {images.map((img, idx) => {
                const isActive = idx === currentIdx;
                const isSelected = frame.selectedImageId === img.id;
                return (
                  <button key={img.id} className={`relative rounded-lg overflow-hidden border-2 transition-all ${isActive ? "border-primary" : "border-transparent hover:border-muted-foreground/40"}`} onClick={() => setLightbox({ ...lightbox, index: idx })}>
                    <img src={img.src} alt={img.description} className="w-full aspect-video object-contain bg-secondary" />
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

    </div>
  );
}
