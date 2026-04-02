import { memo } from "react";
import type { Zone, FrameData, CastNode, LocationNode, ScriptNode, ZoneBounds, SelectedItem } from "../types";
import { FRAME_W, FRAME_H, CAST_W, CAST_H, LOC_W, LOC_H, SCRIPT_W, SCRIPT_H, DRAWER_W } from "../constants";

interface CanvasMinimapProps {
  zones: Zone[];
  frames: FrameData[];
  castNodes: CastNode[];
  locationNodes: LocationNode[];
  scriptNodes: ScriptNode[];
  zoneBounds: Record<string, ZoneBounds>;
  selected: SelectedItem;
  showDrawer: boolean;
}

export const CanvasMinimap = memo(function CanvasMinimap({
  zones, frames, castNodes, locationNodes, scriptNodes,
  zoneBounds, selected, showDrawer,
}: CanvasMinimapProps) {
  return (
    <div
      className="absolute bottom-4 w-[140px] h-[90px] bg-card/90 backdrop-blur-sm border border-border rounded-lg overflow-hidden z-20"
      style={{ right: showDrawer ? DRAWER_W + 16 : 16 }}
    >
      <svg className="w-full h-full" viewBox="-600 -100 2200 900">
        {zones.map((z) => {
          const b = zoneBounds[z.id];
          if (!b) return null;
          return (
            <rect
              key={z.id} x={b.x} y={b.y} width={b.w} height={b.h} rx={8}
              fill="none" stroke={`hsl(${z.color})`} strokeOpacity={0.2}
              strokeWidth={3} strokeDasharray="8 6"
            />
          );
        })}
        {frames.map((f) => (
          <rect
            key={f.id} x={f.x} y={f.y} width={FRAME_W} height={FRAME_H} rx={4}
            fill={selected?.id === f.id ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
            fillOpacity={selected?.id === f.id ? 0.6 : 0.2}
          />
        ))}
        {castNodes.map((n) => (
          <rect key={n.id} x={n.x} y={n.y} width={CAST_W} height={CAST_H} rx={4} fill="hsl(190 80% 50%)" fillOpacity={0.3} />
        ))}
        {locationNodes.map((n) => (
          <rect key={n.id} x={n.x} y={n.y} width={LOC_W} height={LOC_H} rx={4} fill="hsl(150 60% 45%)" fillOpacity={0.3} />
        ))}
        {scriptNodes.map((n) => (
          <rect key={n.id} x={n.x} y={n.y} width={SCRIPT_W} height={SCRIPT_H} rx={4} fill="hsl(280 60% 55%)" fillOpacity={0.3} />
        ))}
      </svg>
    </div>
  );
});