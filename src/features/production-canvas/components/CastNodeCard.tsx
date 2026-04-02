import { memo } from "react";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Actor, CastNode } from "../types";
import { CAST_W } from "../constants";

interface CastNodeCardProps {
  node: CastNode;
  actor: Actor;
  sceneCount: number;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onSettingsClick: () => void;
  onDelete: () => void;
}

export const CastNodeCard = memo(function CastNodeCard({
  node, actor, sceneCount, isSelected,
  onMouseDown, onSettingsClick, onDelete,
}: CastNodeCardProps) {
  return (
    <div
      data-node
      className={cn(
        "absolute rounded-xl border-2 bg-card overflow-hidden select-none group cursor-grab",
        isSelected
          ? "border-cyan-500 shadow-lg shadow-cyan-500/20"
          : "border-border hover:border-muted-foreground/40",
      )}
      style={{ left: node.x, top: node.y, width: CAST_W }}
      onMouseDown={onMouseDown}
    >
      <div className="absolute top-2 left-2 z-10 bg-cyan-500/20 backdrop-blur-sm text-cyan-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
        {sceneCount} shots
      </div>
      <button
        className="absolute top-2 right-2 z-10 bg-background/70 text-foreground/70 hover:text-foreground w-5 h-5 flex items-center justify-center rounded-md transition-all"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onSettingsClick(); }}
        aria-label="Open cast settings"
        title="Open cast settings"
      >
        <Settings className="w-3 h-3" />
      </button>
      <img src={actor.portrait} alt={actor.name} className="w-full aspect-[3/4] object-cover" draggable={false} />
      <div className="p-2">
        <p className="text-xs font-bold text-foreground">{actor.name}</p>
        <p className="text-[10px] text-muted-foreground">{actor.role}</p>
      </div>
    </div>
  );
});