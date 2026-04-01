import {
  Lightbulb, FileText, LayoutGrid, Users, MapPin, Sparkles, Film, Download
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const pipelineStages = [
  { title: "Concept", slug: "concept", icon: Lightbulb },
  { title: "Script", slug: "script", icon: FileText },
  { title: "Storyboard", slug: "storyboard", icon: LayoutGrid },
  { title: "Casting", slug: "casting", icon: Users },
  { title: "Locations", slug: "locations", icon: MapPin },
  { title: "Generation", slug: "generation", icon: Sparkles },
  { title: "Timeline", slug: "timeline", icon: Film },
  { title: "Export", slug: "export", icon: Download },
];

interface PipelineToolbarProps {
  projectId: string;
}

export function PipelineToolbar({ projectId }: PipelineToolbarProps) {
  return (
    <div className="w-14 flex-shrink-0 h-full bg-sidebar-background border-r border-sidebar-border flex flex-col items-center py-3 gap-1">
      {/* Logo */}
      <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center mb-4">
        <Film className="w-4 h-4 text-primary-foreground" />
      </div>

      {/* Pipeline stages */}
      <div className="flex flex-col items-center gap-1 flex-1">
        {pipelineStages.map((stage) => (
          <Tooltip key={stage.slug} delayDuration={0}>
            <TooltipTrigger asChild>
              <NavLink
                to={`/project/${projectId}/${stage.slug}`}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
                activeClassName="bg-sidebar-accent text-primary"
              >
                <stage.icon className="w-[18px] h-[18px]" />
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {stage.title}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* User avatar at bottom */}
      <div className="mt-auto">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-accent/40 flex items-center justify-center text-xs font-semibold text-foreground">
          JD
        </div>
      </div>
    </div>
  );
}
