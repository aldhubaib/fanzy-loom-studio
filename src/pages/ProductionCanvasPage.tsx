import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Plus, MousePointer, Hand, Grid3X3, Maximize, X, Settings, MapPin, Users,
  ArrowLeft, Film, Camera, Clock, Sparkles, ChevronDown, Check, User, Trash2,
  ZoomIn, ZoomOut, Images, ChevronLeft, ChevronRight, Expand, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { CharacterDetailsPanel, type CharacterData } from "@/components/casting/CharacterDetailsPanel";

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
// Actor type aliases CharacterData from the shared panel
type Actor = CharacterData;

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
  zoneId: string;
}

interface CastNode {
  id: string;
  actorId: string;
  x: number;
  y: number;
  zoneId: string;
}

interface LocationNode {
  id: string;
  locationName: string;
  x: number;
  y: number;
  zoneId: string;
}

interface ScriptNode {
  id: string;
  heading: string;
  body: string;
  x: number;
  y: number;
  zoneId: string;
}

interface Zone {
  id: string;
  label: string;
  type: "casting" | "shots" | "locations" | "script";
  x: number;
  y: number;
  color: string;
}

interface Connection {
  from: string;
  to: string;
}

type SelectedItem =
  | { type: "frame"; id: string }
  | { type: "cast"; id: string }
  | { type: "location"; id: string }
  | { type: "zone"; id: string }
  | null;

type Tool = "select" | "hand";

// ─── Constants ──────────────────────────────────────────────
const FRAME_W = 260;
const IMAGE_H = 146;
const FRAME_H = IMAGE_H + 70;
const PORT_Y = FRAME_H / 2;
const CAST_W = 160;
const CAST_H = 220;
const LOC_W = 180;
const LOC_H = 140;
const DRAWER_W = 360;
const ZONE_PAD = 40;
const ZONE_LABEL_H = 40;
const MIN_ZONE_W = 300;
const MIN_ZONE_H = 200;

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
  { id: "a1", name: "Jack Marlowe", portrait: actorMarlowe, role: "Protagonist", description: "A world-weary private detective.", gender: "Male", ageRange: "Middle Age (31-55)", ethnicity: "Caucasian", bodyType: "Average", height: "Tall", hairColor: "Dark Brown", hairStyle: "Short", eyeColor: "Brown", skinTone: "Light", clothing: "Formal", distinguishingFeatures: "Facial Scar", generatedPortraits: [{ id: "g1a", src: actorMarlowe, description: "Detective — classic noir" }], selectedPortraitId: "g1a" },
  { id: "a2", name: "Vivian Lake", portrait: actorVivian, role: "Supporting", description: "A mysterious woman with a missing person case.", gender: "Female", ageRange: "Young Adult (18-30)", ethnicity: "Caucasian", bodyType: "Slim", height: "Average", hairColor: "Dark Brown", hairStyle: "Long", eyeColor: "Green", skinTone: "Very Light", clothing: "High Fashion", distinguishingFeatures: "None", generatedPortraits: [{ id: "g2a", src: actorVivian, description: "Vivian — classic look" }], selectedPortraitId: "g2a" },
  { id: "a3", name: "Eddie", portrait: actorEddie, role: "Supporting", description: "Marlowe's street-smart informant.", gender: "Male", ageRange: "Young Adult (18-30)", ethnicity: "African", bodyType: "Average", height: "Average", hairColor: "Black", hairStyle: "Short", eyeColor: "Brown", skinTone: "Dark", clothing: "Streetwear", distinguishingFeatures: "None", generatedPortraits: [{ id: "g3a", src: actorEddie, description: "Eddie — street look" }], selectedPortraitId: "g3a" },
];

// ─── Initial Data ───────────────────────────────────────────
const initialZones: Zone[] = [
  { id: "z-casting", label: "Casting", type: "casting", x: -500, y: 0, color: "190 80% 50%" },
  { id: "z-shots", label: "Shots", type: "shots", x: 40, y: 0, color: "var(--primary)" },
  { id: "z-locations", label: "Locations", type: "locations", x: 1200, y: 0, color: "150 60% 45%" },
];

const initialFrames: FrameData[] = [
  { id: "f1", x: 80, y: 80, image: frame1, scene: "SC 1", shot: "WIDE", description: "Marlowe sits at his desk, smoke curling from a cigarette.", duration: "4s", actors: ["a1"], location: "Office", zoneId: "z-shots" },
  { id: "f2", x: 400, y: 80, image: frame2, scene: "SC 1", shot: "MED", description: "Vivian appears in the rain-soaked alley.", duration: "3s", actors: ["a2"], zoneId: "z-shots" },
  { id: "f3", x: 720, y: 80, image: frame3, scene: "SC 2", shot: "WIDE", description: "The Blue Note Jazz Club — establishing shot.", duration: "5s", actors: ["a3"], location: "Jazz Club", zoneId: "z-shots" },
  { id: "f4", x: 80, y: 340, image: frame4, scene: "SC 2", shot: "CU", description: "Marlowe examines a photograph under his desk lamp.", duration: "3s", actors: ["a1"], location: "Office", zoneId: "z-shots" },
  { id: "f5", x: 400, y: 340, image: frame5, scene: "SC 3", shot: "WIDE", description: "Two silhouettes meet on the foggy bridge.", duration: "6s", actors: ["a1", "a2"], location: "Bridge", zoneId: "z-shots" },
  { id: "f6", x: 720, y: 340, image: frame6, scene: "SC 3", shot: "DYNAMIC", description: "Car chase through wet city streets.", duration: "4s", actors: ["a1"], location: "Street", zoneId: "z-shots" },
];

