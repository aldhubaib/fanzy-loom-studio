interface Connector {
  id: string;
  x1: number; y1: number;
  x2: number; y2: number;
  from: string; to: string;
}

interface ConnectorsSvgProps {
  connectors: Connector[];
  connectingFrom: string | null;
  connectingFromPos: { x: number; y: number } | null;
  connectingMouse: { x: number; y: number };
  onDeleteConnection: (from: string, to: string) => void;
}

export function ConnectorsSvg({
  connectors, connectingFrom, connectingFromPos, connectingMouse, onDeleteConnection,
}: ConnectorsSvgProps) {
  return (
    <svg className="absolute inset-0 w-[4000px] h-[4000px]" style={{ pointerEvents: "none" }}>
      {connectors.map(c => {
        const dx = Math.abs(c.x2 - c.x1);
        const curvature = Math.min(140, Math.max(18, dx * 0.35));
        const d = `M ${c.x1} ${c.y1} C ${c.x1 + curvature} ${c.y1}, ${c.x2 - curvature} ${c.y2}, ${c.x2} ${c.y2}`;
        return (
          <g key={c.id} style={{ pointerEvents: "auto", cursor: "pointer" }} onClick={() => onDeleteConnection(c.from, c.to)}>
            <path d={d} stroke="transparent" strokeWidth="16" fill="none" />
            <path d={d} stroke="hsl(var(--primary))" strokeOpacity="0.45" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        );
      })}
      {connectingFrom && connectingFromPos && (() => {
        const p = connectingFromPos;
        const dx = Math.abs(connectingMouse.x - p.x);
        const curvature = Math.min(140, Math.max(18, dx * 0.35));
        return (
          <path
            d={`M ${p.x} ${p.y} C ${p.x + curvature} ${p.y}, ${connectingMouse.x - curvature} ${connectingMouse.y}, ${connectingMouse.x} ${connectingMouse.y}`}
            stroke="hsl(var(--primary))" strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round"
            strokeDasharray="8 6" fill="none"
          />
        );
      })()}
    </svg>
  );
}
