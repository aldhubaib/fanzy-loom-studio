import { Bell, Plus } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  onNewProject: () => void;
}

export function TopBar({ onNewProject }: TopBarProps) {
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <nav className="flex items-center gap-1 text-sm">
          <span className="text-muted-foreground">Fanzy</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium">All Projects</span>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={onNewProject}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md gap-2"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Button>
        <button className="relative text-muted-foreground hover:text-foreground transition-colors p-2">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-accent/40 flex items-center justify-center text-xs font-semibold text-foreground">
          JD
        </div>
      </div>
    </header>
  );
}
