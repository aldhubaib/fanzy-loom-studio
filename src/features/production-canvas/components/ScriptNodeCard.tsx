import { memo } from "react";
import { Settings, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScriptNode, SelectedItem } from "../types";
import { SCRIPT_W } from "../constants";

interface ScriptNodeCardProps {
  node: ScriptNode;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onSettingsClick: () => void;
  onDelete: () => void;
}

export const ScriptNodeCard = memo(function ScriptNodeCard({
  node, isSelected, onMouseDown, onSettingsClick, onDelete,
}: ScriptNodeCardProps) {
  return (
    <div
      data-node
      className={cn(
        "absolute rounded-xl border-2 bg-card overflow-hidden select-none group cursor-grab",
        isSelected
          ? "border-purple-500 shadow-lg shadow-purple-500/20"
          : "border-border hover:border-muted-foreground/40",
      )}
      style={{ left: node.x, top: node.y, width: SCRIPT_W }}
      onMouseDown={onMouseDown}
    >
      <button
        className="absolute top-2 right-8 z-10 bg-background/70 text-foreground/70 hover:text-foreground w-5 h-5 flex items-center justify-center rounded-md transition-all"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onSettingsClick(); }}
        aria-label="Open scene settings"
        title="Open scene settings"
      >
        <Settings className="w-3 h-3" />
      </button>
      <button
        className="absolute top-2 right-2 z-10 bg-background/70 text-foreground/70 hover:text-destructive w-5 h-5 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-all"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
      >
        <X className="w-3 h-3" />
      </button>
      <div className="p-3 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider truncate">
            {node.heading}
          </p>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-4 leading-relaxed">{node.body}</p>
      </div>
    </div>
  );
});