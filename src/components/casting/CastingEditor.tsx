import { useState, useCallback } from "react";
import { Plus, User, Trash2, Sparkles, Check, ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import detectiveImg from "@/assets/casting/detective.jpg";
import femmeFataleImg from "@/assets/casting/femme-fatale.jpg";
import olderGentlemanImg from "@/assets/casting/older-gentleman.jpg";

// Attribute reference images
import buildSlim from "@/assets/casting/build-slim.jpg";
import buildAverage from "@/assets/casting/build-average.jpg";
import buildMuscular from "@/assets/casting/build-muscular.jpg";
import buildHeavy from "@/assets/casting/build-heavy.jpg";
import hairShort from "@/assets/casting/hair-short.jpg";
import hairLong from "@/assets/casting/hair-long.jpg";
import hairCurly from "@/assets/casting/hair-curly.jpg";
import hairBald from "@/assets/casting/hair-bald.jpg";
import hairSlicked from "@/assets/casting/hair-slicked.jpg";
import hairBraided from "@/assets/casting/hair-braided.jpg";

// ─── Types ──────────────────────────────────────────────────
interface GeneratedPortrait {
  id: string;
  src: string;
  description: string;
}

interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  portrait: string;
  gender: string;
  ageRange: string;
  ethnicity: string;
  bodyType: string;
  height: string;
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  clothing: string;
  distinguishingFeatures: string;
  generatedPortraits: GeneratedPortrait[];
  selectedPortraitId: string | null;
}

interface VisualOption {
  label: string;
  image?: string;
  color?: string;
  gradient?: string;
}

type AttributeKey = "gender" | "ageRange" | "ethnicity" | "bodyType" | "height" | "hairStyle" | "hairColor" | "eyeColor" | "skinTone" | "clothing" | "distinguishingFeatures";

const attributeCategories: { key: AttributeKey; label: string }[] = [
  { key: "gender", label: "Gender" },
  { key: "ageRange", label: "Age Range" },
  { key: "ethnicity", label: "Ethnicity" },
  { key: "bodyType", label: "Build" },
  { key: "height", label: "Height" },
  { key: "hairStyle", label: "Hair Style" },
  { key: "hairColor", label: "Hair Color" },
  { key: "eyeColor", label: "Eye Color" },
  { key: "skinTone", label: "Skin Tone" },
  { key: "clothing", label: "Outfit Style" },
  { key: "distinguishingFeatures", label: "Details" },
];

