import { memo } from "react";
import { Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Actor, CastNode } from "../types";
import { CAST_W } from "../constants";

interface CastNodeCardProps {
  node: CastNode;
  actor: Actor;
  sceneCount: number;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onSettingsClick: () => void;
  onDelete: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
}

export const CastNodeCard = memo(function CastNodeCard({
  node, actor, sceneCount, isSelected, isFirst, isLast,
  onMouseDown, onSettingsClick, onDelete, onMoveLeft, onMoveRight,
}: CastNodeCardProps) {
  return (
    <div
      data-node
      className={cn(
        "absolute rounded-xl border-2 bg-card overflow-hidden select-none group",
        isSelected
          ? "border-cyan-500 shadow-lg shadow-cyan-500/20"
          : "border-border hover:border-cyan-500/40",
      )}
      style={{ left: node.x, top: node.y, width: CAST_W }}
      onMouseDown={onMouseDown}
    >
      <div className="absolute top-2 left-2 z-10 bg-cyan-500/20 backdrop-blur-sm text-cyan-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
        {sceneCount} shots
      </div>
      <button
        className="absolute top-2 right-2 z-10 bg-background/70 text-foreground/70 hover:text-foreground w-5 h-5 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-all"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onSettingsClick(); }}
        aria-label="Open cast settings"
      >
        <Settings className="w-3 h-3" />
      </button>
      <img src={actor.portrait} alt={actor.name} className="w-full aspect-[3/4] object-cover" draggable={false} />
      <div className="p-2 flex items-center justify-between">
        <p className="text-xs font-bold text-foreground truncate flex-1">{actor.name}</p>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isFirst && (
            <button
              className="w-4 h-4 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={(e) => { e.stopPropagation(); onMoveLeft(); }}
              onMouseDown={(e) => e.stopPropagation()}
              title="Move left"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
          )}
          {!isLast && (
            <button
              className="w-4 h-4 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={(e) => { e.stopPropagation(); onMoveRight(); }}
              onMouseDown={(e) => e.stopPropagation()}
              title="Move right"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
