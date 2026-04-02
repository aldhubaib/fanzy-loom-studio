// ─── Production Canvas Page ─────────────────────────────────
// Composed from isolated sub-components. All constants, types,
// and logic are extracted — this file is purely composition.

import { useCallback, useState, useMemo, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { mockProjects } from "@/data/mockProjects";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ZoneType, ScriptNode, ShotStatus } from "./types";
import { GRID_SIZE, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP, CAST_W, CAST_H, LOC_W, LOC_H, FRAME_W, FRAME_H, SCRIPT_W, TIMELINE_W, ZONE_PAD, ZONE_LABEL_H } from "./constants";
import { getFrameHForAspect } from "./utils";
import { ZONE_COLORS, ZONE_LABELS } from "./constants";
import { useCanvasState } from "./hooks/useCanvasState";

import { CanvasErrorBoundary } from "./components/ErrorBoundary";
import { CanvasToolbar } from "./components/CanvasToolbar";
import { CanvasConnectors } from "./components/CanvasConnectors";
import { CanvasContextMenu } from "./components/CanvasContextMenu";
import { CastPicker, LocationPicker } from "./components/CanvasPickers";
import { CanvasDrawer } from "./components/CanvasDrawer";
import { CanvasMinimap } from "./components/CanvasMinimap";
import { ZoneBackground } from "./components/ZoneBackground";
import { ShotFrameNode } from "./components/ShotFrameNode";
import { CastNodeCard } from "./components/CastNodeCard";
import { LocationNodeCard } from "./components/LocationNodeCard";
import { ScriptNodeCard } from "./components/ScriptNodeCard";
import { TimelineNode } from "./components/TimelineNode";
import { DeleteConfirmDialog, type DeleteSeverity } from "./components/DeleteConfirmDialog";
import { CollabPresence, CommentsPanel, ActivityFeed, ShareDialog } from "./components/CollabOverlay";


interface PendingDelete {
  severity: DeleteSeverity;
  title: string;
  description: string;
  onConfirm: () => void;
}

