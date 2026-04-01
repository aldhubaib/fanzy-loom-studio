import React, { useState, useEffect } from "react";
import {
  X, Sparkles, Camera, Palette, Clock, Check, Images,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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
  { value: "WIDE", label: "Wide Shot (WS)" },
  { value: "MED", label: "Medium Shot (MS)" },
  { value: "CU", label: "Close-Up (CU)" },
  { value: "ECU", label: "Extreme Close-Up (ECU)" },
  { value: "OTS", label: "Over-the-Shoulder (OTS)" },
  { value: "POV", label: "Point of View (POV)" },
  { value: "DYNAMIC", label: "Dynamic Shot" },
  { value: "LOW", label: "Low Angle" },
  { value: "HIGH", label: "High Angle" },
  { value: "AERIAL", label: "Aerial Shot" },
];

const moodOptions = [
  "Dramatic", "Noir", "Warm", "Cold", "Tense", "Romantic", "Mysterious", "Action",
];

interface FrameSettingsPanelProps {
  frame: FrameData;
  actorRoster: Actor[];
  onUpdate: (updated: FrameData) => void;
  onClose: () => void;
}

export function FrameSettingsPanel({ frame, actorRoster, onUpdate, onClose }: FrameSettingsPanelProps) {
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
    // Mock generating multiple images
    const mockImages: GeneratedImage[] = Array.from({ length: imageCount }, (_, i) => {
      // For demo: cycle through existing images with different descriptions
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
        src: frame.image, // In production, AI would generate different images
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

        {/* Camera */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Camera className="w-3 h-3" /> Camera / Shot Type
          </Label>
          <Select value={shot} onValueChange={setShot}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {shotTypes.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mood */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Palette className="w-3 h-3" /> Mood / Lighting
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {moodOptions.map(m => (
              <Badge
                key={m}
                variant={mood === m ? "default" : "outline"}
                className="cursor-pointer text-[10px]"
                onClick={() => setMood(m)}
              >
                {m}
              </Badge>
            ))}
          </div>
        </div>

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
