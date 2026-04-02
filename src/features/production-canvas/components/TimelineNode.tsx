// ─── Timeline Node (Production Zone) ─────────────────────────
// A visual video editor timeline with an attached preview monitor.
// Clips auto-populate from connected shot frames inside the production zone.

import { memo, useMemo, useState, useEffect, useCallback } from "react";
import { Monitor, Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FrameData, Actor } from "../types";
import {
  TIMELINE_W,
  TIMELINE_PREVIEW_H,
  TIMELINE_TRACK_H,
  TIMELINE_HEADER_H,
  TIMELINE_RULER_H,
} from "../constants";

export interface TimelineNodeData {
  id: string;
  x: number;
  y: number;
  zoneId: string;
}

interface TimelineNodeProps {
  node: TimelineNodeData;
  frames: FrameData[];
  actors: Actor[];
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onSettingsClick: () => void;
}

const parseDuration = (value: string): number => {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? 3 : parsed;
};

const formatTimecode = (sec: number): string => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const f = Math.floor((sec % 1) * 24);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
};

const formatClock = (sec: number): string => {
  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const TimelineNode = memo(function TimelineNode({
  node, frames, actors, isSelected, onMouseDown, onSettingsClick,
}: TimelineNodeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const timeline = useMemo(() => {
    const sortedFrames = [...frames].sort((a, b) => a.x - b.x);
    const totalDuration = sortedFrames.reduce((sum, frame) => sum + parseDuration(frame.duration), 0);
    const pixelsPerSecond = totalDuration > 0 ? (TIMELINE_W - 96) / totalDuration : 10;

    let currentTime = 0;
    const clips = sortedFrames.map((frame) => {
      const duration = parseDuration(frame.duration);
      const clip = {
        frame,
        startTime: currentTime,
        duration,
        x: currentTime * pixelsPerSecond,
        w: Math.max(duration * pixelsPerSecond, 36),
      };
      currentTime += duration;
      return clip;
    });

    const sceneMap = new Map<string, typeof clips>();
    clips.forEach((clip) => {
      const scene = clip.frame.scene || "SC 1";
      if (!sceneMap.has(scene)) sceneMap.set(scene, []);
      sceneMap.get(scene)!.push(clip);
    });

    return {
      clips,
      scenes: Array.from(sceneMap.entries()),
      totalDuration: currentTime,
      pixelsPerSecond,
    };
  }, [frames]);

  useEffect(() => {
    if (timeline.clips.length === 0) {
      setCurrentIndex(0);
      setPlaying(false);
      return;
    }

    if (currentIndex > timeline.clips.length - 1) {
      setCurrentIndex(timeline.clips.length - 1);
      setPlaying(false);
    }
  }, [currentIndex, timeline.clips.length]);

  useEffect(() => {
    if (!playing || timeline.clips.length === 0) return;

    const activeClip = timeline.clips[currentIndex] ?? timeline.clips[0];
    const timeout = window.setTimeout(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= timeline.clips.length) {
          setPlaying(false);
          return 0;
        }
        return next;
      });
    }, activeClip.duration * 1000);

    return () => window.clearTimeout(timeout);
  }, [playing, currentIndex, timeline.clips]);

  const currentClip = timeline.clips[currentIndex] ?? null;
  const currentFrame = currentClip?.frame ?? null;
  const currentTime = currentClip?.startTime ?? 0;
  const playheadX = currentTime * timeline.pixelsPerSecond;
  const progress = timeline.totalDuration > 0 ? currentTime / timeline.totalDuration : 0;

  const frameActors = currentFrame
    ? actors.filter((actor) => currentFrame.actors.includes(actor.id))
    : [];

  const rulerMarks = useMemo(() => {
    const marks: { time: number; x: number; label: string }[] = [];
    const step = timeline.totalDuration > 20 ? 5 : timeline.totalDuration > 10 ? 2 : 1;

    for (let t = 0; t <= timeline.totalDuration; t += step) {
      marks.push({
        time: t,
        x: t * timeline.pixelsPerSecond,
        label: formatTimecode(t),
      });
    }

    return marks;
  }, [timeline.totalDuration, timeline.pixelsPerSecond]);

  const handlePlayPause = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (timeline.clips.length === 0) return;
    setPlaying((prev) => !prev);
  }, [timeline.clips.length]);

  const handlePrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (timeline.clips.length === 0) return;
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setPlaying(false);
  }, [timeline.clips.length]);

  const handleNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (timeline.clips.length === 0) return;
    setCurrentIndex((prev) => Math.min(timeline.clips.length - 1, prev + 1));
    setPlaying(false);
  }, [timeline.clips.length]);

  const trackCount = Math.max(timeline.scenes.length, 1);
  const contentH = TIMELINE_HEADER_H + TIMELINE_PREVIEW_H + TIMELINE_RULER_H + (trackCount + 1) * TIMELINE_TRACK_H;

  return (
    <div
      data-node
      className="absolute group"
      style={{ left: node.x, top: node.y, width: TIMELINE_W, height: contentH }}
      onMouseDown={onMouseDown}
    >
      <div
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-xl border bg-card shadow-2xl transition-colors",
          isSelected ? "border-primary" : "border-border/60",
        )}
      >
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3" style={{ height: TIMELINE_HEADER_H }}>
          <div className="flex items-center gap-1">
            <button
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
              onClick={handlePrev}
            >
              <SkipBack className="h-3 w-3" />
            </button>
            <button
              className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
              onClick={handlePlayPause}
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="ml-0.5 h-3.5 w-3.5" />}
            </button>
            <button
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
              onClick={handleNext}
            >
              <SkipForward className="h-3 w-3" />
            </button>
          </div>

          <span className="text-xs font-mono text-muted-foreground">
            {formatClock(currentTime)} / {formatClock(timeline.totalDuration)}
          </span>

          <div className="ml-auto flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
            <Volume2 className="h-3 w-3" />
            <span>{timeline.clips.length} clips</span>
          </div>
        </div>

        <div className="relative border-b border-border bg-background" style={{ height: TIMELINE_PREVIEW_H }}>
          {currentFrame?.image ? (
            <img
              src={currentFrame.image}
              alt={`${currentFrame.scene} ${currentFrame.shot} preview frame`}
              className="h-full w-full object-cover"
              draggable={false}
              loading="lazy"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground/40">
              <Monitor className="h-12 w-12" />
              <span className="text-xs">No frames to preview</span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/95 via-background/15 to-transparent" />

          {currentFrame && (
            <>
              <div className="absolute left-3 top-3 flex items-center gap-2">
                <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold text-foreground">
                  {currentFrame.scene}
                </span>
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  {currentFrame.shot}
                </span>
              </div>

              <div className="absolute right-3 top-3 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {currentIndex + 1} / {timeline.clips.length}
              </div>

              <div className="absolute inset-x-3 bottom-3 space-y-2">
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {currentFrame.description}
                    </p>
                    {frameActors.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {frameActors.map((actor) => (
                          <span
                            key={actor.id}
                            className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                          >
                            {actor.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {currentFrame.location && (
                    <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {Array.isArray(currentFrame.location) ? currentFrame.location.join(", ") : currentFrame.location}
                    </span>
                  )}
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-background/60">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative border-b border-border" style={{ height: TIMELINE_RULER_H, marginLeft: 72 }}>
          {rulerMarks.map((mark) => (
            <div key={mark.time} className="absolute top-0 h-full" style={{ left: mark.x }}>
              <div className="h-2 w-px bg-muted-foreground/40" />
              <span className="ml-0.5 text-[8px] text-muted-foreground/60">{mark.label}</span>
            </div>
          ))}

          <div className="absolute top-0 h-full w-0.5 bg-primary" style={{ left: playheadX }}>
            <div className="absolute -left-1 -top-0.5 h-2.5 w-2.5 rounded-sm bg-primary" />
          </div>
        </div>

        <div className="relative" style={{ marginLeft: 72 }}>
          {timeline.scenes.length > 0 ? (
            timeline.scenes.map(([scene, clips]) => (
              <div key={scene} className="relative flex items-center" style={{ height: TIMELINE_TRACK_H }}>
                <div
                  className="absolute truncate text-[9px] font-medium text-muted-foreground"
                  style={{ left: -68, width: 60, textAlign: "right" }}
                >
                  {scene}
                </div>

                <div className="absolute inset-x-0 top-1/2 h-px bg-border" />

                {clips.map((clip) => {
                  const actorNames = clip.frame.actors
                    .map((id) => actors.find((actor) => actor.id === id)?.name)
                    .filter(Boolean);

                  return (
                    <div
                      key={clip.frame.id}
                      className="absolute overflow-hidden rounded-md border border-primary/30 bg-primary/10 transition-all hover:brightness-110"
                      style={{
                        left: clip.x,
                        width: clip.w,
                        height: TIMELINE_TRACK_H - 10,
                        top: 5,
                      }}
                    >
                      {clip.frame.image && (
                        <div className="absolute inset-0 opacity-30">
                          <img
                            src={clip.frame.image}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}

                      <div className="relative z-10 flex h-full flex-col justify-center px-1.5 py-0.5">
                        <span className="truncate text-[8px] font-bold text-foreground">
                          {clip.frame.shot}
                        </span>
                        {clip.w > 60 && (
                          <span className="truncate text-[7px] text-muted-foreground">
                            {clip.frame.duration}
                            {actorNames.length > 0 && ` · ${actorNames[0]}`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <div
              className="flex items-center justify-center text-xs text-muted-foreground/50"
              style={{ height: TIMELINE_TRACK_H }}
            >
              Connect a Shots zone to populate the editor
            </div>
          )}

          <div className="relative flex items-center border-t border-border" style={{ height: TIMELINE_TRACK_H }}>
            <div
              className="absolute truncate text-[9px] font-medium text-muted-foreground/50"
              style={{ left: -68, width: 60, textAlign: "right" }}
            >
              Audio
            </div>
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
            <div className="absolute inset-x-0 top-2 bottom-2 flex items-center justify-center rounded bg-accent/20">
              <span className="text-[8px] text-muted-foreground/40">Audio Track</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
