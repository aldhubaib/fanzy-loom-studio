import { Plus, Users, MapPin, Grid3X3, Maximize, MousePointer } from "lucide-react";

interface CanvasContextMenuProps {
  position: { x: number; y: number };
  onAddFrame: () => void;
  onAddCast: () => void;
  onAddLocation: () => void;
  onAutoLayout: () => void;
  onFitToScreen: () => void;
  onSelectAll: () => void;
  onClose: () => void;
}

export function CanvasContextMenu({
  position, onAddFrame, onAddCast, onAddLocation, onAutoLayout, onFitToScreen, onSelectAll, onClose,
}: CanvasContextMenuProps) {
  const item = "flex items-center gap-2 w-full px-3 py-1.5 hover:bg-secondary/60 transition-colors text-foreground";

  return (
    <div
      className="absolute z-50 min-w-[180px] bg-popover border border-border rounded-lg shadow-xl py-1 text-sm"
      style={{ left: position.x, top: position.y }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button className={item} onClick={onAddFrame}>
        <Plus className="w-4 h-4" /> Add New Frame
      </button>
      <button className={item} onClick={onAddCast}>
        <Users className="w-4 h-4" /> Add Cast Member
      </button>
      <button className={item} onClick={onAddLocation}>
        <MapPin className="w-4 h-4" /> Add Location
      </button>
      <div className="h-px bg-border my-1" />
      <button className={item} onClick={onAutoLayout}>
        <Grid3X3 className="w-4 h-4" /> Auto Layout
      </button>
      <button className={item} onClick={onFitToScreen}>
        <Maximize className="w-4 h-4" /> Fit to Screen
      </button>
      <div className="h-px bg-border my-1" />
      <button className={item} onClick={onSelectAll}>
        <MousePointer className="w-4 h-4" /> Select All
      </button>
    </div>
  );
}