const attributeOptions: Record<AttributeKey, VisualOption[]> = {
  gender: [
    { label: "Male", gradient: "from-blue-900/60 to-blue-700/20" },
    { label: "Female", gradient: "from-pink-900/60 to-pink-700/20" },
    { label: "Non-binary", gradient: "from-purple-900/60 to-purple-700/20" },
  ],
  ageRange: [
    { label: "Child (5-12)", gradient: "from-green-900/50 to-green-700/20" },
    { label: "Teen (13-17)", gradient: "from-cyan-900/50 to-cyan-700/20" },
    { label: "Young Adult (18-30)", gradient: "from-blue-900/50 to-blue-700/20" },
    { label: "Middle Age (31-55)", gradient: "from-amber-900/50 to-amber-700/20" },
    { label: "Senior (56+)", gradient: "from-stone-800/50 to-stone-600/20" },
  ],
  ethnicity: [
    { label: "Caucasian", gradient: "from-stone-800/50 to-stone-600/20" },
    { label: "African", gradient: "from-amber-900/50 to-amber-700/20" },
    { label: "East Asian", gradient: "from-red-900/50 to-red-700/20" },
    { label: "South Asian", gradient: "from-orange-900/50 to-orange-700/20" },
    { label: "Hispanic", gradient: "from-emerald-900/50 to-emerald-700/20" },
    { label: "Middle Eastern", gradient: "from-amber-800/50 to-amber-600/20" },
    { label: "Mixed", gradient: "from-violet-900/50 to-violet-700/20" },
  ],
  bodyType: [
    { label: "Slim", image: buildSlim },
    { label: "Average", image: buildAverage },
    { label: "Muscular", image: buildMuscular },
    { label: "Heavy", image: buildHeavy },
  ],
  height: [
    { label: "Short", gradient: "from-stone-800/50 to-stone-600/20" },
    { label: "Average", gradient: "from-blue-900/50 to-blue-700/20" },
    { label: "Tall", gradient: "from-emerald-900/50 to-emerald-700/20" },
    { label: "Very Tall", gradient: "from-amber-900/50 to-amber-700/20" },
  ],
  hairStyle: [
    { label: "Short", image: hairShort },
    { label: "Long", image: hairLong },
    { label: "Curly", image: hairCurly },
    { label: "Bald", image: hairBald },
    { label: "Slicked Back", image: hairSlicked },
    { label: "Braided", image: hairBraided },
  ],
  hairColor: [
    { label: "Black", color: "#1a1a1a" },
    { label: "Dark Brown", color: "#3d2314" },
    { label: "Light Brown", color: "#8b6914" },
    { label: "Blonde", color: "#d4a843" },
    { label: "Red", color: "#8b2500" },
    { label: "Auburn", color: "#6b3a2a" },
    { label: "Gray", color: "#808080" },
    { label: "White", color: "#e0e0e0" },
  ],
  eyeColor: [
    { label: "Brown", color: "#5c3317" },
    { label: "Blue", color: "#3a7bd5" },
    { label: "Green", color: "#2d6a4f" },
    { label: "Hazel", color: "#8b7355" },
    { label: "Gray", color: "#778899" },
    { label: "Amber", color: "#c68e17" },
  ],
  skinTone: [
    { label: "Very Light", color: "#fde7d3" },
    { label: "Light", color: "#f0c8a0" },
    { label: "Medium Light", color: "#d4a06a" },
    { label: "Medium", color: "#b07c4f" },
    { label: "Medium Dark", color: "#8b5e3c" },
    { label: "Dark", color: "#5c3a21" },
  ],
  clothing: [
    { label: "Casual", gradient: "from-blue-900/40 to-blue-700/20" },
    { label: "Formal", gradient: "from-stone-900/40 to-stone-700/20" },
    { label: "High Fashion", gradient: "from-purple-900/40 to-purple-700/20" },
    { label: "Military", gradient: "from-green-900/40 to-green-700/20" },
    { label: "Vintage", gradient: "from-amber-900/40 to-amber-700/20" },
    { label: "Streetwear", gradient: "from-red-900/40 to-red-700/20" },
    { label: "Business", gradient: "from-slate-900/40 to-slate-700/20" },
  ],
  distinguishingFeatures: [
    { label: "None", gradient: "from-muted to-muted/50" },
    { label: "Facial Scar", gradient: "from-red-900/40 to-red-700/20" },
    { label: "Freckles", gradient: "from-amber-900/40 to-amber-700/20" },
    { label: "Tattoos", gradient: "from-indigo-900/40 to-indigo-700/20" },
    { label: "Glasses", gradient: "from-blue-900/40 to-blue-700/20" },
    { label: "Birthmark", gradient: "from-rose-900/40 to-rose-700/20" },
  ],
};

const roleOptions = ["Protagonist", "Antagonist", "Supporting", "Extra"];

