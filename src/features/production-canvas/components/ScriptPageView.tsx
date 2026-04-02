import { memo, useRef, useCallback, useState, useEffect } from "react";
import { createPortal } from "react-dom";
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

interface ToolbarPos {
  x: number;
  y: number;
}

const TOOLBAR_GAP = 12;
const TOOLBAR_HEIGHT = 44;
const TOOLBAR_HALF_WIDTH = 120;
const VIEWPORT_MARGIN = 16;

export const ScriptPageView = memo(function ScriptPageView({
  zoneId, nodes, bounds, onUpdateNode,
}: ScriptPageViewProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [toolbarPos, setToolbarPos] = useState<ToolbarPos | null>(null);

  const updateToolbarPos = useCallback(() => {
    const sel = window.getSelection();
    const editor = editorRef.current;

    if (!sel || sel.isCollapsed || sel.rangeCount === 0 || !editor) {
      setToolbarPos(null);
      return;
    }

    if (
      !sel.anchorNode ||
      !sel.focusNode ||
      !editor.contains(sel.anchorNode) ||
      !editor.contains(sel.focusNode)
    ) {
      setToolbarPos(null);
      return;
    }

    const range = sel.getRangeAt(0);
    let rect = range.getBoundingClientRect();

    if (!rect.width && !rect.height) {
      const rects = range.getClientRects();
      if (!rects.length) {
        setToolbarPos(null);
        return;
      }
      rect = rects[0];
    }

    const centeredX = rect.left + rect.width / 2;
    const minX = VIEWPORT_MARGIN + TOOLBAR_HALF_WIDTH;
    const maxX = window.innerWidth - VIEWPORT_MARGIN - TOOLBAR_HALF_WIDTH;
    const yAbove = rect.top - TOOLBAR_HEIGHT - TOOLBAR_GAP;

    setToolbarPos({
      x: Math.min(Math.max(centeredX, minX), Math.max(minX, maxX)),
      y: yAbove >= VIEWPORT_MARGIN ? yAbove : rect.bottom + TOOLBAR_GAP,
    });
  }, []);

  const execFormat = useCallback((cmd: FormatCmd) => {
    editorRef.current?.focus();
    if (cmd === "hr") {
      document.execCommand("insertHorizontalRule");
    } else {
      document.execCommand("formatBlock", false, `<${cmd}>`);
    }
    requestAnimationFrame(updateToolbarPos);
  }, [updateToolbarPos]);

  // Track text selection to position toolbar
  useEffect(() => {
    document.addEventListener("selectionchange", updateToolbarPos);
    window.addEventListener("resize", updateToolbarPos);
    window.addEventListener("scroll", updateToolbarPos, true);

    return () => {
      document.removeEventListener("selectionchange", updateToolbarPos);
      window.removeEventListener("resize", updateToolbarPos);
      window.removeEventListener("scroll", updateToolbarPos, true);
    };
  }, [updateToolbarPos]);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    const nextTarget = e.relatedTarget as HTMLElement | null;
    if (nextTarget?.closest("[data-script-toolbar]")) return;
    setToolbarPos(null);
    if (!editorRef.current) return;
    const sections = editorRef.current.querySelectorAll("[data-section-id]");
    const sectionIds: string[] = [];
    sections.forEach((section) => {
      const id = section.getAttribute("data-section-id");
      if (!id) return;
      sectionIds.push(id);
      const headingEl = section.querySelector("h1, h2, h3, .section-heading");
      const bodyEl = section.querySelector(".section-body");
      const heading = headingEl?.textContent?.trim() || "";
      const body = bodyEl?.textContent?.trim() || "";
      const node = nodes.find((n) => n.id === id);
      if (node && (heading !== node.heading || body !== node.body)) {
        onUpdateNode(id, { heading, body });
      }
    });
    // Sync order from DOM order
    sectionIds.forEach((id, index) => {
      const node = nodes.find((n) => n.id === id);
      if (node && (node.order ?? 0) !== index) {
        onUpdateNode(id, { order: index });
      }
    });
  }, [nodes, onUpdateNode]);

  const PAD = 20;

  return (
    <div
      data-node
      data-page-view
      className="absolute pointer-events-auto"
      style={{
        left: bounds.x + PAD,
        top: bounds.y + PAD,
        width: bounds.w - PAD * 2,
        height: bounds.h - PAD * 2,
      }}
    >
      {/* Bubble toolbar near selection */}
      {toolbarPos && typeof document !== "undefined" && createPortal(
        <div
          data-script-toolbar
          className="fixed flex items-center gap-1 px-2 py-1 rounded-lg bg-card/95 backdrop-blur-sm border border-border/50 shadow-lg z-[60]"
          style={{ left: toolbarPos.x, top: toolbarPos.y, transform: "translateX(-50%)" }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
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
        </div>,
        document.body
      )}

      {/* A4-style page */}
      <div className="rounded-lg border border-border/40 bg-card/95 shadow-xl overflow-auto h-full">
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
          onBlur={handleBlur}
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          dangerouslySetInnerHTML={{
            __html: nodes.length > 0
              ? nodes
                  .map(
                    (n, i) =>
                      `<div data-section-id="${n.id}"><h1 class="section-heading"><span contenteditable="false" style="user-select:none;pointer-events:none;margin-right:8px;opacity:0.5;font-size:0.75em;">SC ${i + 1}</span>${escapeHtml(n.heading)}</h1><p class="section-body">${escapeHtml(n.body)}</p></div><hr />`
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
