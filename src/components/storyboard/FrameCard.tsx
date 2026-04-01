import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Plus, Settings, Images, ChevronDown, ChevronUp, Check, Expand, MapPin, X,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import type { FrameData, Actor, Connection } from "./types";
import {
  FRAME_W, IMAGE_H, PORT_Y, locationImages, shotDescriptions,
} from "./constants";

interface FrameCardProps {
  frame: FrameData;
  idx: number;
  sceneNumber: number;
  actorRoster: Actor[];
  connections: Connection[];
  frames: FrameData[];
  selectedFrame: string | null;
  dragging: string | null;
  showLocations: boolean;
  galleryOpen: string | null;
  onMouseDown: (e: React.MouseEvent) => void;
  onPortLeftMouseUp: (e: React.MouseEvent) => void;
  onPortRightMouseDown: (e: React.MouseEvent) => void;
  onSettingsClick: () => void;
  onGalleryToggle: () => void;
  onSelectImage: (imgId: string, src: string, desc: string, actors: string[]) => void;
  onLightboxOpen: (index: number) => void;
  onLocationGalleryOpen: (index: number) => void;
  onDeleteConnection: (from: string, to: string) => void;
  frameRef: (el: HTMLDivElement | null) => void;
}

export function FrameCard({
  frame, idx, sceneNumber, actorRoster, connections, frames,
  selectedFrame, dragging, showLocations, galleryOpen,
  onMouseDown, onPortLeftMouseUp, onPortRightMouseDown,
  onSettingsClick, onGalleryToggle, onSelectImage,
  onLightboxOpen, onLocationGalleryOpen, onDeleteConnection, frameRef,
}: FrameCardProps) {
  const isGalleryOpen = galleryOpen === frame.id;

  const displayImage = showLocations
    ? (frame.location ? locationImages[frame.location] : undefined)
    : frame.image;

  const incoming = connections.filter(c => c.to === frame.id);

  return (
    <div
      data-frame
      ref={frameRef}
      className={cn(
        "absolute rounded-xl border-2 bg-card transition-shadow duration-150 select-none group",
        selectedFrame === frame.id
          ? "border-primary shadow-lg shadow-primary/20"
          : "border-border hover:border-muted-foreground/40",
        dragging === frame.id && "opacity-90",
      )}
      style={{ left: frame.x, top: frame.y, width: FRAME_W }}
      onMouseDown={onMouseDown}
    >
      {/* Ports */}
      <div
        className="absolute -left-[9px] -translate-y-1/2 z-20 w-[18px] h-[18px] rounded-full border-[2.5px] border-primary/60 bg-card hover:bg-primary hover:border-primary hover:scale-110 transition-all cursor-crosshair shadow-md"
        style={{ top: PORT_Y }}
        onMouseUp={onPortLeftMouseUp}
        onMouseDown={(e) => e.stopPropagation()}
      />
      <div
        className="absolute -right-[9px] -translate-y-1/2 z-20 w-[18px] h-[18px] rounded-full border-[2.5px] border-primary/60 bg-card hover:bg-primary hover:border-primary hover:scale-110 transition-all cursor-crosshair shadow-md"
        style={{ top: PORT_Y }}
        onMouseDown={onPortRightMouseDown}
      />

      {/* Frame number badge */}
      <div className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">
        {idx + 1}
      </div>

      {/* Top-right badges */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
        <button
          className="bg-background/70 backdrop-blur-sm text-foreground/70 hover:text-foreground hover:bg-background/90 w-5 h-5 flex items-center justify-center rounded-md transition-colors opacity-0 group-hover:opacity-100"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onSettingsClick(); }}
        >
          <Settings className="w-3 h-3" />
        </button>
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="bg-primary/90 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md hover:bg-primary transition-colors"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              {frame.shot}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3 text-xs" side="top" onMouseDown={(e) => e.stopPropagation()}>
            <p className="font-bold text-sm mb-1">{frame.shot}</p>
            <p className="text-muted-foreground">{shotDescriptions[frame.shot] ?? "A camera shot type used in filmmaking."}</p>
          </PopoverContent>
        </Popover>
      </div>

      {/* Image area */}
      <div className="w-full bg-secondary overflow-hidden rounded-t-[10px] relative" style={{ height: IMAGE_H }}>
        {displayImage ? (
          <img src={displayImage} alt={showLocations ? (frame.location ?? "No location") : frame.description} className="w-full h-full object-cover" draggable={false} loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
            {showLocations ? <MapPin className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
          </div>
        )}
        {frame.generatedImages.length > 0 && (
          <button
            className="absolute bottom-1.5 left-1.5 z-10 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 hover:bg-background/95 transition-colors"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onGalleryToggle(); }}
          >
            <Images className="w-3 h-3" />
            {frame.generatedImages.length}
            {isGalleryOpen ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
          </button>
        )}
      </div>

      {/* Gallery strip */}
      {isGalleryOpen && frame.generatedImages.length > 0 && (
        <GalleryStrip
          frame={frame}
          onSelectImage={onSelectImage}
          onLightboxOpen={onLightboxOpen}
        />
      )}

      {/* Info section */}
      <div className="bg-card p-2.5 space-y-1.5 rounded-b-[10px] flex-1 overflow-hidden" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-primary">SC {sceneNumber}</span>
          <span className="text-[10px] text-muted-foreground">{frame.duration}</span>
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider delayDuration={200}>
            {frame.actors.map(actorId => {
              const actor = actorRoster.find(a => a.id === actorId);
              if (!actor) return null;
              return (
                <Tooltip key={actor.id}>
                  <TooltipTrigger asChild>
                    <div className="w-6 h-6 rounded-full overflow-hidden border-[1.5px] border-border">
                      <img src={actor.avatar} alt={actor.name} className="w-full h-full object-cover" draggable={false} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">{actor.name}</TooltipContent>
                </Tooltip>
              );
            })}
            {frame.location && locationImages[frame.location] ? (
              <button
                className="w-10 h-6 rounded-[2px] overflow-hidden border-[1.5px] border-border ml-auto cursor-pointer hover:ring-1 hover:ring-primary/50 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  const idx = Object.keys(locationImages).indexOf(frame.location!);
                  onLocationGalleryOpen(idx >= 0 ? idx : 0);
                }}
              >
                <img src={locationImages[frame.location]} alt={frame.location} className="w-full h-full object-cover" draggable={false} loading="lazy" />
              </button>
            ) : (
              <button
                className="w-10 h-6 rounded-[2px] overflow-hidden border-[1.5px] border-dashed border-muted-foreground/30 ml-auto flex items-center justify-center bg-muted/20 cursor-pointer hover:border-primary/50 transition-all"
                onClick={(e) => { e.stopPropagation(); onLocationGalleryOpen(0); }}
              >
                <MapPin className="w-3 h-3 text-muted-foreground/40" />
              </button>
            )}
          </TooltipProvider>
        </div>
        <p className="text-[11px] text-foreground/80 leading-tight line-clamp-2">{frame.description}</p>

        {/* Incoming connection thumbnails */}
        {incoming.length > 0 && (
          <div className="flex gap-1.5 pt-1">
            {incoming.map(conn => {
              const srcFrame = frames.find(f => f.id === conn.from);
              if (!srcFrame || !srcFrame.image) return null;
              return (
                <div key={conn.from} className="relative group/thumb w-10 h-7 rounded overflow-hidden border border-border/50 flex-shrink-0">
                  <img src={srcFrame.image} alt={srcFrame.scene} className="w-full h-full object-cover" draggable={false} />
                  <button
                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); onDeleteConnection(conn.from, conn.to); }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <X className="w-3 h-3 text-destructive" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Gallery strip sub-component
function GalleryStrip({
  frame,
  onSelectImage,
  onLightboxOpen,
}: {
  frame: FrameData;
  onSelectImage: (imgId: string, src: string, desc: string, actors: string[]) => void;
  onLightboxOpen: (index: number) => void;
}) {
  return (
    <div
      className="bg-secondary/90 relative flex items-stretch"
      onMouseDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      style={{ maxWidth: FRAME_W }}
    >
      <button
        className="flex-shrink-0 w-9 flex items-center justify-center bg-card/80 hover:bg-card border-r border-border text-muted-foreground hover:text-foreground transition-colors z-10"
        onClick={(e) => {
          e.stopPropagation();
          const activeIdx = frame.generatedImages.findIndex(img => img.id === frame.selectedImageId);
          onLightboxOpen(activeIdx >= 0 ? activeIdx : 0);
        }}
        title="Open gallery"
      >
        <Expand className="w-3.5 h-3.5" />
      </button>
      <div
        className="flex-1 flex items-center gap-1 px-1.5 py-1.5 cursor-grab active:cursor-grabbing select-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", overflowX: "auto" }}
        onMouseDown={(e) => {
          e.stopPropagation();
          const el = e.currentTarget;
          const startX = e.pageX;
          const startScroll = el.scrollLeft;
          let moved = false;
          const onMove = (ev: MouseEvent) => {
            if (Math.abs(ev.pageX - startX) > 3) moved = true;
            el.scrollLeft = startScroll - (ev.pageX - startX);
          };
          const onUp = () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
            if (moved) {
              const blocker = (ev: MouseEvent) => { ev.stopPropagation(); ev.preventDefault(); };
              el.addEventListener("click", blocker, { capture: true, once: true });
            }
          };
          document.addEventListener("mousemove", onMove);
          document.addEventListener("mouseup", onUp);
        }}
      >
        {frame.generatedImages.map(img => {
          const isActive = frame.selectedImageId === img.id;
          return (
            <button
              key={img.id}
              className={`relative rounded overflow-hidden border-2 transition-all flex-shrink-0 w-14 h-10 ${
                isActive ? "border-primary" : "border-transparent hover:border-muted-foreground/40"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectImage(img.id, img.src, img.description, img.actors);
              }}
            >
              <img src={img.src} alt={img.description} className="w-full h-full object-cover" draggable={false} />
              {isActive && (
                <div className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-1.5 h-1.5 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
