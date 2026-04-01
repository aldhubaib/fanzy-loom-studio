import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Plus, MousePointer, Hand, Grid3X3, Maximize, X, Settings, MapPin, Users,
  ArrowLeft, Film, Camera, Clock, Sparkles, ChevronDown, Check, User, Trash2,
  ZoomIn, ZoomOut, Images, ChevronLeft, ChevronRight, Expand,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";

// Shot frame images
import frame1 from "@/assets/storyboard/frame-1.jpg";
import frame2 from "@/assets/storyboard/frame-2.jpg";
import frame3 from "@/assets/storyboard/frame-3.jpg";
import frame4 from "@/assets/storyboard/frame-4.jpg";
import frame5 from "@/assets/storyboard/frame-5.jpg";
import frame6 from "@/assets/storyboard/frame-6.jpg";

// Actor images
import actorMarlowe from "@/assets/actors/marlowe.png";
import actorVivian from "@/assets/actors/vivian.png";
import actorEddie from "@/assets/actors/eddie.png";

// Location images
import locOffice from "@/assets/locations/office.jpg";
import locStreet from "@/assets/locations/street.jpg";
import locJazzClub from "@/assets/locations/jazz-club.jpg";
import locBridge from "@/assets/locations/bridge.jpg";

// Shot type images
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

// Location detail images
import locDetailOffice from "@/assets/locations/interior-office.jpg";
import locDetailStreet from "@/assets/locations/exterior-street.jpg";
import locDetailClub from "@/assets/locations/interior-club.jpg";
import locDetailBridge from "@/assets/locations/exterior-bridge.jpg";
import locDetailPenthouse from "@/assets/locations/interior-penthouse.jpg";
import locDetailWarehouse from "@/assets/locations/interior-warehouse.jpg";
import locDetailRestaurant from "@/assets/locations/interior-restaurant.jpg";
import locDetailCar from "@/assets/locations/interior-car.jpg";

// ─── Types ──────────────────────────────────────────────────
interface Actor {
  id: string;
  name: string;
  avatar: string;
  role: string;
  description: string;
}

interface FrameData {
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
}

interface CastNode {
  id: string;
  actorId: string;
  x: number;
  y: number;
}

interface LocationNode {
  id: string;
  locationName: string;
  x: number;
  y: number;
}

interface Connection {
  from: string;
  to: string;
}

type SelectedItem =
  | { type: "frame"; id: string }
  | { type: "cast"; id: string }
  | { type: "location"; id: string }
  | null;

type Tool = "select" | "hand";

// ─── Constants ──────────────────────────────────────────────
const FRAME_W = 260;
const IMAGE_H = 146; // 16:9
const FRAME_H = IMAGE_H + 70;
const PORT_Y = FRAME_H / 2;
const CAST_W = 160;
const CAST_H = 220;
const LOC_W = 180;
const LOC_H = 140;
const DRAWER_W = 360;

const locationImages: Record<string, string> = {
  "Office": locOffice,
  "Street": locStreet,
  "Jazz Club": locJazzClub,
  "Bridge": locBridge,
};

const locationDetailOptions = [
  { value: "Office", label: "Office", img: locDetailOffice },
  { value: "Street", label: "Street", img: locDetailStreet },
  { value: "Jazz Club", label: "Jazz Club", img: locDetailClub },
  { value: "Bridge", label: "Bridge", img: locDetailBridge },
  { value: "Penthouse", label: "Penthouse", img: locDetailPenthouse },
  { value: "Warehouse", label: "Warehouse", img: locDetailWarehouse },
  { value: "Restaurant", label: "Restaurant", img: locDetailRestaurant },
  { value: "Car", label: "Car Interior", img: locDetailCar },
];

const shotTypes = [
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
];

const actorRoster: Actor[] = [
  { id: "a1", name: "Jack Marlowe", avatar: actorMarlowe, role: "Protagonist", description: "A world-weary private detective." },
  { id: "a2", name: "Vivian Lake", avatar: actorVivian, role: "Supporting", description: "A mysterious woman with a missing person case." },
  { id: "a3", name: "Eddie", avatar: actorEddie, role: "Supporting", description: "Marlowe's street-smart informant." },
];

