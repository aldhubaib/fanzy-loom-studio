// ─── Preview Monitor Node ─────────────────────────────────
// A video-editor-style preview screen node for the production canvas.

import { memo, useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Maximize2, Monitor } from "lucide-react";
import type { FrameData, Actor } from "../types";

export interface PreviewNodeData {
  id: string;
  x: number;
  y: number;
  zoneId: string;
}

export const PREVIEW_W = 640;
export const PREVIEW_H = 480;

interface PreviewMonitorNodeProps {
  node: PreviewNodeData;
  frames: FrameData[];
  actors: Actor[];
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onSettingsClick: () => void;
}

export const PreviewMonitorNode = memo(function PreviewMonitorNode({
  node, frames, actors, isSelected, onMouseDown, onSettingsClick,
}: PreviewMonitorNodeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const sortedFrames = frames.length > 0 ? frames : [];
  const currentFrame = sortedFrames[currentIndex] || null;

  // Parse duration string to ms
  const parseDuration = (dur: string) => {
    const n = parseFloat(dur);
    return isNaN(n) ? 3000 : n * 1000;
  };

  // Calculate total duration and current time
  const totalDurationMs = sortedFrames.reduce((acc, f) => acc + parseDuration(f.duration), 0);
  const currentTimeMs = sortedFrames.slice(0, currentIndex).reduce((acc, f) => acc + parseDuration(f.duration), 0);

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  // Auto-play
  useEffect(() => {
    if (playing && sortedFrames.length > 0) {
      const dur = currentFrame ? parseDuration(currentFrame.duration) : 3000;
      timerRef.current = setTimeout(() => {
        setCurrentIndex((prev) => {
          const next = prev + 1;
          if (next >= sortedFrames.length) {
            setPlaying(false);
            return 0;
          }
          return next;
        });
      }, dur);
    }
    return () => clearTimeout(timerRef.current);
  }, [playing, currentIndex, sortedFrames.length]);

  const handlePlayPause = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (sortedFrames.length === 0) return;
    setPlaying((p) => !p);
  }, [sortedFrames.length]);

  const handlePrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((i) => Math.max(0, i - 1));
    setPlaying(false);
  }, []);

  const handleNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((i) => Math.min(sortedFrames.length - 1, i + 1));
    setPlaying(false);
  }, [sortedFrames.length]);

  // Progress fraction
  const progress = totalDurationMs > 0 ? currentTimeMs / totalDurationMs : 0;

  // Get actors for current frame
  const frameActors = currentFrame
    ? actors.filter((a) => currentFrame.actors.includes(a.id))
    : [];

  return (
    <div
      data-node
      onMouseDown={onMouseDown}
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        width: PREVIEW_W,
      }}
      className={`rounded-xl border-2 overflow-hidden shadow-2xl transition-shadow ${
        isSelected ? "border-primary shadow-primary/20" : "border-border/60"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-card/95 border-b border-border/40">
        <Monitor className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-foreground tracking-wide">PREVIEW MONITOR</span>
        <div className="ml-auto flex items-center gap-2">
          {currentFrame && (
            <span className="text-[10px] text-muted-foreground">
              {currentFrame.scene} · {currentFrame.shot}
            </span>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div
        className="relative bg-black flex items-center justify-center"
        style={{ height: PREVIEW_H - 140 }}
      >
        {currentFrame?.image ? (
          <img
            src={currentFrame.image}
            alt={currentFrame.description}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
            <Monitor className="w-12 h-12" />
            <span className="text-xs">No frames to preview</span>
          </div>
        )}

        {/* Overlay info */}
        {currentFrame && (
          <>
            <div className="absolute top-2 left-3 flex items-center gap-1.5">
              <span className="bg-black/70 text-foreground text-[10px] font-bold px-2 py-0.5 rounded">
                {currentIndex + 1} / {sortedFrames.length}
              </span>
            </div>
            <div className="absolute top-2 right-3">
              <span className="bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded">
                {currentFrame.shot}
              </span>
            </div>
            {/* Actor pills */}
            {frameActors.length > 0 && (
              <div className="absolute bottom-2 left-3 flex gap-1">
                {frameActors.map((a) => (
                  <div key={a.id} className="flex items-center gap-1 bg-black/70 rounded-full px-1.5 py-0.5">
                    {a.portrait && (
                      <img src={a.portrait} className="w-4 h-4 rounded-full object-cover" alt={a.name} />
                    )}
                    <span className="text-[9px] text-foreground/80">{a.name.split(" ")[0]}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Description */}
      {currentFrame && (
        <div className="px-3 py-1.5 bg-card/90 border-t border-border/30">
          <p className="text-[11px] text-muted-foreground line-clamp-1">{currentFrame.description}</p>
        </div>
      )}

      {/* Timeline scrubber */}
      <div className="px-3 py-1 bg-card/95 border-t border-border/30">
        <div className="relative h-1.5 bg-secondary rounded-full overflow-hidden cursor-pointer">
          <div
            className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all"
            style={{ width: `${progress * 100}%` }}
          />
          {/* Frame markers */}
          {sortedFrames.map((_, i) => {
            const markerPos = sortedFrames.slice(0, i).reduce((a, f) => a + parseDuration(f.duration), 0) / totalDurationMs;
            return (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-foreground/20"
                style={{ left: `${markerPos * 100}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Transport controls */}
      <div className="flex items-center gap-3 px-3 py-2 bg-card/95">
        <button onClick={handlePrev} className="text-muted-foreground hover:text-foreground transition-colors">
          <SkipBack className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handlePlayPause}
          className="w-7 h-7 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors"
        >
          {playing ? (
            <Pause className="w-3.5 h-3.5 text-primary-foreground" />
          ) : (
            <Play className="w-3.5 h-3.5 text-primary-foreground ml-0.5" />
          )}
        </button>
        <button onClick={handleNext} className="text-muted-foreground hover:text-foreground transition-colors">
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        <span className="text-[11px] font-mono text-muted-foreground ml-1">
          {formatTime(currentTimeMs)} / {formatTime(totalDurationMs)}
        </span>

        <span className="ml-auto text-[10px] text-muted-foreground">
          {sortedFrames.length} clips
        </span>
      </div>
    </div>
  );
});
