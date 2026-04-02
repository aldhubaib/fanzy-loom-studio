// ─── Production Canvas Page ─────────────────────────────────
// Composed from isolated sub-components. All constants, types,
// and logic are extracted — this file is purely composition.

import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { ZoneType, ScriptNode } from "./types";
import { GRID_SIZE, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP, CAST_W, LOC_W, SCRIPT_W, TIMELINE_W } from "./constants";
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

interface PendingDelete {
  severity: DeleteSeverity;
  title: string;
  description: string;
  onConfirm: () => void;
}

function ProductionCanvasPageInner() {
  const { projectId } = useParams();
  const cs = useCanvasState(projectId);

  // ── Derived values ────────────────────────────────────
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const showDrawer = !!cs.selected;

  const selectedFrame = cs.selected?.type === "frame"
    ? cs.frames.find((f) => f.id === cs.selected!.id)
    : null;

  const connectedActorsForFrame = selectedFrame
    ? cs.getConnectedActors(selectedFrame.zoneId)
    : [];

  // ── Callbacks ─────────────────────────────────────────
  const handleDeleteConnection = useCallback(
    (from: string, to: string) => {
      // Check if this is a zone-level connection (data flows through it)
      const isZoneConn = from.includes("::") || to.includes("::");
      const fromZone = cs.zones.find((z) => from.startsWith(z.id));
      const toZone = cs.zones.find((z) => to.startsWith(z.id));

      const doDelete = () => {
        cs.setConnections((prev) => prev.filter((c) => !(c.from === from && c.to === to)));
      };

      if (isZoneConn && fromZone && toZone) {
        setPendingDelete({
          severity: "destructive",
          title: "Delete Connection",
          description: `Disconnecting "${fromZone.label}" from "${toZone.label}" will break the data flow between these zones. All linked shots, actors, and locations will be unlinked.`,
          onConfirm: doDelete,
        });
      } else {
        doDelete();
      }
    },
    [cs.setConnections, cs.zones],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if ((e.target as HTMLElement).closest("[data-node]")) return;
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

            {/* Script nodes */}
            {cs.scriptNodes.map((node) => (
              <ScriptNodeCard
                key={node.id}
                node={node}
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
            ))}

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
                  cs.setScriptNodes((prev) => [...prev, {
                    id: `sn-${Date.now()}`,
                    heading: "INT. NEW LOCATION - DAY",
                    body: "Description of the scene...",
                    x: cs.canvasMenu!.worldX - SCRIPT_W / 2,
                    y: cs.canvasMenu!.worldY,
                    zoneId: zone.id,
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
                cs.setZones((prev) => prev.filter((z) => z.id !== zoneId));
                cs.setFrames((prev) => prev.filter((f) => f.zoneId !== zoneId));
                cs.setCastNodes((prev) => prev.filter((n) => n.zoneId !== zoneId));
                cs.setLocationNodes((prev) => prev.filter((n) => n.zoneId !== zoneId));
                cs.setScriptNodes((prev) => prev.filter((n) => n.zoneId !== zoneId));
                cs.setTimelineNodes((prev) => prev.filter((n) => n.zoneId !== zoneId));
                cs.setPreviewNodes((prev) => prev.filter((n) => n.zoneId !== zoneId));
                cs.setConnections((prev) => prev.filter((c) => !c.from.startsWith(zoneId) && !c.to.startsWith(zoneId)));
                if (cs.selected?.type === "zone" && cs.selected.id === zoneId) cs.setSelected(null);
                cs.setCanvasMenu(null);
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
          cs.setFrames((prev) => prev.filter((f) => f.id !== id));
          cs.setConnections((prev) => prev.filter((c) => c.from !== id && c.to !== id));
          cs.setSelected(null);
        }}
        onUpdateActor={(updated) => cs.setActors((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))}
        onDeleteCastNode={(actorId) => {
          cs.setCastNodes((prev) => prev.filter((n) => n.actorId !== actorId));
          cs.setSelected(null);
        }}
        onUpdateScriptNode={(id, updates) => cs.setScriptNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)))}
        onDeleteScriptNode={(id) => {
          cs.setScriptNodes((prev) => prev.filter((n) => n.id !== id));
          cs.setSelected(null);
        }}
        onDeleteConnection={handleDeleteConnection}
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
