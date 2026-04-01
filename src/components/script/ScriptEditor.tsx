import { useRef, useState } from "react";
import { SceneNavigator, type Scene } from "./SceneNavigator";
import { ScreenplayEditor } from "./ScreenplayEditor";
import { AIAssistantPanel } from "./AIAssistantPanel";
import { List, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

const initialScenes: Scene[] = [
  { id: 1, heading: "INT. MARLOWE'S OFFICE - NIGHT", page: 1 },
  { id: 2, heading: "EXT. RAIN-SLICKED ALLEY - NIGHT", page: 3 },
  { id: 3, heading: "INT. THE BLUE NOTE JAZZ CLUB - NIGHT", page: 5 },
];

export function ScriptEditor() {
  const [activeScene, setActiveScene] = useState(1);
  const [scenes, setScenes] = useState<Scene[]>(initialScenes);
  const [focusMode, setFocusMode] = useState(false);
  const [showScenes, setShowScenes] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const sceneRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleSceneClick = (id: number) => {
    setActiveScene(id);
    sceneRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setShowScenes(false);
  };

  const handleAddScene = () => {
    const nextId = scenes.length + 1;
    setScenes((prev) => [
      ...prev,
      { id: nextId, heading: "INT. NEW LOCATION - DAY", page: prev[prev.length - 1].page + 2 },
    ]);
  };

  return (
    <div className="flex h-full w-full relative">
      {/* Full-width editor */}
      <ScreenplayEditor
        sceneRefs={sceneRefs}
        focusMode={focusMode}
        onFocusModeChange={setFocusMode}
        onToggleScenes={() => setShowScenes(v => !v)}
        onToggleAI={() => setShowAI(v => !v)}
        showScenes={showScenes}
        showAI={showAI}
      />

      {/* Scene Navigator - slide-over from left */}
      {showScenes && !focusMode && (
        <>
          <div className="absolute inset-0 bg-black/30 z-30" onClick={() => setShowScenes(false)} />
          <div className="absolute left-0 top-0 bottom-0 z-40 animate-in slide-in-from-left duration-200">
            <div className="relative h-full">
              <button
                onClick={() => setShowScenes(false)}
                className="absolute top-3 right-3 z-50 w-6 h-6 rounded-md bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <SceneNavigator
                scenes={scenes}
                activeScene={activeScene}
                onSceneClick={handleSceneClick}
                onAddScene={handleAddScene}
              />
            </div>
          </div>
        </>
      )}

      {/* AI Panel - slide-over from right */}
      {showAI && !focusMode && (
        <>
          <div className="absolute inset-0 bg-black/30 z-30" onClick={() => setShowAI(false)} />
          <div className="absolute right-0 top-0 bottom-0 z-40 animate-in slide-in-from-right duration-200">
            <div className="relative h-full">
              <button
                onClick={() => setShowAI(false)}
                className="absolute top-3 right-3 z-50 w-6 h-6 rounded-md bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <AIAssistantPanel />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
