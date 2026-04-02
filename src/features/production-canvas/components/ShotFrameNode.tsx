import { memo, useState } from "react";
import { Plus, Settings, Images, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import type { Actor, FrameData } from "../types";
import { FRAME_W, IMAGE_H, locationImages } from "../constants";

interface ShotFrameNodeProps {
  frame: FrameData;
  index: number;
  actors: Actor[];
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onSettingsClick: () => void;
  onSelectImage?: (frameId: string, image: string) => void;
}

export const ShotFrameNode = memo(function ShotFrameNode({
  frame, index, actors, isSelected, onMouseDown, onSettingsClick, onSelectImage,
}: ShotFrameNodeProps) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const imageCount = frame.generatedImages?.length ?? 0;

  return (
    <>
      <div
        data-node
        className={cn(
          "absolute rounded-xl border-2 bg-card select-none group transition-shadow cursor-grab active:cursor-grabbing",
          isSelected
            ? "border-primary shadow-lg shadow-primary/20"
            : "border-border hover:border-primary/40",
        )}
        style={{ left: frame.x, top: frame.y, width: FRAME_W }}
        onMouseDown={onMouseDown}
      >
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
          <button
            className="bg-background/70 backdrop-blur-sm text-foreground/70 hover:text-foreground hover:bg-background/90 w-5 h-5 flex items-center justify-center rounded-md transition-colors"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onSettingsClick(); }}
            aria-label="Open shot settings"
          >
            <Settings className="w-3 h-3" />
          </button>
          <div className="bg-primary/90 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            {frame.shot}
          </div>
        </div>

        <div className="w-full bg-secondary overflow-hidden rounded-t-[10px] relative" style={{ height: IMAGE_H }}>
          {frame.image ? (
            <img src={frame.image} alt={frame.description} className="w-full h-full object-cover" draggable={false} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
              <Plus className="w-8 h-8" />
            </div>
          )}
          {/* Image count badge */}
          {imageCount > 0 && (
            <button
              className="absolute bottom-2 left-2 z-10 flex items-center gap-1 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md hover:bg-background/95 transition-colors"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setGalleryOpen(true); }}
              aria-label={`${imageCount} generated images`}
            >
              <Images className="w-3 h-3" />
              {imageCount}
            </button>
          )}
        </div>

        <div className="p-2.5 space-y-1 rounded-b-[10px]" onMouseDown={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-primary">{frame.scene}</span>
            <span className="text-[10px] text-muted-foreground">{frame.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider delayDuration={200}>
              {frame.actors.map((aid) => {
                const a = actors.find((ac) => ac.id === aid);
                if (!a) return null;
                return (
                  <Tooltip key={a.id}>
                    <TooltipTrigger asChild>
                      <div className="w-5 h-5 rounded-full overflow-hidden border border-border">
                        <img src={a.portrait} alt={a.name} className="w-full h-full object-cover" draggable={false} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">{a.name}</TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
            {frame.location && locationImages[frame.location] && (
              <div className="ml-auto w-8 h-5 rounded overflow-hidden border border-border">
                <img src={locationImages[frame.location]} alt={frame.location} className="w-full h-full object-cover" draggable={false} />
              </div>
            )}
          </div>
          <p className="text-[10px] text-foreground/70 leading-tight line-clamp-2">{frame.description}</p>
        </div>
      </div>

      {/* Image Gallery Overlay */}
      {galleryOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setGalleryOpen(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl p-4 max-w-lg w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Images className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  {frame.scene} — Generated Images
                </span>
                <span className="text-xs text-muted-foreground">({imageCount})</span>
              </div>
              <button
                onClick={() => setGalleryOpen(false)}
                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {frame.generatedImages?.map((img, i) => {
                const isActive = img === frame.image;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      onSelectImage?.(frame.id, img);
                      setGalleryOpen(false);
                    }}
                    className={cn(
                      "relative rounded-lg overflow-hidden border-2 transition-all aspect-video",
                      isActive
                        ? "border-primary shadow-lg shadow-primary/20"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    <img src={img} alt={`Generated ${i + 1}`} className="w-full h-full object-cover" draggable={false} />
                    {isActive && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <div className="absolute bottom-1.5 left-1.5 bg-background/80 backdrop-blur-sm text-[10px] font-bold px-1.5 py-0.5 rounded text-foreground">
                      {i + 1}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
});
