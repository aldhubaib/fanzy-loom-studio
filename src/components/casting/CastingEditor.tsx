import { useState, useCallback, useMemo } from "react";
import { Plus, User, Trash2, Sparkles, Check, ChevronLeft, ChevronRight, X, Expand, Film } from "lucide-react";
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

// Storyboard frames for "Appears in" section
import frame1 from "@/assets/storyboard/frame-1.jpg";
import frame2 from "@/assets/storyboard/frame-2.jpg";
import frame3 from "@/assets/storyboard/frame-3.jpg";
import frame4 from "@/assets/storyboard/frame-4.jpg";
import frame5 from "@/assets/storyboard/frame-5.jpg";
import frame6 from "@/assets/storyboard/frame-6.jpg";

interface StoryboardAppearance {
  frameId: string;
  scene: string;
  shot: string;
  description: string;
  thumbnail: string;
}

// Mock: which storyboard frames each character appears in
const characterAppearances: Record<string, StoryboardAppearance[]> = {
  "1": [ // Jack Marlowe
    { frameId: "f1", scene: "SC 1", shot: "WIDE", description: "Marlowe sits at his desk, smoke curling from a cigarette.", thumbnail: frame1 },
    { frameId: "f2", scene: "SC 2", shot: "MED", description: "Vivian enters the office. Marlowe looks up.", thumbnail: frame2 },
    { frameId: "f4", scene: "SC 3", shot: "CU", description: "Close-up on Marlowe's reaction.", thumbnail: frame4 },
    { frameId: "f5", scene: "SC 4", shot: "OTS", description: "Marlowe and Vivian exchange files.", thumbnail: frame5 },
  ],
  "2": [ // Vivian Lake
    { frameId: "f2", scene: "SC 2", shot: "MED", description: "Vivian enters the office. Marlowe looks up.", thumbnail: frame2 },
    { frameId: "f3", scene: "SC 2", shot: "CU", description: "Close-up of Vivian at the jazz club.", thumbnail: frame3 },
    { frameId: "f5", scene: "SC 4", shot: "OTS", description: "Marlowe and Vivian exchange files.", thumbnail: frame5 },
  ],
  "3": [ // Victor Kane
    { frameId: "f6", scene: "SC 5", shot: "LOW", description: "Kane stands in his office, city skyline behind.", thumbnail: frame6 },
  ],
};

// ─── Male images ────────────────────────────────────────────
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
import ageChild from "@/assets/casting/age-child.jpg";
import ageTeen from "@/assets/casting/age-teen.jpg";
import ageYoungAdult from "@/assets/casting/age-young-adult.jpg";
import ageMiddle from "@/assets/casting/age-middle.jpg";
import ageSenior from "@/assets/casting/age-senior.jpg";
import heightShort from "@/assets/casting/height-short.jpg";
import heightAverage from "@/assets/casting/height-average.jpg";
import heightTall from "@/assets/casting/height-tall.jpg";
import heightVeryTall from "@/assets/casting/height-very-tall.jpg";
import outfitCasual from "@/assets/casting/outfit-casual.jpg";
import outfitFormal from "@/assets/casting/outfit-formal.jpg";
import outfitHighfashion from "@/assets/casting/outfit-highfashion.jpg";
import outfitMilitary from "@/assets/casting/outfit-military.jpg";
import outfitVintage from "@/assets/casting/outfit-vintage.jpg";
import outfitStreetwear from "@/assets/casting/outfit-streetwear.jpg";
import outfitBusiness from "@/assets/casting/outfit-business.jpg";
import detailNone from "@/assets/casting/detail-none.jpg";
import detailScar from "@/assets/casting/detail-scar.jpg";
import detailFreckles from "@/assets/casting/detail-freckles.jpg";
import detailTattoos from "@/assets/casting/detail-tattoos.jpg";
import detailGlasses from "@/assets/casting/detail-glasses.jpg";
import detailBirthmark from "@/assets/casting/detail-birthmark.jpg";

