import { useState, useMemo } from "react";
import { Plus, MapPin, Sparkles, Check, ChevronRight, Expand, ChevronLeft, ChevronRight as ChevronR, Film, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import type { LocationData } from "../types";

// ─── Attribute images ───────────────────────────────────────
import attrInterior from "@/assets/locations/attr-interior.jpg";
import attrExterior from "@/assets/locations/attr-exterior.jpg";
import attrDawn from "@/assets/locations/attr-dawn.jpg";
import attrDay from "@/assets/locations/attr-day.jpg";
import attrGoldenHour from "@/assets/locations/attr-golden-hour.jpg";
import attrSunset from "@/assets/locations/attr-sunset.jpg";
import attrDusk from "@/assets/locations/attr-dusk.jpg";
import attrNight from "@/assets/locations/attr-night.jpg";
import attrBlueHour from "@/assets/locations/attr-blue-hour.jpg";
import attrClear from "@/assets/locations/attr-clear.jpg";
import attrCloudy from "@/assets/locations/attr-cloudy.jpg";
import attrRain from "@/assets/locations/attr-rain.jpg";
import attrSnow from "@/assets/locations/attr-snow.jpg";
import attrFog from "@/assets/locations/attr-fog.jpg";
import attrStorm from "@/assets/locations/attr-storm.jpg";
import attrEraModern from "@/assets/locations/attr-era-modern.jpg";
import attrEra1990s from "@/assets/locations/attr-era-1990s.jpg";
import attrEra1980s from "@/assets/locations/attr-era-1980s.jpg";
import attrEra1970s from "@/assets/locations/attr-era-1970s.jpg";
import attrEra1960s from "@/assets/locations/attr-era-1960s.jpg";
import attrEra1950s from "@/assets/locations/attr-era-1950s.jpg";
import attrEra1940s from "@/assets/locations/attr-era-1940s.jpg";
import attrEraMedieval from "@/assets/locations/attr-era-medieval.jpg";
import attrEraFuturistic from "@/assets/locations/attr-era-futuristic.jpg";
import attrMoodWarm from "@/assets/locations/attr-mood-warm.jpg";
import attrMoodCold from "@/assets/locations/attr-mood-cold.jpg";
import attrMoodMysterious from "@/assets/locations/attr-mood-mysterious.jpg";
import attrMoodBright from "@/assets/locations/attr-mood-bright.jpg";
import attrMoodGloomy from "@/assets/locations/attr-mood-gloomy.jpg";
import attrMoodRomantic from "@/assets/locations/attr-mood-romantic.jpg";
import attrMoodTense from "@/assets/locations/attr-mood-tense.jpg";

// ─── Types ──────────────────────────────────────────────────
interface VisualOption { label: string; image: string }

type LocAttrKey = "setting" | "timeOfDay" | "weather" | "era" | "mood";

const attributeCategories: { key: LocAttrKey; label: string }[] = [
  { key: "setting", label: "Setting" },
  { key: "timeOfDay", label: "Time of Day" },
  { key: "weather", label: "Weather" },
  { key: "era", label: "Era" },
  { key: "mood", label: "Mood" },
];

const attributeOptions: Record<LocAttrKey, VisualOption[]> = {
  setting: [
    { label: "Interior", image: attrInterior },
    { label: "Exterior", image: attrExterior },
  ],
  timeOfDay: [
    { label: "Dawn", image: attrDawn },
    { label: "Day", image: attrDay },
    { label: "Golden Hour", image: attrGoldenHour },
    { label: "Sunset", image: attrSunset },
    { label: "Dusk", image: attrDusk },
    { label: "Night", image: attrNight },
    { label: "Blue Hour", image: attrBlueHour },
  ],
  weather: [
    { label: "Clear", image: attrClear },
    { label: "Cloudy", image: attrCloudy },
    { label: "Rain", image: attrRain },
    { label: "Snow", image: attrSnow },
    { label: "Fog", image: attrFog },
    { label: "Storm", image: attrStorm },
  ],
  era: [
    { label: "Modern", image: attrEraModern },
    { label: "1990s", image: attrEra1990s },
    { label: "1980s", image: attrEra1980s },
    { label: "1970s", image: attrEra1970s },
    { label: "1960s", image: attrEra1960s },
    { label: "1950s", image: attrEra1950s },
    { label: "1940s", image: attrEra1940s },
    { label: "Medieval", image: attrEraMedieval },
    { label: "Futuristic", image: attrEraFuturistic },
  ],
  mood: [
    { label: "Warm", image: attrMoodWarm },
    { label: "Cold", image: attrMoodCold },
    { label: "Mysterious", image: attrMoodMysterious },
    { label: "Bright", image: attrMoodBright },
    { label: "Gloomy", image: attrMoodGloomy },
    { label: "Romantic", image: attrMoodRomantic },
    { label: "Tense", image: attrMoodTense },
  ],
};

// ─── Sub-components ─────────────────────────────────────────

function AttributePickerDialog({
  open, onOpenChange, category, options, selected, onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category: string;
  options: VisualOption[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card border-border">
        <DialogHeader><DialogTitle>{category}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
          {options.map(opt => {
            const isSelected = selected === opt.label;
            return (
              <div key={opt.label}>
                <button
                  onClick={() => { onSelect(opt.label); onOpenChange(false); }}
                  className={cn(
                    "relative w-full overflow-hidden rounded-xl aspect-[3/4] transition-all duration-200",
                    isSelected
                      ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background scale-[1.03]"
                      : "hover:scale-[1.03] hover:ring-1 hover:ring-border"
                  )}
                >
                  <img src={opt.image} alt={opt.label} className="w-full h-full object-cover" loading="lazy" draggable={false} />
                  <div className={cn("absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent", isSelected && "from-emerald-500/30")} />
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
                <p className={cn("text-xs font-medium text-center mt-1.5", isSelected ? "text-emerald-400" : "text-muted-foreground")}>
                  {opt.label}
                </p>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AttributeRow({ label, value, options, onClick, hasError }: {
  label: string;
  value: string;
  options: VisualOption[];
  onClick: () => void;
  hasError?: boolean;
}) {
  const opt = options.find(o => o.label === value);
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border bg-card transition-all text-left",
        hasError
          ? "border-destructive/60 animate-shake"
          : "border-border hover:border-emerald-500/40"
      )}
    >
      {opt?.image ? (
        <img src={opt.image} alt={value} className="w-8 h-8 rounded-lg object-cover" />
      ) : (
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", hasError ? "bg-destructive/10" : "bg-secondary")}>
          <Plus className={cn("w-3.5 h-3.5", hasError ? "text-destructive" : "text-muted-foreground")} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={cn("text-[10px] uppercase tracking-wider leading-none mb-0.5", hasError ? "text-destructive/70" : "text-muted-foreground")}>{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value || "Choose..."}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
    </button>
  );
}

// ─── Main Panel ─────────────────────────────────────────────

interface LocationDetailsPanelProps {
  location: LocationData;
  onChange: (loc: LocationData) => void;
  onDelete?: () => void;
  appearances?: { id: string; scene: string; shot: string; description: string; image?: string }[];
}

export function LocationDetailsPanel({ location, onChange, onDelete, appearances = [] }: LocationDetailsPanelProps) {
  const [pickerOpen, setPickerOpen] = useState<LocAttrKey | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [genCount, setGenCount] = useState(4);

  const selectImage = (img: { id: string; src: string; description: string }) => {
    onChange({ ...location, portrait: img.src, selectedImageId: img.id });
  };

  const hasFinalImage = !!location.selectedImageId;

  return (
    <>
      <div className="space-y-4">
        {/* Hero image */}
        <div className="w-full rounded-xl overflow-hidden border border-border bg-secondary">
          {location.portrait ? (
            <img src={location.portrait} alt={location.name} className="w-full object-cover max-h-[220px]" />
          ) : (
            <div className="w-full h-[160px] flex items-center justify-center">
              <MapPin className="w-10 h-10 text-muted-foreground/20" />
            </div>
          )}
        </div>

        {/* Name */}
        <input
          value={location.name}
          onChange={e => onChange({ ...location, name: e.target.value })}
          className="w-full text-lg font-bold bg-transparent border-none outline-none text-foreground"
          placeholder="Location Name"
        />

        {/* Description */}
        <Textarea
          value={location.description}
          onChange={e => onChange({ ...location, description: e.target.value })}
          className="min-h-[80px] text-sm"
          placeholder="Describe this location... (e.g. A dimly lit 1940s detective office with wooden desk, filing cabinets, venetian blinds casting shadows)"
        />

        <Separator />

        {/* Attribute rows */}
        <div className="space-y-2">
          {attributeCategories.map(cat => (
            <AttributeRow
              key={cat.key}
              label={cat.label}
              value={location[cat.key]}
              options={attributeOptions[cat.key]}
              onClick={() => { setPickerOpen(cat.key); if (showErrors) setShowErrors(false); }}
              hasError={showErrors && !location[cat.key]}
            />
          ))}
        </div>

        <Separator />

        {/* Generate images */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Location Images</h3>
              <p className="text-[11px] text-muted-foreground">Generate & pick a hero image</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-secondary rounded-lg px-2 py-1">
                {[1, 2, 4, 6].map(n => (
                  <button
                    key={n}
                    onClick={() => setGenCount(n)}
                    className={cn(
                      "w-6 h-6 rounded text-xs font-medium transition-all",
                      genCount === n ? "bg-emerald-500 text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <Button size="sm" className="gap-1.5 h-8 bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                const allFilled = attributeCategories.every(cat => !!location[cat.key]);
                if (!allFilled) { setShowErrors(true); return; }
                toast.success(`Generating ${genCount} location image${genCount > 1 ? "s" : ""}...`);
              }}>
                <Sparkles className="w-3.5 h-3.5" />
                Generate
              </Button>
            </div>
          </div>

          {location.generatedImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {location.generatedImages.map((img, idx) => {
                const isActive = location.selectedImageId === img.id;
                return (
                  <button
                    key={img.id}
                    className={cn(
                      "relative rounded-lg overflow-hidden transition-all group aspect-video",
                      isActive
                        ? "ring-2 ring-emerald-500 ring-offset-1 ring-offset-background"
                        : "hover:scale-[1.02] ring-1 ring-border"
                    )}
                    onClick={() => selectImage(img)}
                  >
                    <img src={img.src} alt={img.description} className="w-full h-full object-cover" draggable={false} />
                    {isActive && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <button
                      className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                    >
                      <Expand className="w-2.5 h-2.5 text-white" />
                    </button>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Separator />

        {/* Appears in */}
        {appearances.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Film className="w-4 h-4 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">Appears in</h3>
                <p className="text-[11px] text-muted-foreground">{appearances.length} shot{appearances.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {appearances.map(app => (
                <div key={app.id} className="rounded-lg overflow-hidden border border-border bg-secondary">
                  {app.image && <img src={app.image} alt={app.description} className="w-full aspect-video object-cover" />}
                  <div className="p-2">
                    <p className="text-[10px] font-bold text-emerald-400">{app.scene}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{app.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete */}
        {onDelete && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={onDelete}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete Location
            </Button>
          </div>
        )}
      </div>

      {/* Attribute picker dialogs */}
      {pickerOpen && (
        <AttributePickerDialog
          open={!!pickerOpen}
          onOpenChange={(v) => { if (!v) setPickerOpen(null); }}
          category={attributeCategories.find(c => c.key === pickerOpen)?.label || ""}
          options={attributeOptions[pickerOpen]}
          selected={location[pickerOpen]}
          onSelect={(v) => onChange({ ...location, [pickerOpen]: v })}
        />
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && location.generatedImages.length > 0 && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center" onClick={() => setLightboxIndex(null)}>
          <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" onClick={() => setLightboxIndex(null)}>
            <X className="w-5 h-5 text-white" />
          </button>
          {lightboxIndex > 0 && (
            <button className="absolute left-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}>
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          )}
          <div className="max-w-2xl max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <img src={location.generatedImages[lightboxIndex].src} alt="" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
            <div className="flex items-center justify-between mt-4 px-2">
              <p className="text-sm text-white/70">{location.generatedImages[lightboxIndex].description}</p>
              <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={() => { selectImage(location.generatedImages[lightboxIndex!]); setLightboxIndex(null); }}>
                <Check className="w-3.5 h-3.5" /> Use This
              </Button>
            </div>
          </div>
          {lightboxIndex < location.generatedImages.length - 1 && (
            <button className="absolute right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}>
              <ChevronR className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
