import { memo } from "react";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LocationNode, LocationData } from "../types";
import { LOC_W } from "../constants";

interface LocationNodeCardProps {
  node: LocationNode;
  location: LocationData;
  isSelected: boolean;
  shotCount: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onSettingsClick: () => void;
  onDelete: () => void;
}

export const LocationNodeCard = memo(function LocationNodeCard({
  node, location, isSelected, shotCount, onMouseDown, onSettingsClick, onDelete,
}: LocationNodeCardProps) {
  const hasFinal = !!location.selectedImageId;

  return (
    <div
      data-node
      className={cn(
        "absolute rounded-xl border-2 bg-card overflow-hidden select-none group cursor-grab active:cursor-grabbing",
        isSelected
          ? "border-emerald-500 shadow-lg shadow-emerald-500/20"
          : "border-border hover:border-emerald-500/40",
      )}
      style={{ left: node.x, top: node.y, width: LOC_W }}
      onMouseDown={onMouseDown}
    >
      <div className="absolute top-2 left-2 z-10 flex gap-1">
        <span className="bg-emerald-500/20 backdrop-blur-sm text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
          {shotCount} shots
        </span>
        <span className={cn(
          "backdrop-blur-sm text-[10px] font-bold px-1.5 py-0.5 rounded-md",
          hasFinal
            ? "bg-emerald-500/30 text-emerald-200"
            : "bg-amber-500/20 text-amber-300"
        )}>
          {hasFinal ? "FINAL" : "DRAFT"}
        </span>
      </div>
      <button
        className="absolute top-2 right-2 z-10 bg-background/70 text-foreground/70 hover:text-foreground w-5 h-5 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-all"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onSettingsClick(); }}
        aria-label="Open location settings"
      >
        <Settings className="w-3 h-3" />
      </button>
      {location.portrait ? (
        <img src={location.portrait} alt={location.name} className="w-full aspect-video object-cover" draggable={false} />
      ) : (
        <div className="w-full aspect-video bg-muted flex items-center justify-center text-muted-foreground text-xs">No Image</div>
      )}
      <div className="p-2">
        <p className="text-xs font-bold text-foreground">{location.name}</p>
      </div>
    </div>
  );
});
