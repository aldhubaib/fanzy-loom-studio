import { memo } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import type { Zone, ZoneBounds, ZoneConnectorConfig } from "../types";
import { ZONE_CONNECTOR_CONFIGS } from "../constants";
import { makeZonePortId } from "../utils";

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
}

export const ZoneBackground = memo(function ZoneBackground({
  zone, bounds, isSelected, isEditingLabel,
  onZoneDragStart, onLabelDoubleClick, onLabelRename, onLabelEditCancel,
  onStartConnect, onEndConnect,
}: ZoneBackgroundProps) {
  const b = bounds;
  const ports = ZONE_CONNECTOR_CONFIGS[zone.type];

  return (
    <div className="absolute pointer-events-none" style={{ left: b.x, top: b.y, width: b.w, height: b.h }}>
      {/* Dashed border */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl border-2 border-dashed transition-colors cursor-grab active:cursor-grabbing pointer-events-auto",
          isSelected && "border-opacity-80",
        )}
        style={{
          borderColor: `hsl(${zone.color} / ${isSelected ? 0.6 : 0.25})`,
          background: "hsl(var(--background))",
        }}
        onMouseDown={onZoneDragStart}
      />

      {/* Zone-level connectors */}
      {ports.map((port) => {
        const portId = makeZonePortId(zone.id, port.key);
        const portColor = `hsl(${port.color})`;
        const yPos = b.h * port.yFrac;
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

      {/* Label */}
      <div
        className="absolute -top-8 left-4 px-3 py-1 cursor-grab active:cursor-grabbing select-none pointer-events-auto"
        onMouseDown={onZoneDragStart}
        onDoubleClick={(e) => { e.stopPropagation(); onLabelDoubleClick(); }}
      >
        {isEditingLabel ? (
          <input
            autoFocus
            className="text-lg font-bold bg-transparent border-b border-current outline-none"
            style={{ color: `hsl(${zone.color} / 0.7)` }}
            defaultValue={zone.label}
            onBlur={(e) => {
              const val = e.target.value.trim();
              if (val) onLabelRename(val);
              onLabelEditCancel();
            }}
            onKeyDown={(e) => {
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
    </div>
  );
});