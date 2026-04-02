import { memo, useRef, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Heading1, Heading2, Heading3, Pilcrow, Minus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import type { ScriptNode } from "../types";

// A4 ratio: 210mm × 297mm ≈ 0.707 aspect
const PAGE_W = 620;
const PAGE_H = 877;

interface ScriptPageViewProps {
  zoneId: string;
  nodes: ScriptNode[];
  zoneX: number;
  zoneY: number;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onUpdateNode: (id: string, updates: Partial<ScriptNode>) => void;
}

type FormatCmd = "h1" | "h2" | "h3" | "p" | "hr";

const formatButtons: { cmd: FormatCmd; icon: React.ReactNode; label: string }[] = [
  { cmd: "h1", icon: <Heading1 className="w-3.5 h-3.5" />, label: "Heading 1" },
  { cmd: "h2", icon: <Heading2 className="w-3.5 h-3.5" />, label: "Heading 2" },
  { cmd: "h3", icon: <Heading3 className="w-3.5 h-3.5" />, label: "Heading 3" },
  { cmd: "p", icon: <Pilcrow className="w-3.5 h-3.5" />, label: "Paragraph" },
  { cmd: "hr", icon: <Minus className="w-3.5 h-3.5" />, label: "Section Divider" },
];

export const ScriptPageView = memo(function ScriptPageView({
  zoneId, nodes, zoneX, zoneY, isSelected, onMouseDown, onUpdateNode,
}: ScriptPageViewProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const execFormat = useCallback((cmd: FormatCmd) => {
    editorRef.current?.focus();
    if (cmd === "hr") {
      document.execCommand("insertHorizontalRule");
    } else {
      document.execCommand("formatBlock", false, `<${cmd}>`);
    }
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Parse sections from the editor content back to nodes
    if (!editorRef.current) return;
    const sections = editorRef.current.querySelectorAll("[data-section-id]");
    sections.forEach((section) => {
      const id = section.getAttribute("data-section-id");
      if (!id) return;
      const headingEl = section.querySelector("h1, h2, h3, .section-heading");
      const bodyEl = section.querySelector(".section-body");
      const heading = headingEl?.textContent?.trim() || "";
      const body = bodyEl?.textContent?.trim() || "";
      const node = nodes.find((n) => n.id === id);
      if (node && (heading !== node.heading || body !== node.body)) {
        onUpdateNode(id, { heading, body });
      }
    });
  }, [nodes, onUpdateNode]);

  // Position: offset from zone anchor
  const posX = zoneX + 40;
  const posY = zoneY + 80;

  return (
    <div
      data-node
      className={cn(
        "absolute select-none",
        isSelected && "ring-2 ring-purple-500/30 rounded-lg",
      )}
      style={{ left: posX, top: posY, width: PAGE_W }}
      onMouseDown={onMouseDown}
    >
      {/* Floating toolbar */}
      <div
        className={cn(
          "absolute -top-10 left-0 flex items-center gap-1 px-2 py-1 rounded-lg bg-card/90 backdrop-blur-sm border border-border/50 transition-opacity z-10",
          isFocused || isSelected ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {formatButtons.map((btn) => (
          <TooltipProvider key={btn.cmd} delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onClick={() => execFormat(btn.cmd)}
                >
                  {btn.icon}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[10px] py-0.5 px-1.5">
                {btn.label}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {/* A4 page */}
      <div
        className="rounded-lg border border-border/40 bg-card/95 shadow-xl overflow-hidden"
        style={{ width: PAGE_W, minHeight: PAGE_H }}
      >
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          className="p-8 outline-none text-sm text-foreground/90 leading-relaxed min-h-[400px] cursor-text
            [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-purple-400 [&_h1]:uppercase [&_h1]:tracking-wider [&_h1]:mb-2 [&_h1]:mt-4
            [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-purple-300 [&_h2]:mb-2 [&_h2]:mt-3
            [&_h3]:text-base [&_h3]:font-medium [&_h3]:text-purple-200 [&_h3]:mb-1.5 [&_h3]:mt-2.5
            [&_p]:text-muted-foreground [&_p]:mb-2
            [&_hr]:border-purple-500/30 [&_hr]:my-6"
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          dangerouslySetInnerHTML={{
            __html: nodes
              .map(
                (n) =>
                  `<div data-section-id="${n.id}"><h1 class="section-heading">${escapeHtml(n.heading)}</h1><p class="section-body">${escapeHtml(n.body)}</p></div><hr />`
              )
              .join(""),
          }}
        />
      </div>
    </div>
  );
});

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
