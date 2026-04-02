import { memo } from "react";
import { Camera, Users, MapPin, FileText, Film, Maximize, Trash2 } from "lucide-react";
import type { Zone, ZoneType, CanvasMenuState } from "../types";
import { ZONE_LABELS } from "../constants";

interface CanvasContextMenuProps {
  menu: CanvasMenuState;
  zones: Zone[];
  onAddFrame: () => void;
  onAddCastPicker: () => void;
  onAddLocationPicker: () => void;
  onAddScriptNode: () => void;
  onAddTimeline: () => void;
  onAddZone: (type: ZoneType) => void;
  onDeleteZone: (zoneId: string) => void;
  onFitToScreen: () => void;
  onClose: () => void;
}

const zoneTypeIcons: Record<ZoneType, React.ReactNode> = {
  casting: <Users className="w-4 h-4" />,
  shots: <Camera className="w-4 h-4" />,
  locations: <MapPin className="w-4 h-4" />,
  script: <FileText className="w-4 h-4" />,
  production: <Film className="w-4 h-4" />,
};

export const CanvasContextMenu = memo(function CanvasContextMenu({
  menu, zones, onAddFrame, onAddCastPicker, onAddLocationPicker,
  onAddScriptNode, onAddTimeline, onAddZone, onDeleteZone, onFitToScreen, onClose,
}: CanvasContextMenuProps) {
  const zone = menu.zoneId ? zones.find((z) => z.id === menu.zoneId) : null;

  return (
    <div
      className="absolute z-50 min-w-[200px] rounded-lg border border-border bg-popover py-1 text-sm shadow-xl"
      style={{ left: menu.x, top: menu.y }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {zone ? (
        <>
          <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            {zone.label} Zone
          </p>
          {zone.type === "shots" && (
            <button className="flex w-full items-center gap-2 px-3 py-1.5 text-foreground hover:bg-secondary/60" onClick={onAddFrame}>
              <Camera className="w-4 h-4" /> Add Shot
            </button>
          )}
          {zone.type === "casting" && (
            <button className="flex w-full items-center gap-2 px-3 py-1.5 text-foreground hover:bg-secondary/60" onClick={onAddCastPicker}>
              <Users className="w-4 h-4" /> Add Cast Member
            </button>
          )}
          {zone.type === "locations" && (
            <button className="flex w-full items-center gap-2 px-3 py-1.5 text-foreground hover:bg-secondary/60" onClick={onAddLocationPicker}>
              <MapPin className="w-4 h-4" /> Add Location
            </button>
          )}
          {zone.type === "script" && (
            <button className="flex w-full items-center gap-2 px-3 py-1.5 text-foreground hover:bg-secondary/60" onClick={onAddScriptNode}>
              <FileText className="w-4 h-4" /> Add Scene
            </button>
          )}
          {zone.type === "production" && (
            <button className="flex w-full items-center gap-2 px-3 py-1.5 text-foreground hover:bg-secondary/60" onClick={onAddTimeline}>
              <Film className="w-4 h-4" /> Add Timeline
            </button>
          )}
          <div className="my-1 h-px bg-border" />
          <button className="flex w-full items-center gap-2 px-3 py-1.5 text-destructive hover:bg-destructive/20" onClick={() => onDeleteZone(zone.id)}>
            <Trash2 className="w-4 h-4" /> Delete Zone
          </button>
        </>
      ) : (
        <>
          <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">Add Zone</p>
          {(["casting", "shots", "locations", "script", "production"] as ZoneType[]).map((type) => (
            <button
              key={type}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-foreground hover:bg-secondary/60"
              onClick={() => onAddZone(type)}
            >
              {zoneTypeIcons[type]} {ZONE_LABELS[type]} Zone
            </button>
          ))}
        </>
      )}
      <div className="my-1 h-px bg-border" />
      <button className="flex w-full items-center gap-2 px-3 py-1.5 text-foreground hover:bg-secondary/60" onClick={onFitToScreen}>
        <Maximize className="w-4 h-4" /> Fit to Screen
      </button>
    </div>
  );
});