import { memo } from "react";
import { X } from "lucide-react";
import type { Actor, PickerPosition } from "../types";
import { CAST_W, LOC_W, locationImages } from "../constants";

interface CastPickerProps {
  position: PickerPosition;
  actors: Actor[];
  onSelect: (actor: Actor) => void;
  onClose: () => void;
}

export const CastPicker = memo(function CastPicker({
  position, actors, onSelect, onClose,
}: CastPickerProps) {
  return (
    <div
      className="absolute z-50 min-w-[200px] bg-popover border border-border rounded-lg shadow-xl py-1 text-sm"
      style={{ left: position.x, top: position.y }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <p className="px-3 py-1.5 text-xs text-muted-foreground uppercase tracking-wider">Choose Actor</p>
      {actors.map((actor) => (
        <button
          key={actor.id}
          className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-secondary/60 text-foreground"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => onSelect(actor)}
        >
          <img src={actor.portrait} alt={actor.name} className="w-7 h-7 rounded-full object-cover" />
          <span>{actor.name}</span>
        </button>
      ))}
      <div className="h-px bg-border my-1" />
      <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-secondary/60 text-muted-foreground" onClick={onClose}>
        <X className="w-4 h-4" /> Cancel
      </button>
    </div>
  );
});

interface LocationPickerProps {
  position: PickerPosition;
  onSelect: (name: string) => void;
  onClose: () => void;
}

export const LocationPicker = memo(function LocationPicker({
  position, onSelect, onClose,
}: LocationPickerProps) {
  return (
    <div
      className="absolute z-50 min-w-[200px] bg-popover border border-border rounded-lg shadow-xl py-1 text-sm"
      style={{ left: position.x, top: position.y }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <p className="px-3 py-1.5 text-xs text-muted-foreground uppercase tracking-wider">Choose Location</p>
      {Object.entries(locationImages).map(([name, img]) => (
        <button
          key={name}
          className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-secondary/60 text-foreground"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => onSelect(name)}
        >
          <img src={img} alt={name} className="w-8 h-5 rounded object-cover" />
          <span>{name}</span>
        </button>
      ))}
      <div className="h-px bg-border my-1" />
      <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-secondary/60 text-muted-foreground" onClick={onClose}>
        <X className="w-4 h-4" /> Cancel
      </button>
    </div>
  );
});