// ─── Mock characters ────────────────────────────────────────
const initialCharacters: Character[] = [
  {
    id: "1", name: "Jack Marlowe", role: "Protagonist",
    description: "A world-weary private detective haunted by a case gone wrong.",
    portrait: detectiveImg, gender: "Male", ageRange: "Middle Age (31-55)", ethnicity: "Caucasian",
    bodyType: "Athletic", hairColor: "Dark Brown", hairStyle: "Short", eyeColor: "Brown",
    skinTone: "Light", clothing: "Formal", distinguishingFeatures: "Facial Scar", height: "Tall",
    generatedPortraits: [
      { id: "g1a", src: detectiveImg, description: "Detective — classic noir" },
      { id: "g1b", src: femmeFataleImg, description: "Detective — alternate angle" },
      { id: "g1c", src: olderGentlemanImg, description: "Detective — older version" },
    ],
    selectedPortraitId: "g1a",
  },
  {
    id: "2", name: "Vivian Lake", role: "Supporting",
    description: "A mysterious woman who walks into Marlowe's office with a missing person case.",
    portrait: femmeFataleImg, gender: "Female", ageRange: "Young Adult (18-30)", ethnicity: "Caucasian",
    bodyType: "Slim", hairColor: "Dark Brown", hairStyle: "Long", eyeColor: "Green",
    skinTone: "Very Light", clothing: "High Fashion", distinguishingFeatures: "None", height: "Average",
    generatedPortraits: [
      { id: "g2a", src: femmeFataleImg, description: "Vivian — classic look" },
      { id: "g2b", src: detectiveImg, description: "Vivian — alternate" },
    ],
    selectedPortraitId: "g2a",
  },
  {
    id: "3", name: "Victor Kane", role: "Antagonist",
    description: "A powerful businessman who controls half the city.",
    portrait: olderGentlemanImg, gender: "Male", ageRange: "Senior (56+)", ethnicity: "Caucasian",
    bodyType: "Average", hairColor: "Gray", hairStyle: "Slicked Back", eyeColor: "Blue",
    skinTone: "Light", clothing: "Formal", distinguishingFeatures: "None", height: "Tall",
    generatedPortraits: [],
    selectedPortraitId: null,
  },
];

