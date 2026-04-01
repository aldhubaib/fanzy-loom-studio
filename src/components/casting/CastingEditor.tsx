import { useState } from "react";
import { Plus, User, ChevronRight, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

import detectiveImg from "@/assets/casting/detective.jpg";
import femmeFataleImg from "@/assets/casting/femme-fatale.jpg";
import olderGentlemanImg from "@/assets/casting/older-gentleman.jpg";

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
  hairTexture: string;
  eyeColor: string;
  skinTone: string;
  facialHair: string;
  clothing: string;
  distinguishingFeatures: string;
  archetype: string;
  era: string;
}

// ─── Tab categories ─────────────────────────────────────────
const tabs = [
  { key: "role", label: "Role" },
  { key: "archetype", label: "Archetype" },
  { key: "identity", label: "Identity" },
  { key: "appearance", label: "Physical Appearance" },
  { key: "details", label: "Details" },
  { key: "outfit", label: "Outfit" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

// ─── Sub-categories for "Identity" tab ──────────────────────
const identitySubcats = ["Gender", "Ethnicity", "Age"] as const;

// ─── Sub-categories for "Physical Appearance" tab ───────────
const appearanceSubcats = ["Build", "Height", "Eye Color", "Hair Style", "Hair Texture", "Hair Color", "Facial Hair", "Skin Tone"] as const;

// ─── Visual card option data ────────────────────────────────
// Each option has a label, a gradient/color for the card bg, and an icon/emoji

interface CardOption {
  label: string;
  emoji?: string;
  gradient?: string;
  color?: string;
}

const roleOptions: CardOption[] = [
  { label: "Protagonist", emoji: "⭐", gradient: "from-amber-900/60 to-amber-700/30" },
  { label: "Antagonist", emoji: "🎭", gradient: "from-red-900/60 to-red-700/30" },
  { label: "Supporting", emoji: "🤝", gradient: "from-blue-900/60 to-blue-700/30" },
  { label: "Extra", emoji: "👥", gradient: "from-slate-800/60 to-slate-600/30" },
];

const archetypeOptions: CardOption[] = [
  { label: "Innocent", emoji: "🕊️", gradient: "from-sky-900/50 to-sky-700/20" },
  { label: "Everyman", emoji: "🧑", gradient: "from-stone-800/50 to-stone-600/20" },
  { label: "Hero", emoji: "🦸", gradient: "from-amber-900/50 to-amber-700/20" },
  { label: "Caregiver", emoji: "💝", gradient: "from-pink-900/50 to-pink-700/20" },
  { label: "Explorer", emoji: "🧭", gradient: "from-emerald-900/50 to-emerald-700/20" },
  { label: "Rebel", emoji: "⚡", gradient: "from-red-900/50 to-red-700/20" },
  { label: "Lover", emoji: "❤️", gradient: "from-rose-900/50 to-rose-700/20" },
  { label: "Jester", emoji: "🃏", gradient: "from-yellow-900/50 to-yellow-700/20" },
  { label: "Sage", emoji: "📚", gradient: "from-indigo-900/50 to-indigo-700/20" },
  { label: "Magician", emoji: "✨", gradient: "from-violet-900/50 to-violet-700/20" },
  { label: "Ruler", emoji: "👑", gradient: "from-amber-900/50 to-amber-800/20" },
  { label: "Creator", emoji: "🎨", gradient: "from-teal-900/50 to-teal-700/20" },
];

const genderOptions: CardOption[] = [
  { label: "Male", emoji: "♂️", gradient: "from-blue-900/50 to-blue-700/20" },
  { label: "Female", emoji: "♀️", gradient: "from-pink-900/50 to-pink-700/20" },
  { label: "Non-binary", emoji: "⚧️", gradient: "from-purple-900/50 to-purple-700/20" },
];

const ethnicityOptions: CardOption[] = [
  { label: "Caucasian", emoji: "🌍", gradient: "from-stone-800/50 to-stone-600/20" },
  { label: "African", emoji: "🌍", gradient: "from-amber-900/50 to-amber-700/20" },
  { label: "East Asian", emoji: "🌏", gradient: "from-red-900/50 to-red-700/20" },
  { label: "South Asian", emoji: "🌏", gradient: "from-orange-900/50 to-orange-700/20" },
  { label: "Hispanic", emoji: "🌎", gradient: "from-emerald-900/50 to-emerald-700/20" },
  { label: "Middle Eastern", emoji: "🌍", gradient: "from-amber-800/50 to-amber-600/20" },
  { label: "Mixed", emoji: "🌐", gradient: "from-violet-900/50 to-violet-700/20" },
];

const ageOptions: CardOption[] = [
  { label: "Child (5-12)", emoji: "🧒", gradient: "from-green-900/50 to-green-700/20" },
  { label: "Teen (13-17)", emoji: "🧑", gradient: "from-cyan-900/50 to-cyan-700/20" },
  { label: "Young Adult (18-30)", emoji: "👤", gradient: "from-blue-900/50 to-blue-700/20" },
  { label: "Middle Age (31-55)", emoji: "🧔", gradient: "from-amber-900/50 to-amber-700/20" },
  { label: "Senior (56+)", emoji: "👴", gradient: "from-stone-800/50 to-stone-600/20" },
];

const buildOptions: CardOption[] = [
  { label: "Slim", emoji: "🦴", gradient: "from-slate-800/50 to-slate-600/20" },
  { label: "Average", emoji: "👤", gradient: "from-stone-800/50 to-stone-600/20" },
  { label: "Athletic", emoji: "🏃", gradient: "from-blue-900/50 to-blue-700/20" },
  { label: "Muscular", emoji: "💪", gradient: "from-red-900/50 to-red-700/20" },
  { label: "Stocky", emoji: "🐻", gradient: "from-amber-900/50 to-amber-700/20" },
  { label: "Heavy", emoji: "🏋️", gradient: "from-stone-900/50 to-stone-700/20" },
];

const heightOptions: CardOption[] = [
  { label: "Short", emoji: "📏", gradient: "from-stone-800/50 to-stone-600/20" },
  { label: "Below Average", emoji: "📐", gradient: "from-slate-800/50 to-slate-600/20" },
  { label: "Average", emoji: "👤", gradient: "from-blue-900/50 to-blue-700/20" },
  { label: "Tall", emoji: "📏", gradient: "from-emerald-900/50 to-emerald-700/20" },
  { label: "Very Tall", emoji: "🦒", gradient: "from-amber-900/50 to-amber-700/20" },
];

const eyeColorOptions: CardOption[] = [
  { label: "Brown", color: "#5c3317" },
  { label: "Blue", color: "#3a7bd5" },
  { label: "Green", color: "#2d6a4f" },
  { label: "Hazel", color: "#8b7355" },
  { label: "Gray", color: "#778899" },
  { label: "Amber", color: "#c68e17" },
];

const hairStyleOptions: CardOption[] = [
  { label: "Short", emoji: "✂️", gradient: "from-stone-800/50 to-stone-600/20" },
  { label: "Medium", emoji: "💇", gradient: "from-slate-800/50 to-slate-600/20" },
  { label: "Long", emoji: "💁", gradient: "from-amber-900/50 to-amber-700/20" },
  { label: "Bald", emoji: "🪒", gradient: "from-stone-900/50 to-stone-700/20" },
  { label: "Curly", emoji: "🌀", gradient: "from-purple-900/50 to-purple-700/20" },
  { label: "Slicked Back", emoji: "💈", gradient: "from-blue-900/50 to-blue-700/20" },
  { label: "Braided", emoji: "🪢", gradient: "from-pink-900/50 to-pink-700/20" },
  { label: "Mohawk", emoji: "🦔", gradient: "from-red-900/50 to-red-700/20" },
];

const hairTextureOptions: CardOption[] = [
  { label: "Straight", emoji: "➖", gradient: "from-stone-800/50 to-stone-600/20" },
  { label: "Wavy", emoji: "〰️", gradient: "from-blue-900/50 to-blue-700/20" },
  { label: "Curly", emoji: "🌀", gradient: "from-amber-900/50 to-amber-700/20" },
  { label: "Coily", emoji: "🔄", gradient: "from-purple-900/50 to-purple-700/20" },
];

const hairColorOptions: CardOption[] = [
  { label: "Black", color: "#1a1a1a" },
  { label: "Dark Brown", color: "#3d2314" },
  { label: "Light Brown", color: "#8b6914" },
  { label: "Blonde", color: "#d4a843" },
  { label: "Red", color: "#8b2500" },
  { label: "Auburn", color: "#6b3a2a" },
  { label: "Gray", color: "#808080" },
  { label: "White", color: "#e0e0e0" },
];

const facialHairOptions: CardOption[] = [
  { label: "Clean Shaven", emoji: "😶", gradient: "from-stone-800/50 to-stone-600/20" },
  { label: "Stubble", emoji: "🧔", gradient: "from-amber-900/50 to-amber-700/20" },
  { label: "Mustache", emoji: "👨", gradient: "from-stone-900/50 to-stone-700/20" },
  { label: "Full Beard", emoji: "🧔‍♂️", gradient: "from-amber-800/50 to-amber-600/20" },
  { label: "Goatee", emoji: "🫦", gradient: "from-slate-800/50 to-slate-600/20" },
];

const skinToneOptions: CardOption[] = [
  { label: "Very Light", color: "#fde7d3" },
  { label: "Light", color: "#f0c8a0" },
  { label: "Medium Light", color: "#d4a06a" },
  { label: "Medium", color: "#b07c4f" },
  { label: "Medium Dark", color: "#8b5e3c" },
  { label: "Dark", color: "#5c3a21" },
];

const detailsOptions: CardOption[] = [
  { label: "Custom", emoji: "✨", gradient: "from-primary/30 to-primary/10" },
  { label: "Facial Scar", emoji: "🩹", gradient: "from-red-900/40 to-red-700/20" },
  { label: "Freckles", emoji: "🔴", gradient: "from-amber-900/40 to-amber-700/20" },
  { label: "Tattoos", emoji: "🖋️", gradient: "from-indigo-900/40 to-indigo-700/20" },
  { label: "Eye Patch", emoji: "🏴‍☠️", gradient: "from-stone-900/40 to-stone-700/20" },
  { label: "Glasses", emoji: "👓", gradient: "from-blue-900/40 to-blue-700/20" },
  { label: "Birthmark", emoji: "🟤", gradient: "from-rose-900/40 to-rose-700/20" },
];

const outfitOptions: CardOption[] = [
  { label: "Custom", emoji: "✨", gradient: "from-primary/30 to-primary/10" },
  { label: "Casual", emoji: "👕", gradient: "from-blue-900/40 to-blue-700/20" },
  { label: "Formal", emoji: "👔", gradient: "from-stone-900/40 to-stone-700/20" },
  { label: "High Fashion", emoji: "💎", gradient: "from-purple-900/40 to-purple-700/20" },
  { label: "Military", emoji: "🎖️", gradient: "from-green-900/40 to-green-700/20" },
  { label: "Sporty", emoji: "🏅", gradient: "from-cyan-900/40 to-cyan-700/20" },
  { label: "Vintage", emoji: "🎩", gradient: "from-amber-900/40 to-amber-700/20" },
  { label: "Streetwear", emoji: "🧢", gradient: "from-red-900/40 to-red-700/20" },
  { label: "Business", emoji: "💼", gradient: "from-slate-900/40 to-slate-700/20" },
];

// ─── Visual Card Component ──────────────────────────────────
function OptionCard({ option, selected, onSelect, size = "md" }: {
  option: CardOption;
  selected: boolean;
  onSelect: () => void;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-36 h-44",
    lg: "w-44 h-52",
  };

  const isColorSwatch = !!option.color && !option.gradient;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative rounded-xl overflow-hidden transition-all duration-200 flex flex-col items-center",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      <div className={cn(
        "relative flex items-center justify-center rounded-xl overflow-hidden transition-all",
        sizeClasses[size],
        isColorSwatch
          ? "border-2"
          : "bg-gradient-to-br",
        isColorSwatch
          ? selected ? "border-primary" : "border-border"
          : option.gradient || "from-muted to-muted/50",
        !selected && "hover:scale-[1.03]",
        selected && "scale-[1.02]"
      )}
      style={isColorSwatch ? { backgroundColor: option.color } : undefined}
      >
        {!isColorSwatch && option.emoji && (
          <span className={cn(
            "transition-transform",
            size === "lg" ? "text-5xl" : size === "md" ? "text-4xl" : "text-2xl",
            "drop-shadow-lg"
          )}>
            {option.emoji}
          </span>
        )}
      </div>
      <span className={cn(
        "mt-2 text-sm font-medium transition-colors",
        selected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
      )}>
        {option.label}
      </span>
    </button>
  );
}

