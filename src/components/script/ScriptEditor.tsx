import { useRef, useState } from "react";
import { SceneNavigator, type Scene } from "./SceneNavigator";
import { ScreenplayEditor } from "./ScreenplayEditor";
import { AIAssistantPanel } from "./AIAssistantPanel";
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
  const sceneRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleSceneClick = (id: number) => {
    setActiveScene(id);
    sceneRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAddScene = () => {
    const nextId = scenes.length + 1;
    setScenes((prev) => [
      ...prev,
      { id: nextId, heading: "INT. NEW LOCATION - DAY", page: prev[prev.length - 1].page + 2 },
    ]);
  };

  return (
    <div className="flex h-full w-full">
      {!focusMode && (
        <SceneNavigator
          scenes={scenes}
          activeScene={activeScene}
          onSceneClick={handleSceneClick}
          onAddScene={handleAddScene}
        />
      )}
      <ScreenplayEditor
        sceneRefs={sceneRefs}
        focusMode={focusMode}
        onFocusModeChange={setFocusMode}
      />
      {!focusMode && <AIAssistantPanel />}
    </div>
  );
}