// ─── Female images ──────────────────────────────────────────
import fBuildSlim from "@/assets/casting/f-build-slim.jpg";
import fBuildAverage from "@/assets/casting/f-build-average.jpg";
import fBuildMuscular from "@/assets/casting/f-build-muscular.jpg";
import fBuildHeavy from "@/assets/casting/f-build-heavy.jpg";
import fHairShort from "@/assets/casting/f-hair-short.jpg";
import fHairLong from "@/assets/casting/f-hair-long.jpg";
import fHairCurly from "@/assets/casting/f-hair-curly.jpg";
import fHairBald from "@/assets/casting/f-hair-bald.jpg";
import fHairSlicked from "@/assets/casting/f-hair-slicked.jpg";
import fHairBraided from "@/assets/casting/f-hair-braided.jpg";
import fAgeChild from "@/assets/casting/f-age-child.jpg";
import fAgeTeen from "@/assets/casting/f-age-teen.jpg";
import fAgeYoungAdult from "@/assets/casting/f-age-young-adult.jpg";
import fAgeMiddle from "@/assets/casting/f-age-middle.jpg";
import fAgeSenior from "@/assets/casting/f-age-senior.jpg";
import fHeightShort from "@/assets/casting/f-height-short.jpg";
import fHeightAverage from "@/assets/casting/f-height-average.jpg";
import fHeightTall from "@/assets/casting/f-height-tall.jpg";
import fHeightVeryTall from "@/assets/casting/f-height-very-tall.jpg";
import fOutfitCasual from "@/assets/casting/f-outfit-casual.jpg";
import fOutfitFormal from "@/assets/casting/f-outfit-formal.jpg";
import fOutfitHighfashion from "@/assets/casting/f-outfit-highfashion.jpg";
import fOutfitMilitary from "@/assets/casting/f-outfit-military.jpg";
import fOutfitVintage from "@/assets/casting/f-outfit-vintage.jpg";
import fOutfitStreetwear from "@/assets/casting/f-outfit-streetwear.jpg";
import fOutfitBusiness from "@/assets/casting/f-outfit-business.jpg";
import fDetailNone from "@/assets/casting/f-detail-none.jpg";
import fDetailScar from "@/assets/casting/f-detail-scar.jpg";
import fDetailFreckles from "@/assets/casting/f-detail-freckles.jpg";
import fDetailTattoos from "@/assets/casting/f-detail-tattoos.jpg";
import fDetailGlasses from "@/assets/casting/f-detail-glasses.jpg";
import fDetailBirthmark from "@/assets/casting/f-detail-birthmark.jpg";

// Gender (shared)
import genderMale from "@/assets/casting/gender-male.jpg";
import genderFemale from "@/assets/casting/gender-female.jpg";
import genderNonbinary from "@/assets/casting/gender-nonbinary.jpg";
// Ethnicity (shared)
import ethCaucasian from "@/assets/casting/eth-caucasian.jpg";
import ethAfrican from "@/assets/casting/eth-african.jpg";
import ethEastAsian from "@/assets/casting/eth-east-asian.jpg";
import ethSouthAsian from "@/assets/casting/eth-south-asian.jpg";
import ethHispanic from "@/assets/casting/eth-hispanic.jpg";
import ethMiddleEastern from "@/assets/casting/eth-middle-eastern.jpg";
import ethMixed from "@/assets/casting/eth-mixed.jpg";
// Eye color (shared – close-up eyes are gender-neutral)
import eyeBrown from "@/assets/casting/eye-brown.jpg";
import eyeBlue from "@/assets/casting/eye-blue.jpg";
import eyeGreen from "@/assets/casting/eye-green.jpg";
import eyeHazel from "@/assets/casting/eye-hazel.jpg";
import eyeGray from "@/assets/casting/eye-gray.jpg";
import eyeAmber from "@/assets/casting/eye-amber.jpg";
// Hair color (shared)
import haircBlack from "@/assets/casting/hairc-black.jpg";
import haircDarkBrown from "@/assets/casting/hairc-dark-brown.jpg";
import haircLightBrown from "@/assets/casting/hairc-light-brown.jpg";
import haircBlonde from "@/assets/casting/hairc-blonde.jpg";
import haircRed from "@/assets/casting/hairc-red.jpg";
import haircAuburn from "@/assets/casting/hairc-auburn.jpg";
import haircGray from "@/assets/casting/hairc-gray.jpg";
import haircWhite from "@/assets/casting/hairc-white.jpg";
// Skin tone (shared)
import skinVeryLight from "@/assets/casting/skin-very-light.jpg";
import skinLight from "@/assets/casting/skin-light.jpg";
import skinMediumLight from "@/assets/casting/skin-medium-light.jpg";
import skinMedium from "@/assets/casting/skin-medium.jpg";
import skinMediumDark from "@/assets/casting/skin-medium-dark.jpg";
import skinDark from "@/assets/casting/skin-dark.jpg";

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
  image: string;
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

