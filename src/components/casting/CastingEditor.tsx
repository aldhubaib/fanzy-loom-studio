import { useState } from "react";
import { Plus, User, ChevronRight, Trash2, Upload, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

// Mock character images
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
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  clothing: string;
  distinguishingFeatures: string;
}

const genderOptions = [
  { label: "Male", emoji: "♂️" },
  { label: "Female", emoji: "♀️" },
  { label: "Non-binary", emoji: "⚧️" },
];

const ageRangeOptions = [
  { label: "Child", detail: "5-12", emoji: "🧒" },
  { label: "Teen", detail: "13-17", emoji: "🧑" },
  { label: "Young Adult", detail: "18-30", emoji: "👤" },
  { label: "Middle Age", detail: "31-55", emoji: "🧔" },
  { label: "Senior", detail: "56+", emoji: "👴" },
];

const bodyTypeOptions = [
  { label: "Slim", emoji: "🦴" },
  { label: "Athletic", emoji: "💪" },
  { label: "Average", emoji: "👤" },
  { label: "Muscular", emoji: "🏋️" },
  { label: "Heavy", emoji: "🐻" },
];

const hairColorOptions = [
  { label: "Black", color: "#1a1a1a" },
  { label: "Dark Brown", color: "#3d2314" },
  { label: "Light Brown", color: "#8b6914" },
  { label: "Blonde", color: "#d4a843" },
  { label: "Red", color: "#8b2500" },
  { label: "Auburn", color: "#6b3a2a" },
  { label: "Gray", color: "#808080" },
  { label: "White", color: "#e0e0e0" },
];

const hairStyleOptions = [
  { label: "Short", emoji: "✂️" },
  { label: "Medium", emoji: "💇" },
  { label: "Long", emoji: "💁" },
  { label: "Bald", emoji: "🪒" },
  { label: "Curly", emoji: "🌀" },
  { label: "Slicked Back", emoji: "💈" },
  { label: "Braided", emoji: "🪢" },
  { label: "Mohawk", emoji: "🦔" },
];

const eyeColorOptions = [
  { label: "Brown", color: "#5c3317" },
  { label: "Blue", color: "#3a7bd5" },
  { label: "Green", color: "#2d6a4f" },
  { label: "Hazel", color: "#8b7355" },
  { label: "Gray", color: "#778899" },
  { label: "Amber", color: "#c68e17" },
];

const skinToneOptions = [
  { label: "Very Light", color: "#fde7d3" },
  { label: "Light", color: "#f0c8a0" },
  { label: "Medium Light", color: "#d4a06a" },
  { label: "Medium", color: "#b07c4f" },
  { label: "Medium Dark", color: "#8b5e3c" },
  { label: "Dark", color: "#5c3a21" },
];

const ethnicityOptions = [
  { label: "Caucasian", emoji: "🌍" },
  { label: "African", emoji: "🌍" },
  { label: "Asian", emoji: "🌏" },
  { label: "Hispanic", emoji: "🌎" },
  { label: "Middle Eastern", emoji: "🌍" },
  { label: "South Asian", emoji: "🌏" },
  { label: "Mixed", emoji: "🌐" },
];

const roleOptions = [
  { label: "Protagonist", emoji: "⭐" },
  { label: "Antagonist", emoji: "🎭" },
  { label: "Supporting", emoji: "🤝" },
  { label: "Extra", emoji: "👥" },
];

