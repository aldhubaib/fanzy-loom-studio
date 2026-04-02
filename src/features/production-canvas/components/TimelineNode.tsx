// ─── Timeline Node (Production Zone) ─────────────────────────
// A visual video editor timeline that auto-populates clips from
// connected shot frames. Rendered as a node inside the production zone.

import { memo, useMemo } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import type { FrameData, Actor } from "../types";
import { TIMELINE_W, TIMELINE_H, TIMELINE_TRACK_H, TIMELINE_HEADER_H, TIMELINE_RULER_H } from "../constants";

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

// Parse duration string to seconds
const parseDuration = (d: string): number => {
  const n = parseFloat(d);
  return isNaN(n) ? 3 : n;
};

// Generate timecode from seconds
const formatTimecode = (sec: number): string => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const f = Math.floor((sec % 1) * 24);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
};

export const TimelineNode = memo(function TimelineNode({
  node, frames, actors, isSelected, onMouseDown, onSettingsClick,
}: TimelineNodeProps) {
  // Group frames by scene for track layout
  const tracks = useMemo(() => {
    const sorted = [...frames].sort((a, b) => a.x - b.x);
    const totalDuration = sorted.reduce((sum, f) => sum + parseDuration(f.duration), 0);
    const pixelsPerSecond = totalDuration > 0 ? (TIMELINE_W - 80) / totalDuration : 10;

    let currentTime = 0;
    const clips = sorted.map((frame) => {
      const dur = parseDuration(frame.duration);
      const clip = {
        frame,
        startTime: currentTime,
        duration: dur,
        x: currentTime * pixelsPerSecond,
        w: Math.max(dur * pixelsPerSecond, 30),
      };
      currentTime += dur;
      return clip;
    });

    // Group into tracks by scene
    const sceneMap = new Map<string, typeof clips>();
    clips.forEach((clip) => {
      const scene = clip.frame.scene || "SC 1";
      if (!sceneMap.has(scene)) sceneMap.set(scene, []);
      sceneMap.get(scene)!.push(clip);
    });

    return {
      scenes: Array.from(sceneMap.entries()),
      totalDuration: currentTime,
      pixelsPerSecond,
      clips,
    };
  }, [frames]);

  // Ruler marks
  const rulerMarks = useMemo(() => {
    const marks: { time: number; x: number; label: string }[] = [];
    const step = tracks.totalDuration > 20 ? 5 : tracks.totalDuration > 10 ? 2 : 1;
    for (let t = 0; t <= tracks.totalDuration; t += step) {
      marks.push({
        time: t,
        x: t * tracks.pixelsPerSecond,
        label: formatTimecode(t),
      });
    }
    return marks;
  }, [tracks]);

  const trackCount = Math.max(tracks.scenes.length, 1);
  const contentH = TIMELINE_HEADER_H + TIMELINE_RULER_H + trackCount * TIMELINE_TRACK_H + 40;

  return (
    <div
      data-node
      className="absolute group"
      style={{ left: node.x, top: node.y, width: TIMELINE_W, height: contentH }}
      onMouseDown={onMouseDown}
    >
      <div
        className="w-full h-full rounded-xl border-2 overflow-hidden transition-colors"
        style={{
          borderColor: isSelected ? "hsl(30 90% 55%)" : "hsl(30 90% 55% / 0.3)",
          background: "hsl(var(--card))",
        }}
      >
        {/* Transport controls header */}
        <div
          className="flex items-center gap-2 px-3 border-b"
          style={{
            height: TIMELINE_HEADER_H,
            borderColor: "hsl(var(--border))",
            background: "hsl(var(--muted) / 0.5)",
          }}
        >
          <div className="flex items-center gap-1">
            <button className="p-1 rounded hover:bg-secondary/60 text-muted-foreground">
              <SkipBack className="w-3 h-3" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-secondary/60" style={{ color: "hsl(30 90% 55%)" }}>
              <Play className="w-4 h-4" />
            </button>
            <button className="p-1 rounded hover:bg-secondary/60 text-muted-foreground">
              <SkipForward className="w-3 h-3" />
            </button>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {formatTimecode(0)} / {formatTimecode(tracks.totalDuration)}
          </span>
          <div className="flex-1" />
          <Volume2 className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground font-medium">
            {frames.length} clips
          </span>
        </div>

        {/* Timeline ruler */}
        <div
          className="relative border-b"
          style={{
            height: TIMELINE_RULER_H,
            borderColor: "hsl(var(--border))",
            marginLeft: 60,
          }}
        >
          {rulerMarks.map((mark) => (
            <div key={mark.time} className="absolute top-0 h-full" style={{ left: mark.x }}>
              <div className="w-px h-2 bg-muted-foreground/40" />
              <span className="text-[8px] text-muted-foreground/60 ml-0.5">{mark.label}</span>
            </div>
          ))}
          {/* Playhead */}
          <div className="absolute top-0 h-full w-0.5" style={{ left: 0, background: "hsl(30 90% 55%)" }}>
            <div
              className="absolute -top-0.5 -left-1 w-2.5 h-2.5 rounded-sm"
              style={{ background: "hsl(30 90% 55%)" }}
            />
          </div>
        </div>

        {/* Tracks */}
        <div className="relative" style={{ marginLeft: 60 }}>
          {tracks.scenes.length > 0 ? (
            tracks.scenes.map(([scene, clips], trackIdx) => (
              <div key={scene} className="relative flex items-center" style={{ height: TIMELINE_TRACK_H }}>
                {/* Track label */}
                <div
                  className="absolute text-[9px] font-medium text-muted-foreground truncate"
                  style={{ left: -56, width: 50, textAlign: "right" }}
                >
                  {scene}
                </div>
                {/* Track line */}
                <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
                {/* Clips */}
                {clips.map((clip) => {
                  const actorNames = clip.frame.actors
                    .map((id) => actors.find((a) => a.id === id)?.name)
                    .filter(Boolean);
                  return (
                    <div
                      key={clip.frame.id}
                      className="absolute rounded-md overflow-hidden border transition-all hover:brightness-110"
                      style={{
                        left: clip.x,
                        width: clip.w,
                        height: TIMELINE_TRACK_H - 10,
                        top: 5,
                        borderColor: "hsl(30 90% 55% / 0.4)",
                        background: clip.frame.image
                          ? `linear-gradient(to right, hsl(30 90% 55% / 0.15), hsl(30 90% 55% / 0.08))`
                          : "hsl(30 90% 55% / 0.12)",
                      }}
                    >
                      {/* Thumbnail strip */}
                      {clip.frame.image && (
                        <div className="absolute inset-0 opacity-30">
                          <img
                            src={clip.frame.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="relative z-10 px-1.5 py-0.5 h-full flex flex-col justify-center">
                        <span className="text-[8px] font-bold text-foreground truncate">
                          {clip.frame.shot}
                        </span>
                        {clip.w > 60 && (
                          <span className="text-[7px] text-muted-foreground truncate">
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
              Connect a Shots zone to populate timeline
            </div>
          )}

          {/* Audio track placeholder */}
          <div className="relative flex items-center border-t" style={{ height: TIMELINE_TRACK_H, borderColor: "hsl(var(--border))" }}>
            <div
              className="absolute text-[9px] font-medium text-muted-foreground/50 truncate"
              style={{ left: -56, width: 50, textAlign: "right" }}
            >
              Audio
            </div>
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
            {/* Waveform placeholder */}
            <div className="absolute inset-x-0 top-2 bottom-2 rounded bg-accent/20 flex items-center justify-center">
              <span className="text-[8px] text-muted-foreground/30">Audio Track</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
