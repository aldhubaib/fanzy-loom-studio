import { memo, useRef, useCallback, useState } from "react";
import {
  Bold, Italic, Heading1, Heading2, Heading3, Pilcrow,
  Minus, Type, Undo2, Redo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SCREENPLAY_W } from "../constants";

export interface ScreenplayNodeData {
  id: string;
  content: string;
  x: number;
  y: number;
  zoneId: string;
}

interface ScreenplayEditorNodeProps {
  node: ScreenplayNodeData;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onUpdate: (id: string, updates: Partial<ScreenplayNodeData>) => void;
}

const DEFAULT_CONTENT = `<h1>UNTITLED SCREENPLAY</h1>
<p><br></p>
<h2>INT. LOCATION - DAY</h2>
<p>Scene description goes here. Write your action lines, character introductions, and scene direction.</p>
<p><br></p>
<p><strong>CHARACTER NAME</strong></p>
<p>Dialogue goes here.</p>
<p><br></p>
<hr>
<p><br></p>
<h2>EXT. LOCATION - NIGHT</h2>
<p>Next scene begins after the divider above. Each divider marks a new shot break.</p>`;

type FormatAction =
  | { cmd: "formatBlock"; value: string }
  | { cmd: "bold" }
  | { cmd: "italic" }
  | { cmd: "insertHorizontalRule" }
  | { cmd: "undo" }
  | { cmd: "redo" };

const toolbarButtons: { icon: React.ReactNode; label: string; action: FormatAction }[] = [
  { icon: <Undo2 className="w-3.5 h-3.5" />, label: "Undo", action: { cmd: "undo" } },
  { icon: <Redo2 className="w-3.5 h-3.5" />, label: "Redo", action: { cmd: "redo" } },
  { icon: <Heading1 className="w-3.5 h-3.5" />, label: "Heading 1", action: { cmd: "formatBlock", value: "h1" } },
  { icon: <Heading2 className="w-3.5 h-3.5" />, label: "Heading 2", action: { cmd: "formatBlock", value: "h2" } },
  { icon: <Heading3 className="w-3.5 h-3.5" />, label: "Heading 3", action: { cmd: "formatBlock", value: "h3" } },
  { icon: <Pilcrow className="w-3.5 h-3.5" />, label: "Paragraph", action: { cmd: "formatBlock", value: "p" } },
  { icon: <Bold className="w-3.5 h-3.5" />, label: "Bold", action: { cmd: "bold" } },
  { icon: <Italic className="w-3.5 h-3.5" />, label: "Italic", action: { cmd: "italic" } },
  { icon: <Minus className="w-3.5 h-3.5" />, label: "Shot Divider", action: { cmd: "insertHorizontalRule" } },
];

export const ScreenplayEditorNode = memo(function ScreenplayEditorNode({
  node,
  isSelected,
  onMouseDown,
  onUpdate,
}: ScreenplayEditorNodeProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const execCommand = useCallback((action: FormatAction) => {
    editorRef.current?.focus();
    if (action.cmd === "formatBlock") {
      document.execCommand("formatBlock", false, `<${action.value}>`);
    } else if (action.cmd === "bold") {
      document.execCommand("bold");
    } else if (action.cmd === "italic") {
      document.execCommand("italic");
    } else if (action.cmd === "insertHorizontalRule") {
      document.execCommand("insertHorizontalRule");
    } else if (action.cmd === "undo") {
      document.execCommand("undo");
    } else if (action.cmd === "redo") {
      document.execCommand("redo");
    }
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const html = editorRef.current?.innerHTML ?? "";
    if (html !== node.content) {
      onUpdate(node.id, { content: html });
    }
  }, [node.id, node.content, onUpdate]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const stopDrag = (e: React.MouseEvent) => e.stopPropagation();

  const content = node.content || DEFAULT_CONTENT;

  return (
    <div
      data-node
      className={cn(
        "absolute rounded-xl border-2 bg-card overflow-hidden select-none group flex flex-col",
        isSelected
          ? "border-amber-500 shadow-lg shadow-amber-500/20"
          : "border-border hover:border-amber-500/40",
      )}
      style={{ left: node.x, top: node.y, width: SCREENPLAY_W }}
      onMouseDown={onMouseDown}
    >
      {/* Floating toolbar — visible when editor focused or node selected */}
      <div
        className={cn(
          "flex items-center gap-0.5 px-2 py-1.5 bg-muted/80 backdrop-blur-sm border-b border-border transition-opacity",
          isFocused || isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
        onMouseDown={stopDrag}
      >
        <div className="flex items-center gap-0.5 mr-1">
          <Type className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mr-2">
            Screenplay
          </span>
        </div>
        <div className="w-px h-4 bg-border mx-1" />
        {toolbarButtons.map((btn, i) => (
          <button
            key={i}
            className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              execCommand(btn.action);
            }}
            title={btn.label}
          >
            {btn.icon}
          </button>
        ))}
      </div>

      {/* A4 page area */}
      <div
        className="bg-white/[0.03] overflow-y-auto"
        style={{ height: 800 }}
        onMouseDown={stopDrag}
      >
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          className={cn(
            "screenplay-editor px-10 py-8 min-h-full outline-none cursor-text select-text",
            "text-foreground/90 leading-relaxed",
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
});
