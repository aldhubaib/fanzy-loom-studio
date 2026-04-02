import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, User, MapPin, FileText, Users, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import type {
  Actor, FrameData, CastNode, LocationNode, ScriptNode, Zone, SelectedItem,
} from "../types";
import { DRAWER_W } from "../constants";
import { ShotDrawer } from "./ShotDrawer";
import { LocationDrawer } from "./LocationDrawer";
import { ZoneDrawer } from "./ZoneDrawer";
import { CharacterDetailsPanel } from "./CharacterDetailsPanel";

interface CanvasDrawerProps {
  selected: SelectedItem;
  frames: FrameData[];
  actors: Actor[];
  castNodes: CastNode[];
  locationNodes: LocationNode[];
  scriptNodes: ScriptNode[];
  zones: Zone[];
  connectedActorsForFrame: Actor[];
  onClose: () => void;
  onUpdateFrame: (f: FrameData) => void;
  onDeleteFrame: (id: string) => void;
  onUpdateActor: (a: Actor) => void;
  onDeleteCastNode: (actorId: string) => void;
  onUpdateScriptNode: (id: string, updates: Partial<ScriptNode>) => void;
  onDeleteScriptNode: (id: string) => void;
  onDeleteConnection: (from: string, to: string) => void;
}

export const CanvasDrawer = memo(function CanvasDrawer({
  selected, frames, actors, castNodes, locationNodes, scriptNodes, zones,
  connectedActorsForFrame, onClose,
  onUpdateFrame, onDeleteFrame, onUpdateActor, onDeleteCastNode,
  onUpdateScriptNode, onDeleteScriptNode, onDeleteConnection,
}: CanvasDrawerProps) {
  const selectedFrame = selected?.type === "frame" ? frames.find((f) => f.id === selected.id) : null;
  const selectedCast = selected?.type === "cast" ? castNodes.find((n) => n.id === selected.id) : null;
  const selectedLocation = selected?.type === "location" ? locationNodes.find((n) => n.id === selected.id) : null;
  const selectedScript = selected?.type === "script" ? scriptNodes.find((n) => n.id === selected.id) : null;
  const selectedZone = selected?.type === "zone" ? zones.find((z) => z.id === selected.id) : null;
  const selectedActor = selectedCast ? actors.find((a) => a.id === selectedCast.actorId) : null;

  const showDrawer = !!selected;

  const drawerTitle = selectedFrame
    ? "Shot Settings"
    : selectedActor
      ? "Cast Details"
      : selectedLocation
        ? "Location"
        : selectedScript
          ? "Scene"
          : selectedZone
            ? selectedZone.label
            : null;

  return (
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
              {selectedScript && <FileText className="w-4 h-4 text-purple-400" />}
              {selectedZone && (
                selectedZone.type === "casting" ? <Users className="w-4 h-4 text-cyan-500" /> :
                selectedZone.type === "shots" ? <Camera className="w-4 h-4 text-primary" /> :
                selectedZone.type === "script" ? <FileText className="w-4 h-4 text-purple-400" /> :
                <MapPin className="w-4 h-4 text-emerald-500" />
              )}
              <h2 className="text-sm font-bold text-foreground">{drawerTitle}</h2>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {selectedFrame && (
              <ShotDrawer
                frame={selectedFrame}
                actors={actors}
                connectedActors={connectedActorsForFrame}
                onUpdate={onUpdateFrame}
                onDelete={() => onDeleteFrame(selectedFrame.id)}
              />
            )}
            {selectedActor && (
              <CharacterDetailsPanel
                character={selectedActor}
                onChange={onUpdateActor}
                onDelete={() => onDeleteCastNode(selectedActor.id)}
                appearances={frames
                  .filter((f) => f.actors.includes(selectedActor.id))
                  .map((f) => ({
                    id: f.id, scene: f.scene, shot: f.shot,
                    description: f.description, image: f.image,
                  }))}
              />
            )}
            {selectedLocation && (
              <LocationDrawer locationName={selectedLocation.locationName} frames={frames} />
            )}
            {selectedScript && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Scene Heading</Label>
                  <input
                    value={selectedScript.heading}
                    onChange={(e) => onUpdateScriptNode(selectedScript.id, { heading: e.target.value })}
                    className="w-full text-sm font-bold bg-secondary/50 border border-border rounded-lg px-3 py-2 mt-1 text-foreground outline-none focus:border-purple-500/50"
                  />
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground">Scene Description</Label>
                  <Textarea
                    value={selectedScript.body}
                    onChange={(e) => onUpdateScriptNode(selectedScript.id, { body: e.target.value })}
                    className="mt-1 min-h-[120px] text-sm"
                    placeholder="Describe what happens in this scene..."
                  />
                </div>
                <Separator />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => onDeleteScriptNode(selectedScript.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete Scene
                </Button>
              </div>
            )}
            {selectedZone && (
              <ZoneDrawer zone={selectedZone} castNodes={castNodes} locationNodes={locationNodes} frames={frames} />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});