const initialCastNodes: CastNode[] = [
  { id: "cn1", actorId: "a1", x: -460, y: 80, zoneId: "z-casting" },
  { id: "cn2", actorId: "a2", x: -260, y: 80, zoneId: "z-casting" },
  { id: "cn3", actorId: "a3", x: -460, y: 340, zoneId: "z-casting" },
];

const initialLocationNodes: LocationNode[] = [
  { id: "ln1", locationName: "Office", x: 1240, y: 80, zoneId: "z-locations" },
  { id: "ln2", locationName: "Bridge", x: 1460, y: 80, zoneId: "z-locations" },
  { id: "ln3", locationName: "Jazz Club", x: 1240, y: 260, zoneId: "z-locations" },
  { id: "ln4", locationName: "Street", x: 1460, y: 260, zoneId: "z-locations" },
];

const initialConnections: Connection[] = [
  { from: "f1", to: "f2" }, { from: "f2", to: "f3" },
  { from: "f3", to: "f4" }, { from: "f4", to: "f5" }, { from: "f5", to: "f6" },
  // Zone-level connections: casting → shots, locations → shots
  { from: "z-casting", to: "z-shots" },
  { from: "z-locations", to: "z-shots" },
];

// ─── Zone Bounds Helper ─────────────────────────────────────
function computeZoneBounds(
  zone: Zone,
  frames: FrameData[],
  castNodes: CastNode[],
  locationNodes: LocationNode[],
) {
  const children: { x: number; y: number; w: number; h: number }[] = [];

  if (zone.type === "shots") {
    frames.filter(f => f.zoneId === zone.id).forEach(f => children.push({ x: f.x, y: f.y, w: FRAME_W, h: FRAME_H }));
  } else if (zone.type === "casting") {
    castNodes.filter(n => n.zoneId === zone.id).forEach(n => children.push({ x: n.x, y: n.y, w: CAST_W, h: CAST_H }));
  } else if (zone.type === "locations") {
    locationNodes.filter(n => n.zoneId === zone.id).forEach(n => children.push({ x: n.x, y: n.y, w: LOC_W, h: LOC_H }));
  }

  if (children.length === 0) {
    return { x: zone.x, y: zone.y, w: MIN_ZONE_W, h: MIN_ZONE_H };
  }

  const minX = Math.min(...children.map(c => c.x)) - ZONE_PAD;
  const minY = Math.min(...children.map(c => c.y)) - ZONE_PAD - ZONE_LABEL_H;
  const maxX = Math.max(...children.map(c => c.x + c.w)) + ZONE_PAD;
  const maxY = Math.max(...children.map(c => c.y + c.h)) + ZONE_PAD;

  return {
    x: minX,
    y: minY,
    w: Math.max(MIN_ZONE_W, maxX - minX),
    h: Math.max(MIN_ZONE_H, maxY - minY),
  };
}

// ─── Drawer Components ──────────────────────────────────────

