import { memo } from "react";
import { Users, Camera, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { Zone, CastNode, LocationNode, FrameData } from "../types";

interface ZoneDrawerProps {
  zone: Zone;
  castNodes: CastNode[];
  locationNodes: LocationNode[];
  frames: FrameData[];
}

const zoneIcons = {
  casting: Users,
  shots: Camera,
  locations: MapPin,
  script: Camera,
};

export const ZoneDrawer = memo(function ZoneDrawer({
  zone, castNodes, locationNodes, frames,
}: ZoneDrawerProps) {
  const castCount = castNodes.filter((n) => n.zoneId === zone.id).length;
  const locCount = locationNodes.filter((n) => n.zoneId === zone.id).length;
  const frameCount = frames.filter((f) => f.zoneId === zone.id).length;
  const Icon = zoneIcons[zone.type] ?? Camera;

  const descriptions: Record<string, string> = {
    casting: "Connect this zone to a Shots zone to make these actors available in those shots.",
    shots: "Connect a Casting zone here to pull actors. Connect a Locations zone to assign locations.",
    locations: "Connect this zone to a Shots zone to make these locations available.",
    script: "Connect this zone to a Shots zone to link script scenes.",
  };

  const counts: Record<string, string> = {
    casting: `${castCount} cast member${castCount !== 1 ? "s" : ""}`,
    shots: `${frameCount} shot${frameCount !== 1 ? "s" : ""}`,
    locations: `${locCount} location${locCount !== 1 ? "s" : ""}`,
    script: "",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `hsl(${zone.color} / 0.15)` }}>
          <Icon className="w-5 h-5" style={{ color: `hsl(${zone.color})` }} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">{zone.label}</h3>
          <p className="text-xs text-muted-foreground">{counts[zone.type]}</p>
        </div>
      </div>
      <Separator />
      <p className="text-sm text-muted-foreground">{descriptions[zone.type]}</p>
      <p className="text-[10px] text-muted-foreground/60">
        Right-click inside the zone to add items. Drag the zone label to reposition.
      </p>
    </div>
  );
});