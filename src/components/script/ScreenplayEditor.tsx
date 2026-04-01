import React from "react";
import { FormattingToolbar } from "./FormattingToolbar";
import { List, Sparkles, ChevronDown, Hash, AlignLeft, User, MessageSquare, Parentheses, ArrowRight, StickyNote, Check, MapPin, UserCircle, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Popover, PopoverTrigger, PopoverContent,
} from "@/components/ui/popover";

// Character photo imports
import charMarlowe from "@/assets/characters/marlowe.jpg";
import charVivian from "@/assets/characters/vivian.jpg";
import charEddie from "@/assets/characters/eddie.jpg";
import charBartender from "@/assets/characters/bartender.jpg";

// Character thumbnail data
const characterThumbnails: Record<string, { initials: string; color: string; photo?: string }> = {
  "MARLOWE": { initials: "DM", color: "from-amber-700/80 to-amber-900/60", photo: charMarlowe },
  "VIVIAN": { initials: "VC", color: "from-rose-700/80 to-rose-900/60", photo: charVivian },
  "EDDIE": { initials: "ER", color: "from-emerald-700/80 to-emerald-900/60", photo: charEddie },
  "BARTENDER": { initials: "BT", color: "from-sky-700/80 to-sky-900/60", photo: charBartender },
};

// Location thumbnail data
const locationThumbnails: Record<string, { icon: string; color: string }> = {
  "MARLOWE'S OFFICE": { icon: "🏢", color: "from-amber-900/60 to-yellow-900/40" },
  "RAIN-SLICKED ALLEY": { icon: "🌧️", color: "from-slate-800/80 to-blue-900/40" },
  "THE BLUE NOTE JAZZ CLUB": { icon: "🎷", color: "from-indigo-900/60 to-blue-800/40" },
};

function getLocationKey(heading: string): string | null {
  for (const key of Object.keys(locationThumbnails)) {
    if (heading.includes(key)) return key;
  }
  return null;
}

type ElementType = "scene-heading" | "action" | "character" | "dialogue" | "parenthetical" | "transition" | "note";

const elementTypes = [
  { id: "scene-heading" as ElementType, label: "Scene Heading", icon: Hash },
  { id: "action" as ElementType, label: "Action", icon: AlignLeft },
  { id: "character" as ElementType, label: "Character", icon: User },
  { id: "dialogue" as ElementType, label: "Dialogue", icon: MessageSquare },
  { id: "parenthetical" as ElementType, label: "Parenthetical", icon: Parentheses },
  { id: "transition" as ElementType, label: "Transition", icon: ArrowRight },
  { id: "note" as ElementType, label: "Note", icon: StickyNote },
];

interface ScriptElement {
  id: string;
  type: ElementType;
  text: string;
  sceneId?: number;
}

