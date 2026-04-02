import { memo } from "react";
import { X, Plus } from "lucide-react";
import type { Actor, PickerPosition } from "../types";
import { CAST_W, LOC_W, locationImages } from "../constants";

interface CastPickerProps {
  position: PickerPosition;
  actors: Actor[];
  existingActorIds?: string[];
  onSelect: (actor: Actor) => void;
  onClose: () => void;
}

export const CastPicker = memo(function CastPicker({
  position, actors, existingActorIds = [], onSelect, onClose,
}: CastPickerProps) {
  const availableActors = actors.filter((a) => !existingActorIds.includes(a.id));

  const handleCreateNew = () => {
    const newActor: Actor = {
      id: `actor-${Date.now()}`,
      name: "New Actor",
      role: "New Role",
      description: "",
      portrait: `https://ui-avatars.com/api/?name=New+Actor&background=1a1a2e&color=8b5cf6&size=200`,
      gender: "",
      ageRange: "",
      ethnicity: "",
      bodyType: "",
      height: "",
      hairColor: "",
      hairStyle: "",
      eyeColor: "",
      skinTone: "",
      clothing: "",
      distinguishingFeatures: "",
      generatedPortraits: [],
      selectedPortraitId: null,
    };
    onSelect(newActor);
  };

  return (
    <div
      className="absolute z-50 min-w-[220px] bg-popover border border-border rounded-lg shadow-xl py-1 text-sm"
      style={{ left: position.x, top: position.y }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <p className="px-3 py-1.5 text-xs text-muted-foreground uppercase tracking-wider">Choose Actor</p>
      {availableActors.length === 0 && (
        <p className="px-3 py-2 text-xs text-muted-foreground/60 italic">All actors already added</p>
      )}
      {availableActors.map((actor) => (
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
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-secondary/60 text-foreground"
        onClick={handleCreateNew}
      >
        <Plus className="w-4 h-4" /> Create New
      </button>
      <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-secondary/60 text-muted-foreground" onClick={onClose}>
        <X className="w-4 h-4" /> Cancel
      </button>
    </div>
  );
});

interface LocationPickerProps {
  position: PickerPosition;
  existingLocationNames?: string[];
  onSelect: (name: string) => void;
  onClose: () => void;
}

export const LocationPicker = memo(function LocationPicker({
  position, existingLocationNames = [], onSelect, onClose,
}: LocationPickerProps) {
  const availableLocations = Object.entries(locationImages).filter(
    ([name]) => !existingLocationNames.includes(name)
  );

  const handleCreateNew = () => {
    const newName = `Location ${Date.now()}`;
    onSelect(newName);
  };

  return (
    <div
      className="absolute z-50 min-w-[200px] bg-popover border border-border rounded-lg shadow-xl py-1 text-sm"
      style={{ left: position.x, top: position.y }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <p className="px-3 py-1.5 text-xs text-muted-foreground uppercase tracking-wider">Choose Location</p>
      {availableLocations.length === 0 && (
        <p className="px-3 py-2 text-xs text-muted-foreground/60 italic">All locations already added</p>
      )}
      {availableLocations.map(([name, img]) => (
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
      <button
        className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-secondary/60 text-foreground"
        onClick={handleCreateNew}
      >
        <Plus className="w-4 h-4" /> Create New
      </button>
      <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-secondary/60 text-muted-foreground" onClick={onClose}>
        <X className="w-4 h-4" /> Cancel
      </button>
    </div>
  );
});