const initialFrames: FrameData[] = [
  { id: "f1", x: 80, y: 80, image: frame1, scene: "SC 1", shot: "WIDE", description: "Marlowe sits at his desk, smoke curling from a cigarette.", duration: "4s", actors: ["a1"], location: "Office" },
  { id: "f2", x: 400, y: 80, image: frame2, scene: "SC 1", shot: "MED", description: "Vivian appears in the rain-soaked alley.", duration: "3s", actors: ["a2"] },
  { id: "f3", x: 720, y: 80, image: frame3, scene: "SC 2", shot: "WIDE", description: "The Blue Note Jazz Club — establishing shot.", duration: "5s", actors: ["a3"], location: "Jazz Club" },
  { id: "f4", x: 80, y: 340, image: frame4, scene: "SC 2", shot: "CU", description: "Marlowe examines a photograph under his desk lamp.", duration: "3s", actors: ["a1"], location: "Office" },
  { id: "f5", x: 400, y: 340, image: frame5, scene: "SC 3", shot: "WIDE", description: "Two silhouettes meet on the foggy bridge.", duration: "6s", actors: ["a1", "a2"], location: "Bridge" },
  { id: "f6", x: 720, y: 340, image: frame6, scene: "SC 3", shot: "DYNAMIC", description: "Car chase through wet city streets.", duration: "4s", actors: ["a1"], location: "Street" },
];

const initialConnections: Connection[] = [
  { from: "f1", to: "f2" }, { from: "f2", to: "f3" },
  { from: "f3", to: "f4" }, { from: "f4", to: "f5" }, { from: "f5", to: "f6" },
];

// ─── Drawer Components ──────────────────────────────────────

