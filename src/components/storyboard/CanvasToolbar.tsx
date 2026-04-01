import { cn } from "@/lib/utils";
import { Plus, MousePointer, Hand, Grid3X3, Maximize, MapPin } from "lucide-react";
import type { Tool } from "./types";

interface CanvasToolbarProps {
  tool: Tool;
  showLocations: boolean;
  onSetTool: (tool: Tool) => void;
  onAddFrame: () => void;
  onAutoLayout: () => void;
  onFitToScreen: () => void;
  onToggleLocations: () => void;
}

export function CanvasToolbar({
  tool, showLocations, onSetTool, onAddFrame, onAutoLayout, onFitToScreen, onToggleLocations,
}: CanvasToolbarProps) {
  const btn = (active: boolean) => cn(
    "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
  );
  const plain = "w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors";

  return (
    <div className="absolute top-1/2 -translate-y-1/2 left-4 z-20 flex flex-col items-center gap-1 p-1.5 rounded-2xl bg-card/90 backdrop-blur-md border border-border shadow-2xl">
      <button onClick={onAddFrame} className={plain} title="Add Frame">
        <Plus className="w-4 h-4" />
      </button>
      <div className="w-6 h-px bg-border my-0.5" />
      <button onClick={() => onSetTool("select")} className={btn(tool === "select")} title="Select (V)">
        <MousePointer className="w-4 h-4" />
      </button>
      <button onClick={() => onSetTool("hand")} className={btn(tool === "hand")} title="Pan (Space)">
        <Hand className="w-4 h-4" />
      </button>
      <div className="w-6 h-px bg-border my-0.5" />
      <button onClick={onAutoLayout} className={plain} title="Auto layout">
        <Grid3X3 className="w-4 h-4" />
      </button>
      <button onClick={onFitToScreen} className={plain} title="Fit to screen">
        <Maximize className="w-4 h-4" />
      </button>
      <div className="w-6 h-px bg-border my-0.5" />
      <button onClick={onToggleLocations} className={btn(showLocations)} title={showLocations ? "Showing locations" : "Showing shots"}>
        <MapPin className="w-4 h-4" />
      </button>
    </div>
  );
}
