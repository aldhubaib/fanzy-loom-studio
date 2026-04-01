import { Copy, ExternalLink, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export interface Project {
  id: string;
  title: string;
  genre: string;
  scenes: number;
  characters: number;
  locations: number;
  pipelineComplete: number;
  pipelineTotal: number;
  editedAgo: string;
  gradient: string;
}

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const progress = (project.pipelineComplete / project.pipelineTotal) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group card-lift rounded-lg border border-border bg-card overflow-hidden cursor-pointer"
    >
      {/* Thumbnail */}
      <div className={`aspect-video bg-gradient-to-br ${project.gradient} relative`}>
        {/* Hover actions */}
        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button className="p-2 rounded-md bg-secondary/80 hover:bg-secondary text-foreground transition-colors">
            <ExternalLink className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-md bg-secondary/80 hover:bg-secondary text-foreground transition-colors">
            <Copy className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-md bg-secondary/80 hover:bg-destructive text-foreground transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-foreground">{project.title}</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
            {project.genre}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          {project.scenes} scenes · {project.characters} characters · Edited {project.editedAgo}
        </p>

        {/* Pipeline progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Pipeline</span>
            <span className="text-muted-foreground">{project.pipelineComplete}/{project.pipelineTotal}</span>
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: progress === 100
                  ? 'hsl(142 71% 45%)'
                  : 'hsl(var(--primary))',
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
