import { useState } from "react";
import {
  Hash, AlignLeft, User, MessageSquare, Parentheses, ArrowRight, StickyNote,
  Bold, Italic, Minus, Focus, Info, ChevronDown, Check,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const elementTypes = [
  { id: "scene-heading", label: "Scene Heading", hint: "INT./EXT. LOCATION - TIME", icon: Hash, shortcut: "⌘1" },
  { id: "action", label: "Action", hint: "Regular description", icon: AlignLeft, shortcut: "⌘2" },
  { id: "character", label: "Character", hint: "Character name before dialogue", icon: User, shortcut: "⌘3" },
  { id: "dialogue", label: "Dialogue", hint: "Spoken lines", icon: MessageSquare, shortcut: "⌘4" },
  { id: "parenthetical", label: "Parenthetical", hint: "Acting direction", icon: Parentheses, shortcut: "⌘5" },
  { id: "transition", label: "Transition", hint: "CUT TO, FADE IN, etc.", icon: ArrowRight, shortcut: "⌘6" },
  { id: "note", label: "Note", hint: "Writer's notes, not in final script", icon: StickyNote, shortcut: "⌘7" },
] as const;

type ElementTypeId = typeof elementTypes[number]["id"];

interface FormattingToolbarProps {
  activeElement: ElementTypeId;
  onElementChange: (el: ElementTypeId) => void;
  focusMode: boolean;
  onFocusModeChange: (v: boolean) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

export function FormattingToolbar({
  activeElement,
  onElementChange,
  focusMode,
  onFocusModeChange,
  fontSize,
  onFontSizeChange,
}: FormattingToolbarProps) {
  const active = elementTypes.find((e) => e.id === activeElement) ?? elementTypes[0];
  const ActiveIcon = active.icon;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-11 flex items-center px-4 gap-3 border-b border-border bg-[hsl(240,5%,8%)] shrink-0">
        {/* Left — Element type dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-foreground hover:bg-secondary transition-colors">
              <ActiveIcon className="w-3.5 h-3.5 text-primary" />
              <span>{active.label}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72 bg-[hsl(240,5%,11%)] border-border">
            {elementTypes.map((el) => {
              const Icon = el.icon;
              const isActive = el.id === activeElement;
              return (
                <DropdownMenuItem
                  key={el.id}
                  onClick={() => onElementChange(el.id)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 cursor-pointer",
                    isActive && "bg-primary/10"
                  )}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                  <div className="flex-1 min-w-0">
                    <span className={cn("text-xs font-medium", isActive ? "text-primary" : "text-foreground")}>
                      {el.label}
                    </span>
                    <p className="text-[10px] text-muted-foreground truncate">{el.hint}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{el.shortcut}</span>
                  {isActive && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="text-[10px] text-muted-foreground hidden lg:inline">⌘1-7 to switch element type</span>

        {/* Separator */}
        <div className="w-px h-5 bg-border" />

        {/* Center — Quick format buttons */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton tooltip="Bold">
            <span className="text-xs font-bold">B</span>
          </ToolbarButton>
          <ToolbarButton tooltip="Italic">
            <span className="text-xs italic font-serif">I</span>
          </ToolbarButton>
          <ToolbarButton tooltip="Scene / Page Break">
            <Minus className="w-3.5 h-3.5" />
          </ToolbarButton>
        </div>

        {/* Separator */}
        <div className="w-px h-5 bg-border" />

        {/* Right — Editor controls */}
        <div className="ml-auto flex items-center gap-3">
          {/* Font size */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onFontSizeChange(Math.max(12, fontSize - 2))}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1"
            >
              A-
            </button>
            <span className="text-[10px] text-muted-foreground w-6 text-center">{fontSize}pt</span>
            <button
              onClick={() => onFontSizeChange(Math.min(16, fontSize + 2))}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1"
            >
              A+
            </button>
          </div>

          <div className="w-px h-5 bg-border" />

          {/* Focus mode */}
          <label className="flex items-center gap-2 cursor-pointer">
            <Focus className={cn("w-3.5 h-3.5", focusMode ? "text-primary" : "text-muted-foreground")} />
            <span className="text-[10px] text-muted-foreground">Focus</span>
            <Switch checked={focusMode} onCheckedChange={onFocusModeChange} className="h-4 w-7 [&>span]:h-3 [&>span]:w-3" />
          </label>

          <div className="w-px h-5 bg-border" />

          {/* Format info */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Info className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs text-xs leading-relaxed">
              <p className="font-semibold mb-1">Screenplay Format</p>
              <p>Scene headings use INT./EXT. + LOCATION - TIME. Character names are centered and uppercase. Dialogue sits in a narrower column below the character name.</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}

function ToolbarButton({ children, tooltip }: { children: React.ReactNode; tooltip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">{tooltip}</TooltipContent>
    </Tooltip>
  );
}