// ─── Color Swatch Card ──────────────────────────────────────
function ColorCard({ option, selected, onSelect }: {
  option: CardOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group flex flex-col items-center gap-2 transition-all",
      )}
    >
      <div
        className={cn(
          "w-16 h-16 rounded-full border-4 transition-all shadow-lg",
          selected ? "border-primary scale-110" : "border-border/50 hover:border-muted-foreground hover:scale-105"
        )}
        style={{ backgroundColor: option.color }}
      />
      <span className={cn(
        "text-xs font-medium",
        selected ? "text-primary" : "text-muted-foreground"
      )}>
        {option.label}
      </span>
    </button>
  );
}

// ─── Mock characters ────────────────────────────────────────
const mockCharacters: Character[] = [
  {
    id: "1", name: "Jack Marlowe", role: "Protagonist", description: "A world-weary private detective haunted by a case gone wrong.",
    portrait: detectiveImg, gender: "Male", ageRange: "Middle Age (31-55)", ethnicity: "Caucasian", bodyType: "Athletic",
    hairColor: "Dark Brown", hairStyle: "Short", hairTexture: "Straight", eyeColor: "Brown", skinTone: "Light",
    clothing: "Formal", distinguishingFeatures: "Facial Scar", archetype: "Hero", era: "", height: "Tall", facialHair: "Stubble",
  },
  {
    id: "2", name: "Vivian Lake", role: "Supporting", description: "A mysterious woman who walks into Marlowe's office with a missing person case.",
    portrait: femmeFataleImg, gender: "Female", ageRange: "Young Adult (18-30)", ethnicity: "Caucasian", bodyType: "Slim",
    hairColor: "Dark Brown", hairStyle: "Medium", hairTexture: "Wavy", eyeColor: "Green", skinTone: "Very Light",
    clothing: "High Fashion", distinguishingFeatures: "", archetype: "Lover", era: "", height: "Average", facialHair: "",
  },
  {
    id: "3", name: "Victor Kane", role: "Antagonist", description: "A powerful businessman who controls half the city.",
    portrait: olderGentlemanImg, gender: "Male", ageRange: "Senior (56+)", ethnicity: "Caucasian", bodyType: "Average",
    hairColor: "Gray", hairStyle: "Slicked Back", hairTexture: "Straight", eyeColor: "Blue", skinTone: "Light",
    clothing: "Formal", distinguishingFeatures: "", archetype: "Ruler", era: "", height: "Tall", facialHair: "Clean Shaven",
  },
];

