import React from "react";

interface ScriptElement {
  type: "scene-heading" | "action" | "character" | "dialogue" | "parenthetical";
  text: string;
  sceneId?: number;
}

interface ScreenplayEditorProps {
  sceneRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
}

const scriptElements: ScriptElement[] = [
  // Scene 1
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

  // Scene 2
  { type: "scene-heading", text: "EXT. RAIN-SLICKED ALLEY - NIGHT", sceneId: 2 },
  { type: "action", text: "Marlowe walks through the alley, collar up. Neon signs reflect off wet pavement. He stops at a service door and knocks twice, then once." },
  { type: "action", text: "The door cracks open. EDDIE \"THE FIXER\" ROSSI (40s, gold rings, nervous energy) peers through." },
  { type: "character", text: "EDDIE" },
  { type: "dialogue", text: "You got some nerve coming here, Marlowe." },
  { type: "character", text: "MARLOWE" },
  { type: "dialogue", text: "Hello to you too, Eddie. I need a name. Whoever moved two hundred grand through this neighborhood in the last week — you'd know about it." },

  // Scene 3
  { type: "scene-heading", text: "INT. THE BLUE NOTE JAZZ CLUB - NIGHT", sceneId: 3 },
  { type: "action", text: "A saxophone wails over low conversation. Smoke curls through blue stage light. Marlowe sits at the bar, nursing a bourbon." },
  { type: "action", text: "A BARTENDER (60s, seen everything) polishes a glass nearby." },
  { type: "character", text: "BARTENDER" },
  { type: "dialogue", text: "You look like a man waiting for bad news." },
  { type: "character", text: "MARLOWE" },
  { type: "dialogue", text: "Just the regular kind." },
  { type: "action", text: "Marlowe spots Vivian across the room, sitting in a booth with a MAN he doesn't recognize. She's laughing — a different woman than the one in his office. Marlowe watches, expressionless, and finishes his drink." },
];

export function ScreenplayEditor({ sceneRefs }: ScreenplayEditorProps) {
  return (
    <div className="flex-1 min-w-0 flex flex-col h-full bg-[hsl(240,6%,10%)]">
      {/* Title area */}
      <div className="px-12 pt-10 pb-6 border-b border-border">
        <h1
          className="text-2xl font-bold font-mono text-foreground tracking-wide cursor-text"
          contentEditable
          suppressContentEditableWarning
        >
          THE LAST DEAL
        </h1>
        <p className="text-xs text-muted-foreground mt-1 font-sans">
          Noir · Written by Jane Director · ~12 min estimated runtime
        </p>
      </div>

      {/* Script body */}
      <div className="flex-1 overflow-y-auto px-12 py-8">
        <div className="max-w-2xl mx-auto space-y-1">
          {scriptElements.map((el, i) => {
            const refProps = el.sceneId
              ? { ref: (node: HTMLDivElement | null) => { sceneRefs.current[el.sceneId!] = node; } }
              : {};

            switch (el.type) {
              case "scene-heading":
                return (
                  <div key={i} {...refProps} className="pt-8 first:pt-0 pb-2 cursor-text">
                    <p className="font-mono text-sm font-bold uppercase text-primary tracking-wider">
                      {el.text}
                    </p>
                  </div>
                );
              case "action":
                return (
                  <div key={i} className="py-1 cursor-text">
                    <p className="font-mono text-sm text-foreground/90 leading-relaxed">
                      {el.text}
                    </p>
                  </div>
                );
              case "character":
                return (
                  <div key={i} className="pt-4 pb-0 cursor-text">
                    <p className="font-mono text-sm font-bold uppercase text-primary text-center">
                      {el.text}
                    </p>
                  </div>
                );
              case "dialogue":
                return (
                  <div key={i} className="mx-auto w-[60%] pb-1 cursor-text">
                    <p className="font-mono text-sm text-foreground/90 text-center leading-relaxed">
                      {el.text}
                    </p>
                  </div>
                );
              case "parenthetical":
                return (
                  <div key={i} className="mx-auto w-[60%] cursor-text">
                    <p className="font-mono text-sm italic text-muted-foreground text-center">
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