// ─── Attribute Picker Dialog ────────────────────────────────
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
        <div className={cn(
          "grid gap-3 mt-4",
          options.some(o => o.image) ? "grid-cols-3 sm:grid-cols-4" : options.some(o => o.color) ? "grid-cols-4 sm:grid-cols-6" : "grid-cols-2 sm:grid-cols-3"
        )}>
          {options.map(opt => {
            const isSelected = selected === opt.label;
            const isImage = !!opt.image;
            const isColor = !!opt.color && !opt.image;

            return (
              <div key={opt.label}>
                <button
                  onClick={() => { onSelect(opt.label); onOpenChange(false); }}
                  className={cn(
                    "relative w-full overflow-hidden transition-all duration-200",
                    isImage && "rounded-xl aspect-[3/4]",
                    isColor && "rounded-full aspect-square mx-auto w-16",
                    !isImage && !isColor && "rounded-xl aspect-[4/3] bg-gradient-to-br",
                    !isImage && !isColor && (opt.gradient || "from-muted to-muted/50"),
                    isSelected
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.03]"
                      : "hover:scale-[1.03] hover:ring-1 hover:ring-border"
                  )}
                  style={isColor ? { backgroundColor: opt.color } : undefined}
                >
                  {isImage && (
                    <img src={opt.image} alt={opt.label} className="w-full h-full object-cover" loading="lazy" draggable={false} />
                  )}
                  {!isImage && !isColor && (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-foreground/20">{opt.label.charAt(0)}</span>
                    </div>
                  )}
                  {isSelected && (
                    <div className={cn("absolute flex items-center justify-center bg-primary", isColor ? "top-0 right-0 w-4 h-4 rounded-full" : "top-2 right-2 w-5 h-5 rounded-full")}>
                      <Check className={cn("text-primary-foreground", isColor ? "w-2.5 h-2.5" : "w-3 h-3")} />
                    </div>
                  )}
                </button>
                <p className={cn("text-xs font-medium text-center mt-1.5", isSelected ? "text-primary" : "text-muted-foreground")}>
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

// ─── Picker Row (in drawer) ─────────────────────────────────
function AttributeRow({ label, value, options, onClick }: {
  label: string;
  value: string;
  options: VisualOption[];
  onClick: () => void;
}) {
  const opt = options.find(o => o.label === value);
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border border-border bg-card hover:border-muted-foreground/40 transition-all text-left"
    >
      {opt?.image ? (
        <img src={opt.image} alt={value} className="w-8 h-8 rounded-lg object-cover" />
      ) : opt?.color ? (
        <div className="w-8 h-8 rounded-full border border-border/50" style={{ backgroundColor: opt.color }} />
      ) : (
        <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center", opt?.gradient || "from-muted to-muted/50")}>
          <span className="text-xs font-bold text-foreground/30">{(value || "?").charAt(0)}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none mb-0.5">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value || "Choose..."}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
    </button>
  );
}

// ─── Slide Drawer Panel ─────────────────────────────────────
function CharacterDrawer({ character, onChange, onClose, onDelete }: {
  character: Character;
  onChange: (c: Character) => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  const [pickerOpen, setPickerOpen] = useState<AttributeKey | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const selectPortrait = (p: GeneratedPortrait) => {
    onChange({ ...character, portrait: p.src, selectedPortraitId: p.id });
  };

  return (
    <>
      <div className="fixed top-0 right-0 h-full w-[400px] z-50 bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <h2 className="text-sm font-bold text-foreground">Character Details</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Portrait preview */}
          <div className="w-full rounded-xl overflow-hidden border border-border bg-secondary">
            {character.portrait ? (
              <img src={character.portrait} alt={character.name} className="w-full object-cover max-h-[220px]" />
            ) : (
              <div className="w-full h-[160px] flex items-center justify-center">
                <User className="w-10 h-10 text-muted-foreground/20" />
              </div>
            )}
          </div>

          {/* Name */}
          <input
            value={character.name}
            onChange={e => onChange({ ...character, name: e.target.value })}
            className="w-full text-lg font-bold bg-transparent border-none outline-none text-foreground"
            placeholder="Character Name"
          />

          {/* Role pills */}
          <div className="flex gap-1.5">
            {roleOptions.map(r => (
              <button
                key={r}
                onClick={() => onChange({ ...character, role: r })}
                className={cn(
                  "text-[11px] px-2.5 py-1 rounded-full border transition-colors",
                  character.role === r
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Description */}
          <textarea
            value={character.description}
            onChange={e => onChange({ ...character, description: e.target.value })}
            placeholder="Character description..."
            className="w-full min-h-[60px] rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />

          <Separator />

          {/* Attribute rows */}
          <div className="space-y-2">
            {attributeCategories.map(cat => (
              <AttributeRow
                key={cat.key}
                label={cat.label}
                value={character[cat.key] as string}
                options={attributeOptions[cat.key]}
                onClick={() => setPickerOpen(cat.key)}
              />
            ))}
          </div>

          <Separator />

          {/* Generated Portraits */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Portraits</h3>
                <p className="text-[11px] text-muted-foreground">Generate & pick a portrait</p>
              </div>
              <Button size="sm" className="gap-1.5 h-8">
                <Sparkles className="w-3.5 h-3.5" />
                Generate
              </Button>
            </div>

            {character.generatedPortraits.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {character.generatedPortraits.map((p, idx) => {
                  const isActive = character.selectedPortraitId === p.id;
                  return (
                    <button
                      key={p.id}
                      className={cn(
                        "relative rounded-lg overflow-hidden transition-all group aspect-[3/4]",
                        isActive
                          ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                          : "hover:scale-[1.02] ring-1 ring-border"
                      )}
                      onClick={() => selectPortrait(p)}
                    >
                      <img src={p.src} alt={p.description} className="w-full h-full object-cover" draggable={false} />
                      {isActive && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
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
            ) : (
              <div className="rounded-lg border-2 border-dashed border-border bg-card/30 p-6 flex flex-col items-center gap-2">
                <Sparkles className="w-6 h-6 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground text-center">
                  Generate portrait options
                </p>
              </div>
            )}
          </div>

          {/* Delete */}
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete Character
            </Button>
          </div>
        </div>
      </div>

      {/* Attribute picker dialogs */}
      {pickerOpen && (
        <AttributePickerDialog
          open={!!pickerOpen}
          onOpenChange={(v) => { if (!v) setPickerOpen(null); }}
          category={attributeCategories.find(c => c.key === pickerOpen)?.label || ""}
          options={attributeOptions[pickerOpen]}
          selected={character[pickerOpen] as string}
          onSelect={(v) => onChange({ ...character, [pickerOpen]: v })}
        />
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && character.generatedPortraits.length > 0 && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            onClick={() => setLightboxIndex(null)}
          >
            <X className="w-5 h-5 text-white" />
          </button>
          {lightboxIndex > 0 && (
            <button
              className="absolute left-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          )}
          <div className="max-w-2xl max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <img src={character.generatedPortraits[lightboxIndex].src} alt="" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
            <div className="flex items-center justify-between mt-4 px-2">
              <p className="text-sm text-white/70">{character.generatedPortraits[lightboxIndex].description}</p>
              <Button size="sm" onClick={() => { selectPortrait(character.generatedPortraits[lightboxIndex!]); setLightboxIndex(null); }} className="gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Use This
              </Button>
            </div>
          </div>
          {lightboxIndex < character.generatedPortraits.length - 1 && (
            <button
              className="absolute right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      )}

      {/* Delete dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Delete Character</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-semibold text-foreground">{character.name}</span>?
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={() => { onDelete(); setDeleteOpen(false); }}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Main Casting Editor ────────────────────────────────────
export function CastingEditor({ projectId }: { projectId?: string }) {
  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  const selectedCharacter = characters.find(c => c.id === selectedCharacterId);

  const addCharacter = useCallback(() => {
    const newChar: Character = {
      id: `char-${Date.now()}`,
      name: "New Character",
      role: "Supporting",
      description: "",
      portrait: "",
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
    setCharacters(prev => [...prev, newChar]);
    setSelectedCharacterId(newChar.id);
  }, []);

  const updateCharacter = useCallback((updated: Character) => {
    setCharacters(prev => prev.map(c => c.id === updated.id ? updated : c));
  }, []);

  const deleteCharacter = useCallback((id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
    setSelectedCharacterId(null);
  }, []);

  return (
    <div className="h-full overflow-auto pt-16">
      <div className={cn("max-w-6xl mx-auto px-8 py-8 transition-all", selectedCharacter && "mr-[400px]")}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cast</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {characters.length} character{characters.length !== 1 ? "s" : ""} — Click a character to define their appearance
            </p>
          </div>
          <Button onClick={addCharacter} className="gap-1.5">
            <Plus className="w-4 h-4" />
            Add Character
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {characters.map(char => (
            <motion.button
              key={char.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedCharacterId(char.id)}
              className={cn(
                "group relative flex flex-col rounded-xl overflow-hidden border bg-card transition-colors text-left",
                selectedCharacterId === char.id
                  ? "border-primary ring-1 ring-primary"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="aspect-[3/4] w-full bg-secondary overflow-hidden">
                {char.portrait ? (
                  <img src={char.portrait} alt={char.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" draggable={false} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                    <User className="w-12 h-12 text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-md",
                    char.role === "Protagonist" && "bg-amber-500/20 text-amber-300",
                    char.role === "Antagonist" && "bg-red-500/20 text-red-300",
                    char.role === "Supporting" && "bg-blue-500/20 text-blue-300",
                    char.role === "Extra" && "bg-slate-500/20 text-slate-300",
                  )}>
                    {char.role}
                  </span>
                </div>
                {char.generatedPortraits.length > 0 && (
                  <div className="absolute top-2 right-2">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-black/50 text-white/80 backdrop-blur-sm">
                      {char.generatedPortraits.length} variants
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-foreground truncate">{char.name}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                  {char.description || "Click to define"}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {char.gender && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{char.gender}</span>}
                  {char.ageRange && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{char.ageRange.split(" ")[0]}</span>}
                  {char.bodyType && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{char.bodyType}</span>}
                </div>
              </div>
            </motion.button>
          ))}

          <motion.button
            whileHover={{ scale: 1.03, y: -4 }}
            transition={{ duration: 0.2 }}
            onClick={addCharacter}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-card/30 hover:bg-card/50 transition-all aspect-[3/4] min-h-[200px]"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Add Character</span>
          </motion.button>
        </div>
      </div>

      {/* Slide drawer */}
      <AnimatePresence>
        {selectedCharacter && (
          <CharacterDrawer
            key={selectedCharacter.id}
            character={selectedCharacter}
            onChange={updateCharacter}
            onClose={() => setSelectedCharacterId(null)}
            onDelete={() => deleteCharacter(selectedCharacter.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
