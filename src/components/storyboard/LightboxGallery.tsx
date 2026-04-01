import { X, ChevronLeft, ChevronRight, Check, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FrameData } from "./types";
import { locationImages } from "./constants";

interface LightboxGalleryProps {
  frame: FrameData;
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onSelectImage: (imgId: string, src: string, desc: string, actors: string[]) => void;
}

export function LightboxGallery({ frame, index, onClose, onNavigate, onSelectImage }: LightboxGalleryProps) {
  const images = frame.generatedImages;
  if (images.length === 0) return null;
  const current = images[index];

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex" onClick={onClose}>
      <div className="flex-1 flex items-center justify-center relative" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-background/20 hover:bg-background/40 text-foreground flex items-center justify-center transition-colors" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
        <div className="absolute top-4 left-4 bg-background/20 text-foreground text-sm font-bold px-3 py-1 rounded-lg">
          {index + 1} / {images.length}
        </div>
        {index > 0 && (
          <button className="absolute left-4 w-10 h-10 rounded-full bg-background/20 hover:bg-background/40 text-foreground flex items-center justify-center transition-colors" onClick={() => onNavigate(index - 1)}>
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <img src={current.src} alt={current.description} className="max-w-[80%] max-h-[85vh] object-contain rounded-lg" />
        {index < images.length - 1 && (
          <button className="absolute right-4 w-10 h-10 rounded-full bg-background/20 hover:bg-background/40 text-foreground flex items-center justify-center transition-colors" onClick={() => onNavigate(index + 1)}>
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/30 backdrop-blur-sm text-foreground text-xs px-4 py-2 rounded-lg max-w-md text-center">
          {current.description}
        </div>
      </div>
      <div className="w-[180px] bg-card/50 backdrop-blur-sm border-l border-border overflow-y-auto p-2 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
        {images.map((img, idx) => (
          <button key={img.id} className={`relative rounded-lg overflow-hidden border-2 transition-all ${idx === index ? "border-primary" : "border-transparent hover:border-muted-foreground/40"}`} onClick={() => onNavigate(idx)}>
            <img src={img.src} alt={img.description} className="w-full aspect-video object-contain bg-secondary" />
            {frame.selectedImageId === img.id && (
              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-primary-foreground" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

interface LocationGalleryProps {
  frame: FrameData;
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onSelectLocation: (name: string | undefined) => void;
}

export function LocationGalleryOverlay({ frame, index, onClose, onNavigate, onSelectLocation }: LocationGalleryProps) {
  const locEntries = Object.entries(locationImages);
  const current = locEntries[index];
  if (!current) return null;
  const isSelected = frame.location === current[0];

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex" onClick={onClose}>
      <div className="flex-1 flex items-center justify-center relative" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-background/20 hover:bg-background/40 text-foreground flex items-center justify-center transition-colors" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
        <div className="absolute top-4 left-4 flex items-center gap-3">
          <span className="bg-background/20 text-foreground text-sm font-bold px-3 py-1 rounded-lg">
            {index + 1} / {locEntries.length}
          </span>
          <span className="bg-background/20 text-foreground/70 text-xs px-3 py-1 rounded-lg flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Locations
          </span>
        </div>
        {index > 0 && (
          <button className="absolute left-4 w-10 h-10 rounded-full bg-background/20 hover:bg-background/40 text-foreground flex items-center justify-center transition-colors" onClick={() => onNavigate(index - 1)}>
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <img src={current[1]} alt={current[0]} className="max-w-[80%] max-h-[85vh] object-contain rounded-lg" />
        {index < locEntries.length - 1 && (
          <button className="absolute right-4 w-10 h-10 rounded-full bg-background/20 hover:bg-background/40 text-foreground flex items-center justify-center transition-colors" onClick={() => onNavigate(index + 1)}>
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <span className="bg-background/30 backdrop-blur-sm text-foreground text-xs px-4 py-2 rounded-lg">{current[0]}</span>
          <button
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-medium transition-all",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-background/30 backdrop-blur-sm text-foreground hover:bg-primary/80 hover:text-primary-foreground"
            )}
            onClick={() => onSelectLocation(isSelected ? undefined : current[0])}
          >
            {isSelected ? "✓ Selected" : "Use Location"}
          </button>
        </div>
      </div>
      <div className="w-[180px] bg-card/50 backdrop-blur-sm border-l border-border overflow-y-auto p-2 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          className={cn("rounded-lg overflow-hidden border-2 transition-all aspect-video flex items-center justify-center bg-secondary/30", !frame.location ? "border-primary" : "border-transparent hover:border-muted-foreground/40")}
          onClick={() => { onSelectLocation(undefined); onClose(); }}
        >
          <X className="w-4 h-4 text-muted-foreground/50" />
        </button>
        {locEntries.map(([name, img], idx) => (
          <button key={name} className={`relative rounded-lg overflow-hidden border-2 transition-all ${idx === index ? "border-primary" : "border-transparent hover:border-muted-foreground/40"}`} onClick={() => onNavigate(idx)}>
            <img src={img} alt={name} className="w-full aspect-video object-cover" />
            {frame.location === name && (
              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-primary-foreground" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
