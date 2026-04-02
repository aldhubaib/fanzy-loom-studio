import { memo } from "react";
import type { ConnectorData } from "../types";
import { CONNECTOR_SVG_OFFSET, CONNECTOR_SVG_SIZE } from "../constants";

interface CanvasConnectorsProps {
  connectors: ConnectorData[];
  connectingFrom: string | null;
  connectingFromPos: { x: number; y: number } | null;
  connectingMouse: { x: number; y: number };
  onDeleteConnection: (from: string, to: string) => void;
}

export const CanvasConnectors = memo(function CanvasConnectors({
  connectors, connectingFrom, connectingFromPos, connectingMouse, onDeleteConnection,
}: CanvasConnectorsProps) {
  return (
    <svg
      className="absolute pointer-events-none overflow-visible z-10"
      style={{
        left: -CONNECTOR_SVG_OFFSET,
        top: -CONNECTOR_SVG_OFFSET,
        width: CONNECTOR_SVG_SIZE,
        height: CONNECTOR_SVG_SIZE,
        position: "absolute",
      }}
      viewBox={`-${CONNECTOR_SVG_OFFSET} -${CONNECTOR_SVG_OFFSET} ${CONNECTOR_SVG_SIZE} ${CONNECTOR_SVG_SIZE}`}
    >
      {connectors.map((c) => {
        const dx = Math.abs(c.x2 - c.x1);
        const curve = Math.min(200, Math.max(30, dx * 0.35));
        const strokeColor = `hsl(${c.color})`;
        return (
          <g
            key={`${c.from}-${c.to}`}
            style={{ pointerEvents: "auto", cursor: "pointer" }}
            onClick={() => onDeleteConnection(c.from, c.to)}
          >
            <path
              d={`M ${c.x1} ${c.y1} C ${c.x1 + curve} ${c.y1}, ${c.x2 - curve} ${c.y2}, ${c.x2} ${c.y2}`}
              stroke="transparent" strokeWidth="16" fill="none"
            />
            <path
              d={`M ${c.x1} ${c.y1} C ${c.x1 + curve} ${c.y1}, ${c.x2 - curve} ${c.y2}, ${c.x2} ${c.y2}`}
              stroke={strokeColor}
              strokeOpacity={0.5}
              strokeWidth={c.isZoneConn ? 3 : 2.5}
              strokeLinecap="round"
              fill="none"
            />
          </g>
        );
      })}
      {connectingFrom && connectingFromPos && (() => {
        const p = connectingFromPos;
        const dx = Math.abs(connectingMouse.x - p.x);
        const curve = Math.min(200, Math.max(30, dx * 0.35));
        return (
          <path
            d={`M ${p.x} ${p.y} C ${p.x + curve} ${p.y}, ${connectingMouse.x - curve} ${connectingMouse.y}, ${connectingMouse.x} ${connectingMouse.y}`}
            stroke="hsl(var(--primary))" strokeOpacity="0.7" strokeWidth="2.5"
            strokeLinecap="round" strokeDasharray="8 6" fill="none"
          />
        );
      })()}
    </svg>
  );
});