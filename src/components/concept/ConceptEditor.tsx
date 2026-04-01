import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Sparkles, Dices, ArrowRight, X, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const genres = [
  "Noir", "Sci-Fi", "Drama", "Horror", "Comedy",
  "Action", "Fantasy", "Thriller", "Western", "Cyberpunk",
  "Documentary", "Animation",
];
const tones = ["Dark", "Light", "Tense", "Emotional", "Funny", "Epic", "Intimate", "Surreal"];
const durations = [
  { label: "Short", detail: "~5 min" },
  { label: "Medium", detail: "~15 min" },
  { label: "Feature", detail: "~45 min" },
];

const pipelineSteps = ["Concept", "Script", "Storyboard", "Casting", "Locations", "Generation", "Timeline", "Export"];

// Mock data for The Last Deal
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
    // Mock: fill with sample data
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
        {/* Top Section — Film Concept */}
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
          <div className="rounded-lg bg-[hsl(240,5%,11%)] border border-border p-1">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Describe your film idea... What's the story about? What's the world? What's the conflict?"
              rows={4}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none p-3 leading-relaxed"
            />
          </div>

          {/* Pills */}
          <div className="mt-6 space-y-4">
            {/* Genre */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Genre</label>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGenre(genre === g ? "" : g)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                      genre === g
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Tone</label>
              <div className="flex flex-wrap gap-2">
                {tones.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(tone === t ? "" : t)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                      tone === t
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Duration</label>
              <div className="flex flex-wrap gap-2">
                {durations.map((d) => (
                  <button
                    key={d.label}
                    onClick={() => setDuration(duration === d.label ? "" : d.label)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                      duration === d.label
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                    )}
                  >
                    {d.label} <span className="opacity-60">({d.detail})</span>
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
                className="w-full bg-[hsl(240,5%,11%)] border border-border rounded-lg p-4 text-foreground text-base leading-relaxed outline-none resize-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Synopsis */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Synopsis</label>
              <textarea
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                rows={8}
                className="w-full bg-[hsl(240,5%,11%)] border border-border rounded-lg p-4 text-foreground text-sm leading-relaxed outline-none resize-none focus:ring-1 focus:ring-primary"
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
                className="w-full bg-[hsl(240,5%,11%)] border border-border rounded-lg p-4 text-foreground text-sm leading-relaxed outline-none resize-none focus:ring-1 focus:ring-primary"
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
                  <span className={cn(
                    i === 0 ? "text-primary font-semibold" : ""
                  )}>
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
