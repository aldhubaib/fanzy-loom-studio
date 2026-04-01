import React, { useState, useEffect, useRef } from "react";
import {
  X, Sparkles, Camera, Palette, Clock, Check, Images, ChevronDown, Plus, MapPin, Shirt, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
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

// Location images
import locOffice from "@/assets/locations/interior-office.jpg";
import locStreet from "@/assets/locations/exterior-street.jpg";
import locClub from "@/assets/locations/interior-club.jpg";
import locPenthouse from "@/assets/locations/interior-penthouse.jpg";
import locBridge from "@/assets/locations/exterior-bridge.jpg";
import locWarehouse from "@/assets/locations/interior-warehouse.jpg";
import locRestaurant from "@/assets/locations/interior-restaurant.jpg";
import locCar from "@/assets/locations/interior-car.jpg";

// Wardrobe images (reuse from casting)
import outfitCasual from "@/assets/casting/outfit-casual.jpg";
import outfitFormal from "@/assets/casting/outfit-formal.jpg";
import outfitHighfashion from "@/assets/casting/outfit-highfashion.jpg";
import outfitMilitary from "@/assets/casting/outfit-military.jpg";
import outfitVintage from "@/assets/casting/outfit-vintage.jpg";
import outfitStreetwear from "@/assets/casting/outfit-streetwear.jpg";
import outfitBusiness from "@/assets/casting/outfit-business.jpg";

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
  location?: string;
  actorWardrobe?: Record<string, string>;
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

const locationOptions = [
  { value: "Office", label: "Office", img: locOffice },
  { value: "Street", label: "Street", img: locStreet },
  { value: "Jazz Club", label: "Jazz Club", img: locClub },
  { value: "Penthouse", label: "Penthouse", img: locPenthouse },
  { value: "Bridge", label: "Bridge", img: locBridge },
  { value: "Warehouse", label: "Warehouse", img: locWarehouse },
  { value: "Restaurant", label: "Restaurant", img: locRestaurant },
  { value: "Car", label: "Car Interior", img: locCar },
];

const wardrobeOptions = [
  { value: "Casual", label: "Casual", img: outfitCasual },
  { value: "Formal", label: "Formal", img: outfitFormal },
  { value: "High Fashion", label: "High Fashion", img: outfitHighfashion },
  { value: "Military", label: "Military", img: outfitMilitary },
  { value: "Vintage", label: "Vintage", img: outfitVintage },
  { value: "Streetwear", label: "Streetwear", img: outfitStreetwear },
  { value: "Business", label: "Business", img: outfitBusiness },
];

interface FrameSettingsPanelProps {
  frame: FrameData;
  sceneNumber: number;
  actorRoster: Actor[];
  onUpdate: (updated: FrameData) => void;
  onClose: () => void;
}

function VisualCard({ label, img, selected, onClick }: { label: string; img: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative group rounded-xl overflow-hidden transition-all duration-200 aspect-[4/3]",
        selected
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.03]"
          : "hover:scale-[1.03] hover:ring-1 hover:ring-border"
      )}
    >
      <img src={img} alt={label} loading="lazy" className="w-full h-full object-cover" />
      <div className={cn("absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent", selected && "from-primary/30 via-transparent")} />
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
    </button>
  );
}

function VisualCardLabel({ label, selected }: { label: string; selected: boolean }) {
  return (
    <p className={cn("text-xs font-medium text-center mt-1.5", selected ? "text-primary" : "text-muted-foreground")}>
      {label}
    </p>
  );
}

function PickerButton({ label, value, selectedImg, icon: Icon, onClick }: {
  label: string; value: string; selectedImg?: string; icon: React.ElementType; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border transition-all",
        value
          ? "bg-card border-primary/30 text-foreground"
          : "bg-card border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
      )}
    >
      {selectedImg ? (
        <img src={selectedImg} alt={value} className="w-7 h-7 rounded-md object-cover" />
      ) : (
        <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center">
          <Plus className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      )}
      <div className="text-left flex-1">
        <p className="text-[10px] uppercase tracking-wider leading-none mb-0.5 text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value || "Choose..."}</p>
      </div>
      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
    </button>
  );
}

