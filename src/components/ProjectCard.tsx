import { Copy, ExternalLink, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const progress = (project.pipelineComplete / project.pipelineTotal) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group card-lift rounded-lg border border-border bg-card overflow-hidden cursor-pointer"
      onClick={() => navigate(`/project/${project.id}/canvas`)}
    >
      {/* Thumbnail */}
      <div className={`aspect-video bg-gradient-to-br ${project.gradient} relative`}>
        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button onClick={(e) => { e.stopPropagation(); }} className="p-2 rounded-md bg-secondary/80 hover:bg-secondary text-foreground transition-colors">
            <ExternalLink className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); }} className="p-2 rounded-md bg-secondary/80 hover:bg-secondary text-foreground transition-colors">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); }} className="p-2 rounded-md bg-secondary/80 hover:bg-destructive text-foreground transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

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
      </div>
    </motion.div>
  );
}
