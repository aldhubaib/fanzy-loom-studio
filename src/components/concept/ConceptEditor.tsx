import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Sparkles, Dices, ArrowRight, X, Plus, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

// Genre images
import genreNoir from "@/assets/genres/noir.jpg";
import genreScifi from "@/assets/genres/scifi.jpg";
import genreDrama from "@/assets/genres/drama.jpg";
import genreHorror from "@/assets/genres/horror.jpg";
import genreComedy from "@/assets/genres/comedy.jpg";
import genreAction from "@/assets/genres/action.jpg";
import genreFantasy from "@/assets/genres/fantasy.jpg";
import genreThriller from "@/assets/genres/thriller.jpg";
import genreWestern from "@/assets/genres/western.jpg";
import genreCyberpunk from "@/assets/genres/cyberpunk.jpg";
import genreDocumentary from "@/assets/genres/documentary.jpg";
import genreAnimation from "@/assets/genres/animation.jpg";

// Tone images
import toneDark from "@/assets/tones/dark.jpg";
import toneLight from "@/assets/tones/light.jpg";
import toneTense from "@/assets/tones/tense.jpg";
import toneEmotional from "@/assets/tones/emotional.jpg";
import toneFunny from "@/assets/tones/funny.jpg";
import toneEpic from "@/assets/tones/epic.jpg";
import toneIntimate from "@/assets/tones/intimate.jpg";
import toneSurreal from "@/assets/tones/surreal.jpg";

const genres = [
  { label: "Noir", img: genreNoir },
  { label: "Sci-Fi", img: genreScifi },
  { label: "Drama", img: genreDrama },
  { label: "Horror", img: genreHorror },
  { label: "Comedy", img: genreComedy },
  { label: "Action", img: genreAction },
  { label: "Fantasy", img: genreFantasy },
  { label: "Thriller", img: genreThriller },
  { label: "Western", img: genreWestern },
  { label: "Cyberpunk", img: genreCyberpunk },
  { label: "Documentary", img: genreDocumentary },
  { label: "Animation", img: genreAnimation },
];

const tones = [
  { label: "Dark", img: toneDark },
  { label: "Light", img: toneLight },
  { label: "Tense", img: toneTense },
  { label: "Emotional", img: toneEmotional },
  { label: "Funny", img: toneFunny },
  { label: "Epic", img: toneEpic },
  { label: "Intimate", img: toneIntimate },
  { label: "Surreal", img: toneSurreal },
];

const durations = [
  { label: "Short", detail: "~5 min", emoji: "⚡" },
  { label: "Medium", detail: "~15 min", emoji: "🎬" },
  { label: "Feature", detail: "~45 min", emoji: "🎥" },
];

const pipelineSteps = ["Concept", "Script", "Storyboard", "Casting", "Locations", "Generation", "Timeline", "Export"];

const mockConcept = {
  title: "The Last Deal",
  idea: "A private detective in a rain-soaked city takes a missing person case from a mysterious woman. The case is not what it seems.",
  genre: "Noir",
  tone: "Dark",
  duration: "Short",
  logline: "A world-weary detective takes on a missing person case that unravels into a web of betrayal, stolen money, and a client who isn't what she seems.",
  synopsis: `Detective Marlowe hasn't taken a real case in months. When Vivian Cross walks into his office asking him to find her missing husband — and the $200,000 he took — Marlowe reluctantly agrees.

But as he digs deeper, he discovers Vivian's story doesn't add up. A meeting with local fixer Eddie Rossi reveals the money was never stolen — it was payment. And Vivian is at the center of it all.

Now Marlowe must decide: walk away from the case or confront the woman who hired him — knowing the truth could get him killed.`,
  themes: ["Betrayal", "Trust", "Greed", "Moral Ambiguity"],
  visualStyle: "Neo-noir. Rain-soaked streets, hard shadows, amber lamplight. Muted palette with occasional splashes of red and neon.",
  estimatedCast: "4-5 characters",
  estimatedScenes: "8-12 scenes",
};

interface ConceptEditorProps {
  projectId?: string;
  isNewProject?: boolean;
}

