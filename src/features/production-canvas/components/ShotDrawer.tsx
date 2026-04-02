import { useState, useEffect, memo } from "react";
import { Check, Sparkles, Trash2, Camera, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Actor, FrameData } from "../types";
import { shotTypes, locationDetailOptions, DURATION_OPTIONS } from "../constants";

interface ShotDrawerProps {
  frame: FrameData;
  actors: Actor[];
  connectedActors: Actor[];
  onUpdate: (f: FrameData) => void;
  onDelete: () => void;
}

export const ShotDrawer = memo(function ShotDrawer({
  frame, actors, connectedActors, onUpdate, onDelete,
}: ShotDrawerProps) {
  const [prompt, setPrompt] = useState(frame.description);
  const [shot, setShot] = useState(frame.shot);
  const [duration, setDuration] = useState(frame.duration);
  const [selectedActors, setSelectedActors] = useState<string[]>(frame.actors);
  const [location, setLocation] = useState(frame.location || "");
  const [shotModalOpen, setShotModalOpen] = useState(false);

  useEffect(() => {
    setPrompt(frame.description);
    setShot(frame.shot);
    setDuration(frame.duration);
    setSelectedActors(frame.actors);
    setLocation(frame.location || "");
  }, [frame.id]);

  const toggleActor = (id: string) => {
    setSelectedActors((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  const save = () => {
    onUpdate({
      ...frame,
      description: prompt,
      shot,
      duration,
      actors: selectedActors,
      location: location || undefined,
    });
    toast.success("Shot updated");
  };

  const availableActors = connectedActors.length > 0 ? connectedActors : actors;
  const currentShotType = shotTypes.find((s) => s.value === shot);

  return (
    <div className="space-y-4">
      {frame.image && (
        <div className="rounded-lg overflow-hidden border border-border">
          <img src={frame.image} alt={frame.description} className="w-full object-cover max-h-[180px]" />
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">{frame.scene}</span>
        <span className="text-xs text-muted-foreground">{frame.shot}</span>
        <span className="text-xs text-muted-foreground ml-auto">{frame.duration}</span>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Scene Prompt</Label>
        <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="min-h-[60px] text-sm resize-none" placeholder="Describe the scene..." />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Shot Type</Label>
        <button
          onClick={() => setShotModalOpen(true)}
          className={cn(
            "w-full rounded-lg border border-border hover:border-muted-foreground/60 transition-all overflow-hidden",
            currentShotType ? "p-0" : "p-4 flex items-center justify-center gap-2 text-muted-foreground"
          )}
        >
          {currentShotType ? (
            <div className="flex items-center gap-3 p-2">
              <img src={currentShotType.img} alt={currentShotType.label} className="w-16 h-12 rounded-md object-cover" />
              <span className="text-sm font-medium text-foreground">{currentShotType.label}</span>
            </div>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              <span className="text-xs">Select shot type</span>
            </>
          )}
        </button>
      </div>

      <Dialog open={shotModalOpen} onOpenChange={setShotModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Select Shot Type</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2 pt-2">
            {shotTypes.map((st) => (
              <button
                key={st.value}
                onClick={() => { setShot(st.value); setShotModalOpen(false); }}
                className={cn(
                  "relative rounded-lg overflow-hidden aspect-[4/3] transition-all",
                  shot === st.value ? "ring-2 ring-primary scale-[1.03]" : "ring-1 ring-border hover:ring-muted-foreground"
                )}
              >
                <img src={st.img} alt={st.label} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-1">
                  <span className="text-[10px] text-white font-medium">{st.label}</span>
                </div>
                {shot === st.value && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Separator />

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Location</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {locationDetailOptions.map((loc) => (
            <button key={loc.value} onClick={() => setLocation(location === loc.value ? "" : loc.value)}
              className={cn("relative rounded-lg overflow-hidden aspect-[4/3] transition-all", location === loc.value ? "ring-2 ring-primary scale-[1.03]" : "ring-1 ring-border hover:ring-muted-foreground")}>
              <img src={loc.img} alt={loc.label} className="w-full h-full object-cover" />
              {location === loc.value && <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center"><Check className="w-2 h-2 text-primary-foreground" /></div>}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Duration</Label>
        <div className="flex gap-1.5">
          {DURATION_OPTIONS.map((d) => (
            <button key={d} onClick={() => setDuration(d)}
              className={cn("px-2.5 py-1 rounded-md text-xs font-medium transition-all", duration === d ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Actors in Scene</Label>
          {connectedActors.length > 0 && (
            <span className="text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">from connected cast</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {availableActors.map((actor) => {
            const isIn = selectedActors.includes(actor.id);
            return (
              <button key={actor.id} onClick={() => toggleActor(actor.id)}
                className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs transition-all",
                  isIn ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/60")}>
                <img src={actor.portrait} alt={actor.name} className="w-5 h-5 rounded-full object-cover" />
                <span>{actor.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      <div className="flex gap-2">
        <Button size="sm" className="flex-1 gap-1.5" onClick={save}><Check className="w-3.5 h-3.5" /> Save</Button>
        <Button size="sm" variant="outline" className="gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Generate</Button>
      </div>
      <button onClick={onDelete} className="w-full flex items-center justify-center gap-1.5 text-xs text-destructive hover:text-destructive/80 py-2 transition-colors">
        <Trash2 className="w-3 h-3" /> Delete Shot
      </button>
    </div>
  );
});
