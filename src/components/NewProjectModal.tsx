import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const genres = [
  "Noir", "Sci-Fi", "Drama", "Horror", "Comedy",
  "Action", "Fantasy", "Documentary", "Cyberpunk", "Western",
];

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewProjectModal({ open, onClose }: NewProjectModalProps) {
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [aiMode, setAiMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const handleCreate = () => {
    onClose();
    setName("");
    setGenre("");
    setAiMode(false);
    setAiPrompt("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl">Create New Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Project Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Untitled Film"
              className="w-full bg-secondary rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-border outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Genre */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-secondary rounded-md px-3 py-2.5 text-sm text-foreground border border-border outline-none focus:ring-1 focus:ring-primary appearance-none"
            >
              <option value="" disabled>Select a genre...</option>
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* AI Toggle */}
          <div className="flex items-center justify-between p-3 rounded-md bg-accent/10 border border-accent/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Start with AI</span>
            </div>
            <Switch checked={aiMode} onCheckedChange={setAiMode} />
          </div>

          {/* AI Prompt */}
          {aiMode && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-accent flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Describe your film idea
              </label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="A noir thriller set in 1940s Los Angeles..."
                rows={3}
                className="w-full bg-secondary rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-accent/30 outline-none focus:ring-1 focus:ring-accent resize-none"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
            <Button
              onClick={handleCreate}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md"
            >
              Create Project
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
