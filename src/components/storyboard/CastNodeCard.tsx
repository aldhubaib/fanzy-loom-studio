import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import type { Actor, FrameData } from "./types";
import { CAST_W } from "./constants";

interface CastNodeCardProps {
  node: { id: string; actorId: string; x: number; y: number };
  actor: Actor;
  sceneCount: number;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onPortRightMouseDown: (e: React.MouseEvent) => void;
  onPortLeftMouseUp: (e: React.MouseEvent) => void;
  onDelete: () => void;
}

export function CastNodeCard({
  node, actor, sceneCount, isSelected,
  onMouseDown, onPortRightMouseDown, onPortLeftMouseUp, onDelete,
}: CastNodeCardProps) {
  return (
    <div
      data-frame
      className={cn(
        "absolute rounded-xl border-2 bg-card overflow-hidden select-none group cursor-grab",
        isSelected ? "border-primary shadow-lg shadow-primary/20" : "border-border hover:border-muted-foreground/40",
      )}
      style={{ left: node.x, top: node.y, width: CAST_W }}
      onMouseDown={onMouseDown}
    >
      <div
        className="absolute -right-[9px] top-1/2 -translate-y-1/2 z-20 w-[18px] h-[18px] rounded-full border-[2.5px] border-cyan-500/60 bg-card hover:bg-cyan-500 hover:border-cyan-500 hover:scale-110 transition-all cursor-crosshair shadow-md"
        onMouseDown={onPortRightMouseDown}
      />
      <div
        className="absolute -left-[9px] top-1/2 -translate-y-1/2 z-20 w-[18px] h-[18px] rounded-full border-[2.5px] border-cyan-500/60 bg-card hover:bg-cyan-500 hover:border-cyan-500 hover:scale-110 transition-all cursor-crosshair shadow-md"
        onMouseUp={onPortLeftMouseUp}
        onMouseDown={(e) => e.stopPropagation()}
      />
      <div className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">
        {sceneCount} scenes
      </div>
      <img src={actor.avatar} alt={actor.name} className="w-full aspect-[3/4] object-cover" draggable={false} />
      <div className="p-2.5">
        <p className="text-sm font-bold text-foreground">{actor.name}</p>
      </div>
    </div>
  );
}