const initialElements: ScriptElement[] = [
  { id: "1", type: "scene-heading", text: "INT. MARLOWE'S OFFICE - NIGHT", sceneId: 1 },
  { id: "2", type: "action", text: "Rain hammers the window. The office is dark except for a desk lamp casting hard shadows across stacked case files. A half-empty bottle of whiskey anchors a pile of unpaid bills." },
  { id: "3", type: "action", text: "DETECTIVE MARLOWE (50s, weathered, loose tie) sits behind the desk, staring at a faded photograph. He puts it face-down as footsteps echo in the hallway." },
  { id: "4", type: "action", text: "The door opens. VIVIAN CROSS (30s, sharp eyes, red lipstick, tailored coat) steps in without knocking." },
  { id: "5", type: "character", text: "MARLOWE" },
  { id: "6", type: "dialogue", text: "Office hours ended at six." },
  { id: "7", type: "character", text: "VIVIAN" },
  { id: "8", type: "dialogue", text: "Then you should lock your door, Detective." },
  { id: "9", type: "action", text: "She sits across from him, uninvited. Places a manila envelope on the desk." },
  { id: "10", type: "character", text: "VIVIAN" },
  { id: "11", type: "dialogue", text: "My husband is missing. Three days. The police say he'll turn up. I say they're not looking hard enough." },
  { id: "12", type: "action", text: "Marlowe eyes the envelope but doesn't touch it." },
  { id: "13", type: "character", text: "MARLOWE" },
  { id: "14", type: "dialogue", text: "Missing husbands usually don't want to be found, Mrs. Cross." },
  { id: "15", type: "character", text: "VIVIAN" },
  { id: "16", type: "dialogue", text: "This one took two hundred thousand dollars with him. I want the money. You can keep the husband." },
  { id: "17", type: "scene-heading", text: "EXT. RAIN-SLICKED ALLEY - NIGHT", sceneId: 2 },
  { id: "18", type: "action", text: "Marlowe walks through the alley, collar up. Neon signs reflect off wet pavement. He stops at a service door and knocks twice, then once." },
  { id: "19", type: "action", text: "The door cracks open. EDDIE \"THE FIXER\" ROSSI (40s, gold rings, nervous energy) peers through." },
  { id: "20", type: "character", text: "EDDIE" },
  { id: "21", type: "dialogue", text: "You got some nerve coming here, Marlowe." },
  { id: "22", type: "character", text: "MARLOWE" },
  { id: "23", type: "dialogue", text: "Hello to you too, Eddie. I need a name. Whoever moved two hundred grand through this neighborhood in the last week — you'd know about it." },
  { id: "24", type: "scene-heading", text: "INT. THE BLUE NOTE JAZZ CLUB - NIGHT", sceneId: 3 },
  { id: "25", type: "action", text: "A saxophone wails over low conversation. Smoke curls through blue stage light. Marlowe sits at the bar, nursing a bourbon." },
  { id: "26", type: "action", text: "A BARTENDER (60s, seen everything) polishes a glass nearby." },
  { id: "27", type: "character", text: "BARTENDER" },
  { id: "28", type: "dialogue", text: "You look like a man waiting for bad news." },
  { id: "29", type: "character", text: "MARLOWE" },
  { id: "30", type: "dialogue", text: "Just the regular kind." },
  { id: "31", type: "action", text: "Marlowe spots Vivian across the room, sitting in a booth with a MAN he doesn't recognize. She's laughing — a different woman than the one in his office. Marlowe watches, expressionless, and finishes his drink." },
];

interface ScreenplayEditorProps {
  sceneRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
  focusMode: boolean;
  onFocusModeChange: (v: boolean) => void;
  onToggleScenes?: () => void;
  onToggleAI?: () => void;
  showScenes?: boolean;
  showAI?: boolean;
}

