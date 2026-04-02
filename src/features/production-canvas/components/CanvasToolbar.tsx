import { memo, useState, useRef, useEffect } from "react";
import { Plus, MousePointer, Hand, Maximize, ZoomIn, ZoomOut, Film, RotateCcw, ChevronDown, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Tool } from "../types";
import { ZOOM_MIN, ZOOM_MAX, ZOOM_STEP } from "../constants";

interface CanvasToolbarProps {
  projectId: string | undefined;
  projectName?: string;
  onProjectNameChange?: (name: string) => void;
  tool: Tool;
  zoom: number;
  onSetTool: (t: Tool) => void;
  onAddFrame: () => void;
  onFitToScreen: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetCanvas: () => void;
}

export const CanvasToolbar = memo(function CanvasToolbar({
  projectId, projectName, onProjectNameChange, tool, zoom,
  onSetTool, onAddFrame, onFitToScreen, onZoomIn, onZoomOut, onResetCanvas,
}: CanvasToolbarProps) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(projectName || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setEditValue(projectName || "");
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [editing, projectName]);

  const commitEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== projectName) {
      onProjectNameChange?.(trimmed);
    }
    setEditing(false);
  };

  return (
    <>
      {/* Logo + Project Name */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-3 px-3 py-2 rounded-xl bg-card/90 backdrop-blur-md border border-border shadow-lg text-sm">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 hover:opacity-80 transition-opacity outline-none">
              <Film className="w-4 h-4 text-primary" />
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 mt-1">
            <DropdownMenuItem onClick={() => navigate("/")}>
              <ArrowLeft className="w-3.5 h-3.5 mr-2" />
              Back to Projects
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {editing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit();
              if (e.key === "Escape") setEditing(false);
            }}
            className="text-xs font-semibold text-foreground bg-transparent outline-none w-32"
          />
        ) : (
          <span
            className="text-xs font-semibold text-foreground cursor-text hover:text-primary transition-colors"
            onClick={() => setEditing(true)}
          >
            {projectName || "Untitled"}
          </span>
        )}
      </div>


      {/* Tool buttons */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 z-20 flex flex-col items-center gap-1 p-1.5 rounded-2xl bg-card/90 backdrop-blur-md border border-border shadow-2xl">
        <button onClick={onAddFrame} className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors" title="Add Shot">
          <Plus className="w-4 h-4" />
        </button>
        <div className="w-6 h-px bg-border my-0.5" />
        <button onClick={() => onSetTool("select")} className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-colors", tool === "select" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60")} title="Select">
          <MousePointer className="w-4 h-4" />
        </button>
        <button onClick={() => onSetTool("hand")} className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-colors", tool === "hand" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60")} title="Pan (Space)">
          <Hand className="w-4 h-4" />
        </button>
        <div className="w-6 h-px bg-border my-0.5" />
        <button onClick={onFitToScreen} className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors" title="Fit to screen">
          <Maximize className="w-4 h-4" />
        </button>
        <button onClick={onResetCanvas} className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors" title="Reset Canvas">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 px-2 py-1 rounded-lg bg-card/90 backdrop-blur-sm border border-border text-xs text-muted-foreground">
        <button onClick={onZoomOut} className="p-0.5 hover:text-foreground"><ZoomOut className="w-3.5 h-3.5" /></button>
        <span className="min-w-[3ch] text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={onZoomIn} className="p-0.5 hover:text-foreground"><ZoomIn className="w-3.5 h-3.5" /></button>
      </div>
    </>
  );
});