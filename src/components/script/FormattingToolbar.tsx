import { useState, useEffect, useCallback, useRef } from "react";
import { Bold, Italic, Strikethrough, Highlighter, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function FormattingToolbar() {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setVisible(false);
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Position above the selection, centered
    const toolbarWidth = 200;
    const top = rect.top + window.scrollY - 48;
    const left = rect.left + window.scrollX + rect.width / 2 - toolbarWidth / 2;

    setPosition({
      top: Math.max(8, top),
      left: Math.max(8, Math.min(left, window.innerWidth - toolbarWidth - 8)),
    });
    setVisible(true);
  }, []);

  useEffect(() => {
    const onSelectionChange = () => {
      // Small delay to let selection settle
      requestAnimationFrame(updatePosition);
    };

    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("mouseup", onSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
      document.removeEventListener("mouseup", onSelectionChange);
    };
  }, [updatePosition]);

  if (!visible) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-[100] flex items-center gap-0.5 px-2 py-1.5 rounded-xl bg-card/95 backdrop-blur-md border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-100"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
    >
      <FormatButton tooltip="Bold">
        <Bold className="w-3.5 h-3.5" />
      </FormatButton>
      <FormatButton tooltip="Italic">
        <Italic className="w-3.5 h-3.5" />
      </FormatButton>
      <FormatButton tooltip="Strikethrough">
        <Strikethrough className="w-3.5 h-3.5" />
      </FormatButton>
      <FormatButton tooltip="Highlight">
        <Highlighter className="w-3.5 h-3.5" />
      </FormatButton>
      <div className="w-px h-4 bg-border mx-0.5" />
      <FormatButton tooltip="Break">
        <Minus className="w-3.5 h-3.5" />
      </FormatButton>
    </div>
  );
}

function FormatButton({ children, tooltip }: { children: React.ReactNode; tooltip: string }) {
  return (
    <button
      title={tooltip}
      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
    >
      {children}
    </button>
  );
}