function ProductionCanvasPageInner() {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState(
    () => mockProjects.find(p => p.id === projectId)?.title || "Untitled"
  );
  const [scriptStackHeights, setScriptStackHeights] = useState<Record<string, number>>({});
  const cs = useCanvasState(projectId, scriptStackHeights);

  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const stackRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const stackObservers = useRef<Record<string, ResizeObserver>>({});

  const setStackRef = useCallback((zoneId: string, el: HTMLDivElement | null) => {
    // Cleanup old observer
    if (stackObservers.current[zoneId]) {
      stackObservers.current[zoneId].disconnect();
      delete stackObservers.current[zoneId];
    }
    stackRefs.current[zoneId] = el;
    if (el) {
      const obs = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const h = entry.contentRect.height;
          setScriptStackHeights((prev) => {
            if (prev[zoneId] === h) return prev;
            return { ...prev, [zoneId]: h };
          });
        }
      });
      obs.observe(el);
      stackObservers.current[zoneId] = obs;
    }
  }, []);

  const showDrawer = cs.selected != null && cs.selected.type !== "zone";

  const selectedFrame = cs.selected?.type === "frame"
    ? cs.frames.find((f) => f.id === cs.selected!.id)
    : null;

  const connectedActorsForFrame = selectedFrame
    ? cs.getConnectedActors(selectedFrame.zoneId)
    : [];

  // ── Animation Callbacks ────────────────────────────────
  const handleAnimateShot = useCallback((frameId: string) => {
    // Set to animating
    cs.setFrames((prev) => prev.map((f) => f.id === frameId ? { ...f, shotStatus: "animating" as ShotStatus, animationProgress: 0 } : f));
    // Simulate progress
    const steps = 30;
    const interval = 100; // 3s total
    let step = 0;
    const timer = setInterval(() => {
      step++;
      cs.setFrames((prev) => prev.map((f) => f.id === frameId ? { ...f, animationProgress: Math.round((step / steps) * 100) } : f));
      if (step >= steps) {
        clearInterval(timer);
        const frame = cs.frames.find((f) => f.id === frameId);
        cs.setFrames((prev) => prev.map((f) => f.id === frameId ? { ...f, shotStatus: "video_ready" as ShotStatus, animationProgress: 100, videoDuration: f.duration } : f));
        toast.success(`Shot ${frame?.scene || ""} animated`);
      }
    }, interval);
  }, [cs.frames]);

  const handleAnimateAll = useCallback(() => {
    const approvedFrames = cs.frames.filter((f) => f.shotStatus === "approved");
    if (approvedFrames.length === 0) return;
    approvedFrames.forEach((frame, idx) => {
      setTimeout(() => handleAnimateShot(frame.id), idx * 500);
    });
    toast(`Animating ${approvedFrames.length} shots...`);
  }, [cs.frames, handleAnimateShot]);

  // ── Callbacks ─────────────────────────────────────────
  const handleDeleteConnection = useCallback(
    (from: string, to: string) => {
      const isZoneConn = from.includes("::") || to.includes("::");
      const fromZone = cs.zones.find((z) => from.startsWith(z.id));
      const toZone = cs.zones.find((z) => to.startsWith(z.id));

      const doDelete = () => {
        cs.setConnections((prev) => prev.filter((c) => !(c.from === from && c.to === to)));
      };

      if (isZoneConn && fromZone && toZone) {
        // Find which zone types are involved to give a specific warning
        const zoneTypes = [fromZone.type, toZone.type];
        const otherZone = fromZone.type === "shots" ? toZone : toZone.type === "shots" ? fromZone : toZone;

        let description = "";
        if (zoneTypes.includes("casting")) {
          const castCount = cs.castNodes.filter((n) => n.zoneId === otherZone.id || n.zoneId === fromZone.id || n.zoneId === toZone.id).length;
          description = `Disconnecting "${fromZone.label}" from "${toZone.label}" will unlink all cast members. ${castCount > 0 ? `${castCount} actor${castCount > 1 ? "s" : ""} will be removed from connected shots.` : ""}`;
        } else if (zoneTypes.includes("locations")) {
          const locCount = cs.locationNodes.filter((n) => n.zoneId === otherZone.id || n.zoneId === fromZone.id || n.zoneId === toZone.id).length;
          description = `Disconnecting "${fromZone.label}" from "${toZone.label}" will unlink all locations. ${locCount > 0 ? `${locCount} location${locCount > 1 ? "s" : ""} will be removed from connected shots.` : ""}`;
        } else if (zoneTypes.includes("script")) {
          const scriptCount = cs.scriptNodes.filter((n) => n.zoneId === otherZone.id || n.zoneId === fromZone.id || n.zoneId === toZone.id).length;
          description = `Disconnecting "${fromZone.label}" from "${toZone.label}" will unlink all scripts. ${scriptCount > 0 ? `${scriptCount} script block${scriptCount > 1 ? "s" : ""} will lose their shot references.` : ""}`;
        } else if (zoneTypes.includes("production")) {
          description = `Disconnecting "${fromZone.label}" from "${toZone.label}" will remove shots from the production timeline.`;
        } else {
          description = `Disconnecting "${fromZone.label}" from "${toZone.label}" will break the data flow between these zones.`;
        }

        setPendingDelete({
          severity: "destructive",
          title: `Disconnect ${fromZone.label}`,
          description,
          onConfirm: doDelete,
        });
      } else {
        doDelete();
      }
    },
    [cs.setConnections, cs.zones, cs.castNodes, cs.locationNodes, cs.scriptNodes],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      // Skip context menu for individual node cards, but allow page-view containers
      const nodeEl = (e.target as HTMLElement).closest("[data-node]");
      if (nodeEl && !nodeEl.hasAttribute("data-page-view")) return;
      const rect = cs.containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const worldX = (e.clientX - rect.left - cs.pan.x) / cs.zoom;
      const worldY = (e.clientY - rect.top - cs.pan.y) / cs.zoom;
      const zoneId = cs.findZoneAt(worldX, worldY);
      cs.setCanvasMenu({ x: e.clientX - rect.left, y: e.clientY - rect.top, worldX, worldY, zoneId });
    },
    [cs.pan, cs.zoom, cs.findZoneAt, cs.setCanvasMenu, cs.containerRef],
  );

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      cs.setCanvasMenu(null);
      cs.setCastPickerPos(null);
      cs.setLocationPickerPos(null);
      cs.handleMouseDown(e);
    },
    [cs.setCanvasMenu, cs.setCastPickerPos, cs.setLocationPickerPos, cs.handleMouseDown],
  );

  return (
    <div className="h-screen w-full relative bg-background overflow-hidden flex">
      <div className="flex-1 relative">
        <CanvasToolbar
           projectId={projectId}
           projectName={projectName}
           onProjectNameChange={setProjectName}
          tool={cs.tool}
          zoom={cs.zoom}
          onSetTool={cs.setTool}
          onAddFrame={() => cs.addFrame()}
          onFitToScreen={cs.fitToScreen}
          onZoomIn={() => cs.setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
          onZoomOut={() => cs.setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
          onUndo={() => {}}
          onRedo={() => {}}
          canUndo={false}
          canRedo={false}
        />

        <CollabPresence
          onOpenComments={() => { setCommentsOpen(true); setActivityOpen(false); }}
          onOpenActivity={() => { setActivityOpen(true); setCommentsOpen(false); }}
          onOpenShare={() => setShareOpen(true)}
        />
        <CommentsPanel open={commentsOpen} onClose={() => setCommentsOpen(false)} />
        <ActivityFeed open={activityOpen} onClose={() => setActivityOpen(false)} />
        <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} />

        {/* Canvas surface */}
        <div
          ref={cs.containerRef}
          className={cn(
            "absolute inset-0",
            cs.tool === "hand" || cs.panning ? "cursor-grab" : "cursor-default",
            cs.panning && "cursor-grabbing",
          )}
          onContextMenu={handleContextMenu}
          onWheel={cs.handleWheel}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={cs.handleMouseMove}
          onMouseUp={cs.handleMouseUp}
          onMouseLeave={cs.handleMouseUp}
        >
          {/* Dot grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle, hsl(var(--foreground) / 0.12) 1px, transparent 1px)`,
              backgroundSize: `${GRID_SIZE * cs.zoom}px ${GRID_SIZE * cs.zoom}px`,
              backgroundPosition: `${cs.pan.x % (GRID_SIZE * cs.zoom)}px ${cs.pan.y % (GRID_SIZE * cs.zoom)}px`,
            }}
          />

          {/* Transform layer */}
          <div style={{ transform: `translate(${cs.pan.x}px, ${cs.pan.y}px) scale(${cs.zoom})`, transformOrigin: "0 0" }}>

            {/* Zone backgrounds */}
            {cs.zones.map((zone) => {
              const b = cs.zoneBounds[zone.id];
              if (!b) return null;
              return (
                <ZoneBackground
                  key={zone.id}
                  zone={zone}
                  bounds={b}
                  isSelected={cs.selected?.type === "zone" && cs.selected.id === zone.id}
                  isEditingLabel={cs.editingZoneLabel === zone.id}
                  isStackView={zone.type === "script"}
                  zoneCols={cs.zoneCols[zone.id] ?? 3}
                  onZoneDragStart={(e) => cs.startZoneDrag(e, zone.id)}
                  onLabelDoubleClick={() => cs.setEditingZoneLabel(zone.id)}
                  onLabelRename={(val) => cs.setZones((prev) => prev.map((z) => (z.id === zone.id ? { ...z, label: val } : z)))}
                  onLabelEditCancel={() => cs.setEditingZoneLabel(null)}
                  onStartConnect={(e, portId) => cs.startConnect(e, portId)}
                  onEndConnect={(e, portId) => { e.stopPropagation(); cs.endConnect(portId); }}
                  onSelect={() => cs.setSelected({ type: "zone", id: zone.id })}
                  onColsChange={(cols) => {
                    cs.setZoneCols((prev) => ({ ...prev, [zone.id]: cols }));
                    cs.autoGridZone(zone.id, zone.type === "script" ? 1 : cols);
                  }}
                  shotAspectRatio={cs.shotAspectRatio}
                  onAspectRatioChange={(ratio) => cs.setShotAspectRatio(ratio)}
                  shotStats={zone.type === "shots" ? (() => {
                    const zoneFrames = cs.frames.filter((f) => f.zoneId === zone.id);
                    const approved = zoneFrames.filter((f) => f.shotStatus === "approved").length;
                    const drafts = zoneFrames.filter((f) => !f.shotStatus || f.shotStatus === "empty" || f.shotStatus === "preview").length;
                    return { total: zoneFrames.length, approved, drafts, animatable: approved };
                  })() : undefined}
                  onAnimateAll={zone.type === "shots" ? handleAnimateAll : undefined}
                  onToolAction={{
                    autoGrid: () => cs.autoGridZone(zone.id, zone.type === "script" ? 1 : (cs.zoneCols[zone.id] ?? 3)),
                  }}
                  onAddItem={() => {
                    const b2 = cs.zoneBounds[zone.id];
                    if (!b2) return;
                    if (zone.type === "shots") {
                      const existing = cs.frames.filter((f) => f.zoneId === zone.id);
                      const cols = cs.zoneCols[zone.id] ?? 3;
                      const gap = 24;
                      const idx = existing.length;
                      const col = idx % cols;
                      const row = Math.floor(idx / cols);
                      const startX = b2.x + ZONE_PAD;
                      const startY = b2.y + ZONE_PAD + ZONE_LABEL_H;
                      const dynamicFrameH = getFrameHForAspect(cs.shotAspectRatio);
                      cs.addFrame(startX + col * (FRAME_W + gap), startY + row * (dynamicFrameH + gap), zone.id);
                    } else if (zone.type === "casting") {
                      const rect = cs.containerRef.current?.getBoundingClientRect();
                      if (!rect) return;
                      // Position picker near the add button (top-right of zone)
                      const btnX = b2.x + b2.w - 40;
                      const btnY = b2.y + 60;
                      const sx = btnX * cs.zoom + cs.pan.x;
                      const sy = btnY * cs.zoom + cs.pan.y;
                      cs.setCastPickerPos({ x: sx, y: sy, worldX: btnX, worldY: btnY, zoneId: zone.id });
                    } else if (zone.type === "locations") {
                      const rect = cs.containerRef.current?.getBoundingClientRect();
                      if (!rect) return;
                      const btnX = b2.x + b2.w - 40;
                      const btnY = b2.y + 60;
                      const sx = btnX * cs.zoom + cs.pan.x;
                      const sy = btnY * cs.zoom + cs.pan.y;
                      cs.setLocationPickerPos({ x: sx, y: sy, worldX: btnX, worldY: btnY, zoneId: zone.id });
                    } else if (zone.type === "script") {
                      const zoneScripts = cs.scriptNodes.filter((n) => n.zoneId === zone.id);
                      const maxOrder = zoneScripts.reduce((max, n) => Math.max(max, n.order ?? 0), -1);
                      const startX = b2.x + ZONE_PAD;
                      const startY = b2.y + ZONE_PAD + ZONE_LABEL_H;
                      cs.setScriptNodes((prev) => [...prev, {
                        id: `sn-${Date.now()}`,
                        heading: "New Scene",
                        body: "Description of the scene...",
                        x: startX,
                        y: startY + zoneScripts.length * (160 + 8),
                        zoneId: zone.id,
                        order: maxOrder + 1,
                      }]);
                    }
                  }}
                  onDuplicateZone={() => {
                    const newId = `z-${zone.type}-${Date.now()}`;
                    const b2 = cs.zoneBounds[zone.id];
                    const offsetX = b2 ? b2.w + 80 : 400;
                    cs.setZones((prev) => {
                      const count = prev.filter((z) => z.type === zone.type).length;
                      return [...prev, {
                        id: newId,
                        label: `${zone.label} Copy`,
                        type: zone.type,
                        x: zone.x + offsetX,
                        y: zone.y,
                        color: zone.color,
                      }];
                    });
                  }}
                />
              );
            })}

            {/* Connection lines */}
            <CanvasConnectors
              connectors={cs.connectors}
              connectingFrom={cs.connectingFrom}
              connectingFromPos={cs.connectingFrom ? cs.getPortPos(cs.connectingFrom, "right") : null}
              connectingMouse={cs.connectingMouse}
              onDeleteConnection={handleDeleteConnection}
            />

            {/* Shot frames */}
            {(() => {
              const sorted = [...cs.frames].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
              return sorted.map((frame, idx) => (
                <ShotFrameNode
                  key={frame.id}
                  frame={frame}
                  index={idx}
                  actors={cs.actors}
                  isSelected={cs.selected?.id === frame.id}
                  onMouseDown={(e) => { cs.setSelected({ type: "frame", id: frame.id }); cs.startDrag(e, frame); }}
                  onSettingsClick={() => cs.setSelected({ type: "frame", id: frame.id })}
                  onSelectImage={(frameId, image) => cs.setFrames((prev) => prev.map((f) => f.id === frameId ? { ...f, image, shotStatus: "approved" } : f))}
                  onAnimate={(frameId) => handleAnimateShot(frameId)}
                  aspectRatio={cs.shotAspectRatio}
                />
              ));
            })()}

            {/* Cast nodes */}
            {(() => {
              const sorted = [...cs.castNodes].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
              return sorted.map((node) => {
                const actor = cs.actors.find((a) => a.id === node.actorId);
                if (!actor) return null;
                const sceneCount = cs.frames.filter((f) => f.actors.includes(node.actorId)).length;
                return (
                  <CastNodeCard
                    key={node.id}
                    node={node}
                    actor={actor}
                    sceneCount={sceneCount}
                    isSelected={cs.selected?.id === node.id}
                    onMouseDown={(e) => { cs.setSelected({ type: "cast", id: node.id }); cs.startDrag(e, node); }}
                    onSettingsClick={() => cs.setSelected({ type: "cast", id: node.id })}
                    onDelete={() => {
                      const doDelete = () => {
                        cs.setCastNodes((prev) => prev.filter((n) => n.id !== node.id));
                        if (cs.selected?.id === node.id) cs.setSelected(null);
                      };
                      if (sceneCount > 0) {
                        setPendingDelete({
                          severity: "destructive",
                          title: "Delete Cast Node",
                          description: `"${actor.name}" is assigned to ${sceneCount} shot${sceneCount > 1 ? "s" : ""}. Deleting this node will remove the actor from all connected shots.`,
                          onConfirm: doDelete,
                        });
                      } else {
                        setPendingDelete({
                          severity: "warning",
                          title: "Delete Cast Node",
                          description: `Are you sure you want to delete "${actor.name}" from the canvas?`,
                          onConfirm: doDelete,
                        });
                      }
                    }}
                  />
                );
              });
            })()}

            {/* Location nodes */}
            {(() => {
              const sorted = [...cs.locationNodes].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
              return sorted.map((node) => {
                const loc = cs.locations.find((l) => l.id === node.locationId);
                if (!loc) return null;
                const shotCount = cs.frames.filter((f) => { const ls = Array.isArray(f.location) ? f.location : (f.location ? [f.location] : []); return ls.includes(loc.name); }).length;
                return (
                  <LocationNodeCard
                    key={node.id}
                    node={node}
                    location={loc}
                    isSelected={cs.selected?.id === node.id}
                    shotCount={shotCount}
                    onMouseDown={(e) => { cs.setSelected({ type: "location", id: node.id }); cs.startDrag(e, node); }}
                    onSettingsClick={() => cs.setSelected({ type: "location", id: node.id })}
                    onDelete={() => {
                      const doDelete = () => {
                        cs.setLocationNodes((prev) => prev.filter((n) => n.id !== node.id));
                        if (cs.selected?.id === node.id) cs.setSelected(null);
                      };
                      if (shotCount > 0) {
                        setPendingDelete({
                          severity: "destructive",
                          title: "Delete Location Node",
                          description: `"${loc.name}" is used in ${shotCount} shot${shotCount > 1 ? "s" : ""}. Deleting this node will remove the location reference from all connected shots.`,
                          onConfirm: doDelete,
                        });
                      } else {
                        setPendingDelete({
                          severity: "warning",
                          title: "Delete Location Node",
                          description: `Are you sure you want to delete "${loc.name}" from the canvas?`,
                          onConfirm: doDelete,
                        });
                      }
                    }}
                  />
                );
              });
            })()}

            {/* Script nodes — card view or page view per zone */}
            {(() => {
              // Group script nodes by zone, sorted by order
              const scriptByZone = new Map<string, typeof cs.scriptNodes>();
              [...cs.scriptNodes].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).forEach((node) => {
                const arr = scriptByZone.get(node.zoneId) || [];
                arr.push(node);
                scriptByZone.set(node.zoneId, arr);
              });

              const elements: React.ReactNode[] = [];

              scriptByZone.forEach((nodes, zoneId) => {
                    const b = cs.zoneBounds[zoneId];
                    if (!b) return;
                    elements.push(
                      <div
                        key={`stack-${zoneId}`}
                        ref={(el) => setStackRef(zoneId, el)}
                        className="absolute flex flex-col gap-2"
                        style={{
                          left: b.x + 40,
                          top: b.y + 50,
                          width: SCRIPT_W * 3,
                        }}
                      >
                        {nodes.map((node, idx) => (
                          <ScriptNodeCard
                            key={node.id}
                            node={node}
                            sceneNumber={idx + 1}
                            isSelected={cs.selected?.id === node.id}
                            isStackView
                            isFirst={idx === 0}
                            isLast={idx === nodes.length - 1}
                            onMouseDown={(e) => { cs.setSelected({ type: "script", id: node.id }); cs.startDrag(e, node); }}
                            onSettingsClick={() => cs.setSelected({ type: "script", id: node.id })}
                            onMoveUp={() => {
                              if (idx === 0) return;
                              cs.setScriptNodes((prev) => {
                                const zoneNodes = prev.filter((n) => n.zoneId === node.zoneId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                                const prevNode = zoneNodes[idx - 1];
                                if (!prevNode) return prev;
                                const prevOrder = prevNode.order ?? 0;
                                const curOrder = node.order ?? 0;
                                return prev.map((n) => {
                                  if (n.id === node.id) return { ...n, order: prevOrder };
                                  if (n.id === prevNode.id) return { ...n, order: curOrder };
                                  return n;
                                });
                              });
                            }}
                            onMoveDown={() => {
                              if (idx === nodes.length - 1) return;
                              cs.setScriptNodes((prev) => {
                                const zoneNodes = prev.filter((n) => n.zoneId === node.zoneId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                                const nextNode = zoneNodes[idx + 1];
                                if (!nextNode) return prev;
                                const nextOrder = nextNode.order ?? 0;
                                const curOrder = node.order ?? 0;
                                return prev.map((n) => {
                                  if (n.id === node.id) return { ...n, order: nextOrder };
                                  if (n.id === nextNode.id) return { ...n, order: curOrder };
                                  return n;
                                });
                              });
                            }}
                            onDelete={() => {
                              const linkedFrames = cs.frames.filter((f) => f.zoneId === node.zoneId);
                              const doDelete = () => {
                                cs.setScriptNodes((prev) => prev.filter((n) => n.id !== node.id));
                                if (cs.selected?.id === node.id) cs.setSelected(null);
                              };
                              if (linkedFrames.length > 0) {
                                setPendingDelete({
                                  severity: "destructive",
                                  title: "Delete Script Node",
                                  description: `This script block is in a zone with ${linkedFrames.length} shot${linkedFrames.length > 1 ? "s" : ""}. Deleting it may break your scene continuity.`,
                                  onConfirm: doDelete,
                                });
                              } else {
                                setPendingDelete({
                                  severity: "warning",
                                  title: "Delete Script Node",
                                  description: `Are you sure you want to delete this script block?`,
                                  onConfirm: doDelete,
                                });
                              }
                            }}
                            onUpdate={(id, updates) => cs.setScriptNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)))}
                          />
                        ))}
                      </div>
                    );
              });

              return elements;
            })()}

            {/* Timeline nodes */}
            {cs.timelineNodes.map((node) => {
              const connectedFrames = cs.frames.filter((f) => {
                const timelineZone = cs.zones.find((z) => z.id === node.zoneId);
                if (!timelineZone) return false;
                return cs.connections.some((c) => {
                  const fromBase = c.from.split("::")[0];
                  const toBase = c.to.split("::")[0];
                  const shotsZone = cs.zones.find((z) => z.id === fromBase && z.type === "shots");
                  const prodZone = cs.zones.find((z) => z.id === toBase && z.type === "production");
                  if (shotsZone && prodZone && prodZone.id === node.zoneId) return f.zoneId === shotsZone.id;
                  const shotsZone2 = cs.zones.find((z) => z.id === toBase && z.type === "shots");
                  const prodZone2 = cs.zones.find((z) => z.id === fromBase && z.type === "production");
                  if (shotsZone2 && prodZone2 && prodZone2.id === node.zoneId) return f.zoneId === shotsZone2.id;
                  return false;
                });
              });

              return (
                <TimelineNode
                  key={node.id}
                  node={node}
                  frames={connectedFrames}
                  actors={cs.actors}
                  isSelected={cs.selected?.id === node.id}
                  onMouseDown={(e) => cs.startDrag(e, node)}
                  onSettingsClick={() => cs.setSelected({ type: "script", id: node.id })}
                />
              );
            })}
          </div>

          {/* Context menu */}
          {cs.canvasMenu && (
            <CanvasContextMenu
              menu={cs.canvasMenu}
              zones={cs.zones}
              onAddFrame={() => {
                cs.addFrame(cs.canvasMenu!.worldX, cs.canvasMenu!.worldY, cs.canvasMenu!.zoneId);
                cs.setCanvasMenu(null);
              }}
              onAddCastPicker={() => {
                cs.setCastPickerPos({ x: cs.canvasMenu!.x, y: cs.canvasMenu!.y, worldX: cs.canvasMenu!.worldX, worldY: cs.canvasMenu!.worldY, zoneId: cs.canvasMenu!.zoneId || "" });
                cs.setCanvasMenu(null);
              }}
              onAddLocationPicker={() => {
                cs.setLocationPickerPos({ x: cs.canvasMenu!.x, y: cs.canvasMenu!.y, worldX: cs.canvasMenu!.worldX, worldY: cs.canvasMenu!.worldY, zoneId: cs.canvasMenu!.zoneId || "" });
                cs.setCanvasMenu(null);
              }}
              onAddScriptNode={() => {
                const zone = cs.zones.find((z) => z.id === cs.canvasMenu!.zoneId);
                if (zone) {
                  const maxOrder = cs.scriptNodes.filter((n) => n.zoneId === zone.id).reduce((max, n) => Math.max(max, n.order ?? 0), -1);
                  cs.setScriptNodes((prev) => [...prev, {
                    id: `sn-${Date.now()}`,
                    heading: "New Scene",
                    body: "Description of the scene...",
                    x: cs.canvasMenu!.worldX - SCRIPT_W / 2,
                    y: cs.canvasMenu!.worldY,
                    zoneId: zone.id,
                    order: maxOrder + 1,
                  }]);
                }
                cs.setCanvasMenu(null);
              }}
              onAddTimeline={() => {
                const zone = cs.zones.find((z) => z.id === cs.canvasMenu!.zoneId);
                if (zone) {
                  cs.setTimelineNodes((prev) => [...prev, {
                    id: `tn-${Date.now()}`,
                    x: cs.canvasMenu!.worldX - TIMELINE_W / 2,
                    y: cs.canvasMenu!.worldY,
                    zoneId: zone.id,
                  }]);
                }
                cs.setCanvasMenu(null);
              }}
              onAddZone={(type) => {
                const zoneId = `z-${type}-${Date.now()}`;
                const wx = cs.canvasMenu!.worldX;
                const wy = cs.canvasMenu!.worldY;
                cs.setZones((prev) => {
                  const count = prev.filter((z) => z.type === type).length;
                  const label = count > 0 ? `${ZONE_LABELS[type]} #${count + 1}` : ZONE_LABELS[type];
                  return [...prev, {
                    id: zoneId,
                    label,
                    type,
                    x: wx,
                    y: wy,
                    color: ZONE_COLORS[type],
                  }];
                });
                if (type === "production") {
                  const tsNow = Date.now();
                  cs.setTimelineNodes((prev) => [...prev, {
                    id: `tn-${tsNow}`,
                    x: wx + 40,
                    y: wy + 40,
                    zoneId,
                  }]);
                }
                cs.setCanvasMenu(null);
              }}
              onDeleteZone={(zoneId) => {
                const zone = cs.zones.find((z) => z.id === zoneId);
                const zoneFrames = cs.frames.filter((f) => f.zoneId === zoneId);
                const zoneCast = cs.castNodes.filter((n) => n.zoneId === zoneId);
                const zoneLoc = cs.locationNodes.filter((n) => n.zoneId === zoneId);
                const zoneScripts = cs.scriptNodes.filter((n) => n.zoneId === zoneId);
                const totalNodes = zoneFrames.length + zoneCast.length + zoneLoc.length + zoneScripts.length;

                const doDelete = () => {
                  cs.setZones((prev) => prev.filter((z) => z.id !== zoneId));
                  cs.setFrames((prev) => prev.filter((f) => f.zoneId !== zoneId));
                  cs.setCastNodes((prev) => prev.filter((n) => n.zoneId !== zoneId));
                  cs.setLocationNodes((prev) => prev.filter((n) => n.zoneId !== zoneId));
                  cs.setScriptNodes((prev) => prev.filter((n) => n.zoneId !== zoneId));
                  cs.setTimelineNodes((prev) => prev.filter((n) => n.zoneId !== zoneId));
                  cs.setPreviewNodes((prev) => prev.filter((n) => n.zoneId !== zoneId));
                  cs.setConnections((prev) => prev.filter((c) => !c.from.startsWith(zoneId) && !c.to.startsWith(zoneId)));
                  if (cs.selected?.type === "zone" && cs.selected.id === zoneId) cs.setSelected(null);
                };

                cs.setCanvasMenu(null);

                // Find connected zones via connections
                const connectedZones = cs.connections
                  .filter((c) => c.from.startsWith(zoneId) || c.to.startsWith(zoneId))
                  .map((c) => {
                    const otherId = c.from.startsWith(zoneId) ? c.to.split("::")[0] : c.from.split("::")[0];
                    return cs.zones.find((z) => z.id === otherId);
                  })
                  .filter(Boolean);

                const connectedShotsZone = connectedZones.find((z) => z!.type === "shots");

                if (totalNodes > 0 || connectedZones.length > 0) {
                  let description = "";
                  
                  if (zone?.type === "locations" && connectedShotsZone) {
                    description = `This zone is connected to "${connectedShotsZone.label}". If you delete it, all shot locations will be empty.`;
                  } else if (zone?.type === "casting" && connectedShotsZone) {
                    description = `This zone is connected to "${connectedShotsZone.label}". If you delete it, all actor assignments in shots will be removed.`;
                  } else if (zone?.type === "script" && connectedShotsZone) {
                    description = `This zone is connected to "${connectedShotsZone.label}". If you delete it, all script references for shots will be lost.`;
                  } else if (zone?.type === "shots" && connectedZones.length > 0) {
                    const names = connectedZones.map((z) => `"${z!.label}"`).join(", ");
                    description = `This zone is connected to ${names}. Deleting it will remove all ${zoneFrames.length} shot${zoneFrames.length !== 1 ? "s" : ""} and break those connections.`;
                  } else if (zone?.type === "production") {
                    description = `This zone contains the production timeline. Deleting it will remove the timeline and all production data.`;
                  } else {
                    description = `This zone contains ${totalNodes} node${totalNodes !== 1 ? "s" : ""}. All contents will be permanently deleted.`;
                  }

                  setPendingDelete({
                    severity: "destructive",
                    title: `Delete "${zone?.label || "Zone"}"`,
                    description,
                    onConfirm: doDelete,
                  });
                } else {
                  setPendingDelete({
                    severity: "warning",
                    title: `Delete "${zone?.label || "Zone"}"`,
                    description: `Are you sure you want to delete this empty zone?`,
                    onConfirm: doDelete,
                  });
                }
              }}
              onFitToScreen={() => { cs.fitToScreen(); cs.setCanvasMenu(null); }}
              onClose={() => cs.setCanvasMenu(null)}
            />
          )}

          {/* Pickers */}
          {cs.castPickerPos && (
            <CastPicker
              position={cs.castPickerPos}
              actors={cs.actors}
              existingActorIds={cs.castNodes.filter((n) => n.zoneId === cs.castPickerPos!.zoneId).map((n) => n.actorId)}
              onSelect={(actor) => {
                // If it's a brand-new actor, add to the roster
                if (!cs.actors.find((a) => a.id === actor.id)) {
                  cs.setActors((prev) => [...prev, actor]);
                }
                const zoneId = cs.castPickerPos!.zoneId;
                const b = cs.zoneBounds[zoneId];
                const existing = cs.castNodes.filter((n) => n.zoneId === zoneId);
                const cols = cs.zoneCols[zoneId] ?? 3;
                const gap = 24;
                const idx = existing.length;
                const col = idx % cols;
                const row = Math.floor(idx / cols);
                const startX = b ? b.x + ZONE_PAD : cs.castPickerPos!.worldX;
                const startY = b ? b.y + ZONE_PAD + ZONE_LABEL_H : cs.castPickerPos!.worldY;
                cs.setCastNodes((prev) => [...prev, {
                  id: `cn-${Date.now()}`,
                  actorId: actor.id,
                  x: startX + col * (CAST_W + gap),
                  y: startY + row * (CAST_H + gap),
                  zoneId,
                }]);
                cs.setCastPickerPos(null);
              }}
              onClose={() => cs.setCastPickerPos(null)}
            />
          )}
{cs.locationPickerPos && (
            <LocationPicker
              position={cs.locationPickerPos}
              locations={cs.locations}
              existingLocationIds={
                cs.locationNodes
                  .filter((n) => n.zoneId === cs.locationPickerPos!.zoneId)
                  .map((n) => n.locationId)
              }
              onSelect={(loc) => {
                // If it's a brand-new location, add to the roster
                if (!cs.locations.find((l) => l.id === loc.id)) {
                  cs.setLocations((prev) => [...prev, loc]);
                }
                const zoneId = cs.locationPickerPos!.zoneId;
                const b = cs.zoneBounds[zoneId];
                const existing = cs.locationNodes.filter((n) => n.zoneId === zoneId);
                const cols = cs.zoneCols[zoneId] ?? 3;
                const gap = 24;
                const idx = existing.length;
                const col = idx % cols;
                const row = Math.floor(idx / cols);
                const startX = b ? b.x + ZONE_PAD : cs.locationPickerPos!.worldX;
                const startY = b ? b.y + ZONE_PAD + ZONE_LABEL_H : cs.locationPickerPos!.worldY;
                cs.setLocationNodes((prev) => [...prev, {
                  id: `ln-${Date.now()}`,
                  locationId: loc.id,
                  x: startX + col * (LOC_W + gap),
                  y: startY + row * (LOC_H + gap),
                  zoneId,
                }]);
                cs.setLocationPickerPos(null);
              }}
              onClose={() => cs.setLocationPickerPos(null)}
            />
          )}
        </div>

        {/* Minimap */}
        <CanvasMinimap
          zones={cs.zones}
          frames={cs.frames}
          castNodes={cs.castNodes}
          locationNodes={cs.locationNodes}
          scriptNodes={cs.scriptNodes}
          zoneBounds={cs.zoneBounds}
          selected={cs.selected}
          showDrawer={showDrawer}
        />
      </div>

      {/* Side drawer */}
      {showDrawer && (
        <CanvasDrawer
          selected={cs.selected}
          frames={cs.frames}
          actors={cs.actors}
          locations={cs.locations}
          castNodes={cs.castNodes}
          locationNodes={cs.locationNodes}
          scriptNodes={cs.scriptNodes}
          zones={cs.zones}
          connectedActorsForFrame={connectedActorsForFrame}
          onClose={() => cs.setSelected(null)}
          onUpdateFrame={(updated) => cs.setFrames((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))}
          onDeleteFrame={(id) => {
            const frame = cs.frames.find((f) => f.id === id);
            const doDelete = () => {
              cs.setFrames((prev) => prev.filter((f) => f.id !== id));
              cs.setConnections((prev) => prev.filter((c) => c.from !== id && c.to !== id));
              cs.setSelected(null);
            };
            setPendingDelete({
              severity: (frame?.actors.length ?? 0) > 0 ? "destructive" : "warning",
              title: "Delete Shot",
              description: (frame?.actors.length ?? 0) > 0
                ? `This shot has ${frame!.actors.length} actor${frame!.actors.length > 1 ? "s" : ""} assigned. Deleting it will remove all assignments.`
                : "Are you sure you want to delete this shot?",
              onConfirm: doDelete,
            });
          }}
          onUpdateActor={(updated) => cs.setActors((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))}
          onDeleteCastNode={(actorId) => {
            const actor = cs.actors.find((a) => a.id === actorId);
            const usedInShots = cs.frames.filter((f) => f.actors.includes(actorId)).length;
            const doDelete = () => {
              cs.setCastNodes((prev) => prev.filter((n) => n.actorId !== actorId));
              cs.setSelected(null);
            };
            if (usedInShots > 0) {
              setPendingDelete({
                severity: "destructive",
                title: "Delete Cast Node",
                description: `"${actor?.name || "This actor"}" is in ${usedInShots} shot${usedInShots > 1 ? "s" : ""}. Deleting will remove the actor from all shots.`,
                onConfirm: doDelete,
              });
            } else {
              setPendingDelete({
                severity: "warning",
                title: "Delete Cast Node",
                description: `Are you sure you want to delete "${actor?.name || "this actor"}"?`,
                onConfirm: doDelete,
              });
            }
          }}
          onUpdateLocation={(updated) => cs.setLocations((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))}
          onDeleteLocationNode={(locationId) => {
            const loc = cs.locations.find((l) => l.id === locationId);
            const usedInShots = cs.frames.filter((f) => f.location === loc?.name).length;
            const doDelete = () => {
              cs.setLocationNodes((prev) => prev.filter((n) => n.locationId !== locationId));
              cs.setSelected(null);
            };
            if (usedInShots > 0) {
              setPendingDelete({
                severity: "destructive",
                title: "Delete Location",
                description: `"${loc?.name || "This location"}" is in ${usedInShots} shot${usedInShots > 1 ? "s" : ""}. Deleting will remove it from all shots.`,
                onConfirm: doDelete,
              });
            } else {
              setPendingDelete({
                severity: "warning",
                title: "Delete Location",
                description: `Are you sure you want to delete "${loc?.name || "this location"}"?`,
                onConfirm: doDelete,
              });
            }
          }}
          onUpdateScriptNode={(id, updates) => cs.setScriptNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)))}
          onDeleteScriptNode={(id) => {
            const node = cs.scriptNodes.find((n) => n.id === id);
            const linkedFrames = node ? cs.frames.filter((f) => f.zoneId === node.zoneId).length : 0;
            const doDelete = () => {
              cs.setScriptNodes((prev) => prev.filter((n) => n.id !== id));
              cs.setSelected(null);
            };
            if (linkedFrames > 0) {
              setPendingDelete({
                severity: "destructive",
                title: "Delete Script Node",
                description: `This script block is in a zone with ${linkedFrames} shot${linkedFrames > 1 ? "s" : ""}. Deleting it may break scene continuity.`,
                onConfirm: doDelete,
              });
            } else {
              setPendingDelete({
                severity: "warning",
                title: "Delete Script Node",
                description: "Are you sure you want to delete this script block?",
                onConfirm: doDelete,
              });
            }
          }}
          onDeleteConnection={handleDeleteConnection}
          onApproveShot={(frameId) => cs.setFrames((prev) => prev.map((f) => f.id === frameId ? { ...f, shotStatus: "approved" } : f))}
        />
      )}

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        open={!!pendingDelete}
        severity={pendingDelete?.severity ?? "warning"}
        title={pendingDelete?.title ?? ""}
        description={pendingDelete?.description ?? ""}
        onConfirm={() => {
          pendingDelete?.onConfirm();
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

function CanvasLoader() {
  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center gap-6 animate-fade-in">
      {/* Animated film reel icon */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
        <div className="absolute inset-2 rounded-xl bg-primary/10 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-primary animate-[spin_3s_linear_infinite]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="2" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="2" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="22" y2="12" />
            <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" />
            <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
            <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" />
            <line x1="16.95" y1="7.05" x2="19.07" y2="4.93" />
          </svg>
        </div>
      </div>

      {/* Loading text */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-semibold text-foreground tracking-wide">Loading Canvas</p>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

export default function ProductionCanvasPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <CanvasLoader />;

  return (
    <CanvasErrorBoundary fallbackTitle="Canvas crashed">
      <ProductionCanvasPageInner />
    </CanvasErrorBoundary>
  );
}
