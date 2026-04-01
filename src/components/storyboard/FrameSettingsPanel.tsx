import React, { useState, useEffect } from "react";
import {
  X, Sparkles, Camera, Palette, Clock, Check, Images,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Shot type images
import shotWide from "@/assets/shots/wide.jpg";
import shotMedium from "@/assets/shots/medium.jpg";
import shotCloseup from "@/assets/shots/closeup.jpg";
import shotECU from "@/assets/shots/extreme-closeup.jpg";
import shotOTS from "@/assets/shots/ots.jpg";
import shotPOV from "@/assets/shots/pov.jpg";
import shotDynamic from "@/assets/shots/dynamic.jpg";
import shotLow from "@/assets/shots/low-angle.jpg";
import shotHigh from "@/assets/shots/high-angle.jpg";
import shotAerial from "@/assets/shots/aerial.jpg";

// Mood images
import moodDramatic from "@/assets/moods/dramatic.jpg";
import moodNoir from "@/assets/moods/noir.jpg";
import moodWarm from "@/assets/moods/warm.jpg";
import moodCold from "@/assets/moods/cold.jpg";
import moodTense from "@/assets/moods/tense.jpg";
import moodRomantic from "@/assets/moods/romantic.jpg";
import moodMysterious from "@/assets/moods/mysterious.jpg";
import moodAction from "@/assets/moods/action.jpg";

export interface Actor {
  id: string;
  name: string;
  avatar: string;
}

export interface GeneratedImage {
  id: string;
  src: string;
  description: string;
  actors: string[];
}

export interface FrameData {
  id: string;
  x: number;
  y: number;
  image: string;
  scene: string;
  shot: string;
  description: string;
  duration: string;
  actors: string[];
  generatedImages: GeneratedImage[];
  selectedImageId: string | null;
}

const shotTypes = [
  { value: "WIDE", label: "Wide", img: shotWide },
  { value: "MED", label: "Medium", img: shotMedium },
  { value: "CU", label: "Close-Up", img: shotCloseup },
  { value: "ECU", label: "Extreme CU", img: shotECU },
  { value: "OTS", label: "Over Shoulder", img: shotOTS },
  { value: "POV", label: "POV", img: shotPOV },
  { value: "DYNAMIC", label: "Dynamic", img: shotDynamic },
  { value: "LOW", label: "Low Angle", img: shotLow },
  { value: "HIGH", label: "High Angle", img: shotHigh },
  { value: "AERIAL", label: "Aerial", img: shotAerial },
];

const moodOptions = [
  { value: "Dramatic", label: "Dramatic", img: moodDramatic },
  { value: "Noir", label: "Noir", img: moodNoir },
  { value: "Warm", label: "Warm", img: moodWarm },
  { value: "Cold", label: "Cold", img: moodCold },
  { value: "Tense", label: "Tense", img: moodTense },
  { value: "Romantic", label: "Romantic", img: moodRomantic },
  { value: "Mysterious", label: "Mysterious", img: moodMysterious },
  { value: "Action", label: "Action", img: moodAction },
];

interface FrameSettingsPanelProps {
  frame: FrameData;
  sceneNumber: number;
  actorRoster: Actor[];
  onUpdate: (updated: FrameData) => void;
  onClose: () => void;
}

function VisualOption({ label, img, selected, onClick }: { label: string; img: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-lg overflow-hidden transition-all duration-150 aspect-[4/3]",
        selected
          ? "ring-2 ring-primary ring-offset-1 ring-offset-background scale-[1.03]"
          : "hover:scale-[1.03] hover:ring-1 hover:ring-border opacity-75 hover:opacity-100"
      )}
    >
      <img src={img} alt={label} loading="lazy" className="w-full h-full object-cover" />
      <div className={cn("absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent", selected && "from-primary/30")} />
      <span className="absolute bottom-1 left-1.5 text-[9px] font-bold text-white drop-shadow-md">{label}</span>
      {selected && (
        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-primary-foreground" />
        </div>
      )}
    </button>
  );
}