// Visual card for modal grid
function VisualCard({ label, img, selected, onClick }: { label: string; img: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative group rounded-xl overflow-hidden transition-all duration-200",
        "aspect-[4/3]",
        selected
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.03]"
          : "hover:scale-[1.03] hover:ring-1 hover:ring-border"
      )}
    >
      <img src={img} alt={label} loading="lazy" className="w-full h-full object-cover" />
      <div className={cn("absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent", selected && "from-primary/30 via-transparent")} />
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8 3" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
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

// Picker trigger button
function PickerButton({ label, value, selectedImg, onClick }: { label: string; value: string; selectedImg?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all",
        value
          ? "bg-card border-primary/30 text-foreground"
          : "bg-card border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
      )}
    >
      {selectedImg && (
        <img src={selectedImg} alt={value} className="w-7 h-7 rounded-md object-cover" />
      )}
      {!selectedImg && !value && (
        <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center">
          <Plus className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      )}
      <div className="text-left">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none mb-0.5">{label}</p>
        <p className="text-sm font-medium">{value || "Choose..."}</p>
      </div>
      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
    </button>
  );
}

export function ConceptEditor({ projectId, isNewProject }: ConceptEditorProps) {
  const navigate = useNavigate();
  const isMockProject = projectId === "1";

  const [title, setTitle] = useState(isMockProject ? mockConcept.title : "");
  const [idea, setIdea] = useState(isMockProject ? mockConcept.idea : "");
  const [genre, setGenre] = useState(isMockProject ? mockConcept.genre : "");
  const [tone, setTone] = useState(isMockProject ? mockConcept.tone : "");
  const [duration, setDuration] = useState(isMockProject ? mockConcept.duration : "");
  const [conceptGenerated, setConceptGenerated] = useState(isMockProject);

  const [logline, setLogline] = useState(isMockProject ? mockConcept.logline : "");
  const [synopsis, setSynopsis] = useState(isMockProject ? mockConcept.synopsis : "");
  const [themes, setThemes] = useState<string[]>(isMockProject ? mockConcept.themes : []);
  const [newTheme, setNewTheme] = useState("");
  const [visualStyle, setVisualStyle] = useState(isMockProject ? mockConcept.visualStyle : "");

  const handleGenerate = () => {
    if (!title) setTitle("Untitled Film");
    setConceptGenerated(true);
    if (!logline) setLogline("A compelling story unfolds in unexpected ways...");
    if (!synopsis) setSynopsis("Your AI-generated synopsis will appear here after generation.");
    if (themes.length === 0) setThemes(["Theme 1", "Theme 2"]);
    if (!visualStyle) setVisualStyle("A cinematic visual approach.");
  };

  const handleSurpriseMe = () => {
    setTitle("Echoes of Tomorrow");
    setIdea("In a crumbling space station orbiting a dying star, a lone engineer discovers a message from the future — one that was sent by herself.");
    setGenre("Sci-Fi");
    setTone("Tense");
    setDuration("Medium");
    setConceptGenerated(true);
    setLogline("A lone engineer on a decaying space station receives a distress signal from the future — sent by a version of herself she doesn't remember becoming.");
    setSynopsis("The Meridian Station has been in decay for years, its crew long evacuated. Only Chief Engineer Sable remains, running maintenance on systems that nobody will ever use again.\n\nWhen a corrupted transmission breaks through on a dead frequency, Sable traces it to an impossible source: her own biometric signature, timestamped three years in the future. The message contains coordinates — and a warning.");
    setThemes(["Identity", "Time", "Isolation", "Hope"]);
    setVisualStyle("Cold blues and clinical whites of a deteriorating space station. Flickering holographic displays. Moments of warm golden light breaking through viewport cracks.");
  };

  const addTheme = () => {
    if (newTheme.trim() && !themes.includes(newTheme.trim())) {
      setThemes([...themes, newTheme.trim()]);
      setNewTheme("");
    }
  };

  const removeTheme = (t: string) => setThemes(themes.filter((th) => th !== t));

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Film"
            className="w-full bg-transparent text-3xl font-bold text-foreground placeholder:text-muted-foreground/40 outline-none mb-4 tracking-tight"
          />

          {/* Idea textarea */}
          <div className="rounded-lg bg-card border border-border p-1">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Describe your film idea... What's the story about? What's the world? What's the conflict?"
              rows={4}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none p-3 leading-relaxed"
            />
          </div>

          {/* Visual selectors */}
          <div className="mt-8 space-y-6">
            {/* Genre */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Genre</label>
              <div className="flex flex-wrap gap-2.5">
                {genres.map((g) => (
                  <VisualCard
                    key={g.label}
                    label={g.label}
                    img={g.img}
                    selected={genre === g.label}
                    onClick={() => setGenre(genre === g.label ? "" : g.label)}
                  />
                ))}
              </div>
            </div>

            {/* Tone */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Tone</label>
              <div className="flex flex-wrap gap-2.5">
                {tones.map((t) => (
                  <VisualCard
                    key={t.label}
                    label={t.label}
                    img={t.img}
                    selected={tone === t.label}
                    onClick={() => setTone(tone === t.label ? "" : t.label)}
                  />
                ))}
              </div>
            </div>

            {/* Duration — kept as styled cards without images */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Duration</label>
              <div className="flex flex-wrap gap-3">
                {durations.map((d) => (
                  <button
                    key={d.label}
                    onClick={() => setDuration(duration === d.label ? "" : d.label)}
                    className={cn(
                      "flex items-center gap-3 px-5 py-3 rounded-xl border transition-all duration-200",
                      duration === d.label
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                    )}
                  >
                    <span className="text-xl">{d.emoji}</span>
                    <div className="text-left">
                      <p className="text-sm font-semibold">{d.label}</p>
                      <p className="text-[11px] opacity-70">{d.detail}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-8">
            <Button
              onClick={handleGenerate}
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 px-6"
            >
              <Sparkles className="w-4 h-4" />
              Generate Concept
            </Button>
            <Button
              onClick={handleSurpriseMe}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-2 px-6"
            >
              <Dices className="w-4 h-4" />
              Surprise Me
            </Button>
          </div>
        </motion.div>

        {/* Generated Concept */}
        {conceptGenerated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-12 space-y-8 border-t border-border pt-10"
          >
            {/* Logline */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Logline</label>
              <textarea
                value={logline}
                onChange={(e) => setLogline(e.target.value)}
                rows={2}
                className="w-full bg-card border border-border rounded-lg p-4 text-foreground text-base leading-relaxed outline-none resize-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Synopsis */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Synopsis</label>
              <textarea
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                rows={8}
                className="w-full bg-card border border-border rounded-lg p-4 text-foreground text-sm leading-relaxed outline-none resize-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Key Themes */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Key Themes</label>
              <div className="flex flex-wrap gap-2 items-center">
                {themes.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/15 text-primary text-xs font-medium"
                  >
                    {t}
                    <button onClick={() => removeTheme(t)} className="hover:text-primary-foreground transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-1">
                  <input
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTheme()}
                    placeholder="Add theme..."
                    className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 outline-none w-24"
                  />
                  <button onClick={addTheme} className="text-muted-foreground hover:text-primary transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Visual Style */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Visual Style</label>
              <textarea
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value)}
                rows={2}
                className="w-full bg-card border border-border rounded-lg p-4 text-foreground text-sm leading-relaxed outline-none resize-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Estimates */}
            <div className="flex gap-6">
              <div className="flex-1 rounded-lg bg-secondary/50 border border-border p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Estimated Cast</p>
                <p className="text-lg font-semibold text-foreground">{isMockProject ? mockConcept.estimatedCast : "3-4 characters"}</p>
              </div>
              <div className="flex-1 rounded-lg bg-secondary/50 border border-border p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Estimated Scenes</p>
                <p className="text-lg font-semibold text-foreground">{isMockProject ? mockConcept.estimatedScenes : "5-8 scenes"}</p>
              </div>
            </div>

            {/* Progress breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
              {pipelineSteps.map((step, i) => (
                <span key={step} className="flex items-center gap-2">
                  {i > 0 && <span>→</span>}
                  <span className={cn(i === 0 ? "text-primary font-semibold" : "")}>
                    {i === 0 ? "Concept ✓" : step}
                  </span>
                </span>
              ))}
            </div>

            {/* Continue button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={() => navigate(`/project/${projectId}/script`)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8 h-12 text-base font-semibold"
              >
                Continue to Script
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}