const mockCharacters: Character[] = [
  {
    id: "1", name: "Jack Marlowe", role: "Protagonist", description: "A world-weary private detective haunted by a case gone wrong. Cynical on the outside, but driven by an unshakeable sense of justice.",
    portrait: detectiveImg, gender: "Male", ageRange: "Middle Age", ethnicity: "Caucasian", bodyType: "Athletic",
    hairColor: "Dark Brown", hairStyle: "Short", eyeColor: "Brown", skinTone: "Light", clothing: "Fedora, trench coat, worn leather shoes",
    distinguishingFeatures: "Scar above left eyebrow, perpetual five o'clock shadow"
  },
  {
    id: "2", name: "Vivian Lake", role: "Supporting", description: "A mysterious woman who walks into Marlowe's office with a missing person case. Nothing about her story adds up.",
    portrait: femmeFataleImg, gender: "Female", ageRange: "Young Adult", ethnicity: "Caucasian", bodyType: "Slim",
    hairColor: "Dark Brown", hairStyle: "Medium", eyeColor: "Green", skinTone: "Very Light", clothing: "Elegant dark dress, pearl earrings, red lipstick",
    distinguishingFeatures: "Beauty mark on left cheek, always wears gloves"
  },
  {
    id: "3", name: "Victor Kane", role: "Antagonist", description: "A powerful businessman who controls half the city. Polished exterior hides a ruthless criminal mastermind.",
    portrait: olderGentlemanImg, gender: "Male", ageRange: "Senior", ethnicity: "Caucasian", bodyType: "Average",
    hairColor: "Gray", hairStyle: "Slicked Back", eyeColor: "Blue", skinTone: "Light", clothing: "Expensive three-piece suit, gold cufflinks, signet ring",
    distinguishingFeatures: "Cold, piercing gaze; walks with a slight limp"
  },
];

// Attribute pill selector
function AttributePills({ options, selected, onSelect, type = "emoji" }: {
  options: { label: string; emoji?: string; color?: string }[];
  selected: string;
  onSelect: (v: string) => void;
  type?: "emoji" | "color";
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.label}
          onClick={() => onSelect(opt.label)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all duration-150",
            selected === opt.label
              ? "border-primary bg-primary/10 text-primary font-medium"
              : "border-border bg-card text-muted-foreground hover:border-muted-foreground hover:text-foreground"
          )}
        >
          {type === "color" && opt.color && (
            <span className="w-4 h-4 rounded-full border border-border/50 shrink-0" style={{ backgroundColor: opt.color }} />
          )}
          {type === "emoji" && opt.emoji && <span>{opt.emoji}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// Section wrapper
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</label>
      {children}
    </div>
  );
}

