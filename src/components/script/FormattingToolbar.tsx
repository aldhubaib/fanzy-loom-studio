import { useState, useEffect, useCallback } from "react";
import {
  Hash, AlignLeft, User, MessageSquare, Parentheses, ArrowRight, StickyNote,
  Bold, Italic, Minus, ChevronDown, Check, Strikethrough, Highlighter,
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
  const [hasSelection, setHasSelection] = useState(false);
  const [selectionText, setSelectionText] = useState("");

  const checkSelection = useCallback(() => {
    const sel = window.getSelection();
    const text = sel?.toString().trim() || "";
    setHasSelection(text.length > 0);
    setSelectionText(text);
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", checkSelection);
    document.addEventListener("mouseup", checkSelection);
    return () => {
      document.removeEventListener("selectionchange", checkSelection);
      document.removeEventListener("mouseup", checkSelection);
    };
  }, [checkSelection]);

  const active = elementTypes.find((e) => e.id === activeElement) ?? elementTypes[0];
  const ActiveIcon = active.icon;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="h-11 flex items-center px-4 gap-2 border-b border-border bg-card/60 backdrop-blur-sm shrink-0 rounded-lg">

        {/* Left — Element type dropdown (always visible) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-secondary transition-colors">
              <ActiveIcon className="w-3.5 h-3.5 text-primary" />
              <span>{active.label}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72 bg-popover border-border">
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

        {/* Context-aware formatting — only shows when text is selected */}
        {hasSelection ? (
          <>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-0.5 animate-in fade-in duration-150">
              <FormatButton tooltip="Bold (⌘B)" active={false}>
                <Bold className="w-3.5 h-3.5" />
              </FormatButton>
              <FormatButton tooltip="Italic (⌘I)" active={false}>
                <Italic className="w-3.5 h-3.5" />
              </FormatButton>
              <FormatButton tooltip="Strikethrough" active={false}>
                <Strikethrough className="w-3.5 h-3.5" />
              </FormatButton>
              <FormatButton tooltip="Highlight" active={false}>
                <Highlighter className="w-3.5 h-3.5" />
              </FormatButton>
              <div className="w-px h-5 bg-border mx-1" />
              <FormatButton tooltip="Scene Break" active={false}>
                <Minus className="w-3.5 h-3.5" />
              </FormatButton>
            </div>
            <div className="ml-2 px-2 py-0.5 rounded bg-secondary">
              <span className="text-[10px] text-muted-foreground">
                {selectionText.length > 30 ? `${selectionText.slice(0, 30)}…` : selectionText}
              </span>
            </div>
          </>
        ) : (
          <span className="text-[10px] text-muted-foreground hidden lg:inline ml-1">⌘1-7 to switch type</span>
        )}

        <div className="ml-auto" />
      </div>
    </TooltipProvider>
  );
}

function FormatButton({ children, tooltip, active }: { children: React.ReactNode; tooltip: string; active: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className={cn(
          "w-7 h-7 rounded-md flex items-center justify-center transition-colors",
          active
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        )}>
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">{tooltip}</TooltipContent>
    </Tooltip>
  );
}
