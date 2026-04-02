import { memo, useState } from "react";
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
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");

  const availableActors = actors.filter((a) => !existingActorIds.includes(a.id));

  const handleCreateNew = () => {
    if (!newName.trim()) return;
    const newActor: Actor = {
      id: `actor-${Date.now()}`,
      name: newName.trim(),
      role: newRole.trim() || "New Role",
      description: "",
      portrait: `https://ui-avatars.com/api/?name=${encodeURIComponent(newName.trim())}&background=1a1a2e&color=8b5cf6&size=200`,
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
      {isCreating ? (
        <div className="px-3 py-2 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">New Actor</p>
          <input
            autoFocus
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") handleCreateNew(); if (e.key === "Escape") setIsCreating(false); }}
            className="w-full bg-secondary/50 border border-border rounded px-2 py-1 text-sm text-foreground outline-none focus:border-primary/50"
          />
          <input
            placeholder="Role (optional)"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") handleCreateNew(); if (e.key === "Escape") setIsCreating(false); }}
            className="w-full bg-secondary/50 border border-border rounded px-2 py-1 text-sm text-foreground outline-none focus:border-primary/50"
          />
          <div className="flex gap-2">
            <button
              className="flex-1 px-2 py-1 rounded bg-primary/20 text-primary hover:bg-primary/30 text-xs font-medium"
              onClick={handleCreateNew}
            >
              Add
            </button>
            <button
              className="flex-1 px-2 py-1 rounded bg-secondary/50 text-muted-foreground hover:bg-secondary text-xs"
              onClick={() => setIsCreating(false)}
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        <>
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
            onClick={() => setIsCreating(true)}
          >
            <Plus className="w-4 h-4" /> Create New
          </button>
          <button className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-secondary/60 text-muted-foreground" onClick={onClose}>
            <X className="w-4 h-4" /> Cancel
          </button>
        </>
      )}
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
