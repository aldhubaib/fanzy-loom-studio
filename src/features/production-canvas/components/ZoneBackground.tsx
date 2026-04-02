import { memo, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { LayoutGrid, FileText, type LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import type { Zone, ZoneBounds, ZoneType } from "../types";
import { ZONE_CONNECTOR_CONFIGS } from "../constants";
import { makeZonePortId } from "../utils";

// ─── Zone Tool Definition ───────────────────────────────────
// Shared and zone-specific tools are declared here.
// To add a new tool: add it to SHARED_ZONE_TOOLS or ZONE_SPECIFIC_TOOLS.

export interface ZoneToolDef {
  key: string;
  icon: LucideIcon;
  label: string;
}

/** Tools available to all (or most) zone types */
const SHARED_ZONE_TOOLS: { tool: ZoneToolDef; zones: ZoneType[] }[] = [
  {
    tool: { key: "autoGrid", icon: LayoutGrid, label: "Auto Grid" },
    zones: ["casting", "locations", "script", "shots"],
  },
];

/** Tools unique to a specific zone type */
const ZONE_SPECIFIC_TOOLS: Partial<Record<ZoneType, ZoneToolDef[]>> = {
  script: [{ key: "pageView", icon: FileText, label: "Page View" }],
};

function getToolsForZone(type: ZoneType): ZoneToolDef[] {
  const shared = SHARED_ZONE_TOOLS
    .filter((s) => s.zones.includes(type))
    .map((s) => s.tool);
  const specific = ZONE_SPECIFIC_TOOLS[type] ?? [];
  return [...shared, ...specific];
}

// ─── Component ──────────────────────────────────────────────

interface ZoneBackgroundProps {
  zone: Zone;
  bounds: ZoneBounds;
  isSelected: boolean;
  isEditingLabel: boolean;
  onZoneDragStart: (e: React.MouseEvent) => void;
  onLabelDoubleClick: () => void;
  onLabelRename: (newLabel: string) => void;
  onLabelEditCancel: () => void;
  onStartConnect: (e: React.MouseEvent, portId: string) => void;
  onEndConnect: (e: React.MouseEvent, portId: string) => void;
  onSelect?: () => void;
  /** Handler map: tool key → callback. Only tools with a handler are rendered. */
  onToolAction?: Record<string, () => void>;
}

export const ZoneBackground = memo(function ZoneBackground({
  zone, bounds, isSelected, isEditingLabel,
  onZoneDragStart, onLabelDoubleClick, onLabelRename, onLabelEditCancel,
  onStartConnect, onEndConnect, onSelect, onToolAction,
}: ZoneBackgroundProps) {
  const b = bounds;
  const ports = ZONE_CONNECTOR_CONFIGS[zone.type];
  const [hovered, setHovered] = useState(false);

  const tools = useMemo(() => {
    const all = getToolsForZone(zone.type);
    if (!onToolAction) return [];
    return all.filter((t) => onToolAction[t.key]);
  }, [zone.type, onToolAction]);

  return (
    <div
      className="absolute pointer-events-none"
      style={{ left: b.x, top: b.y - 40, width: b.w, height: b.h + 40 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Dashed border */}
      <div
        className={cn(
          "absolute rounded-2xl border-[3px] border-dashed transition-colors cursor-grab active:cursor-grabbing pointer-events-auto",
          isSelected && "border-opacity-80",
        )}
        style={{
          left: 0,
          top: 40,
          width: b.w,
          height: b.h,
          borderColor: `hsl(${zone.color} / ${isSelected || hovered ? 0.55 : 0.25})`,
          background: "hsl(var(--background))",
        }}
        onMouseDown={(e) => { onSelect?.(); onZoneDragStart(e); }}
      />

      {/* Zone-level connectors */}
      {ports.map((port) => {
        const portId = makeZonePortId(zone.id, port.key);
        const portColor = `hsl(${port.color})`;
        const yPos = 40 + b.h * port.yFrac;
        const isLeft = port.side === "left";
        const size = zone.type === "shots" ? 20 : 18;
        const borderW = zone.type === "shots" ? 4 : 3;
        return (
          <TooltipProvider key={port.key} delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="absolute z-30 rounded-full bg-card hover:scale-125 transition-all cursor-crosshair pointer-events-auto"
                  style={{
                    width: size,
                    height: size,
                    borderWidth: borderW,
                    borderStyle: "solid",
                    borderColor: portColor,
                    [isLeft ? "left" : "right"]: -(size / 2),
                    top: yPos - size / 2,
                  }}
                  onMouseDown={(e) => onStartConnect(e, portId)}
                  onMouseUp={(e) => onEndConnect(e, portId)}
                >
                  <div className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity" style={{ backgroundColor: portColor }} />
                </div>
              </TooltipTrigger>
              <TooltipContent side={isLeft ? "left" : "right"} className="text-[10px] py-0.5 px-1.5">
                {port.label}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}

      {/* Label + Zone tools */}
      <div className="absolute top-0 left-4 h-10 flex items-center gap-1.5 pointer-events-auto">
        <div
          className="px-2 cursor-grab active:cursor-grabbing select-none leading-none"
          onMouseDown={onZoneDragStart}
          onDoubleClick={(e) => { e.stopPropagation(); onLabelDoubleClick(); }}
        >
          {isEditingLabel ? (
            <input
              autoFocus
              className="text-lg font-bold bg-transparent border-none outline-none"
              style={{ color: `hsl(${zone.color} / 0.7)` }}
              defaultValue={zone.label}
              onBlur={(e) => {
                const val = e.target.value.trim();
                if (val) onLabelRename(val);
                onLabelEditCancel();
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                if (e.key === "Escape") onLabelEditCancel();
              }}
              onMouseDown={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-lg font-bold" style={{ color: `hsl(${zone.color} / 0.7)` }}>
              {zone.label}
            </span>
          )}
        </div>

        {/* Zone tools — visible on hover or when selected */}
        {(hovered || isSelected) && tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <TooltipProvider key={tool.key} delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="flex items-center justify-center w-7 h-7 rounded-md opacity-60 hover:opacity-100 transition-opacity"
                    style={{ color: `hsl(${zone.color} / 0.8)` }}
                    onClick={(e) => { e.stopPropagation(); onToolAction?.[tool.key]?.(); }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={8} className="text-[10px] py-0.5 px-1.5">
                  {tool.label}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
});