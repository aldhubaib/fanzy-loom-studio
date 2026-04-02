import { memo, useRef, useCallback, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Heading1, Heading2, Heading3, Pilcrow, Minus, GripVertical } from "lucide-react";
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ── Draggable Section ──────────────────────────────────── */

interface SectionProps {
  node: ScriptNode;
  sceneNumber: number;
  onUpdateNode: (id: string, updates: Partial<ScriptNode>) => void;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDragEnd: () => void;
  isDragOver: boolean;
  isDragging: boolean;
}

const ScriptSection = memo(function ScriptSection({
  node, sceneNumber, onUpdateNode, onDragStart, onDragOver, onDragEnd, isDragOver, isDragging,
}: SectionProps) {
  const headingRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const handleBlur = useCallback(() => {
    const heading = headingRef.current?.textContent?.trim() || "";
    const body = bodyRef.current?.textContent?.trim() || "";
    if (heading !== node.heading || body !== node.body) {
      onUpdateNode(node.id, { heading, body });
    }
  }, [node, onUpdateNode]);

  return (
    <div
      data-section-id={node.id}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart(node.id);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        onDragOver(node.id);
      }}
      onDragEnd={onDragEnd}
      className={`group relative transition-opacity ${isDragging ? "opacity-30" : ""}`}
    >
      {/* Drop indicator line */}
      {isDragOver && (
        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-purple-500 rounded-full z-10" />
      )}

      <div className="flex gap-2">
        {/* Drag handle */}
        <div
          className="shrink-0 pt-5 cursor-grab opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Heading row */}
          <div className="flex items-baseline gap-2 mt-4 mb-2">
            <span
              className="shrink-0 text-[0.7em] font-bold tracking-wider uppercase select-none"
              style={{ color: "rgba(168,130,255,0.55)" }}
            >
              SC {sceneNumber}
            </span>
            <div
              ref={headingRef}
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              className="text-xl font-bold text-purple-400 uppercase tracking-wider outline-none cursor-text min-w-[20px] flex-1"
              onBlur={handleBlur}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              dangerouslySetInnerHTML={{ __html: escapeHtml(node.heading) }}
            />
          </div>

          {/* Body */}
          <div
            ref={bodyRef}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            className="text-sm text-muted-foreground mb-2 outline-none cursor-text min-h-[1.5em]"
            onBlur={handleBlur}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            dangerouslySetInnerHTML={{ __html: escapeHtml(node.body) }}
          />
        </div>
      </div>

      {/* Divider */}
      <hr className="border-purple-500/30 my-6" />
    </div>
  );
});

/* ── Page View ──────────────────────────────────────────── */

export const ScriptPageView = memo(function ScriptPageView({
  zoneId, nodes, bounds, onUpdateNode,
}: ScriptPageViewProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [toolbarPos, setToolbarPos] = useState<ToolbarPos | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

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

  /* ── Drag & drop reorder ── */
  const handleDragStart = useCallback((id: string) => setDragId(id), []);
  const handleDragOver = useCallback((id: string) => setDragOverId(id), []);

  const handleDragEnd = useCallback(() => {
    if (dragId && dragOverId && dragId !== dragOverId) {
      const ordered = [...nodes];
      const fromIdx = ordered.findIndex((n) => n.id === dragId);
      const toIdx = ordered.findIndex((n) => n.id === dragOverId);
      if (fromIdx !== -1 && toIdx !== -1) {
        const [moved] = ordered.splice(fromIdx, 1);
        ordered.splice(toIdx, 0, moved);
        ordered.forEach((n, i) => {
          if ((n.order ?? 0) !== i) {
            onUpdateNode(n.id, { order: i });
          }
        });
      }
    }
    setDragId(null);
    setDragOverId(null);
  }, [dragId, dragOverId, nodes, onUpdateNode]);

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
          className="p-8 min-h-full"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {nodes.length > 0 ? (
            nodes.map((n, i) => (
              <ScriptSection
                key={n.id}
                node={n}
                sceneNumber={i + 1}
                onUpdateNode={onUpdateNode}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                isDragOver={dragOverId === n.id && dragId !== n.id}
                isDragging={dragId === n.id}
              />
            ))
          ) : (
            <p className="text-muted-foreground/30 text-sm">Start writing your script...</p>
          )}
        </div>
      </div>
    </div>
  );
});
