import { memo } from "react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { FrameData } from "../types";
import { locationImages } from "../constants";

interface LocationDrawerProps {
  locationName: string;
  frames: FrameData[];
}

export const LocationDrawer = memo(function LocationDrawer({
  locationName, frames,
}: LocationDrawerProps) {
  const img = locationImages[locationName];
  const appearances = frames.filter((f) => f.location === locationName);

  return (
    <div className="space-y-4">
      {img && (
        <div className="rounded-xl overflow-hidden border border-border">
          <img src={img} alt={locationName} className="w-full object-cover max-h-[200px]" />
        </div>
      )}
      <h3 className="text-lg font-bold text-foreground">{locationName}</h3>
      <Separator />
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">
          Used in {appearances.length} shot{appearances.length !== 1 ? "s" : ""}
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {appearances.map((f) => (
            <div key={f.id} className="rounded-lg overflow-hidden border border-border bg-secondary">
              {f.image && (
                <img src={f.image} alt={f.description} className="w-full aspect-video object-cover" />
              )}
              <div className="p-2">
                <p className="text-[10px] font-bold text-primary">{f.scene}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});