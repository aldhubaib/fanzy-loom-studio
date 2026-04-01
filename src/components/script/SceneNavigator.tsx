import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Scene {
  id: number;
  heading: string;
  page: number;
}

interface SceneNavigatorProps {
  scenes: Scene[];
  activeScene: number;
  onSceneClick: (id: number) => void;
}

export function SceneNavigator({ scenes, activeScene, onSceneClick }: SceneNavigatorProps) {
  return (
    <div className="w-[220px] flex-shrink-0 border-r border-border bg-card flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scenes</span>
        <button className="w-6 h-6 rounded-md bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {scenes.map((scene) => (
          <button
            key={scene.id}
            onClick={() => onSceneClick(scene.id)}
            className={cn(
              "w-full text-left px-4 py-3 border-l-2 transition-colors hover:bg-secondary/50",
              activeScene === scene.id
                ? "border-l-primary bg-secondary/70"
                : "border-l-transparent"
            )}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span className={cn(
                "text-xs font-bold",
                activeScene === scene.id ? "text-primary" : "text-muted-foreground"
              )}>
                {scene.id}
              </span>
            </div>
            <p className={cn(
              "text-xs truncate font-mono",
              activeScene === scene.id ? "text-foreground" : "text-muted-foreground"
            )}>
              {scene.heading}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">page {scene.page}</p>
          </button>
        ))}
      </div>

      <div className="p-3 border-t border-border">
        <button className="w-full py-2 rounded-lg border-2 border-dashed border-border text-muted-foreground text-xs hover:border-primary/50 hover:text-primary transition-colors">
          + Add Scene
        </button>
      </div>
    </div>
  );
}
