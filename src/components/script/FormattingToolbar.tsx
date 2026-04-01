import { useState, useEffect, useCallback } from "react";
import {
  Bold, Italic, Minus, Strikethrough, Highlighter,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function FormattingToolbar() {
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

  if (!hasSelection) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="h-10 flex items-center px-4 gap-1 border-b border-border bg-card/60 backdrop-blur-sm shrink-0 rounded-lg animate-in fade-in duration-150">
        <FormatButton tooltip="Bold (⌘B)">
          <Bold className="w-3.5 h-3.5" />
        </FormatButton>
        <FormatButton tooltip="Italic (⌘I)">
          <Italic className="w-3.5 h-3.5" />
        </FormatButton>
        <FormatButton tooltip="Strikethrough">
          <Strikethrough className="w-3.5 h-3.5" />
        </FormatButton>
        <FormatButton tooltip="Highlight">
          <Highlighter className="w-3.5 h-3.5" />
        </FormatButton>
        <div className="w-px h-5 bg-border mx-1" />
        <FormatButton tooltip="Scene Break">
          <Minus className="w-3.5 h-3.5" />
        </FormatButton>
        <div className="ml-2 px-2 py-0.5 rounded bg-secondary">
          <span className="text-[10px] text-muted-foreground">
            {selectionText.length > 30 ? `${selectionText.slice(0, 30)}…` : selectionText}
          </span>
        </div>
      </div>
    </TooltipProvider>
  );
}

function FormatButton({ children, tooltip }: { children: React.ReactNode; tooltip: string }) {
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