// Gender-neutral options (same for all)
const sharedOptions: Partial<Record<AttributeKey, VisualOption[]>> = {
  gender: [
    { label: "Male", image: genderMale },
    { label: "Female", image: genderFemale },
    
  ],
  ethnicity: [
    { label: "Caucasian", image: ethCaucasian },
    { label: "African", image: ethAfrican },
    { label: "East Asian", image: ethEastAsian },
    { label: "South Asian", image: ethSouthAsian },
    { label: "Hispanic", image: ethHispanic },
    { label: "Middle Eastern", image: ethMiddleEastern },
    { label: "Mixed", image: ethMixed },
  ],
  eyeColor: [
    { label: "Brown", image: eyeBrown },
    { label: "Blue", image: eyeBlue },
    { label: "Green", image: eyeGreen },
    { label: "Hazel", image: eyeHazel },
    { label: "Gray", image: eyeGray },
    { label: "Amber", image: eyeAmber },
  ],
  hairColor: [
    { label: "Black", image: haircBlack },
    { label: "Dark Brown", image: haircDarkBrown },
    { label: "Light Brown", image: haircLightBrown },
    { label: "Blonde", image: haircBlonde },
    { label: "Red", image: haircRed },
    { label: "Auburn", image: haircAuburn },
    { label: "Gray", image: haircGray },
    { label: "White", image: haircWhite },
  ],
  skinTone: [
    { label: "Very Light", image: skinVeryLight },
    { label: "Light", image: skinLight },
    { label: "Medium Light", image: skinMediumLight },
    { label: "Medium", image: skinMedium },
    { label: "Medium Dark", image: skinMediumDark },
    { label: "Dark", image: skinDark },
  ],
};

// Male-specific options
const maleOptions: Partial<Record<AttributeKey, VisualOption[]>> = {
  ageRange: [
    { label: "Child (5-12)", image: ageChild },
    { label: "Teen (13-17)", image: ageTeen },
    { label: "Young Adult (18-30)", image: ageYoungAdult },
    { label: "Middle Age (31-55)", image: ageMiddle },
    { label: "Senior (56+)", image: ageSenior },
  ],
  bodyType: [
    { label: "Slim", image: buildSlim },
    { label: "Average", image: buildAverage },
    { label: "Muscular", image: buildMuscular },
    { label: "Heavy", image: buildHeavy },
  ],
  height: [
    { label: "Short", image: heightShort },
    { label: "Average", image: heightAverage },
    { label: "Tall", image: heightTall },
    { label: "Very Tall", image: heightVeryTall },
  ],
  hairStyle: [
    { label: "Short", image: hairShort },
    { label: "Long", image: hairLong },
    { label: "Curly", image: hairCurly },
    { label: "Bald", image: hairBald },
    { label: "Slicked Back", image: hairSlicked },
    { label: "Braided", image: hairBraided },
  ],
  clothing: [
    { label: "Casual", image: outfitCasual },
    { label: "Formal", image: outfitFormal },
    { label: "High Fashion", image: outfitHighfashion },
    { label: "Military", image: outfitMilitary },
    { label: "Vintage", image: outfitVintage },
    { label: "Streetwear", image: outfitStreetwear },
    { label: "Business", image: outfitBusiness },
  ],
  distinguishingFeatures: [
    { label: "None", image: detailNone },
    { label: "Facial Scar", image: detailScar },
    { label: "Freckles", image: detailFreckles },
    { label: "Tattoos", image: detailTattoos },
    { label: "Glasses", image: detailGlasses },
    { label: "Birthmark", image: detailBirthmark },
  ],
};

// Female-specific options
const femaleOptions: Partial<Record<AttributeKey, VisualOption[]>> = {
  ageRange: [
    { label: "Child (5-12)", image: fAgeChild },
    { label: "Teen (13-17)", image: fAgeTeen },
    { label: "Young Adult (18-30)", image: fAgeYoungAdult },
    { label: "Middle Age (31-55)", image: fAgeMiddle },
    { label: "Senior (56+)", image: fAgeSenior },
  ],
  bodyType: [
    { label: "Slim", image: fBuildSlim },
    { label: "Average", image: fBuildAverage },
    { label: "Muscular", image: fBuildMuscular },
    { label: "Heavy", image: fBuildHeavy },
  ],
  height: [
    { label: "Short", image: fHeightShort },
    { label: "Average", image: fHeightAverage },
    { label: "Tall", image: fHeightTall },
    { label: "Very Tall", image: fHeightVeryTall },
  ],
  hairStyle: [
    { label: "Short", image: fHairShort },
    { label: "Long", image: fHairLong },
    { label: "Curly", image: fHairCurly },
    { label: "Bald", image: fHairBald },
    { label: "Slicked Back", image: fHairSlicked },
    { label: "Braided", image: fHairBraided },
  ],
  clothing: [
    { label: "Casual", image: fOutfitCasual },
    { label: "Formal", image: fOutfitFormal },
    { label: "High Fashion", image: fOutfitHighfashion },
    { label: "Military", image: fOutfitMilitary },
    { label: "Vintage", image: fOutfitVintage },
    { label: "Streetwear", image: fOutfitStreetwear },
    { label: "Business", image: fOutfitBusiness },
  ],
  distinguishingFeatures: [
    { label: "None", image: fDetailNone },
    { label: "Facial Scar", image: fDetailScar },
    { label: "Freckles", image: fDetailFreckles },
    { label: "Tattoos", image: fDetailTattoos },
    { label: "Glasses", image: fDetailGlasses },
    { label: "Birthmark", image: fDetailBirthmark },
  ],
};

