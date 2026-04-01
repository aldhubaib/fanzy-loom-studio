import type { FrameData, CastNode, LocationNode } from "./types";
import { FRAME_W, FRAME_H_BASE, CAST_W, CAST_H, LOC_W, LOC_H } from "./constants";

interface MinimapProps {
  frames: FrameData[];
  castNodes: CastNode[];
  locationNodes: LocationNode[];
  selectedFrame: string | null;
  pan: { x: number; y: number };
  zoom: number;
  containerWidth: number;
  containerHeight: number;
}

export function Minimap({
  frames, castNodes, locationNodes, selectedFrame, pan, zoom, containerWidth, containerHeight,
}: MinimapProps) {
  return (
    <div className="absolute bottom-4 right-4 w-[160px] h-[100px] bg-card/90 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 1200 700">
        {frames.map(f => (
          <rect
            key={f.id}
            x={f.x} y={f.y}
            width={FRAME_W} height={FRAME_H_BASE}
            rx={6}
            fill={selectedFrame === f.id ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
            fillOpacity={selectedFrame === f.id ? 0.6 : 0.2}
            stroke="hsl(var(--muted-foreground))" strokeOpacity={0.3} strokeWidth={2}
          />
        ))}
        {castNodes.map(n => (
          <rect key={n.id} x={n.x} y={n.y} width={CAST_W} height={CAST_H} rx={6} fill="hsl(190 80% 50%)" fillOpacity={0.3} />
        ))}
        {locationNodes.map(n => (
          <rect key={n.id} x={n.x} y={n.y} width={LOC_W} height={LOC_H} rx={6} fill="hsl(150 60% 45%)" fillOpacity={0.3} />
        ))}
        {containerWidth > 0 && (
          <rect
            x={-pan.x / zoom} y={-pan.y / zoom}
            width={containerWidth / zoom} height={containerHeight / zoom}
            fill="none" stroke="hsl(var(--primary))" strokeWidth={3} rx={4} strokeOpacity={0.5}
          />
        )}
      </svg>
    </div>
  );
}