// Inline insert bar between elements
function InsertBar({ onInsert }: { onInsert: (type: ElementType) => void }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="group relative h-3 flex items-center -mx-4 px-4">
      <div className="absolute inset-x-4 h-px bg-transparent group-hover:bg-border transition-colors" />
      <div className={cn("absolute left-1/2 -translate-x-1/2 z-10 transition-opacity", open ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button className="w-5 h-5 rounded-full bg-secondary hover:bg-primary/20 border border-border hover:border-primary/40 flex items-center justify-center transition-all hover:scale-110">
              <Plus className="w-3 h-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48 bg-popover border-border">
            {elementTypes.map((el) => {
              const Icon = el.icon;
              return (
                <DropdownMenuItem key={el.id} onClick={() => onInsert(el.id)} className="flex items-center gap-2.5 px-3 py-2 cursor-pointer">
                  <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">{el.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Placeholder text for new elements
function placeholderFor(type: ElementType): string {
  switch (type) {
    case "scene-heading": return "INT. NEW LOCATION - DAY";
    case "action": return "Describe what happens...";
    case "character": return "CHARACTER NAME";
    case "dialogue": return "Dialogue line...";
    case "parenthetical": return "(beat)";
    case "transition": return "CUT TO:";
    case "note": return "Writer's note...";
    default: return "Type here...";
  }
}

let nextId = 100;

export function ScreenplayEditor({ sceneRefs, focusMode, onFocusModeChange, onToggleScenes, onToggleAI, showScenes, showAI }: ScreenplayEditorProps) {
  const [elements, setElements] = React.useState<ScriptElement[]>(initialElements);
  const [activeElement, setActiveElement] = React.useState<ElementType>("action");
  const [fontSize, setFontSize] = React.useState(14);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const active = elementTypes.find((e) => e.id === activeElement) ?? elementTypes[0];
  const ActiveIcon = active.icon;

  // Smart sticky header
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const lastScrollY = React.useRef(0);
  const [headerVisible, setHeaderVisible] = React.useState(true);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const y = el.scrollTop;
      if (y < 80) setHeaderVisible(true);
      else if (y < lastScrollY.current) setHeaderVisible(true);
      else if (y > lastScrollY.current + 4) setHeaderVisible(false);
      lastScrollY.current = y;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Insert element at position
  const insertAt = (index: number, type: ElementType) => {
    const newEl: ScriptElement = {
      id: String(nextId++),
      type,
      text: placeholderFor(type),
      ...(type === "scene-heading" ? { sceneId: Math.max(...elements.filter(e => e.sceneId).map(e => e.sceneId!), 0) + 1 } : {}),
    };
    setElements(prev => [...prev.slice(0, index), newEl, ...prev.slice(index)]);
  };

  // Update element text
  const updateText = (id: string, text: string) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, text } : el));
  };

  // Change element type
  const changeType = (id: string, newType: ElementType) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, type: newType } : el));
  };

  // Delete element
  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
  };

  let currentScene = 0;

  return (
    <div className="flex-1 min-w-0 flex flex-col h-full bg-background">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {/* Sticky header */}
        <div
          className={cn(
            "sticky top-0 z-20 bg-background/95 backdrop-blur-sm transition-transform duration-300 border-b border-transparent",
            !headerVisible && "-translate-y-full"
          )}
        >
          <div className="px-8 sm:px-16 pt-6 pb-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                {!focusMode && (
                  <div className="flex items-center gap-2">
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

              <h1 className="text-2xl font-bold font-mono text-foreground tracking-wide cursor-text" contentEditable suppressContentEditableWarning>
                THE LAST DEAL
              </h1>
              <p className="text-xs text-muted-foreground mt-1 font-sans">
                Noir · Written by Jane Director · ~12 min · {elements.reduce((a, e) => a + e.text.split(/\s+/).length, 0).toLocaleString()} words · {elements.filter(e => e.type === "scene-heading").length} scenes
              </p>
            </div>
          </div>
        </div>

        <FormattingToolbar />

        {/* Script body */}
        <div className="px-8 sm:px-16 py-8">
          <div className="max-w-3xl mx-auto bg-card/60 border border-border/50 rounded-xl px-10 sm:px-16 py-10 shadow-lg shadow-black/20">
            <div className="space-y-0" style={{ fontSize: `${fontSize}px` }}>
              {/* Insert bar at very top */}
              <InsertBar onInsert={(type) => insertAt(0, type)} />

              {elements.map((el, i) => {
                const isNewScene = el.sceneId !== undefined;
                const showDivider = isNewScene && currentScene > 0;
                if (isNewScene) currentScene = el.sceneId!;
                const isHovered = hoveredId === el.id;

                const refProps = el.sceneId
                  ? { ref: (node: HTMLDivElement | null) => { sceneRefs.current[el.sceneId!] = node; } }
                  : {};

                // Element type changer (shown on hover, left gutter)
                const typeChanger = (
                  <div className={cn("absolute -left-8 top-1/2 -translate-y-1/2 transition-opacity", isHovered ? "opacity-100" : "opacity-0")}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Change type">
                          {(() => { const t = elementTypes.find(e => e.id === el.type); return t ? <t.icon className="w-3 h-3" /> : null; })()}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" side="left" className="w-48 bg-popover border-border">
                        {elementTypes.map((et) => {
                          const Icon = et.icon;
                          const isCurrent = et.id === el.type;
                          return (
                            <DropdownMenuItem key={et.id} onClick={() => changeType(el.id, et.id)} className={cn("flex items-center gap-2.5 px-3 py-1.5 cursor-pointer", isCurrent && "bg-primary/10")}>
                              <Icon className={cn("w-3.5 h-3.5 shrink-0", isCurrent ? "text-primary" : "text-muted-foreground")} />
                              <span className={cn("text-xs", isCurrent ? "text-primary" : "text-foreground")}>{et.label}</span>
                            </DropdownMenuItem>
                          );
                        })}
                        <DropdownMenuItem onClick={() => deleteElement(el.id)} className="flex items-center gap-2.5 px-3 py-1.5 cursor-pointer text-destructive">
                          <Trash2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-xs">Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );

                const wrapElement = (content: React.ReactNode) => (
                  <React.Fragment key={el.id}>
                    <div
                      className="relative"
                      onMouseEnter={() => setHoveredId(el.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      {typeChanger}
                      {content}
                    </div>
                    <InsertBar onInsert={(type) => insertAt(i + 1, type)} />
                  </React.Fragment>
                );

                switch (el.type) {
                  case "scene-heading":
                    return wrapElement(
                      <>
                        {showDivider && (
                          <div className="flex items-center gap-3 pt-8 pb-2">
                            <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">Scene {el.sceneId}</span>
                            <div className="flex-1 h-px bg-border" />
                          </div>
                        )}
                        <div {...refProps} className="pt-8 first:pt-0 pb-2 cursor-text rounded-lg px-4 -mx-4 bg-card/50">
                          <div className="flex items-center gap-3">
                            {(() => {
                              const locKey = getLocationKey(el.text);
                              const loc = locKey ? locationThumbnails[locKey] : null;
                              return (
                                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0", loc ? `bg-gradient-to-br ${loc.color}` : "bg-secondary")}>
                                  {loc ? loc.icon : <MapPin className="w-3.5 h-3.5 text-muted-foreground" />}
                                </div>
                              );
                            })()}
                            <p
                              className="font-mono font-bold uppercase text-primary tracking-wider leading-relaxed flex-1 outline-none"
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => updateText(el.id, e.currentTarget.textContent || "")}
                            >
                              {el.text}
                            </p>
                          </div>
                        </div>
                      </>
                    );
                  case "action":
                    return wrapElement(
                      <div className="py-1.5 cursor-text">
                        <p
                          className="font-mono text-foreground/90 leading-relaxed outline-none"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => updateText(el.id, e.currentTarget.textContent || "")}
                        >
                          {el.text}
                        </p>
                      </div>
                    );
                  case "character": {
                    const charData = characterThumbnails[el.text];
                    const isDefined = !!charData;
                    return wrapElement(
                      <div className="pt-5 pb-0 cursor-text flex items-center gap-3 justify-center">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0 transition-all",
                              "hover:scale-110 hover:ring-2 hover:ring-primary/50",
                              isDefined
                                ? `bg-gradient-to-br ${charData.color} text-foreground`
                                : "bg-secondary text-muted-foreground border border-dashed border-muted-foreground/40 hover:border-primary/60"
                            )}>
                              {isDefined ? charData.initials : <UserCircle className="w-3 h-3" />}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent side="left" align="start" className="w-56 p-3 bg-popover border-border">
                            {isDefined ? (
                              <div className="flex items-center gap-3">
                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-gradient-to-br", charData.color, "text-foreground")}>{charData.initials}</div>
                                <div>
                                  <p className="text-sm font-semibold text-foreground">{el.text}</p>
                                  <p className="text-xs text-muted-foreground">Defined character</p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-foreground">{el.text}</p>
                                <p className="text-xs text-muted-foreground">Not yet defined</p>
                                <button className="w-full text-xs font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Define Character</button>
                              </div>
                            )}
                          </PopoverContent>
                        </Popover>
                        <p
                          className="font-mono font-bold uppercase text-primary outline-none"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => updateText(el.id, e.currentTarget.textContent || "")}
                        >
                          {el.text}
                        </p>
                      </div>
                    );
                  }
                  case "dialogue":
                    return wrapElement(
                      <div className="mx-auto w-[65%] pb-1 cursor-text">
                        <p
                          className="font-mono text-foreground/90 text-center leading-relaxed outline-none"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => updateText(el.id, e.currentTarget.textContent || "")}
                        >
                          {el.text}
                        </p>
                      </div>
                    );
                  case "parenthetical":
                    return wrapElement(
                      <div className="mx-auto w-[65%] cursor-text">
                        <p
                          className="font-mono italic text-muted-foreground text-center outline-none"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => updateText(el.id, e.currentTarget.textContent || "")}
                        >
                          {el.text}
                        </p>
                      </div>
                    );
                  case "transition":
                    return wrapElement(
                      <div className="py-2 text-right cursor-text">
                        <p
                          className="font-mono font-bold uppercase text-foreground/70 outline-none"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => updateText(el.id, e.currentTarget.textContent || "")}
                        >
                          {el.text}
                        </p>
                      </div>
                    );
                  case "note":
                    return wrapElement(
                      <div className="py-2 px-4 -mx-4 bg-primary/5 border-l-2 border-primary/30 rounded-r cursor-text">
                        <p
                          className="font-sans text-sm italic text-muted-foreground outline-none"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => updateText(el.id, e.currentTarget.textContent || "")}
                        >
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
        </div>
      </div>
    </div>
  );
}
