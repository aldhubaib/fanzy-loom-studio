import { Plus } from "lucide-react";
import { motion } from "framer-motion";

interface NewProjectCardProps {
  onClick: () => void;
}

export function NewProjectCard({ onClick }: NewProjectCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onClick={onClick}
      className="card-lift rounded-lg border-2 border-dashed border-primary/30 hover:border-primary/60 bg-card/50 overflow-hidden cursor-pointer flex flex-col items-center justify-center transition-colors group h-full"
    >
      <div className="w-14 h-14 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors mb-3">
        <Plus className="w-7 h-7 text-primary" />
      </div>
      <span className="text-foreground font-semibold">New Project</span>
      <span className="text-xs text-muted-foreground mt-1">Start a new film</span>
    </motion.button>
  );
}
