import { memo } from "react";
import { Plus, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import type { Actor, FrameData } from "../types";
import { FRAME_W, IMAGE_H, locationImages } from "../constants";

interface ShotFrameNodeProps {
  frame: FrameData;
  index: number;
  actors: Actor[];
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onSettingsClick: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
}

export const ShotFrameNode = memo(function ShotFrameNode({
  frame, index, actors, isSelected, isFirst, isLast,
  onMouseDown, onSettingsClick, onMoveLeft, onMoveRight,
}: ShotFrameNodeProps) {
  return (
    <div
      data-node
      className={cn(
        "absolute rounded-xl border-2 bg-card select-none group transition-shadow",
        isSelected
          ? "border-primary shadow-lg shadow-primary/20"
          : "border-border hover:border-primary/40",
      )}
      style={{ left: frame.x, top: frame.y, width: FRAME_W }}
      onMouseDown={onMouseDown}
    >
      <div className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">
        {index + 1}
      </div>
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
        <button
          className="bg-background/70 backdrop-blur-sm text-foreground/70 hover:text-foreground hover:bg-background/90 w-5 h-5 flex items-center justify-center rounded-md transition-colors"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onSettingsClick(); }}
          aria-label="Open shot settings"
        >
          <Settings className="w-3 h-3" />
        </button>
        <div className="bg-primary/90 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">
          {frame.shot}
        </div>
      </div>

      <div className="w-full bg-secondary overflow-hidden rounded-t-[10px]" style={{ height: IMAGE_H }}>
        {frame.image ? (
          <img src={frame.image} alt={frame.description} className="w-full h-full object-cover" draggable={false} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
            <Plus className="w-8 h-8" />
          </div>
        )}
      </div>

      <div className="p-2.5 space-y-1 rounded-b-[10px]" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-primary">{frame.scene}</span>
          <span className="text-[10px] text-muted-foreground">{frame.duration}</span>
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider delayDuration={200}>
            {frame.actors.map((aid) => {
              const a = actors.find((ac) => ac.id === aid);
              if (!a) return null;
              return (
                <Tooltip key={a.id}>
                  <TooltipTrigger asChild>
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-border">
                      <img src={a.portrait} alt={a.name} className="w-full h-full object-cover" draggable={false} />
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
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-foreground/70 leading-tight line-clamp-2 flex-1">{frame.description}</p>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
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
    </div>
  );
});