function ShotDrawer({ frame, actorRoster: actors, onUpdate, onDelete }: {
  frame: FrameData;
  actorRoster: Actor[];
  onUpdate: (f: FrameData) => void;
  onDelete: () => void;
}) {
  const [prompt, setPrompt] = useState(frame.description);
  const [shot, setShot] = useState(frame.shot);
  const [duration, setDuration] = useState(frame.duration);
  const [selectedActors, setSelectedActors] = useState<string[]>(frame.actors);
  const [location, setLocation] = useState(frame.location || "");
  const [shotPickerOpen, setShotPickerOpen] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  useEffect(() => {
    setPrompt(frame.description);
    setShot(frame.shot);
    setDuration(frame.duration);
    setSelectedActors(frame.actors);
    setLocation(frame.location || "");
  }, [frame.id]);

  const toggleActor = (id: string) => {
    setSelectedActors(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const save = () => {
    onUpdate({ ...frame, description: prompt, shot, duration, actors: selectedActors, location: location || undefined });
    toast.success("Shot updated");
  };

  return (
    <div className="space-y-4">
      {/* Preview */}
      {frame.image && (
        <div className="rounded-lg overflow-hidden border border-border">
          <img src={frame.image} alt={frame.description} className="w-full object-cover max-h-[180px]" />
        </div>
      )}

      {/* Scene label */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">{frame.scene}</span>
        <span className="text-xs text-muted-foreground">{frame.shot}</span>
        <span className="text-xs text-muted-foreground ml-auto">{frame.duration}</span>
      </div>

      {/* Prompt */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Scene Prompt</Label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[60px] text-sm resize-none"
          placeholder="Describe the scene..."
        />
      </div>

      <Separator />

      {/* Shot Type */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Shot Type</Label>
        <div className="grid grid-cols-5 gap-1.5">
          {shotTypes.map(st => (
            <button
              key={st.value}
              onClick={() => setShot(st.value)}
              className={cn(
                "relative rounded-lg overflow-hidden aspect-[4/3] transition-all",
                shot === st.value ? "ring-2 ring-primary scale-[1.03]" : "ring-1 ring-border hover:ring-muted-foreground"
              )}
            >
              <img src={st.img} alt={st.label} className="w-full h-full object-cover" />
              {shot === st.value && (
                <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-2 h-2 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground text-center">{shotTypes.find(s => s.value === shot)?.label}</p>
      </div>

      <Separator />

      {/* Location */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Location</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {locationDetailOptions.map(loc => (
            <button
              key={loc.value}
              onClick={() => setLocation(location === loc.value ? "" : loc.value)}
              className={cn(
                "relative rounded-lg overflow-hidden aspect-[4/3] transition-all",
                location === loc.value ? "ring-2 ring-primary scale-[1.03]" : "ring-1 ring-border hover:ring-muted-foreground"
              )}
            >
              <img src={loc.img} alt={loc.label} className="w-full h-full object-cover" />
              {location === loc.value && (
                <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-2 h-2 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground text-center">
          {locationDetailOptions.find(l => l.value === location)?.label || "None"}
        </p>
      </div>

      <Separator />

      {/* Duration */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Duration</Label>
        <div className="flex gap-1.5">
          {["2s", "3s", "4s", "5s", "6s", "8s"].map(d => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                duration === d ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Actors */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Actors in Scene</Label>
        <div className="flex flex-wrap gap-2">
          {actors.map(actor => {
            const isIn = selectedActors.includes(actor.id);
            return (
              <button
                key={actor.id}
                onClick={() => toggleActor(actor.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs transition-all",
                  isIn ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/60"
                )}
              >
                <img src={actor.avatar} alt={actor.name} className="w-5 h-5 rounded-full object-cover" />
                <span>{actor.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex gap-2">
        <Button size="sm" className="flex-1 gap-1.5" onClick={save}>
          <Check className="w-3.5 h-3.5" /> Save
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Generate
        </Button>
      </div>

      <button
        onClick={onDelete}
        className="w-full flex items-center justify-center gap-1.5 text-xs text-destructive hover:text-destructive/80 py-2 transition-colors"
      >
        <Trash2 className="w-3 h-3" /> Delete Shot
      </button>
    </div>
  );
}

function CastDrawer({ actor, frames }: { actor: Actor; frames: FrameData[] }) {
  const appearances = frames.filter(f => f.actors.includes(actor.id));

  return (
    <div className="space-y-4">
      {/* Portrait */}
      <div className="rounded-xl overflow-hidden border border-border bg-secondary">
        <img src={actor.avatar} alt={actor.name} className="w-full object-cover max-h-[240px]" />
      </div>

      {/* Name & Role */}
      <div>
        <h3 className="text-lg font-bold text-foreground">{actor.name}</h3>
        <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">{actor.role}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed">{actor.description}</p>

      <Separator />

      {/* Appears in */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Appears in {appearances.length} shot{appearances.length !== 1 ? "s" : ""}</Label>
        <div className="grid grid-cols-2 gap-2">
          {appearances.map(f => (
            <div key={f.id} className="rounded-lg overflow-hidden border border-border bg-secondary">
              {f.image && <img src={f.image} alt={f.description} className="w-full aspect-video object-cover" />}
              <div className="p-2">
                <p className="text-[10px] font-bold text-primary">{f.scene}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <Button size="sm" variant="outline" className="w-full gap-1.5">
        <Settings className="w-3.5 h-3.5" /> Edit Full Profile
      </Button>
    </div>
  );
}

function LocationDrawer({ locationName, frames }: { locationName: string; frames: FrameData[] }) {
  const img = locationImages[locationName];
  const appearances = frames.filter(f => f.location === locationName);

  return (
    <div className="space-y-4">
      {/* Image */}
      {img && (
        <div className="rounded-xl overflow-hidden border border-border">
          <img src={img} alt={locationName} className="w-full object-cover max-h-[200px]" />
        </div>
      )}

      <h3 className="text-lg font-bold text-foreground">{locationName}</h3>

      <Separator />

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Used in {appearances.length} shot{appearances.length !== 1 ? "s" : ""}</Label>
        <div className="grid grid-cols-2 gap-2">
          {appearances.map(f => (
            <div key={f.id} className="rounded-lg overflow-hidden border border-border bg-secondary">
              {f.image && <img src={f.image} alt={f.description} className="w-full aspect-video object-cover" />}
              <div className="p-2">
                <p className="text-[10px] font-bold text-primary">{f.scene}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Canvas ────────────────────────────────────────────
export default function ProductionCanvasPage() {
  const { projectId } = useParams();
  const containerRef = useRef<HTMLDivElement>(null);

  const [frames, setFrames] = useState<FrameData[]>(initialFrames);
  const [castNodes, setCastNodes] = useState<CastNode[]>([
    { id: "cn1", actorId: "a1", x: -200, y: 100 },
    { id: "cn2", actorId: "a2", x: -200, y: 360 },
  ]);
  const [locationNodes, setLocationNodes] = useState<LocationNode[]>([
    { id: "ln1", locationName: "Office", x: 1100, y: 80 },
    { id: "ln2", locationName: "Bridge", x: 1100, y: 280 },
  ]);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<Tool>("select");
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState<SelectedItem>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [connectingMouse, setConnectingMouse] = useState({ x: 0, y: 0 });
  const [canvasMenu, setCanvasMenu] = useState<{ x: number; y: number; worldX: number; worldY: number } | null>(null);
  const [castPickerPos, setCastPickerPos] = useState<{ x: number; y: number; worldX: number; worldY: number } | null>(null);
  const [locationPickerPos, setLocationPickerPos] = useState<{ x: number; y: number; worldX: number; worldY: number } | null>(null);

  // Zoom towards mouse
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(prev => {
        const next = Math.min(3, Math.max(0.15, prev + delta));
        const scale = next / prev;
        setPan(p => ({ x: mouseX - scale * (mouseX - p.x), y: mouseY - scale * (mouseY - p.y) }));
        return next;
      });
    } else {
      setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && tool === "hand")) {
      setPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault();
    } else if (e.button === 0 && tool === "select") {
      setSelected(null);
    }
  }, [tool, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
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
      // Update whichever array contains this id
      setFrames(prev => prev.map(f => f.id === dragging ? { ...f, x, y } : f));
      setCastNodes(prev => prev.map(n => n.id === dragging ? { ...n, x, y } : n));
      setLocationNodes(prev => prev.map(n => n.id === dragging ? { ...n, x, y } : n));
    }
  }, [panning, panStart, dragging, dragOffset, pan, zoom, connectingFrom]);

  const handleMouseUp = useCallback(() => {
    setPanning(false);
    setDragging(null);
    setConnectingFrom(null);
  }, []);

  const startDrag = useCallback((e: React.MouseEvent, node: { id: string; x: number; y: number }, sel: SelectedItem) => {
    if (tool !== "select" || e.button !== 0) return;
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = (e.clientX - rect.left - pan.x) / zoom;
    const my = (e.clientY - rect.top - pan.y) / zoom;
    setDragOffset({ x: mx - node.x, y: my - node.y });
    setDragging(node.id);
    setSelected(sel);
  }, [tool, pan, zoom]);

  const startConnect = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConnectingFrom(id);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setConnectingMouse({ x: (e.clientX - rect.left - pan.x) / zoom, y: (e.clientY - rect.top - pan.y) / zoom });
  }, [pan, zoom]);

  const endConnect = useCallback((id: string) => {
    if (connectingFrom && connectingFrom !== id) {
      const exists = connections.some(c => c.from === connectingFrom && c.to === id);
      if (!exists) setConnections(prev => [...prev, { from: connectingFrom, to: id }]);
    }
    setConnectingFrom(null);
  }, [connectingFrom, connections]);

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
    return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, from: c.from, to: c.to };
  });

  const fitToScreen = useCallback(() => {
    if (!containerRef.current) return;
    const allNodes = [
      ...frames.map(f => ({ x: f.x, y: f.y, w: FRAME_W, h: FRAME_H })),
      ...castNodes.map(n => ({ x: n.x, y: n.y, w: CAST_W, h: CAST_H })),
      ...locationNodes.map(n => ({ x: n.x, y: n.y, w: LOC_W, h: LOC_H })),
    ];
    if (allNodes.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const minX = Math.min(...allNodes.map(n => n.x));
    const minY = Math.min(...allNodes.map(n => n.y));
    const maxX = Math.max(...allNodes.map(n => n.x + n.w));
    const maxY = Math.max(...allNodes.map(n => n.y + n.h));
    const cw = maxX - minX + 120;
    const ch = maxY - minY + 120;
    const drawWidth = selected ? rect.width - DRAWER_W : rect.width;
    const nz = Math.min(drawWidth / cw, rect.height / ch, 1.5);
    setZoom(nz);
    setPan({ x: (drawWidth - cw * nz) / 2 - minX * nz + 60 * nz, y: (rect.height - ch * nz) / 2 - minY * nz + 60 * nz });
  }, [frames, castNodes, locationNodes, selected]);

  const autoLayout = useCallback(() => {
    const cols = 3, gapX = 320, gapY = 260;
    setFrames(prev => prev.map((f, i) => ({ ...f, x: 80 + (i % cols) * gapX, y: 80 + Math.floor(i / cols) * gapY })));
  }, []);

  const addFrame = useCallback((x?: number, y?: number) => {
    const id = `f${Date.now()}`;
    const last = frames[frames.length - 1];
    setFrames(prev => [...prev, {
      id, x: x ?? (last ? last.x + 320 : 80), y: y ?? (last ? last.y : 80),
      image: "", scene: `SC ${Math.ceil((frames.length + 1) / 2)}`, shot: "WIDE",
      description: "New frame", duration: "3s", actors: [],
      location: undefined,
    }]);
    setSelected({ type: "frame", id });
  }, [frames]);

  // Spacebar for hand tool
  useEffect(() => {
    const d = (e: KeyboardEvent) => { if (e.code === "Space" && !e.repeat) { setTool("hand"); e.preventDefault(); } };
    const u = (e: KeyboardEvent) => { if (e.code === "Space") setTool("select"); };
    window.addEventListener("keydown", d);
    window.addEventListener("keyup", u);
    return () => { window.removeEventListener("keydown", d); window.removeEventListener("keyup", u); };
  }, []);

  // Fit on mount
  useEffect(() => { const t = setTimeout(fitToScreen, 150); return () => clearTimeout(t); }, []);

  // Resolve selected item for drawer
  const selectedFrame = selected?.type === "frame" ? frames.find(f => f.id === selected.id) : null;
  const selectedCast = selected?.type === "cast" ? castNodes.find(n => n.id === selected.id) : null;
  const selectedLocation = selected?.type === "location" ? locationNodes.find(n => n.id === selected.id) : null;
  const selectedActor = selectedCast ? actorRoster.find(a => a.id === selectedCast.actorId) : null;

  const drawerTitle = selectedFrame ? "Shot Settings" : selectedActor ? "Cast Details" : selectedLocation ? "Location" : null;
  const showDrawer = !!selected;

  return (
    <div className="h-screen w-full relative bg-background overflow-hidden flex">
      {/* Canvas area */}
      <div className="flex-1 relative">
        {/* Back button */}
        <Link
          to={`/project/${projectId}/storyboard`}
          className="absolute top-3 left-3 z-30 flex items-center gap-2 px-3 py-2 rounded-xl bg-card/90 backdrop-blur-md border border-border shadow-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs">Back to Pipeline</span>
        </Link>

        {/* Canvas title */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 rounded-xl bg-card/90 backdrop-blur-md border border-border shadow-lg">
          <Film className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">Production Canvas</span>
          <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Beta</span>
        </div>

        {/* Floating vertical toolbar */}
        <div className="absolute top-1/2 -translate-y-1/2 left-4 z-20 flex flex-col items-center gap-1 p-1.5 rounded-2xl bg-card/90 backdrop-blur-md border border-border shadow-2xl">
          <button onClick={() => addFrame()} className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors" title="Add Frame">
            <Plus className="w-4 h-4" />
          </button>
          <div className="w-6 h-px bg-border my-0.5" />
          <button onClick={() => setTool("select")} className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-colors", tool === "select" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60")} title="Select (V)">
            <MousePointer className="w-4 h-4" />
          </button>
          <button onClick={() => setTool("hand")} className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-colors", tool === "hand" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60")} title="Pan (Space)">
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

        {/* Zoom indicator */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 px-2 py-1 rounded-lg bg-card/90 backdrop-blur-sm border border-border text-xs text-muted-foreground">
          <button onClick={() => setZoom(z => Math.max(0.15, z - 0.1))} className="p-0.5 hover:text-foreground"><ZoomOut className="w-3.5 h-3.5" /></button>
          <span className="min-w-[3ch] text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-0.5 hover:text-foreground"><ZoomIn className="w-3.5 h-3.5" /></button>
        </div>

        {/* Canvas surface */}
        <div
          ref={containerRef}
          className={cn("absolute inset-0", tool === "hand" || panning ? "cursor-grab" : "cursor-default", panning && "cursor-grabbing")}
          onContextMenu={(e) => {
            e.preventDefault();
            if ((e.target as HTMLElement).closest("[data-node]")) return;
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;
            const worldX = (e.clientX - rect.left - pan.x) / zoom;
            const worldY = (e.clientY - rect.top - pan.y) / zoom;
            setCanvasMenu({ x: e.clientX - rect.left, y: e.clientY - rect.top, worldX, worldY });
          }}
          onWheel={handleWheel}
          onMouseDown={(e) => { setCanvasMenu(null); setCastPickerPos(null); setLocationPickerPos(null); handleMouseDown(e); }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Dot grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle, hsl(var(--foreground) / 0.12) 1px, transparent 1px)`,
              backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
              backgroundPosition: `${pan.x % (32 * zoom)}px ${pan.y % (32 * zoom)}px`,
            }}
          />

          {/* Transform layer */}
          <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0" }}>
            {/* Connection lines */}
            <svg className="absolute inset-0 w-[5000px] h-[5000px]" style={{ pointerEvents: "none" }}>
              {connectors.map(c => {
                const dx = Math.abs(c.x2 - c.x1);
                const curve = Math.min(140, Math.max(18, dx * 0.35));
                return (
                  <g key={`${c.from}-${c.to}`} style={{ pointerEvents: "auto", cursor: "pointer" }} onClick={() => setConnections(prev => prev.filter(cc => !(cc.from === c.from && cc.to === c.to)))}>
                    <path d={`M ${c.x1} ${c.y1} C ${c.x1 + curve} ${c.y1}, ${c.x2 - curve} ${c.y2}, ${c.x2} ${c.y2}`} stroke="transparent" strokeWidth="16" fill="none" />
                    <path d={`M ${c.x1} ${c.y1} C ${c.x1 + curve} ${c.y1}, ${c.x2 - curve} ${c.y2}, ${c.x2} ${c.y2}`} stroke="hsl(var(--primary))" strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  </g>
                );
              })}
              {connectingFrom && (() => {
                const p = getPortPos(connectingFrom, "right");
                const dx = Math.abs(connectingMouse.x - p.x);
                const curve = Math.min(140, Math.max(18, dx * 0.35));
                return <path d={`M ${p.x} ${p.y} C ${p.x + curve} ${p.y}, ${connectingMouse.x - curve} ${connectingMouse.y}, ${connectingMouse.x} ${connectingMouse.y}`} stroke="hsl(var(--primary))" strokeOpacity="0.7" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="8 6" fill="none" />;
              })()}
            </svg>

            {/* Shot frames */}
            {frames.map((frame, idx) => (
              <div
                key={frame.id}
                data-node
                className={cn(
                  "absolute rounded-xl border-2 bg-card select-none group transition-shadow",
                  selected?.id === frame.id ? "border-primary shadow-lg shadow-primary/20" : "border-border hover:border-muted-foreground/40",
                )}
                style={{ left: frame.x, top: frame.y, width: FRAME_W }}
                onMouseDown={(e) => startDrag(e, frame, { type: "frame", id: frame.id })}
              >
                {/* Ports */}
                <div className="absolute -left-[8px] z-20 w-[16px] h-[16px] rounded-full border-2 border-primary/50 bg-card hover:bg-primary hover:border-primary transition-all cursor-crosshair" style={{ top: PORT_Y - 8 }}
                  onMouseUp={(e) => { e.stopPropagation(); endConnect(frame.id); }} onMouseDown={(e) => e.stopPropagation()} />
                <div className="absolute -right-[8px] z-20 w-[16px] h-[16px] rounded-full border-2 border-primary/50 bg-card hover:bg-primary hover:border-primary transition-all cursor-crosshair" style={{ top: PORT_Y - 8 }}
                  onMouseDown={(e) => { e.stopPropagation(); startConnect(e, frame.id); }} />

                {/* Frame number */}
                <div className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">{idx + 1}</div>
                {/* Shot badge */}
                <div className="absolute top-2 right-2 z-10 bg-primary/90 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">{frame.shot}</div>

                {/* Image */}
                <div className="w-full bg-secondary overflow-hidden rounded-t-[10px]" style={{ height: IMAGE_H }}>
                  {frame.image ? (
                    <img src={frame.image} alt={frame.description} className="w-full h-full object-cover" draggable={false} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30"><Plus className="w-8 h-8" /></div>
                  )}
                </div>

                {/* Info */}
                <div className="p-2.5 space-y-1 rounded-b-[10px]" onMouseDown={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-primary">{frame.scene}</span>
                    <span className="text-[10px] text-muted-foreground">{frame.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TooltipProvider delayDuration={200}>
                      {frame.actors.map(aid => {
                        const a = actorRoster.find(ac => ac.id === aid);
                        if (!a) return null;
                        return (
                          <Tooltip key={a.id}>
                            <TooltipTrigger asChild>
                              <div className="w-5 h-5 rounded-full overflow-hidden border border-border">
                                <img src={a.avatar} alt={a.name} className="w-full h-full object-cover" draggable={false} />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">{a.name}</TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </TooltipProvider>
                    {frame.location && locationImages[frame.location] && (
                      <div className="ml-auto w-8 h-5 rounded overflow-hidden border border-border">
                        <img src={locationImages[frame.location]} alt={frame.location} className="w-full h-full object-cover" draggable={false} />
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-foreground/70 leading-tight line-clamp-2">{frame.description}</p>
                </div>
              </div>
            ))}

            {/* Cast nodes */}
            {castNodes.map(node => {
              const actor = actorRoster.find(a => a.id === node.actorId);
              if (!actor) return null;
              const sceneCount = frames.filter(f => f.actors.includes(node.actorId)).length;
              return (
                <div
                  key={node.id}
                  data-node
                  className={cn(
                    "absolute rounded-xl border-2 bg-card overflow-hidden select-none group cursor-grab",
                    selected?.id === node.id ? "border-cyan-500 shadow-lg shadow-cyan-500/20" : "border-border hover:border-muted-foreground/40",
                  )}
                  style={{ left: node.x, top: node.y, width: CAST_W }}
                  onMouseDown={(e) => startDrag(e, node, { type: "cast", id: node.id })}
                >
                  {/* Ports */}
                  <div className="absolute -right-[8px] top-1/2 -translate-y-1/2 z-20 w-[16px] h-[16px] rounded-full border-2 border-cyan-500/50 bg-card hover:bg-cyan-500 transition-all cursor-crosshair"
                    onMouseDown={(e) => { e.stopPropagation(); startConnect(e, node.id); }} />
                  <div className="absolute -left-[8px] top-1/2 -translate-y-1/2 z-20 w-[16px] h-[16px] rounded-full border-2 border-cyan-500/50 bg-card hover:bg-cyan-500 transition-all cursor-crosshair"
                    onMouseUp={(e) => { e.stopPropagation(); endConnect(node.id); }} onMouseDown={e => e.stopPropagation()} />

                  <div className="absolute top-2 left-2 z-10 bg-cyan-500/20 backdrop-blur-sm text-cyan-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md">{sceneCount} shots</div>
                  <button
                    className="absolute top-2 right-2 z-10 bg-background/70 text-foreground/70 hover:text-destructive w-5 h-5 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-all"
                    onMouseDown={e => e.stopPropagation()}
                    onClick={() => { setCastNodes(prev => prev.filter(n => n.id !== node.id)); setConnections(prev => prev.filter(c => c.from !== node.id && c.to !== node.id)); if (selected?.id === node.id) setSelected(null); }}
                  ><X className="w-3 h-3" /></button>
                  <img src={actor.avatar} alt={actor.name} className="w-full aspect-[3/4] object-cover" draggable={false} />
                  <div className="p-2">
                    <p className="text-xs font-bold text-foreground">{actor.name}</p>
                    <p className="text-[10px] text-muted-foreground">{actor.role}</p>
                  </div>
                </div>
              );
            })}

            {/* Location nodes */}
            {locationNodes.map(node => {
              const img = locationImages[node.locationName];
              if (!img) return null;
              const shotCount = frames.filter(f => f.location === node.locationName).length;
              return (
                <div
                  key={node.id}
                  data-node
                  className={cn(
                    "absolute rounded-xl border-2 bg-card overflow-hidden select-none group cursor-grab",
                    selected?.id === node.id ? "border-emerald-500 shadow-lg shadow-emerald-500/20" : "border-border hover:border-muted-foreground/40",
                  )}
                  style={{ left: node.x, top: node.y, width: LOC_W }}
                  onMouseDown={(e) => startDrag(e, node, { type: "location", id: node.id })}
                >
                  <div className="absolute -right-[8px] top-1/2 -translate-y-1/2 z-20 w-[16px] h-[16px] rounded-full border-2 border-emerald-500/50 bg-card hover:bg-emerald-500 transition-all cursor-crosshair"
                    onMouseDown={(e) => { e.stopPropagation(); startConnect(e, node.id); }} />
                  <div className="absolute -left-[8px] top-1/2 -translate-y-1/2 z-20 w-[16px] h-[16px] rounded-full border-2 border-emerald-500/50 bg-card hover:bg-emerald-500 transition-all cursor-crosshair"
                    onMouseUp={(e) => { e.stopPropagation(); endConnect(node.id); }} onMouseDown={e => e.stopPropagation()} />

                  <div className="absolute top-2 left-2 z-10 bg-emerald-500/20 backdrop-blur-sm text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md">{shotCount} shots</div>
                  <button
                    className="absolute top-2 right-2 z-10 bg-background/70 text-foreground/70 hover:text-destructive w-5 h-5 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-all"
                    onMouseDown={e => e.stopPropagation()}
                    onClick={() => { setLocationNodes(prev => prev.filter(n => n.id !== node.id)); setConnections(prev => prev.filter(c => c.from !== node.id && c.to !== node.id)); if (selected?.id === node.id) setSelected(null); }}
                  ><X className="w-3 h-3" /></button>
                  <img src={img} alt={node.locationName} className="w-full aspect-video object-cover" draggable={false} />
                  <div className="p-2">
                    <p className="text-xs font-bold text-foreground">{node.locationName}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Context menu */}
          {canvasMenu && (
            <div className="absolute z-50 min-w-[180px] bg-popover border border-border rounded-lg shadow-xl py-1 text-sm" style={{ left: canvasMenu.x, top: canvasMenu.y }} onMouseDown={e => e.stopPropagation()}>
              <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-secondary/60 text-foreground" onClick={() => { addFrame(canvasMenu.worldX, canvasMenu.worldY); setCanvasMenu(null); }}>
                <Plus className="w-4 h-4" /> Add Shot
              </button>
              <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-secondary/60 text-foreground" onClick={() => { setCastPickerPos(canvasMenu); setCanvasMenu(null); }}>
                <Users className="w-4 h-4" /> Add Cast Member
              </button>
              <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-secondary/60 text-foreground" onClick={() => { setLocationPickerPos(canvasMenu); setCanvasMenu(null); }}>
                <MapPin className="w-4 h-4" /> Add Location
              </button>
              <div className="h-px bg-border my-1" />
              <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-secondary/60 text-foreground" onClick={() => { autoLayout(); setCanvasMenu(null); }}>
                <Grid3X3 className="w-4 h-4" /> Auto Layout
              </button>
              <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-secondary/60 text-foreground" onClick={() => { fitToScreen(); setCanvasMenu(null); }}>
                <Maximize className="w-4 h-4" /> Fit to Screen
              </button>
            </div>
          )}

          {/* Cast Picker */}
          {castPickerPos && (
            <div className="absolute z-50 min-w-[200px] bg-popover border border-border rounded-lg shadow-xl py-1 text-sm" style={{ left: castPickerPos.x, top: castPickerPos.y }} onMouseDown={e => e.stopPropagation()}>
              <p className="px-3 py-1.5 text-xs text-muted-foreground uppercase tracking-wider">Choose Actor</p>
              {actorRoster.map(actor => (
                <button key={actor.id} className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-secondary/60 text-foreground" onMouseDown={e => e.stopPropagation()}
                  onClick={() => { setCastNodes(prev => [...prev, { id: `cn-${Date.now()}`, actorId: actor.id, x: castPickerPos.worldX - CAST_W / 2, y: castPickerPos.worldY }]); setCastPickerPos(null); }}>
                  <img src={actor.avatar} alt={actor.name} className="w-7 h-7 rounded-full object-cover" />
                  <span>{actor.name}</span>
                </button>
              ))}
              <div className="h-px bg-border my-1" />
              <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-secondary/60 text-muted-foreground" onClick={() => setCastPickerPos(null)}>
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          )}

          {/* Location Picker */}
          {locationPickerPos && (
            <div className="absolute z-50 min-w-[200px] bg-popover border border-border rounded-lg shadow-xl py-1 text-sm" style={{ left: locationPickerPos.x, top: locationPickerPos.y }} onMouseDown={e => e.stopPropagation()}>
              <p className="px-3 py-1.5 text-xs text-muted-foreground uppercase tracking-wider">Choose Location</p>
              {Object.entries(locationImages).map(([name, img]) => (
                <button key={name} className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-secondary/60 text-foreground" onMouseDown={e => e.stopPropagation()}
                  onClick={() => { setLocationNodes(prev => [...prev, { id: `ln-${Date.now()}`, locationName: name, x: locationPickerPos.worldX - LOC_W / 2, y: locationPickerPos.worldY }]); setLocationPickerPos(null); }}>
                  <img src={img} alt={name} className="w-8 h-5 rounded object-cover" />
                  <span>{name}</span>
                </button>
              ))}
              <div className="h-px bg-border my-1" />
              <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-secondary/60 text-muted-foreground" onClick={() => setLocationPickerPos(null)}>
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          )}
        </div>

        {/* Minimap */}
        <div className="absolute bottom-4 right-4 w-[140px] h-[90px] bg-card/90 backdrop-blur-sm border border-border rounded-lg overflow-hidden z-20" style={{ right: showDrawer ? DRAWER_W + 16 : 16 }}>
          <svg className="w-full h-full" viewBox="-300 -50 1600 800">
            {frames.map(f => (
              <rect key={f.id} x={f.x} y={f.y} width={FRAME_W} height={FRAME_H} rx={4} fill={selected?.id === f.id ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} fillOpacity={selected?.id === f.id ? 0.6 : 0.2} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.3} strokeWidth={2} />
            ))}
            {castNodes.map(n => <rect key={n.id} x={n.x} y={n.y} width={CAST_W} height={CAST_H} rx={4} fill="hsl(190 80% 50%)" fillOpacity={0.3} />)}
            {locationNodes.map(n => <rect key={n.id} x={n.x} y={n.y} width={LOC_W} height={LOC_H} rx={4} fill="hsl(150 60% 45%)" fillOpacity={0.3} />)}
          </svg>
        </div>
      </div>

      {/* Context-sensitive drawer */}
      {showDrawer && (
        <div className="h-full border-l border-border bg-card flex flex-col animate-in slide-in-from-right duration-200" style={{ width: DRAWER_W }}>
          {/* Drawer header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              {selectedFrame && <Camera className="w-4 h-4 text-primary" />}
              {selectedActor && <User className="w-4 h-4 text-cyan-500" />}
              {selectedLocation && <MapPin className="w-4 h-4 text-emerald-500" />}
              <h2 className="text-sm font-bold text-foreground">{drawerTitle}</h2>
            </div>
            <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {selectedFrame && (
              <ShotDrawer
                frame={selectedFrame}
                actorRoster={actorRoster}
                onUpdate={(updated) => setFrames(prev => prev.map(f => f.id === updated.id ? updated : f))}
                onDelete={() => {
                  setFrames(prev => prev.filter(f => f.id !== selectedFrame.id));
                  setConnections(prev => prev.filter(c => c.from !== selectedFrame.id && c.to !== selectedFrame.id));
                  setSelected(null);
                }}
              />
            )}
            {selectedActor && <CastDrawer actor={selectedActor} frames={frames} />}
            {selectedLocation && <LocationDrawer locationName={selectedLocation.locationName} frames={frames} />}
          </div>
        </div>
      )}
    </div>
  );
}