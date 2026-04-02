import { useState, useRef, useEffect } from "react";
import {
  Lightbulb, FileText, LayoutGrid, Users, MapPin, Sparkles, Film, Download,
  ChevronDown, PanelLeft, ArrowLeft
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";

const pipelineStages = [
  { title: "Canvas", slug: "canvas", icon: Sparkles },
];

interface FloatingToolbarProps {
  projectTitle: string;
  currentStage?: string;
}

export function FloatingToolbar({ projectTitle, currentStage }: FloatingToolbarProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { projectId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeStage = pipelineStages.find(s => s.slug === currentStage);

  return (
    <div ref={ref} className="absolute top-3 left-3 z-50">
      {/* Pill */}
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-xl bg-card/90 backdrop-blur-md border border-border shadow-lg",
          "hover:bg-card transition-colors cursor-pointer select-none"
        )}
      >
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
          <Film className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
        <span className="sr-only">{projectTitle}</span>
        {activeStage && (
          <div className="w-px h-4 bg-border" />
        )}
        {activeStage && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <activeStage.icon className="w-3.5 h-3.5" />
            <span className="text-xs">{activeStage.title}</span>
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="mt-2 w-56 rounded-xl bg-card/95 backdrop-blur-md border border-border shadow-2xl py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to projects
          </Link>

          <div className="h-px bg-border mx-2 my-1.5" />

          <p className="px-3.5 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">Pipeline</p>

          {pipelineStages.map((stage, i) => {
            const isActive = stage.slug === currentStage;
            return (
              <button
                key={stage.slug}
                onClick={() => {
                  navigate(`/project/${projectId}/${stage.slug}`);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <stage.icon className="w-4 h-4" />
                <span>{stage.title}</span>
                <span className="ml-auto text-[10px] text-muted-foreground/40">{i + 1}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