function ImagePickerDialog({
  open, onOpenChange, title: dialogTitle, items, selected, onSelect, allowCustom = false, customItems, onAddCustom,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; title: string;
  items: { value: string; label: string; img: string }[]; selected: string; onSelect: (v: string) => void;
  allowCustom?: boolean;
  customItems?: { value: string; label: string; img: string }[];
  onAddCustom?: (item: { value: string; label: string; img: string }) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const allItems = [...items, ...(customItems || [])];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onAddCustom) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const name = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
      const label = name.charAt(0).toUpperCase() + name.slice(1);
      const value = `custom-${Date.now()}`;
      onAddCustom({ value, label, img: src });
      onSelect(value);
      onOpenChange(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card border-border">
        <DialogHeader><DialogTitle>{dialogTitle}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
          {allItems.map((item) => (
            <div key={item.value}>
              <VisualCard
                label={item.label}
                img={item.img}
                selected={selected === item.value}
                onClick={() => { onSelect(selected === item.value ? "" : item.value); onOpenChange(false); }}
              />
              <VisualCardLabel label={item.label} selected={selected === item.value} />
            </div>
          ))}
          {/* Custom upload slot */}
          {allowCustom && (
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1.5 transition-colors bg-secondary/20"
              >
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground font-medium">Upload Custom</span>
              </button>
              <p className="text-xs font-medium text-center mt-1.5 text-muted-foreground">Custom</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function FrameSettingsPanel({ frame, sceneNumber, actorRoster, onUpdate, onClose }: FrameSettingsPanelProps) {
  const [prompt, setPrompt] = useState(frame.description);
  const [scene, setScene] = useState(frame.scene);
  const [shot, setShot] = useState(frame.shot);
  const [duration, setDuration] = useState(frame.duration);
  const [selectedActors, setSelectedActors] = useState<string[]>(frame.actors);
  const [mood, setMood] = useState("Noir");
  const [location, setLocation] = useState(frame.location || "");
  const [actorWardrobe, setActorWardrobe] = useState<Record<string, string>>(frame.actorWardrobe || {});
  const [imageCount, setImageCount] = useState(4);
  const [shotOpen, setShotOpen] = useState(false);
  const [moodOpen, setMoodOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [wardrobeOpen, setWardrobeOpen] = useState<string | null>(null);
  const [customLocations, setCustomLocations] = useState<{ value: string; label: string; img: string }[]>([]);
  const [customWardrobes, setCustomWardrobes] = useState<{ value: string; label: string; img: string }[]>([]);

  useEffect(() => {
    setPrompt(frame.description);
    setScene(frame.scene);
    setShot(frame.shot);
    setDuration(frame.duration);
    setSelectedActors(frame.actors);
    setLocation(frame.location || "");
    setActorWardrobe(frame.actorWardrobe || {});
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
      location,
      actorWardrobe,
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
      location,
      actorWardrobe,
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

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Preview */}
        <div className="w-full rounded-lg overflow-hidden border border-border bg-secondary">
          {frame.image ? (
            <img src={frame.image} alt={frame.description} className="w-full object-cover max-h-[200px]" />
          ) : (
            <div className="w-full h-[140px] flex items-center justify-center text-muted-foreground/40 text-xs">No image</div>
          )}
        </div>

        {/* Scene */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Scene</Label>
          <div className="h-8 px-3 flex items-center rounded-md bg-secondary text-sm text-foreground">
            SC {sceneNumber}
          </div>
        </div>

        {/* Prompt */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Scene Prompt</Label>
          <Textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            className="min-h-[60px] text-sm resize-none overflow-hidden"
            placeholder="Describe the scene for AI generation..."
          />
        </div>

        <Separator />

        {/* Location */}
        <PickerButton
          label="Location"
          value={locationOptions.find(l => l.value === location)?.label || ""}
          selectedImg={locationOptions.find(l => l.value === location)?.img}
          icon={MapPin}
          onClick={() => setLocationOpen(true)}
        />

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

        {/* Per-actor wardrobe */}
        {selectedActors.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Shirt className="w-3 h-3" /> Wardrobe per Actor
              </Label>
              <div className="space-y-1.5">
                {selectedActors.map(actorId => {
                  const actor = actorRoster.find(a => a.id === actorId);
                  if (!actor) return null;
                  const currentWardrobe = actorWardrobe[actorId] || "";
                  const wardrobeImg = wardrobeOptions.find(w => w.value === currentWardrobe)?.img;
                  return (
                    <button
                      key={actorId}
                      onClick={() => setWardrobeOpen(actorId)}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl border border-border bg-card hover:border-muted-foreground/40 transition-all text-left"
                    >
                      <img src={actor.avatar} alt={actor.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-muted-foreground leading-none mb-0.5">{actor.name}</p>
                        <p className="text-xs font-medium text-foreground truncate">{currentWardrobe || "Choose outfit..."}</p>
                      </div>
                      {wardrobeImg && (
                        <img src={wardrobeImg} alt={currentWardrobe} className="w-6 h-6 rounded-md object-cover shrink-0" />
                      )}
                      <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Camera / Shot Type */}
        <PickerButton
          label="Camera / Shot Type"
          value={shotTypes.find(s => s.value === shot)?.label || ""}
          selectedImg={shotTypes.find(s => s.value === shot)?.img}
          icon={Camera}
          onClick={() => setShotOpen(true)}
        />

        <Separator />

        {/* Mood / Lighting */}
        <PickerButton
          label="Mood / Lighting"
          value={moodOptions.find(m => m.value === mood)?.label || ""}
          selectedImg={moodOptions.find(m => m.value === mood)?.img}
          icon={Palette}
          onClick={() => setMoodOpen(true)}
        />

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

      {/* Dialogs */}
      <ImagePickerDialog
        open={shotOpen}
        onOpenChange={setShotOpen}
        title="Camera / Shot Type"
        items={shotTypes}
        selected={shot}
        onSelect={setShot}
      />
      <ImagePickerDialog
        open={moodOpen}
        onOpenChange={setMoodOpen}
        title="Mood / Lighting"
        items={moodOptions}
        selected={mood}
        onSelect={setMood}
      />
      <ImagePickerDialog
        open={locationOpen}
        onOpenChange={setLocationOpen}
        title="Location"
        items={locationOptions}
        selected={location}
        onSelect={setLocation}
        allowCustom
        customItems={customLocations}
        onAddCustom={(item) => setCustomLocations(prev => [...prev, item])}
      />
      {selectedActors.map(actorId => {
        const actor = actorRoster.find(a => a.id === actorId);
        return (
          <ImagePickerDialog
            key={`wardrobe-${actorId}`}
            open={wardrobeOpen === actorId}
            onOpenChange={(v) => setWardrobeOpen(v ? actorId : null)}
            title={`Wardrobe — ${actor?.name || "Actor"}`}
            items={wardrobeOptions}
            selected={actorWardrobe[actorId] || ""}
            onSelect={(v) => setActorWardrobe(prev => ({ ...prev, [actorId]: v }))}
            allowCustom
            customItems={customWardrobes}
            onAddCustom={(item) => setCustomWardrobes(prev => [...prev, item])}
          />
        );
      })}
    </div>
  );
}