export function FrameSettingsPanel({ frame, sceneNumber, actorRoster, onUpdate, onClose }: FrameSettingsPanelProps) {
  const [prompt, setPrompt] = useState(frame.description);
  const [scene, setScene] = useState(frame.scene);
  const [shot, setShot] = useState(frame.shot);
  const [duration, setDuration] = useState(frame.duration);
  const [selectedActors, setSelectedActors] = useState<string[]>(frame.actors);
  const [mood, setMood] = useState("Noir");
  const [imageCount, setImageCount] = useState(4);

  useEffect(() => {
    setPrompt(frame.description);
    setScene(frame.scene);
    setShot(frame.shot);
    setDuration(frame.duration);
    setSelectedActors(frame.actors);
  }, [frame.id]);

  const toggleActor = (actorId: string) => {
    setSelectedActors(prev =>
      prev.includes(actorId) ? prev.filter(a => a !== actorId) : [...prev, actorId]
    );
  };

  const handleSave = () => {
    onUpdate({
      ...frame,
      description: prompt,
      scene,
      shot,
      duration,
      actors: selectedActors,
    });
    toast.success("Frame settings saved");
  };

  const handleGenerate = () => {
    const mockImages: GeneratedImage[] = Array.from({ length: imageCount }, (_, i) => {
      const actorSubsets = [
        selectedActors,
        selectedActors.slice(0, 1),
        selectedActors.length > 1 ? selectedActors.slice(1) : selectedActors,
        selectedActors,
      ];
      const descriptions = [
        prompt,
        `${prompt} — alternate angle`,
        `${prompt} — close variation`,
        `${prompt} — wide variation`,
      ];
      return {
        id: `gen-${Date.now()}-${i}`,
        src: frame.image,
        description: descriptions[i % descriptions.length],
        actors: actorSubsets[i % actorSubsets.length],
      };
    });

    onUpdate({
      ...frame,
      description: prompt,
      scene,
      shot,
      duration,
      actors: selectedActors,
      generatedImages: [...frame.generatedImages, ...mockImages],
    });

    toast.info(`Generating ${imageCount} images...`, {
      description: "AI image generation will be available once Lovable Cloud is enabled.",
    });
  };

  return (
    <div className="fixed top-0 right-0 h-full w-[360px] z-50 bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-bold text-foreground">Frame Settings</h2>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Preview */}
      <div className="px-4 pt-3">
        <div className="w-full h-[140px] rounded-lg overflow-hidden border border-border bg-secondary">
          {frame.image ? (
            <img src={frame.image} alt={frame.description} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-xs">No image</div>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Scene */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Scene</Label>
          <Input
            value={scene}
            onChange={(e) => setScene(e.target.value)}
            className="h-8 text-sm"
            placeholder="SC 1"
          />
        </div>

        {/* Prompt */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Scene Prompt</Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[80px] text-sm resize-none"
            placeholder="Describe the scene for AI generation..."
          />
        </div>

        <Separator />

        {/* Actors */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Actors in Scene</Label>
          <div className="flex flex-wrap gap-2">
            {actorRoster.map(actor => {
              const isSelected = selectedActors.includes(actor.id);
              return (
                <button
                  key={actor.id}
                  onClick={() => toggleActor(actor.id)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-muted-foreground/60"
                  }`}
                >
                  <img src={actor.avatar} alt={actor.name} className="w-5 h-5 rounded-full object-cover" />
                  <span>{actor.name}</span>
                  {isSelected && <Check className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Camera / Shot Type — Visual Grid */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Camera className="w-3 h-3" /> Camera / Shot Type
          </Label>
          <div className="grid grid-cols-5 gap-1.5">
            {shotTypes.map(s => (
              <VisualOption
                key={s.value}
                label={s.label}
                img={s.img}
                selected={shot === s.value}
                onClick={() => setShot(s.value)}
              />
            ))}
          </div>
        </div>

        <Separator />

        {/* Mood / Lighting — Visual Grid */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Palette className="w-3 h-3" /> Mood / Lighting
          </Label>
          <div className="grid grid-cols-4 gap-1.5">
            {moodOptions.map(m => (
              <VisualOption
                key={m.value}
                label={m.label}
                img={m.img}
                selected={mood === m.value}
                onClick={() => setMood(m.value)}
              />
            ))}
          </div>
        </div>

        <Separator />

        {/* Duration */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> Duration
          </Label>
          <Input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="h-8 text-sm w-20"
            placeholder="4s"
          />
        </div>

        <Separator />

        {/* Image count */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Images className="w-3 h-3" /> Images to Generate
          </Label>
          <div className="flex gap-1.5">
            {[1, 2, 4, 6, 8].map(n => (
              <button
                key={n}
                onClick={() => setImageCount(n)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  imageCount === n
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-4 py-3 border-t border-border flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={handleSave}>
          Save Changes
        </Button>
        <Button size="sm" className="flex-1" onClick={handleGenerate}>
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          Generate {imageCount}
        </Button>
      </div>
    </div>
  );
}
