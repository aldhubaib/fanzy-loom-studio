// ─── Production Canvas Page ─────────────────────────────────
// Composed from isolated sub-components. All constants, types,
// and logic are extracted — this file is purely composition.

import { useCallback, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { ZoneType, ScriptNode } from "./types";
import { GRID_SIZE, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP, CAST_W, LOC_W, SCRIPT_W, SCRIPT_H, TIMELINE_W } from "./constants";
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
import { ScriptPageView } from "./components/ScriptPageView";

interface PendingDelete {
  severity: DeleteSeverity;
  title: string;
  description: string;
  onConfirm: () => void;
}

function ProductionCanvasPageInner() {
  const { projectId } = useParams();
  const [pageViewZones, setPageViewZones] = useState<Set<string>>(new Set());
  const cs = useCanvasState(projectId, pageViewZones);

  // ── Derived values ────────────────────────────────────
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const togglePageView = useCallback((zoneId: string) => {
    setPageViewZones((prev) => {
      const next = new Set(prev);
      if (next.has(zoneId)) next.delete(zoneId);
      else next.add(zoneId);
      return next;
    });
  }, []);

  const showDrawer = cs.selected != null && cs.selected.type !== "zone";

  const selectedFrame = cs.selected?.type === "frame"
    ? cs.frames.find((f) => f.id === cs.selected!.id)
    : null;

  const connectedActorsForFrame = selectedFrame
    ? cs.getConnectedActors(selectedFrame.zoneId)
    : [];

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
          tool={cs.tool}
          zoom={cs.zoom}
          onSetTool={cs.setTool}
          onAddFrame={() => cs.addFrame()}
          onFitToScreen={cs.fitToScreen}
          onZoomIn={() => cs.setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
          onZoomOut={() => cs.setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
          onResetCanvas={cs.resetCanvas}
        />

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
                  onZoneDragStart={(e) => cs.startZoneDrag(e, zone.id)}
                  onLabelDoubleClick={() => cs.setEditingZoneLabel(zone.id)}
                  onLabelRename={(val) => cs.setZones((prev) => prev.map((z) => (z.id === zone.id ? { ...z, label: val } : z)))}
                  onLabelEditCancel={() => cs.setEditingZoneLabel(null)}
                  onStartConnect={(e, portId) => cs.startConnect(e, portId)}
                  onEndConnect={(e, portId) => { e.stopPropagation(); cs.endConnect(portId); }}
                  onSelect={() => cs.setSelected({ type: "zone", id: zone.id })}
                  onToolAction={{
                    autoGrid: () => cs.autoGridZone(zone.id),
                    ...(zone.type === "script" ? { pageView: () => togglePageView(zone.id) } : {}),
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
            {cs.frames.map((frame, idx) => (
              <ShotFrameNode
                key={frame.id}
                frame={frame}
                index={idx}
                actors={cs.actors}
                isSelected={cs.selected?.id === frame.id}
                onMouseDown={(e) => cs.startDrag(e, frame)}
                onSettingsClick={() => cs.setSelected({ type: "frame", id: frame.id })}
              />
            ))}

            {/* Cast nodes */}
            {cs.castNodes.map((node) => {
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
                  onMouseDown={(e) => cs.startDrag(e, node)}
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
            })}

            {/* Location nodes */}
            {cs.locationNodes.map((node) => {
              const shotCount = cs.frames.filter((f) => f.location === node.locationName).length;
              return (
                <LocationNodeCard
                  key={node.id}
                  node={node}
                  isSelected={cs.selected?.id === node.id}
                  shotCount={shotCount}
                  onMouseDown={(e) => cs.startDrag(e, node)}
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
                        description: `"${node.locationName}" is used in ${shotCount} shot${shotCount > 1 ? "s" : ""}. Deleting this node will remove the location reference from all connected shots.`,
                        onConfirm: doDelete,
                      });
                    } else {
                      setPendingDelete({
                        severity: "warning",
                        title: "Delete Location Node",
                        description: `Are you sure you want to delete "${node.locationName}" from the canvas?`,
                        onConfirm: doDelete,
                      });
                    }
                  }}
                />
              );
            })}

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
                if (pageViewZones.has(zoneId)) {
                  // Page view — render inside zone bounds
                  const b = cs.zoneBounds[zoneId];
                  if (b) {
                    elements.push(
                      <ScriptPageView
                        key={`page-${zoneId}`}
                        zoneId={zoneId}
                        nodes={nodes}
                        bounds={b}
                        onUpdateNode={(id, updates) => cs.setScriptNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)))}
                      />
                    );
                  }
                } else {
                  // Card view — render cards with scene numbers and connector arrows
                  nodes.forEach((node, idx) => {
                    elements.push(
                      <ScriptNodeCard
                        key={node.id}
                        node={node}
                        sceneNumber={idx + 1}
                        isSelected={cs.selected?.id === node.id}
                        onMouseDown={(e) => cs.startDrag(e, node)}
                        onSettingsClick={() => cs.setSelected({ type: "script", id: node.id })}
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
                    );
                  });

                  // Connector arrows between ordered script cards
                  if (nodes.length > 1) {
                    const CARD_H = 80; // approximate card height for connector midpoint
                    for (let i = 0; i < nodes.length - 1; i++) {
                      const from = nodes[i];
                      const to = nodes[i + 1];
                      const x1 = from.x + SCRIPT_W;
                      const y1 = from.y + CARD_H / 2;
                      const x2 = to.x;
                      const y2 = to.y + CARD_H / 2;
                      const midX = (x1 + x2) / 2;
                      elements.push(
                        <svg
                          key={`sc-arrow-${from.id}-${to.id}`}
                          className="absolute top-0 left-0 pointer-events-none"
                          style={{ overflow: "visible" }}
                          width="1"
                          height="1"
                        >
                          <path
                            d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                            fill="none"
                            stroke="hsl(var(--purple-500, 168 85% 57%))"
                            className="stroke-purple-500/60"
                            strokeWidth="2"
                            strokeDasharray="6 4"
                          />
                          <circle cx={x2} cy={y2} r="4" className="fill-purple-500/80" />
                        </svg>
                      );
                    }
                  }
                }
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
              onSelect={(actor) => {
                cs.setCastNodes((prev) => [...prev, {
                  id: `cn-${Date.now()}`,
                  actorId: actor.id,
                  x: cs.castPickerPos!.worldX - CAST_W / 2,
                  y: cs.castPickerPos!.worldY,
                  zoneId: cs.castPickerPos!.zoneId,
                }]);
                cs.setCastPickerPos(null);
              }}
              onClose={() => cs.setCastPickerPos(null)}
            />
          )}
          {cs.locationPickerPos && (
            <LocationPicker
              position={cs.locationPickerPos}
              onSelect={(name) => {
                cs.setLocationNodes((prev) => [...prev, {
                  id: `ln-${Date.now()}`,
                  locationName: name,
                  x: cs.locationPickerPos!.worldX - LOC_W / 2,
                  y: cs.locationPickerPos!.worldY,
                  zoneId: cs.locationPickerPos!.zoneId,
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

export default function ProductionCanvasPage() {
  return (
    <CanvasErrorBoundary fallbackTitle="Canvas crashed">
      <ProductionCanvasPageInner />
    </CanvasErrorBoundary>
  );
}
