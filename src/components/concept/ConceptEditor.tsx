import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dices, ArrowRight, Plus, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { genres, tones, settings, durations, audiences, formats } from "@/data/conceptOptions";

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
function PickerButton({ label, value, selectedImg, emoji, onClick }: { label: string; value: string; selectedImg?: string; emoji?: string; onClick: () => void }) {
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
      {emoji && !selectedImg && (
        <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center text-sm">
          {emoji}
        </div>
      )}
      {!selectedImg && !emoji && !value && (
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

// Reusable image grid picker dialog
function ImagePickerDialog({
  open, onOpenChange, title: dialogTitle, items, selected, onSelect, cols = 4,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; title: string;
  items: { label: string; img: string }[]; selected: string; onSelect: (v: string) => void; cols?: number;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card border-border">
        <DialogHeader><DialogTitle>{dialogTitle}</DialogTitle></DialogHeader>
        <div className={cn("grid gap-3 mt-4", cols === 6 ? "grid-cols-4 sm:grid-cols-6" : "grid-cols-3 sm:grid-cols-4")}>
          {items.map((item) => (
            <div key={item.label}>
              <VisualCard label={item.label} img={item.img} selected={selected === item.label} onClick={() => { onSelect(selected === item.label ? "" : item.label); onOpenChange(false); }} />
              <VisualCardLabel label={item.label} selected={selected === item.label} />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Reusable list picker dialog (for duration, audience, format)
function ListPickerDialog({
  open, onOpenChange, title: dialogTitle, items, selected, onSelect,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; title: string;
  items: { label: string; detail: string; emoji: string }[]; selected: string; onSelect: (v: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader><DialogTitle>{dialogTitle}</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          {items.map((d) => (
            <button
              key={d.label}
              onClick={() => { onSelect(selected === d.label ? "" : d.label); onOpenChange(false); }}
              className={cn(
                "flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-200",
                selected === d.label
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-secondary/30 border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              )}
            >
              <span className="text-2xl">{d.emoji}</span>
              <div className="text-left">
                <p className="text-base font-semibold">{d.label}</p>
                <p className="text-xs opacity-70">{d.detail}</p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const mockConcept = {
  title: "The Last Deal",
  idea: "A private detective in a rain-soaked city takes a missing person case from a mysterious woman. The case is not what it seems.",
  genre: "Noir",
  tone: "Dark",
  duration: "Short",
  setting: "Modern City",
  audience: "Mature",
  format: "Film",
};

export function ConceptEditor({ projectId, isNewProject }: ConceptEditorProps) {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [idea, setIdea] = useState("");
  const [genre, setGenre] = useState("");
  const [tone, setTone] = useState("");
  const [duration, setDuration] = useState("");
  const [setting, setSetting] = useState("");
  const [audience, setAudience] = useState("");
  const [format, setFormat] = useState("");
  

  const [genreOpen, setGenreOpen] = useState(false);
  const [toneOpen, setToneOpen] = useState(false);
  const [durationOpen, setDurationOpen] = useState(false);
  const [settingOpen, setSettingOpen] = useState(false);
  const [audienceOpen, setAudienceOpen] = useState(false);
  const [formatOpen, setFormatOpen] = useState(false);

  const handleSurpriseMe = () => {
    setTitle("Echoes of Tomorrow");
    setIdea("In a crumbling space station orbiting a dying star, a lone engineer discovers a message from the future — one that was sent by herself.");
    setGenre("Sci-Fi");
    setTone("Tense");
    setDuration("Medium");
    setSetting("Space");
    setAudience("General");
    setFormat("Film");
  };

  const selectedAudience = audiences.find(a => a.label === audience);
  const selectedFormat = formats.find(f => f.label === format);

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

          {/* Idea textarea — auto-grows */}
          <div className="rounded-lg bg-card border border-border p-1">
            <textarea
              ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
              value={idea}
              onChange={(e) => { setIdea(e.target.value); const t = e.target; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }}
              placeholder="Describe your film idea... What's the story about? What's the world? What's the conflict?"
              rows={2}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none p-3 leading-relaxed min-h-[3.5rem]"
            />
          </div>

          {/* Surprise Me */}
          <div className="mt-4">
            <Button
              onClick={handleSurpriseMe}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <Dices className="w-3.5 h-3.5" />
              Surprise Me
            </Button>
          </div>

          {/* Compact picker buttons */}
          <div className="mt-4 flex flex-wrap gap-3">
            <PickerButton label="Genre" value={genre} selectedImg={genres.find(g => g.label === genre)?.img} onClick={() => setGenreOpen(true)} />
            <PickerButton label="Tone" value={tone} selectedImg={tones.find(t => t.label === tone)?.img} onClick={() => setToneOpen(true)} />
            <PickerButton label="Setting" value={setting} selectedImg={settings.find(s => s.label === setting)?.img} onClick={() => setSettingOpen(true)} />
            <PickerButton label="Duration" value={duration ? `${duration} (${durations.find(d => d.label === duration)?.detail})` : ""} onClick={() => setDurationOpen(true)} />
            <PickerButton label="Audience" value={audience} emoji={selectedAudience?.emoji} onClick={() => setAudienceOpen(true)} />
            <PickerButton label="Format" value={format} emoji={selectedFormat?.emoji} onClick={() => setFormatOpen(true)} />
          </div>

          {/* Dialogs */}
          <ImagePickerDialog open={genreOpen} onOpenChange={setGenreOpen} title="Choose a Genre" items={genres} selected={genre} onSelect={setGenre} cols={6} />
          <ImagePickerDialog open={toneOpen} onOpenChange={setToneOpen} title="Choose a Tone" items={tones} selected={tone} onSelect={setTone} />
          <ImagePickerDialog open={settingOpen} onOpenChange={setSettingOpen} title="Choose a Setting" items={settings} selected={setting} onSelect={setSetting} />
          <ListPickerDialog open={durationOpen} onOpenChange={setDurationOpen} title="Choose Duration" items={durations} selected={duration} onSelect={setDuration} />
          <ListPickerDialog open={audienceOpen} onOpenChange={setAudienceOpen} title="Choose Audience" items={audiences} selected={audience} onSelect={setAudience} />
          <ListPickerDialog open={formatOpen} onOpenChange={setFormatOpen} title="Choose Format" items={formats} selected={format} onSelect={setFormat} />

          {/* Continue button */}
          <div className="flex items-center mt-8">
            <Button
              onClick={() => navigate(`/project/${projectId}/script`)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-6 h-11 text-base font-semibold"
            >
              Continue to Script
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