function ShotDrawer({ frame, actors, connectedActors, onUpdate, onDelete }: {
  frame: FrameData;
  actors: Actor[];
  connectedActors: Actor[];
  onUpdate: (f: FrameData) => void;
  onDelete: () => void;
}) {
  const [prompt, setPrompt] = useState(frame.description);
  const [shot, setShot] = useState(frame.shot);
  const [duration, setDuration] = useState(frame.duration);
  const [selectedActors, setSelectedActors] = useState<string[]>(frame.actors);
  const [location, setLocation] = useState(frame.location || "");

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

  // Use connected actors (from linked casting zone) instead of full roster
  const availableActors = connectedActors.length > 0 ? connectedActors : actors;

  return (
    <div className="space-y-4">
      {frame.image && (
        <div className="rounded-lg overflow-hidden border border-border">
          <img src={frame.image} alt={frame.description} className="w-full object-cover max-h-[180px]" />
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">{frame.scene}</span>
        <span className="text-xs text-muted-foreground">{frame.shot}</span>
        <span className="text-xs text-muted-foreground ml-auto">{frame.duration}</span>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Scene Prompt</Label>
        <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="min-h-[60px] text-sm resize-none" placeholder="Describe the scene..." />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Shot Type</Label>
        <div className="grid grid-cols-5 gap-1.5">
          {shotTypes.map(st => (
            <button key={st.value} onClick={() => setShot(st.value)}
              className={cn("relative rounded-lg overflow-hidden aspect-[4/3] transition-all", shot === st.value ? "ring-2 ring-primary scale-[1.03]" : "ring-1 ring-border hover:ring-muted-foreground")}>
              <img src={st.img} alt={st.label} className="w-full h-full object-cover" />
              {shot === st.value && <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center"><Check className="w-2 h-2 text-primary-foreground" /></div>}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground text-center">{shotTypes.find(s => s.value === shot)?.label}</p>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Location</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {locationDetailOptions.map(loc => (
            <button key={loc.value} onClick={() => setLocation(location === loc.value ? "" : loc.value)}
              className={cn("relative rounded-lg overflow-hidden aspect-[4/3] transition-all", location === loc.value ? "ring-2 ring-primary scale-[1.03]" : "ring-1 ring-border hover:ring-muted-foreground")}>
              <img src={loc.img} alt={loc.label} className="w-full h-full object-cover" />
              {location === loc.value && <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center"><Check className="w-2 h-2 text-primary-foreground" /></div>}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Duration</Label>
        <div className="flex gap-1.5">
          {["2s", "3s", "4s", "5s", "6s", "8s"].map(d => (
            <button key={d} onClick={() => setDuration(d)}
              className={cn("px-2.5 py-1 rounded-md text-xs font-medium transition-all", duration === d ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Actors in Scene</Label>
          {connectedActors.length > 0 && (
            <span className="text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">from connected cast</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {availableActors.map(actor => {
            const isIn = selectedActors.includes(actor.id);
            return (
              <button key={actor.id} onClick={() => toggleActor(actor.id)}
                className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs transition-all",
                  isIn ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/60")}>
                <img src={actor.portrait} alt={actor.name} className="w-5 h-5 rounded-full object-cover" />
                <span>{actor.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      <div className="flex gap-2">
        <Button size="sm" className="flex-1 gap-1.5" onClick={save}><Check className="w-3.5 h-3.5" /> Save</Button>
        <Button size="sm" variant="outline" className="gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Generate</Button>
      </div>
      <button onClick={onDelete} className="w-full flex items-center justify-center gap-1.5 text-xs text-destructive hover:text-destructive/80 py-2 transition-colors">
        <Trash2 className="w-3 h-3" /> Delete Shot
      </button>
    </div>
  );
}

// CastDrawer is now replaced by CharacterDetailsPanel (imported)

function LocationDrawer({ locationName, frames }: { locationName: string; frames: FrameData[] }) {
  const img = locationImages[locationName];
  const appearances = frames.filter(f => f.location === locationName);
  return (
    <div className="space-y-4">
      {img && <div className="rounded-xl overflow-hidden border border-border"><img src={img} alt={locationName} className="w-full object-cover max-h-[200px]" /></div>}
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

function ZoneDrawer({ zone, castNodes, locationNodes, frames }: {
  zone: Zone; castNodes: CastNode[]; locationNodes: LocationNode[]; frames: FrameData[];
}) {
  const castCount = castNodes.filter(n => n.zoneId === zone.id).length;
  const locCount = locationNodes.filter(n => n.zoneId === zone.id).length;
  const frameCount = frames.filter(f => f.zoneId === zone.id).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `hsl(${zone.color} / 0.15)` }}>
          {zone.type === "casting" && <Users className="w-5 h-5" style={{ color: `hsl(${zone.color})` }} />}
          {zone.type === "shots" && <Camera className="w-5 h-5" style={{ color: `hsl(${zone.color})` }} />}
          {zone.type === "locations" && <MapPin className="w-5 h-5" style={{ color: `hsl(${zone.color})` }} />}
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">{zone.label}</h3>
          <p className="text-xs text-muted-foreground">
            {zone.type === "casting" && `${castCount} cast member${castCount !== 1 ? "s" : ""}`}
            {zone.type === "shots" && `${frameCount} shot${frameCount !== 1 ? "s" : ""}`}
            {zone.type === "locations" && `${locCount} location${locCount !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>
      <Separator />
      <p className="text-sm text-muted-foreground">
        {zone.type === "casting" && "Connect this zone to a Shots zone to make these actors available in those shots."}
        {zone.type === "shots" && "Connect a Casting zone here to pull actors. Connect a Locations zone to assign locations."}
        {zone.type === "locations" && "Connect this zone to a Shots zone to make these locations available."}
      </p>
      <p className="text-[10px] text-muted-foreground/60">Right-click inside the zone to add items. Drag the zone label to reposition.</p>
    </div>
  );
}

// ─── Main Canvas ────────────────────────────────────────────
export default function ProductionCanvasPage() {
  const { projectId } = useParams();
  const containerRef = useRef<HTMLDivElement>(null);

  const [actors, setActors] = useState<Actor[]>(actorRoster);
  const [zones, setZones] = useState<Zone[]>(initialZones);
  const [frames, setFrames] = useState<FrameData[]>(initialFrames);
  const [castNodes, setCastNodes] = useState<CastNode[]>(initialCastNodes);
  const [locationNodes, setLocationNodes] = useState<LocationNode[]>(initialLocationNodes);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<Tool>("select");
  const [dragging, setDragging] = useState<string | null>(null);
  const [draggingZone, setDraggingZone] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoneDragStart, setZoneDragStart] = useState<{ x: number; y: number } | null>(null);
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState<SelectedItem>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [connectingMouse, setConnectingMouse] = useState({ x: 0, y: 0 });
  const [canvasMenu, setCanvasMenu] = useState<{ x: number; y: number; worldX: number; worldY: number; zoneId?: string } | null>(null);
  const [castPickerPos, setCastPickerPos] = useState<{ x: number; y: number; worldX: number; worldY: number; zoneId: string } | null>(null);
  const [locationPickerPos, setLocationPickerPos] = useState<{ x: number; y: number; worldX: number; worldY: number; zoneId: string } | null>(null);

  // Compute zone bounds
  const zoneBounds = useMemo(() => {
    const map: Record<string, { x: number; y: number; w: number; h: number }> = {};
    zones.forEach(z => { map[z.id] = computeZoneBounds(z, frames, castNodes, locationNodes); });
    return map;
  }, [zones, frames, castNodes, locationNodes]);

  // Get actors connected to a shots zone via zone connections
  const getConnectedActors = useCallback((shotsZoneId: string): Actor[] => {
    const castingZoneIds = connections
      .filter(c => c.to === shotsZoneId && zones.find(z => z.id === c.from)?.type === "casting")
      .map(c => c.from);
    const actorIds = castNodes
      .filter(n => castingZoneIds.includes(n.zoneId))
      .map(n => n.actorId);
    return actors.filter(a => actorIds.includes(a.id));
  }, [connections, zones, castNodes]);

  // Find which zone a world coordinate falls in
  const findZoneAt = useCallback((wx: number, wy: number): string | undefined => {
    for (const z of zones) {
      const b = zoneBounds[z.id];
      if (b && wx >= b.x && wx <= b.x + b.w && wy >= b.y && wy <= b.y + b.h) return z.id;
    }
    return undefined;
  }, [zones, zoneBounds]);

  // Pan/Zoom
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
      setConnectingMouse({ x: (e.clientX - rect.left - pan.x) / zoom, y: (e.clientY - rect.top - pan.y) / zoom });
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
      setFrames(prev => prev.map(f => f.zoneId === draggingZone ? { ...f, x: f.x + dx, y: f.y + dy } : f));
      setCastNodes(prev => prev.map(n => n.zoneId === draggingZone ? { ...n, x: n.x + dx, y: n.y + dy } : n));
      setLocationNodes(prev => prev.map(n => n.zoneId === draggingZone ? { ...n, x: n.x + dx, y: n.y + dy } : n));
    }
    if (dragging) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left - pan.x) / zoom - dragOffset.x;
      const y = (e.clientY - rect.top - pan.y) / zoom - dragOffset.y;
      setFrames(prev => prev.map(f => f.id === dragging ? { ...f, x, y } : f));
      setCastNodes(prev => prev.map(n => n.id === dragging ? { ...n, x, y } : n));
      setLocationNodes(prev => prev.map(n => n.id === dragging ? { ...n, x, y } : n));
    }
  }, [panning, panStart, dragging, dragOffset, pan, zoom, connectingFrom, draggingZone, zoneDragStart]);

  const handleMouseUp = useCallback(() => {
    setPanning(false);
    setDragging(null);
    setDraggingZone(null);
    setZoneDragStart(null);
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
    // Check if it's a zone
    const zb = zoneBounds[nodeId];
    if (zb) return { x: side === "right" ? zb.x + zb.w : zb.x, y: zb.y + zb.h / 2 };
    const f = frames.find(fr => fr.id === nodeId);
    if (f) return { x: side === "right" ? f.x + FRAME_W : f.x, y: f.y + PORT_Y };
    const cn = castNodes.find(n => n.id === nodeId);
    if (cn) return { x: side === "right" ? cn.x + CAST_W : cn.x, y: cn.y + CAST_H / 2 };
    const ln = locationNodes.find(n => n.id === nodeId);
    if (ln) return { x: side === "right" ? ln.x + LOC_W : ln.x, y: ln.y + LOC_H / 2 };
    return { x: 0, y: 0 };
  }, [frames, castNodes, locationNodes, zoneBounds]);

  const connectors = connections.map(c => {
    const p1 = getPortPos(c.from, "right");
    const p2 = getPortPos(c.to, "left");
    const isZoneConn = zones.some(z => z.id === c.from) || zones.some(z => z.id === c.to);
    return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, from: c.from, to: c.to, isZoneConn };
  });

  const fitToScreen = useCallback(() => {
    if (!containerRef.current) return;
    const allBounds = Object.values(zoneBounds);
    if (allBounds.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const minX = Math.min(...allBounds.map(b => b.x));
    const minY = Math.min(...allBounds.map(b => b.y));
    const maxX = Math.max(...allBounds.map(b => b.x + b.w));
    const maxY = Math.max(...allBounds.map(b => b.y + b.h));
    const cw = maxX - minX + 120;
    const ch = maxY - minY + 120;
    const drawWidth = selected ? rect.width - DRAWER_W : rect.width;
    const nz = Math.min(drawWidth / cw, rect.height / ch, 1.2);
    setZoom(nz);
    setPan({ x: (drawWidth - cw * nz) / 2 - minX * nz + 60 * nz, y: (rect.height - ch * nz) / 2 - minY * nz + 60 * nz });
  }, [zoneBounds, selected]);

  const addFrame = useCallback((x?: number, y?: number, zoneId?: string) => {
    const targetZone = zoneId || zones.find(z => z.type === "shots")?.id || "z-shots";
    const zb = zoneBounds[targetZone];
    const id = `f${Date.now()}`;
    const last = frames.filter(f => f.zoneId === targetZone);
    const lastF = last[last.length - 1];
    setFrames(prev => [...prev, {
      id, x: x ?? (lastF ? lastF.x + 300 : (zb ? zb.x + ZONE_PAD : 80)),
      y: y ?? (lastF ? lastF.y : (zb ? zb.y + ZONE_PAD + ZONE_LABEL_H : 80)),
      image: "", scene: `SC ${Math.ceil((frames.length + 1) / 2)}`, shot: "WIDE",
      description: "New frame", duration: "3s", actors: [], zoneId: targetZone,
    }]);
    setSelected({ type: "frame", id });
  }, [frames, zones, zoneBounds]);

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

  // Resolve selected
  const selectedFrame = selected?.type === "frame" ? frames.find(f => f.id === selected.id) : null;
  const selectedCast = selected?.type === "cast" ? castNodes.find(n => n.id === selected.id) : null;
  const selectedLocation = selected?.type === "location" ? locationNodes.find(n => n.id === selected.id) : null;
  const selectedZone = selected?.type === "zone" ? zones.find(z => z.id === selected.id) : null;
  const selectedActor = selectedCast ? actors.find(a => a.id === selectedCast.actorId) : null;

  const connectedActorsForFrame = selectedFrame ? getConnectedActors(selectedFrame.zoneId) : [];

  const drawerTitle = selectedFrame ? "Shot Settings" : selectedActor ? "Cast Details" : selectedLocation ? "Location" : selectedZone ? selectedZone.label : null;
  const showDrawer = !!selected;

  return (
    <div className="h-screen w-full relative bg-background overflow-hidden flex">
      <div className="flex-1 relative">
        {/* Back button */}
        <Link to={`/project/${projectId}/storyboard`}
          className="absolute top-3 left-3 z-30 flex items-center gap-2 px-3 py-2 rounded-xl bg-card/90 backdrop-blur-md border border-border shadow-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /><span className="text-xs">Back to Pipeline</span>
        </Link>

        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 rounded-xl bg-card/90 backdrop-blur-md border border-border shadow-lg">
          <Film className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">Production Canvas</span>
          <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Beta</span>
        </div>

        {/* Floating toolbar */}
        <div className="absolute top-1/2 -translate-y-1/2 left-4 z-20 flex flex-col items-center gap-1 p-1.5 rounded-2xl bg-card/90 backdrop-blur-md border border-border shadow-2xl">
          <button onClick={() => addFrame()} className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors" title="Add Shot"><Plus className="w-4 h-4" /></button>
          <div className="w-6 h-px bg-border my-0.5" />
          <button onClick={() => setTool("select")} className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-colors", tool === "select" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60")} title="Select"><MousePointer className="w-4 h-4" /></button>
          <button onClick={() => setTool("hand")} className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-colors", tool === "hand" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60")} title="Pan (Space)"><Hand className="w-4 h-4" /></button>
          <div className="w-6 h-px bg-border my-0.5" />
          <button onClick={fitToScreen} className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors" title="Fit to screen"><Maximize className="w-4 h-4" /></button>
        </div>

        {/* Zoom */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 px-2 py-1 rounded-lg bg-card/90 backdrop-blur-sm border border-border text-xs text-muted-foreground">
          <button onClick={() => setZoom(z => Math.max(0.15, z - 0.1))} className="p-0.5 hover:text-foreground"><ZoomOut className="w-3.5 h-3.5" /></button>
          <span className="min-w-[3ch] text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-0.5 hover:text-foreground"><ZoomIn className="w-3.5 h-3.5" /></button>
        </div>

        {/* Canvas */}
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
            const zoneId = findZoneAt(worldX, worldY);
            setCanvasMenu({ x: e.clientX - rect.left, y: e.clientY - rect.top, worldX, worldY, zoneId });
          }}
          onWheel={handleWheel}
          onMouseDown={(e) => { setCanvasMenu(null); setCastPickerPos(null); setLocationPickerPos(null); handleMouseDown(e); }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Dot grid */}
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--foreground) / 0.12) 1px, transparent 1px)`,
            backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
            backgroundPosition: `${pan.x % (32 * zoom)}px ${pan.y % (32 * zoom)}px`,
          }} />

          {/* Transform layer */}
          <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0" }}>

            {/* Zone backgrounds */}
            {zones.map(zone => {
              const b = zoneBounds[zone.id];
              if (!b) return null;
              const isSelected = selected?.type === "zone" && selected.id === zone.id;
              return (
                <div
                  key={zone.id}
                  className="absolute"
                  style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
                >
                  {/* Dashed border */}
                  <div
                    className={cn("absolute inset-0 rounded-2xl border-2 border-dashed transition-colors", isSelected && "border-opacity-80")}
                    style={{ borderColor: `hsl(${zone.color} / ${isSelected ? 0.6 : 0.25})`, background: `hsl(${zone.color} / 0.03)` }}
                  />
                  {/* Label */}
                  <div
                    className="absolute -top-8 left-4 px-3 py-1 cursor-grab active:cursor-grabbing select-none"
                    onMouseDown={(e) => {
                      if (e.button !== 0) return;
                      e.stopPropagation();
                      setSelected({ type: "zone", id: zone.id });
                      setDraggingZone(zone.id);
                      const rect = containerRef.current?.getBoundingClientRect();
                      if (!rect) return;
                      setZoneDragStart({ x: (e.clientX - rect.left - pan.x) / zoom, y: (e.clientY - rect.top - pan.y) / zoom });
                    }}
                  >
                    <span className="text-lg font-bold" style={{ color: `hsl(${zone.color} / 0.7)` }}>{zone.label}</span>
                  </div>
                  {/* Zone port — right side */}
                  <div
                    className="absolute -right-[10px] top-1/2 -translate-y-1/2 z-20 w-[20px] h-[20px] rounded-full border-[2.5px] bg-card hover:scale-110 transition-all cursor-crosshair"
                    style={{ borderColor: `hsl(${zone.color} / 0.5)` }}
                    onMouseDown={(e) => { e.stopPropagation(); startConnect(e, zone.id); }}
                    onMouseUp={(e) => { e.stopPropagation(); endConnect(zone.id); }}
                  />
                  {/* Zone port — left side */}
                  <div
                    className="absolute -left-[10px] top-1/2 -translate-y-1/2 z-20 w-[20px] h-[20px] rounded-full border-[2.5px] bg-card hover:scale-110 transition-all cursor-crosshair"
                    style={{ borderColor: `hsl(${zone.color} / 0.5)` }}
                    onMouseUp={(e) => { e.stopPropagation(); endConnect(zone.id); }}
                    onMouseDown={(e) => { e.stopPropagation(); startConnect(e, zone.id); }}
                  />
                </div>
              );
            })}

            {/* Connection lines */}
            <svg className="absolute inset-0 w-[5000px] h-[5000px]" style={{ pointerEvents: "none" }}>
              {connectors.map(c => {
                const dx = Math.abs(c.x2 - c.x1);
                const curve = Math.min(200, Math.max(30, dx * 0.35));
                return (
                  <g key={`${c.from}-${c.to}`} style={{ pointerEvents: "auto", cursor: "pointer" }}
                    onClick={() => setConnections(prev => prev.filter(cc => !(cc.from === c.from && cc.to === c.to)))}>
                    <path d={`M ${c.x1} ${c.y1} C ${c.x1 + curve} ${c.y1}, ${c.x2 - curve} ${c.y2}, ${c.x2} ${c.y2}`} stroke="transparent" strokeWidth="16" fill="none" />
                    <path d={`M ${c.x1} ${c.y1} C ${c.x1 + curve} ${c.y1}, ${c.x2 - curve} ${c.y2}, ${c.x2} ${c.y2}`}
                      stroke={c.isZoneConn ? "hsl(var(--muted-foreground))" : "hsl(var(--primary))"}
                      strokeOpacity={c.isZoneConn ? 0.4 : 0.4}
                      strokeWidth={c.isZoneConn ? 3 : 2.5}
                      strokeLinecap="round"
                      fill="none" />
                  </g>
                );
              })}
              {connectingFrom && (() => {
                const p = getPortPos(connectingFrom, "right");
                const dx = Math.abs(connectingMouse.x - p.x);
                const curve = Math.min(200, Math.max(30, dx * 0.35));
                return <path d={`M ${p.x} ${p.y} C ${p.x + curve} ${p.y}, ${connectingMouse.x - curve} ${connectingMouse.y}, ${connectingMouse.x} ${connectingMouse.y}`} stroke="hsl(var(--primary))" strokeOpacity="0.7" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="8 6" fill="none" />;
              })()}
            </svg>

            {/* Shot frames */}
            {frames.map((frame, idx) => (
              <div key={frame.id} data-node
                className={cn("absolute rounded-xl border-2 bg-card select-none group transition-shadow",
                  selected?.id === frame.id ? "border-primary shadow-lg shadow-primary/20" : "border-border hover:border-muted-foreground/40")}
                style={{ left: frame.x, top: frame.y, width: FRAME_W }}
                onMouseDown={(e) => startDrag(e, frame, { type: "frame", id: frame.id })}>
                <div className="absolute -left-[8px] z-20 w-[16px] h-[16px] rounded-full border-2 border-primary/50 bg-card hover:bg-primary hover:border-primary transition-all cursor-crosshair" style={{ top: PORT_Y - 8 }}
                  onMouseUp={(e) => { e.stopPropagation(); endConnect(frame.id); }} onMouseDown={(e) => { e.stopPropagation(); startConnect(e, frame.id); }} />
                <div className="absolute -right-[8px] z-20 w-[16px] h-[16px] rounded-full border-2 border-primary/50 bg-card hover:bg-primary hover:border-primary transition-all cursor-crosshair" style={{ top: PORT_Y - 8 }}
                  onMouseDown={(e) => { e.stopPropagation(); startConnect(e, frame.id); }} onMouseUp={(e) => { e.stopPropagation(); endConnect(frame.id); }} />
                <div className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">{idx + 1}</div>
                <div className="absolute top-2 right-2 z-10 bg-primary/90 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">{frame.shot}</div>
                <div className="w-full bg-secondary overflow-hidden rounded-t-[10px]" style={{ height: IMAGE_H }}>
                  {frame.image ? <img src={frame.image} alt={frame.description} className="w-full h-full object-cover" draggable={false} />
                    : <div className="w-full h-full flex items-center justify-center text-muted-foreground/30"><Plus className="w-8 h-8" /></div>}
                </div>
                <div className="p-2.5 space-y-1 rounded-b-[10px]" onMouseDown={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-primary">{frame.scene}</span>
                    <span className="text-[10px] text-muted-foreground">{frame.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TooltipProvider delayDuration={200}>
                      {frame.actors.map(aid => {
                        const a = actors.find(ac => ac.id === aid);
                        if (!a) return null;
                        return (
                          <Tooltip key={a.id}><TooltipTrigger asChild>
                            <div className="w-5 h-5 rounded-full overflow-hidden border border-border"><img src={a.portrait} alt={a.name} className="w-full h-full object-cover" draggable={false} /></div>
                          </TooltipTrigger><TooltipContent side="bottom" className="text-xs">{a.name}</TooltipContent></Tooltip>
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
              const actor = actors.find(a => a.id === node.actorId);
              if (!actor) return null;
              const sceneCount = frames.filter(f => f.actors.includes(node.actorId)).length;
              return (
                <div key={node.id} data-node
                  className={cn("absolute rounded-xl border-2 bg-card overflow-hidden select-none group cursor-grab",
                    selected?.id === node.id ? "border-cyan-500 shadow-lg shadow-cyan-500/20" : "border-border hover:border-muted-foreground/40")}
                  style={{ left: node.x, top: node.y, width: CAST_W }}
                  onMouseDown={(e) => startDrag(e, node, { type: "cast", id: node.id })}>
                  <div className="absolute top-2 left-2 z-10 bg-cyan-500/20 backdrop-blur-sm text-cyan-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md">{sceneCount} shots</div>
                  <button className="absolute top-2 right-2 z-10 bg-background/70 text-foreground/70 hover:text-destructive w-5 h-5 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-all"
                    onMouseDown={e => e.stopPropagation()}
                    onClick={() => { setCastNodes(prev => prev.filter(n => n.id !== node.id)); if (selected?.id === node.id) setSelected(null); }}>
                    <X className="w-3 h-3" />
                  </button>
                  <img src={actor.portrait} alt={actor.name} className="w-full aspect-[3/4] object-cover" draggable={false} />
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
                <div key={node.id} data-node
                  className={cn("absolute rounded-xl border-2 bg-card overflow-hidden select-none group cursor-grab",
                    selected?.id === node.id ? "border-emerald-500 shadow-lg shadow-emerald-500/20" : "border-border hover:border-muted-foreground/40")}
                  style={{ left: node.x, top: node.y, width: LOC_W }}
                  onMouseDown={(e) => startDrag(e, node, { type: "location", id: node.id })}>
                  <div className="absolute top-2 left-2 z-10 bg-emerald-500/20 backdrop-blur-sm text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md">{shotCount} shots</div>
                  <button className="absolute top-2 right-2 z-10 bg-background/70 text-foreground/70 hover:text-destructive w-5 h-5 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-all"
                    onMouseDown={e => e.stopPropagation()}
                    onClick={() => { setLocationNodes(prev => prev.filter(n => n.id !== node.id)); if (selected?.id === node.id) setSelected(null); }}>
                    <X className="w-3 h-3" />
                  </button>
                  <img src={img} alt={node.locationName} className="w-full aspect-video object-cover" draggable={false} />
                  <div className="p-2"><p className="text-xs font-bold text-foreground">{node.locationName}</p></div>
                </div>
              );
            })}
          </div>

          {/* Context menu */}
          {canvasMenu && (() => {
            const zone = canvasMenu.zoneId ? zones.find(z => z.id === canvasMenu.zoneId) : null;
            return (
              <div className="absolute z-50 min-w-[200px] bg-popover border border-border rounded-lg shadow-xl py-1 text-sm" style={{ left: canvasMenu.x, top: canvasMenu.y }} onMouseDown={e => e.stopPropagation()}>
                {zone && (
                  <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">{zone.label} Zone</p>
                )}
                {(!zone || zone.type === "shots") && (
                  <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-secondary/60 text-foreground" onClick={() => {
                    addFrame(canvasMenu.worldX, canvasMenu.worldY, canvasMenu.zoneId || undefined);
                    setCanvasMenu(null);
                  }}><Camera className="w-4 h-4" /> Add Shot</button>
                )}
                {(!zone || zone.type === "casting") && (
                  <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-secondary/60 text-foreground" onClick={() => {
                    const targetZone = canvasMenu.zoneId || zones.find(z => z.type === "casting")?.id || "z-casting";
                    setCastPickerPos({ x: canvasMenu.x, y: canvasMenu.y, worldX: canvasMenu.worldX, worldY: canvasMenu.worldY, zoneId: targetZone });
                    setCanvasMenu(null);
                  }}><Users className="w-4 h-4" /> Add Cast Member</button>
                )}
                {(!zone || zone.type === "locations") && (
                  <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-secondary/60 text-foreground" onClick={() => {
                    const targetZone = canvasMenu.zoneId || zones.find(z => z.type === "locations")?.id || "z-locations";
                    setLocationPickerPos({ x: canvasMenu.x, y: canvasMenu.y, worldX: canvasMenu.worldX, worldY: canvasMenu.worldY, zoneId: targetZone });
                    setCanvasMenu(null);
                  }}><MapPin className="w-4 h-4" /> Add Location</button>
                )}
                <div className="h-px bg-border my-1" />
                <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-secondary/60 text-foreground" onClick={() => { fitToScreen(); setCanvasMenu(null); }}>
                  <Maximize className="w-4 h-4" /> Fit to Screen
                </button>
              </div>
            );
          })()}

          {/* Cast Picker */}
          {castPickerPos && (
            <div className="absolute z-50 min-w-[200px] bg-popover border border-border rounded-lg shadow-xl py-1 text-sm" style={{ left: castPickerPos.x, top: castPickerPos.y }} onMouseDown={e => e.stopPropagation()}>
              <p className="px-3 py-1.5 text-xs text-muted-foreground uppercase tracking-wider">Choose Actor</p>
              {actors.map(actor => (
                <button key={actor.id} className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-secondary/60 text-foreground" onMouseDown={e => e.stopPropagation()}
                  onClick={() => {
                    setCastNodes(prev => [...prev, { id: `cn-${Date.now()}`, actorId: actor.id, x: castPickerPos.worldX - CAST_W / 2, y: castPickerPos.worldY, zoneId: castPickerPos.zoneId }]);
                    setCastPickerPos(null);
                  }}>
                  <img src={actor.portrait} alt={actor.name} className="w-7 h-7 rounded-full object-cover" />
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
                  onClick={() => {
                    setLocationNodes(prev => [...prev, { id: `ln-${Date.now()}`, locationName: name, x: locationPickerPos.worldX - LOC_W / 2, y: locationPickerPos.worldY, zoneId: locationPickerPos.zoneId }]);
                    setLocationPickerPos(null);
                  }}>
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
        <div className="absolute bottom-4 w-[140px] h-[90px] bg-card/90 backdrop-blur-sm border border-border rounded-lg overflow-hidden z-20" style={{ right: showDrawer ? DRAWER_W + 16 : 16 }}>
          <svg className="w-full h-full" viewBox="-600 -100 2200 900">
            {zones.map(z => {
              const b = zoneBounds[z.id];
              if (!b) return null;
              return <rect key={z.id} x={b.x} y={b.y} width={b.w} height={b.h} rx={8} fill="none" stroke={`hsl(${z.color})`} strokeOpacity={0.2} strokeWidth={3} strokeDasharray="8 6" />;
            })}
            {frames.map(f => <rect key={f.id} x={f.x} y={f.y} width={FRAME_W} height={FRAME_H} rx={4} fill={selected?.id === f.id ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} fillOpacity={selected?.id === f.id ? 0.6 : 0.2} />)}
            {castNodes.map(n => <rect key={n.id} x={n.x} y={n.y} width={CAST_W} height={CAST_H} rx={4} fill="hsl(190 80% 50%)" fillOpacity={0.3} />)}
            {locationNodes.map(n => <rect key={n.id} x={n.x} y={n.y} width={LOC_W} height={LOC_H} rx={4} fill="hsl(150 60% 45%)" fillOpacity={0.3} />)}
          </svg>
        </div>
      </div>

      {/* Context-sensitive drawer */}
      <AnimatePresence>
      {showDrawer && (
        <motion.div
          initial={{ x: DRAWER_W, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: DRAWER_W, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="h-full border-l border-border bg-card flex flex-col z-50 relative shrink-0"
          style={{ width: DRAWER_W }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              {selectedFrame && <Camera className="w-4 h-4 text-primary" />}
              {selectedActor && <User className="w-4 h-4 text-cyan-500" />}
              {selectedLocation && <MapPin className="w-4 h-4 text-emerald-500" />}
              {selectedZone && (
                selectedZone.type === "casting" ? <Users className="w-4 h-4 text-cyan-500" /> :
                selectedZone.type === "shots" ? <Camera className="w-4 h-4 text-primary" /> :
                <MapPin className="w-4 h-4 text-emerald-500" />
              )}
              <h2 className="text-sm font-bold text-foreground">{drawerTitle}</h2>
            </div>
            <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {selectedFrame && (
              <ShotDrawer frame={selectedFrame} actors={actors} connectedActors={connectedActorsForFrame}
                onUpdate={(updated) => setFrames(prev => prev.map(f => f.id === updated.id ? updated : f))}
                onDelete={() => { setFrames(prev => prev.filter(f => f.id !== selectedFrame.id)); setConnections(prev => prev.filter(c => c.from !== selectedFrame.id && c.to !== selectedFrame.id)); setSelected(null); }} />
            )}
            {selectedActor && (
              <CharacterDetailsPanel
                character={selectedActor}
                onChange={(updated) => setActors(prev => prev.map(a => a.id === updated.id ? updated : a))}
                onDelete={() => {
                  setCastNodes(prev => prev.filter(n => n.actorId !== selectedActor.id));
                  setSelected(null);
                }}
                appearances={frames.filter(f => f.actors.includes(selectedActor.id)).map(f => ({
                  id: f.id, scene: f.scene, shot: f.shot, description: f.description, image: f.image,
                }))}
              />
            )}
            {selectedLocation && <LocationDrawer locationName={selectedLocation.locationName} frames={frames} />}
            {selectedZone && <ZoneDrawer zone={selectedZone} castNodes={castNodes} locationNodes={locationNodes} frames={frames} />}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}