// ─── Character Detail (visual tab wizard) ───────────────────
function CharacterDetail({ character, onChange, onDelete }: {
  character: Character;
  onChange: (c: Character) => void;
  onDelete: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("role");
  const [identitySubcat, setIdentitySubcat] = useState<string>("Gender");
  const [appearanceSubcat, setAppearanceSubcat] = useState<string>("Build");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const getFieldForTab = (): { options: CardOption[]; field: keyof Character; useColor?: boolean } => {
    switch (activeTab) {
      case "role":
        return { options: roleOptions, field: "role" };
      case "archetype":
        return { options: archetypeOptions, field: "archetype" };
      case "identity":
        switch (identitySubcat) {
          case "Gender": return { options: genderOptions, field: "gender" };
          case "Ethnicity": return { options: ethnicityOptions, field: "ethnicity" };
          case "Age": return { options: ageOptions, field: "ageRange" };
          default: return { options: genderOptions, field: "gender" };
        }
      case "appearance":
        switch (appearanceSubcat) {
          case "Build": return { options: buildOptions, field: "bodyType" };
          case "Height": return { options: heightOptions, field: "height" };
          case "Eye Color": return { options: eyeColorOptions, field: "eyeColor", useColor: true };
          case "Hair Style": return { options: hairStyleOptions, field: "hairStyle" };
          case "Hair Texture": return { options: hairTextureOptions, field: "hairTexture" };
          case "Hair Color": return { options: hairColorOptions, field: "hairColor", useColor: true };
          case "Facial Hair": return { options: facialHairOptions, field: "facialHair" };
          case "Skin Tone": return { options: skinToneOptions, field: "skinTone", useColor: true };
          default: return { options: buildOptions, field: "bodyType" };
        }
      case "details":
        return { options: detailsOptions, field: "distinguishingFeatures" };
      case "outfit":
        return { options: outfitOptions, field: "clothing" };
      default:
        return { options: roleOptions, field: "role" };
    }
  };

  const { options, field, useColor } = getFieldForTab();
  const currentValue = character[field] as string;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full"
    >
      {/* Character header */}
      <div className="flex items-center gap-5 px-8 pt-6 pb-4">
        <div className="w-16 h-20 rounded-xl overflow-hidden border border-border bg-card shrink-0">
          {character.portrait ? (
            <img src={character.portrait} alt={character.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <User className="w-6 h-6 text-muted-foreground/30" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <input
            value={character.name}
            onChange={e => onChange({ ...character, name: e.target.value })}
            placeholder="Character Name"
            className="w-full bg-transparent text-2xl font-bold text-foreground placeholder:text-muted-foreground/40 outline-none tracking-tight"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Build your character — role, appearance, and every detail in between.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 shrink-0"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Top tabs */}
      <div className="px-8 border-b border-border">
        <div className="flex gap-1 overflow-x-auto pb-0">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-3 text-sm font-medium whitespace-nowrap rounded-t-lg transition-all relative",
                activeTab === tab.key
                  ? "text-foreground bg-secondary/80"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex h-full">
          {/* Sub-category sidebar for identity & appearance */}
          {(activeTab === "identity" || activeTab === "appearance") && (
            <div className="w-40 shrink-0 border-r border-border bg-card/30 py-4">
              {(activeTab === "identity" ? identitySubcats : appearanceSubcats).map(sub => {
                const isActive = activeTab === "identity" ? identitySubcat === sub : appearanceSubcat === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => activeTab === "identity" ? setIdentitySubcat(sub) : setAppearanceSubcat(sub)}
                    className={cn(
                      "w-full text-left px-5 py-2.5 text-sm transition-all border-l-2",
                      isActive
                        ? "text-foreground font-medium border-l-primary bg-primary/5"
                        : "text-muted-foreground hover:text-foreground border-l-transparent"
                    )}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          )}

          {/* Cards grid */}
          <div className="flex-1 p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${activeTab === "identity" ? identitySubcat : activeTab === "appearance" ? appearanceSubcat : ""}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {useColor ? (
                  <div className="flex flex-wrap gap-6">
                    {options.map(opt => (
                      <ColorCard
                        key={opt.label}
                        option={opt}
                        selected={currentValue === opt.label}
                        onSelect={() => onChange({ ...character, [field]: opt.label })}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                    {options.map(opt => (
                      <OptionCard
                        key={opt.label}
                        option={opt}
                        selected={currentValue === opt.label}
                        onSelect={() => onChange({ ...character, [field]: opt.label })}
                        size="md"
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom prompt bar */}
      <div className="border-t border-border px-8 py-4 flex items-center gap-3 bg-card/50">
        <input
          value={character.description}
          onChange={e => onChange({ ...character, description: e.target.value })}
          placeholder="Describe your character..."
          className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition-colors"
        />
        <Button variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/10 shrink-0">
          <Sparkles className="w-4 h-4" />
          Generate
        </Button>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm bg-card border-border">
          <DialogHeader><DialogTitle>Delete {character.name || "this character"}?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <div className="flex gap-3 mt-4 justify-end">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { onDelete(); setDeleteOpen(false); }}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// ─── Main Casting Editor ────────────────────────────────────
export function CastingEditor({ projectId }: { projectId?: string }) {
  const isMockProject = projectId === "1";
  const [characters, setCharacters] = useState<Character[]>(isMockProject ? mockCharacters : []);
  const [selectedId, setSelectedId] = useState<string | null>(isMockProject ? "1" : null);

  const selectedCharacter = characters.find(c => c.id === selectedId);

  const addCharacter = () => {
    const newChar: Character = {
      id: Date.now().toString(), name: "", role: "", description: "", portrait: "",
      gender: "", ageRange: "", ethnicity: "", bodyType: "", height: "",
      hairColor: "", hairStyle: "", hairTexture: "", eyeColor: "", skinTone: "",
      facialHair: "", clothing: "", distinguishingFeatures: "", archetype: "", era: "",
    };
    setCharacters(prev => [...prev, newChar]);
    setSelectedId(newChar.id);
  };

  const updateCharacter = (updated: Character) => {
    setCharacters(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const deleteCharacter = (id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
    if (selectedId === id) {
      const remaining = characters.filter(c => c.id !== id);
      setSelectedId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Character list sidebar */}
      <div className="w-64 shrink-0 border-r border-border bg-card/50 flex flex-col h-full pt-14">
        <div className="p-4 border-b border-border">
          <Button onClick={addCharacter} variant="outline" size="sm" className="w-full gap-2 border-border bg-card text-muted-foreground hover:text-foreground">
            <Plus className="w-3.5 h-3.5" />
            Add Character
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {characters.map(char => (
            <button
              key={char.id}
              onClick={() => setSelectedId(char.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left",
                selectedId === char.id
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-secondary/50 border border-transparent"
              )}
            >
              <div className="w-9 h-11 rounded-md overflow-hidden bg-secondary shrink-0">
                {char.portrait ? (
                  <img src={char.portrait} alt={char.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-4 h-4 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-medium truncate", selectedId === char.id ? "text-primary" : "text-foreground")}>
                  {char.name || "Unnamed"}
                </p>
                {char.role && <p className="text-[11px] text-muted-foreground truncate">{char.role}</p>}
              </div>
              <ChevronRight className={cn("w-3.5 h-3.5 shrink-0", selectedId === char.id ? "text-primary" : "text-muted-foreground/40")} />
            </button>
          ))}
          {characters.length === 0 && (
            <div className="text-center py-8 px-4">
              <User className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No characters yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Character detail area */}
      <div className="flex-1 overflow-hidden h-full pt-14">
        <AnimatePresence mode="wait">
          {selectedCharacter ? (
            <CharacterDetail
              key={selectedCharacter.id}
              character={selectedCharacter}
              onChange={updateCharacter}
              onDelete={() => deleteCharacter(selectedCharacter.id)}
            />
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full gap-4"
            >
              <User className="w-16 h-16 text-muted-foreground/20" />
              <p className="text-muted-foreground text-center">
                Select a character or add a new one to begin casting.
              </p>
              <Button onClick={addCharacter} variant="outline" className="gap-2 mt-2">
                <Plus className="w-4 h-4" />
                Add Your First Character
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