function getAttributeOptions(gender: string): Record<AttributeKey, VisualOption[]> {
  const gendered = gender === "Female" ? femaleOptions : maleOptions;
  return {
    gender: sharedOptions.gender!,
    ageRange: gendered.ageRange || maleOptions.ageRange!,
    ethnicity: sharedOptions.ethnicity!,
    bodyType: gendered.bodyType || maleOptions.bodyType!,
    height: gendered.height || maleOptions.height!,
    hairStyle: gendered.hairStyle || maleOptions.hairStyle!,
    hairColor: sharedOptions.hairColor!,
    eyeColor: sharedOptions.eyeColor!,
    skinTone: sharedOptions.skinTone!,
    clothing: gendered.clothing || maleOptions.clothing!,
    distinguishingFeatures: gendered.distinguishingFeatures || maleOptions.distinguishingFeatures!,
  };
}

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
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.03]"
                      : "hover:scale-[1.03] hover:ring-1 hover:ring-border"
                  )}
                >
                  <img src={opt.image} alt={opt.label} className="w-full h-full object-cover" loading="lazy" draggable={false} />
                  <div className={cn("absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent", isSelected && "from-primary/30")} />
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
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

// ─── Picker Row ─────────────────────────────────────────────
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
      ) : (
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
          <Plus className="w-3.5 h-3.5 text-muted-foreground" />
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

  // Get gender-matched attribute options
  const attrOptions = useMemo(() => getAttributeOptions(character.gender), [character.gender]);

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

          <Separator />

          {/* Attribute rows */}
          <div className="space-y-2">
            {attributeCategories.map(cat => (
              <AttributeRow
                key={cat.key}
                label={cat.label}
                value={character[cat.key] as string}
                options={attrOptions[cat.key]}
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
                <p className="text-xs text-muted-foreground text-center">Generate portrait options</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Appears in storyboard */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Film className="w-4 h-4 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">Appears in</h3>
                <p className="text-[11px] text-muted-foreground">Storyboard frames featuring this character</p>
              </div>
            </div>

            {(() => {
              const appearances = characterAppearances[character.id] || [];
              if (appearances.length === 0) {
                return (
                  <div className="rounded-lg border-2 border-dashed border-border bg-card/30 p-4 flex flex-col items-center gap-1.5">
                    <Film className="w-5 h-5 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground text-center">Not in any storyboard frames yet</p>
                  </div>
                );
              }
              return (
                <div className="space-y-2">
                  {appearances.map(app => (
                    <div
                      key={app.frameId}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card p-2 hover:border-muted-foreground/40 transition-colors"
                    >
                      <img
                        src={app.thumbnail}
                        alt={app.scene}
                        className="w-14 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-primary">{app.scene}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{app.shot}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{app.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
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
          options={attrOptions[pickerOpen]}
          selected={character[pickerOpen] as string}
          onSelect={(v) => onChange({ ...character, [pickerOpen]: v })}
        />
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && character.generatedPortraits.length > 0 && (
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
            <img src={character.generatedPortraits[lightboxIndex].src} alt="" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
            <div className="flex items-center justify-between mt-4 px-2">
              <p className="text-sm text-white/70">{character.generatedPortraits[lightboxIndex].description}</p>
              <Button size="sm" onClick={() => { selectPortrait(character.generatedPortraits[lightboxIndex!]); setLightboxIndex(null); }} className="gap-1.5">
                <Check className="w-3.5 h-3.5" /> Use This
              </Button>
            </div>
          </div>
          {lightboxIndex < character.generatedPortraits.length - 1 && (
            <button className="absolute right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}>
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
      id: `char-${Date.now()}`, name: "New Character", role: "Supporting", description: "", portrait: "",
      gender: "", ageRange: "", ethnicity: "", bodyType: "", height: "", hairColor: "", hairStyle: "",
      eyeColor: "", skinTone: "", clothing: "", distinguishingFeatures: "",
      generatedPortraits: [], selectedPortraitId: null,
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
            <Plus className="w-4 h-4" /> Add Character
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
                selectedCharacterId === char.id ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/50"
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
