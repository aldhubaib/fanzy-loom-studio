import { memo, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Settings, Images, X, Check, Play, Film, Zap, CheckCircle, Loader2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import type { Actor, FrameData, ShotStatus } from "../types";
import { FRAME_W, locationImages } from "../constants";

function parseAspectRatio(ratio: string): number {
  const [w, h] = ratio.split(":").map(Number);
  return (w && h) ? w / h : 16 / 9;
}

function getStatusConfig(status: ShotStatus) {
  switch (status) {
    case "empty":
      return { label: "DRAFT", color: "bg-muted-foreground/60 text-foreground", borderClass: "border-border", icon: null };
    case "generating":
      return { label: "GENERATING", color: "bg-amber-500/80 text-white", borderClass: "border-amber-500/50", icon: Loader2 };
    case "preview":
      return { label: "DRAFT", color: "bg-muted-foreground/60 text-foreground", borderClass: "border-amber-500/40", icon: null };
    case "approved":
      return { label: "APPROVED", color: "bg-emerald-500/80 text-white", borderClass: "border-emerald-500/50", icon: CheckCircle };
    case "animating":
      return { label: "ANIMATING", color: "bg-amber-500/80 text-white", borderClass: "border-amber-500/50", icon: Loader2 };
    case "video_ready":
      return { label: "VIDEO", color: "bg-primary/80 text-primary-foreground", borderClass: "border-primary/50", icon: Play };
  }
}

interface ShotFrameNodeProps {
  frame: FrameData;
  index: number;
  actors: Actor[];
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onSettingsClick: () => void;
  onSelectImage?: (frameId: string, image: string) => void;
  onAnimate?: (frameId: string) => void;
  aspectRatio?: string;
}

export const ShotFrameNode = memo(function ShotFrameNode({
  frame, index, actors, isSelected, onMouseDown, onSettingsClick, onSelectImage, onAnimate, aspectRatio = "16:9",
}: ShotFrameNodeProps) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState(0);
  const [locationLightbox, setLocationLightbox] = useState(false);
  const [videoLightbox, setVideoLightbox] = useState(false);
  const imageCount = frame.generatedImages?.length ?? 0;
  const imageH = Math.round(FRAME_W / parseAspectRatio(aspectRatio));

  const status: ShotStatus = frame.shotStatus || (frame.image ? "preview" : "empty");
  const config = getStatusConfig(status);
  const StatusIcon = config.icon;

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status === "video_ready") {
      setVideoLightbox(true);
    }
  };

  return (
    <>
      <div
        data-node
        className={cn(
          "absolute rounded-xl border-2 bg-card select-none group transition-shadow cursor-grab active:cursor-grabbing",
          isSelected
            ? "border-primary shadow-lg shadow-primary/20"
            : config.borderClass,
        )}
        style={{ left: frame.x, top: frame.y, width: FRAME_W }}
        onMouseDown={onMouseDown}
      >
        {/* Status badge — top left */}
        <div className="absolute top-2 left-2 z-10">
          <div className={cn("flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md", config.color)}>
            {StatusIcon && <StatusIcon className={cn("w-2.5 h-2.5", status === "generating" || status === "animating" ? "animate-spin" : "")} />}
            {config.label}
          </div>
        </div>

        {/* Top right controls */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
          <button
            className="bg-background/70 backdrop-blur-sm text-foreground/70 hover:text-foreground hover:bg-background/90 w-5 h-5 flex items-center justify-center rounded-md transition-colors"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onSettingsClick(); }}
            aria-label="Open shot settings"
          >
            <Settings className="w-3 h-3" />
          </button>
        </div>

        {/* Image area */}
        <div className="w-full bg-secondary overflow-hidden rounded-t-[10px] relative" style={{ height: imageH }}>
          {status === "generating" ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50 gap-2">
              <div className="w-full h-full bg-gradient-to-r from-secondary via-muted/30 to-secondary animate-pulse" />
              <span className="absolute text-[10px] font-medium text-muted-foreground">Generating...</span>
            </div>
          ) : frame.image ? (
            <div className="relative w-full h-full" onMouseDown={(e) => e.stopPropagation()} onClick={handleImageClick}>
              <img src={frame.image} alt={frame.description} className="w-full h-full object-cover" draggable={false} />
              {/* Video play overlay */}
              {status === "video_ready" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                  </div>
                </div>
              )}
              {/* Animating overlay */}
              {status === "animating" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                  <Film className="w-8 h-8 text-amber-400 animate-pulse" />
                  <span className="text-[10px] font-medium text-white mt-1">Animating...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
              <Plus className="w-8 h-8" />
            </div>
          )}

          {/* Animation progress bar */}
          {status === "animating" && frame.animationProgress != null && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
              <div
                className="h-full bg-amber-400 transition-all duration-300 ease-linear"
                style={{ width: `${frame.animationProgress}%` }}
              />
            </div>
          )}

          {/* Image count badge */}
          {imageCount > 0 && status !== "animating" && status !== "generating" && (
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

        {/* Animate button for approved shots */}
        {status === "approved" && onAnimate && (
          <div className="absolute top-2 right-2 z-10" onMouseDown={(e) => e.stopPropagation()}>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => { e.stopPropagation(); onAnimate(frame.id); }}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors shadow-md"
                  >
                    <Zap className="w-3 h-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="text-xs">Animate</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        <div className="p-2.5 space-y-1 rounded-b-[10px]" onMouseDown={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-primary">{frame.scene}</span>
            <span className="text-[10px] font-medium text-muted-foreground">{status === "video_ready" && frame.videoDuration ? `▶ ${frame.videoDuration}` : frame.shot}</span>
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
            {(() => {
              const locs = Array.isArray(frame.location) ? frame.location : (frame.location ? [frame.location] : []);
              const validLocs = locs.filter(l => locationImages[l]);
              if (validLocs.length === 0) return null;
              const shown = validLocs.slice(0, 2);
              const extra = validLocs.length - 2;
              return (
                <div className="ml-auto flex items-center gap-0.5">
                  {shown.map((loc, i) => (
                    <button
                      key={loc + i}
                      className="w-8 h-5 rounded overflow-hidden border border-border hover:border-primary/40 transition-colors"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => { e.stopPropagation(); setLocationLightbox(true); }}
                    >
                      <img src={locationImages[loc]} alt={loc} className="w-full h-full object-cover" draggable={false} />
                    </button>
                  ))}
                  {extra > 0 && (
                    <span className="text-[8px] font-bold text-muted-foreground ml-0.5">+{extra}</span>
                  )}
                </div>
              );
            })()}
          </div>
          <p className="text-[10px] text-foreground/70 leading-tight line-clamp-2">{frame.description}</p>
        </div>
      </div>

      {/* Full-screen Image Gallery Modal */}
      {galleryOpen && typeof document !== "undefined" && document.body && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex"
          onClick={() => setGalleryOpen(false)}
        >
          <button
            onClick={() => setGalleryOpen(false)}
            className="absolute top-4 left-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-background/20 hover:bg-background/40 text-foreground/70 hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

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

          <div
            className="w-40 flex flex-col gap-2 p-3 overflow-y-auto bg-background/10"
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
                    "relative overflow-hidden border-2 transition-all aspect-video flex-shrink-0",
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

      {/* Video Preview Lightbox */}
      {videoLightbox && status === "video_ready" && typeof document !== "undefined" && document.body && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center"
          onClick={() => setVideoLightbox(false)}
        >
          <button
            onClick={() => setVideoLightbox(false)}
            className="absolute top-4 left-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-background/20 hover:bg-background/40 text-foreground/70 hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center gap-6 max-w-3xl w-full px-8" onClick={(e) => e.stopPropagation()}>
            {/* Video area with poster frame */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border/30">
              <img src={frame.image} alt={frame.description} className="w-full h-full object-cover" draggable={false} />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <button className="w-16 h-16 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center shadow-2xl transition-colors">
                  <Play className="w-8 h-8 text-primary-foreground ml-1" />
                </button>
              </div>
              {/* Duration badge */}
              <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                <Film className="w-3 h-3" />
                {frame.videoDuration || frame.duration}
              </div>
            </div>

            {/* Metadata */}
            <div className="w-full space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-bold text-primary">{frame.scene}</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md font-medium">{frame.shot}</span>
                <span className="text-xs text-muted-foreground">{frame.videoDuration || frame.duration}</span>
                <div className="flex items-center gap-1 ml-auto">
                  {frame.actors.map((aid) => {
                    const a = actors.find((ac) => ac.id === aid);
                    if (!a) return null;
                    return (
                      <div key={a.id} className="flex items-center gap-1.5 bg-background/20 px-2 py-0.5 rounded-full">
                        <div className="w-4 h-4 rounded-full overflow-hidden">
                          <img src={a.portrait} alt={a.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] text-foreground/70">{a.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
                {frame.location && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Eye className="w-3 h-3" />
                  {Array.isArray(frame.location) ? frame.location.join(", ") : frame.location}
                </div>
              )}
              <p className="text-sm text-foreground/60">{frame.description}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Approve
              </button>
              <button className="bg-background/20 hover:bg-background/30 text-foreground text-xs font-semibold px-4 py-2 rounded-full transition-colors flex items-center gap-1.5 border border-border/30">
                <Zap className="w-3.5 h-3.5" />
                Re-animate
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* Location image lightbox */}
      {locationLightbox && frame.location && typeof document !== "undefined" && document.body && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center"
          onClick={() => setLocationLightbox(false)}
        >
          <button
            onClick={() => setLocationLightbox(false)}
            className="absolute top-4 left-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-background/20 hover:bg-background/40 text-foreground/70 hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="p-8 flex gap-6 flex-wrap justify-center" onClick={(e) => e.stopPropagation()}>
            {(Array.isArray(frame.location) ? frame.location : [frame.location]).filter(l => locationImages[l]).map((loc, i) => (
              <div key={loc + i} className="text-center">
                <img
                  src={locationImages[loc]}
                  alt={loc}
                  className="max-w-[300px] max-h-[60vh] object-contain rounded-lg"
                  draggable={false}
                />
                <p className="text-sm text-foreground/70 mt-2">{loc}</p>
              </div>
            ))}
          </div>
        </div>
      , document.body)}
    </>
  );
});
