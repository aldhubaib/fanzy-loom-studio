import { useRef, useState } from "react";
import { SceneNavigator, type Scene } from "./SceneNavigator";
import { ScreenplayEditor } from "./ScreenplayEditor";
import { AIAssistantPanel } from "./AIAssistantPanel";

const mockScenes: Scene[] = [
  { id: 1, heading: "INT. MARLOWE'S OFFICE - NIGHT", page: 1 },
  { id: 2, heading: "EXT. RAIN-SLICKED ALLEY - NIGHT", page: 3 },
  { id: 3, heading: "INT. THE BLUE NOTE JAZZ CLUB - NIGHT", page: 5 },
];

export function ScriptEditor() {
  const [activeScene, setActiveScene] = useState(1);
  const sceneRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleSceneClick = (id: number) => {
    setActiveScene(id);
    sceneRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex h-full w-full">
      <SceneNavigator scenes={mockScenes} activeScene={activeScene} onSceneClick={handleSceneClick} />
      <ScreenplayEditor sceneRefs={sceneRefs} />
      <AIAssistantPanel />
    </div>
  );
}
