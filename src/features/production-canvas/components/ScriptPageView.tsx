import { memo, useRef, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Heading1, Heading2, Heading3, Pilcrow, Minus } from "lucide-react";
import type { ScriptNode } from "../types";
import type { ZoneBounds } from "../types";

interface ScriptPageViewProps {
  zoneId: string;
  nodes: ScriptNode[];
  bounds: ZoneBounds;
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
  zoneId, nodes, bounds, onUpdateNode,
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

  // Render inside the zone bounds with some padding
  const PAD = 20;

  return (
    <div
      data-node
      className="absolute pointer-events-auto"
      style={{
        left: bounds.x + PAD,
        top: bounds.y + PAD,
        width: bounds.w - PAD * 2,
        height: bounds.h - PAD * 2,
      }}
    >
      {/* Floating format toolbar */}
      <div
        className={cn(
          "absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded-lg bg-card/90 backdrop-blur-sm border border-border/50 transition-opacity z-10",
          isFocused ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {formatButtons.map((btn) => (
          <button
            key={btn.cmd}
            className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            title={btn.label}
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={() => execFormat(btn.cmd)}
          >
            {btn.icon}
          </button>
        ))}
      </div>

      {/* A4-style page */}
      <div
        className="rounded-lg border border-border/40 bg-card/95 shadow-xl overflow-auto h-full"
      >
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          className="p-8 outline-none text-sm text-foreground/90 leading-relaxed min-h-full cursor-text
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
            __html: nodes.length > 0
              ? nodes
                  .map(
                    (n) =>
                      `<div data-section-id="${n.id}"><h1 class="section-heading">${escapeHtml(n.heading)}</h1><p class="section-body">${escapeHtml(n.body)}</p></div><hr />`
                  )
                  .join("")
              : `<p style="color: rgba(255,255,255,0.3)">Start writing your script...</p>`,
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
