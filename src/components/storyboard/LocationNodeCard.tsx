import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { LOC_W } from "./constants";

interface LocationNodeCardProps {
  node: { id: string; locationName: string; x: number; y: number };
  image: string;
  sceneCount: number;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onPortRightMouseDown: (e: React.MouseEvent) => void;
  onPortLeftMouseUp: (e: React.MouseEvent) => void;
  onDelete: () => void;
}

export function LocationNodeCard({
  node, image, sceneCount, isSelected,
  onMouseDown, onPortRightMouseDown, onPortLeftMouseUp, onDelete,
}: LocationNodeCardProps) {
  return (
    <div
      data-frame
      className={cn(
        "absolute rounded-xl border-2 bg-card overflow-hidden select-none group cursor-grab",
        isSelected ? "border-primary shadow-lg shadow-primary/20" : "border-border hover:border-muted-foreground/40",
      )}
      style={{ left: node.x, top: node.y, width: LOC_W }}
      onMouseDown={onMouseDown}
    >
      <div
        className="absolute -right-[9px] top-1/2 -translate-y-1/2 z-20 w-[18px] h-[18px] rounded-full border-[2.5px] border-emerald-500/60 bg-card hover:bg-emerald-500 hover:border-emerald-500 hover:scale-110 transition-all cursor-crosshair shadow-md"
        onMouseDown={onPortRightMouseDown}
      />
      <div
        className="absolute -left-[9px] top-1/2 -translate-y-1/2 z-20 w-[18px] h-[18px] rounded-full border-[2.5px] border-emerald-500/60 bg-card hover:bg-emerald-500 hover:border-emerald-500 hover:scale-110 transition-all cursor-crosshair shadow-md"
        onMouseUp={onPortLeftMouseUp}
        onMouseDown={(e) => e.stopPropagation()}
      />
      <div className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">
        {sceneCount} shots
      </div>
      <button
        className="absolute top-2 right-2 z-10 bg-background/70 backdrop-blur-sm text-foreground/70 hover:text-destructive hover:bg-background/90 w-5 h-5 flex items-center justify-center rounded-md transition-colors opacity-0 group-hover:opacity-100"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={onDelete}
      >
        <X className="w-3 h-3" />
      </button>
      <img src={image} alt={node.locationName} className="w-full aspect-video object-cover" draggable={false} />
      <div className="p-2.5">
        <p className="text-sm font-bold text-foreground">{node.locationName}</p>
      </div>
    </div>
  );
}