// Character detail editor (full page style like concept editor)
function CharacterDetail({ character, onChange, onDelete }: {
  character: Character;
  onChange: (c: Character) => void;
  onDelete: () => void;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Portrait + Name header */}
      <div className="flex items-start gap-6">
        <div className="relative group shrink-0">
          <div className="w-28 h-36 rounded-xl overflow-hidden border border-border bg-card">
            {character.portrait ? (
              <img src={character.portrait} alt={character.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                <User className="w-10 h-10 text-muted-foreground/30" />
              </div>
            )}
          </div>
          <button className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
            <Upload className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <input
            value={character.name}
            onChange={e => onChange({ ...character, name: e.target.value })}
            placeholder="Character Name"
            className="w-full bg-transparent text-2xl font-bold text-foreground placeholder:text-muted-foreground/40 outline-none tracking-tight"
          />
          <Section label="Role">
            <AttributePills options={roleOptions} selected={character.role} onSelect={v => onChange({ ...character, role: v })} />
          </Section>
        </div>
      </div>

      {/* Description */}
      <Section label="Character Description">
        <div className="rounded-lg bg-card border border-border p-1">
          <textarea
            ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
            value={character.description}
            onChange={e => {
              onChange({ ...character, description: e.target.value });
              const t = e.target; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px';
            }}
            placeholder="Describe this character's personality, backstory, motivations..."
            rows={2}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none p-3 leading-relaxed min-h-[3.5rem]"
          />
        </div>
      </Section>

      {/* Physical Attributes */}
      <div className="border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Physical Appearance
        </h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Section label="Gender">
              <AttributePills options={genderOptions} selected={character.gender} onSelect={v => onChange({ ...character, gender: v })} />
            </Section>
            <Section label="Age Range">
              <AttributePills options={ageRangeOptions} selected={character.ageRange} onSelect={v => onChange({ ...character, ageRange: v })} />
            </Section>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Section label="Ethnicity">
              <AttributePills options={ethnicityOptions} selected={character.ethnicity} onSelect={v => onChange({ ...character, ethnicity: v })} />
            </Section>
            <Section label="Body Type">
              <AttributePills options={bodyTypeOptions} selected={character.bodyType} onSelect={v => onChange({ ...character, bodyType: v })} />
            </Section>
          </div>

          <Section label="Skin Tone">
            <AttributePills options={skinToneOptions} selected={character.skinTone} onSelect={v => onChange({ ...character, skinTone: v })} type="color" />
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Section label="Hair Color">
              <AttributePills options={hairColorOptions} selected={character.hairColor} onSelect={v => onChange({ ...character, hairColor: v })} type="color" />
            </Section>
            <Section label="Hair Style">
              <AttributePills options={hairStyleOptions} selected={character.hairStyle} onSelect={v => onChange({ ...character, hairStyle: v })} />
            </Section>
          </div>

          <Section label="Eye Color">
            <AttributePills options={eyeColorOptions} selected={character.eyeColor} onSelect={v => onChange({ ...character, eyeColor: v })} type="color" />
          </Section>
        </div>
      </div>

      {/* Wardrobe & Distinguishing Features */}
      <div className="border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Style & Details
        </h3>
        <div className="space-y-6">
          <Section label="Clothing / Wardrobe">
            <div className="rounded-lg bg-card border border-border p-1">
              <textarea
                ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
                value={character.clothing}
                onChange={e => {
                  onChange({ ...character, clothing: e.target.value });
                  const t = e.target; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px';
                }}
                placeholder="Describe their typical outfit, accessories..."
                rows={2}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none p-3 leading-relaxed min-h-[3rem]"
              />
            </div>
          </Section>

          <Section label="Distinguishing Features">
            <div className="rounded-lg bg-card border border-border p-1">
              <textarea
                ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
                value={character.distinguishingFeatures}
                onChange={e => {
                  onChange({ ...character, distinguishingFeatures: e.target.value });
                  const t = e.target; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px';
                }}
                placeholder="Scars, tattoos, unique mannerisms, props..."
                rows={2}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none p-3 leading-relaxed min-h-[3rem]"
              />
            </div>
          </Section>
        </div>
      </div>

      {/* Generate & Delete */}
      <div className="border-t border-border pt-6 flex items-center justify-between">
        <Button
          variant="outline"
          className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
        >
          <Sparkles className="w-4 h-4" />
          Generate Portrait
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Character
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

// Main Casting Editor
export function CastingEditor({ projectId }: { projectId?: string }) {
  const isMockProject = projectId === "1";
  const [characters, setCharacters] = useState<Character[]>(isMockProject ? mockCharacters : []);
  const [selectedId, setSelectedId] = useState<string | null>(isMockProject ? "1" : null);

  const selectedCharacter = characters.find(c => c.id === selectedId);

  const addCharacter = () => {
    const newChar: Character = {
      id: Date.now().toString(),
      name: "",
      role: "",
      description: "",
      portrait: "",
      gender: "",
      ageRange: "",
      ethnicity: "",
      bodyType: "",
      hairColor: "",
      hairStyle: "",
      eyeColor: "",
      skinTone: "",
      clothing: "",
      distinguishingFeatures: "",
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
                {char.role && (
                  <p className="text-[11px] text-muted-foreground truncate">{char.role}</p>
                )}
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
      <div className="flex-1 overflow-y-auto h-full pt-14">
        <div className="max-w-3xl mx-auto px-8 py-8">
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
                className="flex flex-col items-center justify-center h-[60vh] gap-4"
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
    </div>
  );
}
