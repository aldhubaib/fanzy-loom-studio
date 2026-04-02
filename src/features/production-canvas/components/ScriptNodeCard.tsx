import { memo, useRef, useCallback } from "react";
import { Settings, FileText, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScriptNode } from "../types";
import { SCRIPT_W } from "../constants";

interface ScriptNodeCardProps {
  node: ScriptNode;
  sceneNumber: number;
  isSelected: boolean;
  isStackView?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onSettingsClick: () => void;
  onDelete: () => void;
  onUpdate?: (id: string, updates: Partial<ScriptNode>) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const ScriptNodeCard = memo(function ScriptNodeCard({
  node, sceneNumber, isSelected, isStackView, isFirst, isLast,
  onMouseDown, onSettingsClick, onDelete, onUpdate, onMoveUp, onMoveDown,
}: ScriptNodeCardProps) {
  const headingRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const handleHeadingBlur = useCallback(() => {
    const text = headingRef.current?.textContent?.trim() || node.heading;
    if (text !== node.heading) onUpdate?.(node.id, { heading: text });
  }, [node.id, node.heading, onUpdate]);

  const handleBodyBlur = useCallback(() => {
    const text = bodyRef.current?.textContent?.trim() || node.body;
    if (text !== node.body) onUpdate?.(node.id, { body: text });
  }, [node.id, node.body, onUpdate]);

  const stopDrag = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      data-node
      className={cn(
        "rounded-xl border-2 bg-card overflow-visible select-none group cursor-grab",
        isStackView ? "relative" : "absolute",
        isSelected
          ? "border-purple-500 shadow-lg shadow-purple-500/20"
          : "border-border hover:border-purple-500/40",
      )}
      style={isStackView ? { width: "100%" } : { left: node.x, top: node.y, width: SCRIPT_W }}
      onMouseDown={onMouseDown}
    >
      {/* Settings button */}
      <button
        className="absolute top-2 right-2 z-10 bg-background/70 text-foreground/70 hover:text-foreground w-5 h-5 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-all"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onSettingsClick(); }}
        aria-label="Open scene settings"
        title="Open scene settings"
      >
        <Settings className="w-3 h-3" />
      </button>

      {/* Move up/down handles — visible when selected in stack view */}
      {isStackView && isSelected && (
        <div className="absolute -left-9 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10">
          {!isFirst && (
            <button
              className="w-6 h-6 flex items-center justify-center rounded-md bg-purple-500/20 text-purple-300 hover:bg-purple-500/40 hover:text-purple-100 transition-all"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onMoveUp?.(); }}
              aria-label="Move up"
              title="Move up"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
          {!isLast && (
            <button
              className="w-6 h-6 flex items-center justify-center rounded-md bg-purple-500/20 text-purple-300 hover:bg-purple-500/40 hover:text-purple-100 transition-all"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onMoveDown?.(); }}
              aria-label="Move down"
              title="Move down"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <div className="p-3 space-y-1.5">
        <div className="flex items-start gap-1.5">
          <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="text-[10px] font-bold text-purple-300/70 uppercase tracking-wider shrink-0">SC {sceneNumber}</span>
          <div
            ref={headingRef}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            className="text-[10px] font-bold text-purple-400 uppercase tracking-wider outline-none cursor-text select-text min-w-[20px]"
            onMouseDown={stopDrag}
            onBlur={handleHeadingBlur}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); headingRef.current?.blur(); } }}
          >
            {node.heading}
          </div>
        </div>
        <div
          ref={bodyRef}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          className="text-xs text-muted-foreground leading-relaxed outline-none cursor-text select-text min-h-[1.25em]"
          onMouseDown={stopDrag}
          onBlur={handleBodyBlur}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { /* allow newlines */ } }}
        >
          {node.body}
        </div>
      </div>
    </div>
  );
});
