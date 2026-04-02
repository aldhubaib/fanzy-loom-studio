import { memo, useState } from "react";
import { createPortal } from "react-dom";
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
  const [selectedPreview, setSelectedPreview] = useState(0);
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

      {/* Full-screen Image Gallery Modal - rendered via portal to escape canvas transform */}
      {galleryOpen && typeof document !== "undefined" && document.body && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex"
          onClick={() => setGalleryOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setGalleryOpen(false)}
            className="absolute top-4 left-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-background/20 hover:bg-background/40 text-foreground/70 hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 right-4 z-10 bg-background/20 backdrop-blur-sm text-foreground text-sm font-medium px-3 py-1.5 rounded-full">
            {(selectedPreview ?? 0) + 1} / {imageCount}
          </div>

          {/* Main preview area */}
          <div
            className="flex-1 flex items-center justify-center p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {frame.generatedImages && frame.generatedImages[selectedPreview ?? 0] && (
              <img
                src={frame.generatedImages[selectedPreview ?? 0]}
                alt={`Generated ${(selectedPreview ?? 0) + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
                draggable={false}
              />
            )}
          </div>

          {/* Right-side thumbnail strip */}
          <div
            className="w-20 flex flex-col gap-2 p-3 overflow-y-auto bg-background/10"
            onClick={(e) => e.stopPropagation()}
          >
            {frame.generatedImages?.map((img, i) => {
              const isViewing = i === (selectedPreview ?? 0);
              const isActive = img === frame.image;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedPreview(i)}
                  onDoubleClick={() => {
                    onSelectImage?.(frame.id, img);
                    setGalleryOpen(false);
                  }}
                  className={cn(
                    "relative rounded-lg overflow-hidden border-2 transition-all aspect-[3/4] flex-shrink-0",
                    isViewing
                      ? "border-primary shadow-lg shadow-primary/30"
                      : "border-transparent hover:border-primary/40 opacity-60 hover:opacity-100",
                  )}
                >
                  <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" draggable={false} />
                  {isActive && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom bar */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                const img = frame.generatedImages?.[selectedPreview ?? 0];
                if (img) {
                  onSelectImage?.(frame.id, img);
                  setGalleryOpen(false);
                }
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-4 py-2 rounded-full transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Use this image
            </button>
          </div>
        </div>
      , document.body)}
    </>
  );
});
