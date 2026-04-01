import React from "react";
import { FormattingToolbar } from "./FormattingToolbar";
import { List, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScriptElement {
  type: "scene-heading" | "action" | "character" | "dialogue" | "parenthetical";
  text: string;
  sceneId?: number;
}

interface ScreenplayEditorProps {
  sceneRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
  focusMode: boolean;
  onFocusModeChange: (v: boolean) => void;
  onToggleScenes?: () => void;
  onToggleAI?: () => void;
  showScenes?: boolean;
  showAI?: boolean;
}

const scriptElements: ScriptElement[] = [
  { type: "scene-heading", text: "INT. MARLOWE'S OFFICE - NIGHT", sceneId: 1 },
  { type: "action", text: "Rain hammers the window. The office is dark except for a desk lamp casting hard shadows across stacked case files. A half-empty bottle of whiskey anchors a pile of unpaid bills." },
  { type: "action", text: "DETECTIVE MARLOWE (50s, weathered, loose tie) sits behind the desk, staring at a faded photograph. He puts it face-down as footsteps echo in the hallway." },
  { type: "action", text: "The door opens. VIVIAN CROSS (30s, sharp eyes, red lipstick, tailored coat) steps in without knocking." },
  { type: "character", text: "MARLOWE" },
  { type: "dialogue", text: "Office hours ended at six." },
  { type: "character", text: "VIVIAN" },
  { type: "dialogue", text: "Then you should lock your door, Detective." },
  { type: "action", text: "She sits across from him, uninvited. Places a manila envelope on the desk." },
  { type: "character", text: "VIVIAN" },
  { type: "dialogue", text: "My husband is missing. Three days. The police say he'll turn up. I say they're not looking hard enough." },
  { type: "action", text: "Marlowe eyes the envelope but doesn't touch it." },
  { type: "character", text: "MARLOWE" },
  { type: "dialogue", text: "Missing husbands usually don't want to be found, Mrs. Cross." },
  { type: "character", text: "VIVIAN" },
  { type: "dialogue", text: "This one took two hundred thousand dollars with him. I want the money. You can keep the husband." },
  { type: "scene-heading", text: "EXT. RAIN-SLICKED ALLEY - NIGHT", sceneId: 2 },
  { type: "action", text: "Marlowe walks through the alley, collar up. Neon signs reflect off wet pavement. He stops at a service door and knocks twice, then once." },
  { type: "action", text: "The door cracks open. EDDIE \"THE FIXER\" ROSSI (40s, gold rings, nervous energy) peers through." },
  { type: "character", text: "EDDIE" },
  { type: "dialogue", text: "You got some nerve coming here, Marlowe." },
  { type: "character", text: "MARLOWE" },
  { type: "dialogue", text: "Hello to you too, Eddie. I need a name. Whoever moved two hundred grand through this neighborhood in the last week — you'd know about it." },
  { type: "scene-heading", text: "INT. THE BLUE NOTE JAZZ CLUB - NIGHT", sceneId: 3 },
  { type: "action", text: "A saxophone wails over low conversation. Smoke curls through blue stage light. Marlowe sits at the bar, nursing a bourbon." },
  { type: "action", text: "A BARTENDER (60s, seen everything) polishes a glass nearby." },
  { type: "character", text: "BARTENDER" },
  { type: "dialogue", text: "You look like a man waiting for bad news." },
  { type: "character", text: "MARLOWE" },
  { type: "dialogue", text: "Just the regular kind." },
  { type: "action", text: "Marlowe spots Vivian across the room, sitting in a booth with a MAN he doesn't recognize. She's laughing — a different woman than the one in his office. Marlowe watches, expressionless, and finishes his drink." },
];

export function ScreenplayEditor({ sceneRefs, focusMode, onFocusModeChange, onToggleScenes, onToggleAI, showScenes, showAI }: ScreenplayEditorProps) {
  const [activeElement, setActiveElement] = React.useState<"scene-heading" | "action" | "character" | "dialogue" | "parenthetical" | "transition" | "note">("action");
  const [fontSize, setFontSize] = React.useState(14);

  let currentScene = 0;

  return (
    <div className="flex-1 min-w-0 flex flex-col h-full bg-background">
      {/* Title area with panel toggles */}
      <div className="px-16 pt-16 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            {/* Panel toggle buttons */}
            {!focusMode && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleScenes}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    showScenes
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <List className="w-3.5 h-3.5" />
                  Scenes
                </button>
                <button
                  onClick={onToggleAI}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    showAI
                      ? "bg-accent/15 text-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Assistant
                </button>
              </div>
            )}
            {focusMode && <div />}
          </div>

          <h1
            className="text-3xl font-bold font-mono text-foreground tracking-wide cursor-text"
            contentEditable
            suppressContentEditableWarning
          >
            THE LAST DEAL
          </h1>
          <p className="text-xs text-muted-foreground mt-2 font-sans">
            Noir · Written by Jane Director · ~12 min estimated runtime
          </p>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="px-16">
        <div className="max-w-2xl mx-auto">
          <FormattingToolbar
            activeElement={activeElement}
            onElementChange={setActiveElement}
            focusMode={focusMode}
            onFocusModeChange={onFocusModeChange}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
          />
        </div>
      </div>

      {/* Script body */}
      <div className="flex-1 overflow-y-auto px-16 py-8">
        <div className="max-w-2xl mx-auto space-y-1" style={{ fontSize: `${fontSize}px` }}>
          {scriptElements.map((el, i) => {
            const isNewScene = el.sceneId !== undefined;
            const showDivider = isNewScene && currentScene > 0;
            if (isNewScene) currentScene = el.sceneId!;

            const refProps = el.sceneId
              ? { ref: (node: HTMLDivElement | null) => { sceneRefs.current[el.sceneId!] = node; } }
              : {};

            switch (el.type) {
              case "scene-heading":
                return (
                  <React.Fragment key={i}>
                    {showDivider && (
                      <div className="flex items-center gap-3 pt-8 pb-2">
                        <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                          Scene {el.sceneId}
                        </span>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                    )}
                    <div {...refProps} className="pt-8 first:pt-0 pb-2 cursor-text rounded-lg px-4 -mx-4 bg-card/50">
                      <p className="font-mono font-bold uppercase text-primary tracking-wider leading-relaxed">
                        {el.text}
                      </p>
                    </div>
                  </React.Fragment>
                );
              case "action":
                return (
                  <div key={i} className="py-1.5 cursor-text">
                    <p className="font-mono text-foreground/90 leading-relaxed">
                      {el.text}
                    </p>
                  </div>
                );
              case "character":
                return (
                  <div key={i} className="pt-5 pb-0 cursor-text">
                    <p className="font-mono font-bold uppercase text-primary text-center">
                      {el.text}
                    </p>
                  </div>
                );
              case "dialogue":
                return (
                  <div key={i} className="mx-auto w-[65%] pb-1 cursor-text">
                    <p className="font-mono text-foreground/90 text-center leading-relaxed">
                      {el.text}
                    </p>
                  </div>
                );
              case "parenthetical":
                return (
                  <div key={i} className="mx-auto w-[65%] cursor-text">
                    <p className="font-mono italic text-muted-foreground text-center">
                      {el.text}
                    </p>
                  </div>
                );
              default:
                return null;
            }
          })}
        </div>
      </div>

      {/* Status bar */}
      <div className="px-6 py-2 border-t border-border flex items-center gap-4 text-[11px] text-muted-foreground font-sans">
        <span>1,247 words</span>
        <span>·</span>
        <span>3 scenes</span>
        <span>·</span>
        <span>~12 min</span>
        <span>·</span>
        <span>Saved 2m ago</span>
      </div>
    </div>
  );
}
