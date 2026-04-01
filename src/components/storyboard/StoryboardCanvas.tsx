import React, { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

import type { FrameData, CastNode, LocationNode } from "./types";
import {
  FRAME_W, FRAME_H_BASE, CAST_W, LOC_W, GRID_COLS, GAP_X, GAP_Y,
  locationImages, actorRoster, initialFrames,
} from "./constants";
import { useCanvasInteractions } from "./hooks/useCanvasInteractions";
import { useConnections } from "./hooks/useConnections";

import { CanvasToolbar } from "./CanvasToolbar";
import { CanvasContextMenu } from "./CanvasContextMenu";
import { CastPickerMenu, LocationPickerMenu } from "./PickerMenu";
import { ConnectorsSvg } from "./ConnectorsSvg";
import { FrameCard } from "./FrameCard";
import { CastNodeCard } from "./CastNodeCard";
import { LocationNodeCard } from "./LocationNodeCard";
import { Minimap } from "./Minimap";
import { LightboxGallery, LocationGalleryOverlay } from "./LightboxGallery";
import { FrameContextMenu } from "./FrameContextMenu";
import { FrameSettingsPanel } from "./FrameSettingsPanel";

export function StoryboardCanvas() {
  const frameRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [frames, setFrames] = useState<FrameData[]>(initialFrames);
  const [castNodes, setCastNodes] = useState<CastNode[]>([]);
  const [locationNodes, setLocationNodes] = useState<LocationNode[]>([]);
  const [frameHeights, setFrameHeights] = useState<Record<string, number>>({});
  const [showLocations, setShowLocations] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState<string | null>(null);
  const [settingsFrame, setSettingsFrame] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ frameId: string; index: number } | null>(null);
  const [locationGallery, setLocationGallery] = useState<{ frameId: string; index: number } | null>(null);
  const [canvasMenu, setCanvasMenu] = useState<{ x: number; y: number; worldX: number; worldY: number } | null>(null);
  const [castPickerPos, setCastPickerPos] = useState<{ x: number; y: number; worldX: number; worldY: number } | null>(null);
  const [locationPickerPos, setLocationPickerPos] = useState<{ x: number; y: number; worldX: number; worldY: number } | null>(null);

  const canvas = useCanvasInteractions({
    frames, setFrames, castNodes, setCastNodes, locationNodes, setLocationNodes,
  });

  const conns = useConnections({
    frames, castNodes, locationNodes,
    pan: canvas.pan, zoom: canvas.zoom, containerRef: canvas.containerRef,
  });

  // Frame CRUD
  const addFrame = useCallback((worldX?: number, worldY?: number) => {
    const newId = `f${Date.now()}`;
    const lastFrame = frames[frames.length - 1];
    setFrames(prev => [...prev, {
      id: newId,
      x: worldX ?? (lastFrame ? lastFrame.x + GAP_X : 80),
      y: worldY ?? (lastFrame ? lastFrame.y : 80),
      image: "", scene: `SC ${Math.ceil((frames.length + 1) / 2)}`, shot: "WIDE",
      description: "New frame — click to edit", duration: "3s", actors: [],
      generatedImages: [], selectedImageId: null,
    }]);
    canvas.setSelectedFrame(newId);
  }, [frames, canvas.setSelectedFrame]);

  const moveFrame = useCallback((fromIdx: number, toIdx: number) => {
    setFrames(prev => {
      const arr = [...prev];
      const [removed] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, removed);
      return arr.map((f, i) => ({ ...f, x: 80 + (i % GRID_COLS) * GAP_X, y: 80 + Math.floor(i / GRID_COLS) * GAP_Y }));
    });
  }, []);

  const duplicateFrame = useCallback((idx: number) => {
    setFrames(prev => {
      const dup = { ...prev[idx], id: `f${Date.now()}` };
      const arr = [...prev];
      arr.splice(idx + 1, 0, dup);
      return arr.map((f, i) => ({ ...f, x: 80 + (i % GRID_COLS) * GAP_X, y: 80 + Math.floor(i / GRID_COLS) * GAP_Y }));
    });
  }, []);

  const deleteFrame = useCallback((idx: number) => {
    const deletedId = frames[idx]?.id;
    setFrames(prev => prev.filter((_, i) => i !== idx));
    if (deletedId) conns.removeConnectionsForNode(deletedId);
    canvas.setSelectedFrame(null);
  }, [frames, conns.removeConnectionsForNode, canvas.setSelectedFrame]);

  // Fit on mount
  useEffect(() => {
    const t = setTimeout(() => canvas.fitToScreen(frameHeights), 100);
    return () => clearTimeout(t);
  }, []);

  // Measure frame heights
  useEffect(() => {
    const observers: ResizeObserver[] = [];
    const nextHeights: Record<string, number> = {};
    frames.forEach(frame => {
      const el = frameRefs.current[frame.id];
      if (!el) return;
      nextHeights[frame.id] = el.offsetHeight;
      const ro = new ResizeObserver(entries => {
        const h = entries[0]?.contentRect.height;
        if (h) setFrameHeights(prev => (prev[frame.id] === h ? prev : { ...prev, [frame.id]: h }));
      });
      ro.observe(el);
      observers.push(ro);
    });
    setFrameHeights(prev => ({ ...prev, ...nextHeights }));
    return () => observers.forEach(o => o.disconnect());
  }, [frames, conns.connections]);

  // Scene numbering
  const sorted = [...frames].sort((a, b) => {
    const rowA = Math.round(a.y / 200);
    const rowB = Math.round(b.y / 200);
    return rowA !== rowB ? rowA - rowB : a.x - b.x;
  });
  const orderMap = new Map(sorted.map((f, i) => [f.id, i + 1]));

  return (
    <div className="h-full w-full relative bg-background overflow-hidden">
      <CanvasToolbar
        tool={canvas.tool}
        showLocations={showLocations}
        onSetTool={canvas.setTool}
        onAddFrame={() => addFrame()}
        onAutoLayout={canvas.autoLayout}
        onFitToScreen={() => canvas.fitToScreen(frameHeights)}
        onToggleLocations={() => setShowLocations(v => !v)}
      />

      {/* Canvas */}
      <div
        ref={canvas.containerRef}
        className={cn(
          "absolute inset-0",
          canvas.tool === "hand" || canvas.panning ? "cursor-grab" : "cursor-default",
          canvas.panning && "cursor-grabbing",
        )}
        onContextMenu={(e) => {
          e.preventDefault();
          if ((e.target as HTMLElement).closest('[data-frame]')) return;
          const rect = canvas.containerRef.current?.getBoundingClientRect();
          if (!rect) return;
          const worldX = (e.clientX - rect.left - canvas.pan.x) / canvas.zoom;
          const worldY = (e.clientY - rect.top - canvas.pan.y) / canvas.zoom;
          setCanvasMenu({ x: e.clientX - rect.left, y: e.clientY - rect.top, worldX, worldY });
        }}
        onWheel={canvas.handleWheel}
        onMouseDown={(e) => {
          setCanvasMenu(null);
          setCastPickerPos(null);
          setLocationPickerPos(null);
          canvas.handleMouseDown(e);
        }}
        onMouseMove={(e) => {
          canvas.handleMouseMove(e);
          conns.updateConnectingMouse(e);
        }}
        onMouseUp={canvas.handleMouseUp}
        onMouseLeave={canvas.handleMouseUp}
      >
        {/* Grid background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--foreground) / 0.15) 1px, transparent 1px)`,
            backgroundSize: `${32 * canvas.zoom}px ${32 * canvas.zoom}px`,
            backgroundPosition: `${canvas.pan.x % (32 * canvas.zoom)}px ${canvas.pan.y % (32 * canvas.zoom)}px`,
          }}
        />

        {/* Transform layer */}
        <div style={{ transform: `translate(${canvas.pan.x}px, ${canvas.pan.y}px) scale(${canvas.zoom})`, transformOrigin: "0 0" }}>
          <ConnectorsSvg
            connectors={conns.connectors}
            connectingFrom={conns.connectingFrom}
            connectingFromPos={conns.connectingFrom ? conns.getPortPos(conns.connectingFrom, "right") : null}
            connectingMouse={conns.connectingMouse}
            onDeleteConnection={conns.deleteConnection}
          />

          {/* Frame cards */}
          {frames.map((frame, idx) => {
            const sceneNumber = orderMap.get(frame.id) ?? idx + 1;
            return (
              <FrameContextMenu
                key={frame.id}
                frameIndex={idx}
                totalFrames={frames.length}
                onMoveLeft={() => moveFrame(idx, idx - 1)}
                onMoveRight={() => moveFrame(idx, idx + 1)}
                onMoveToStart={() => moveFrame(idx, 0)}
                onMoveToEnd={() => moveFrame(idx, frames.length - 1)}
                onDuplicate={() => duplicateFrame(idx)}
                onDelete={() => deleteFrame(idx)}
              >
                <FrameCard
                  frame={frame}
                  idx={idx}
                  sceneNumber={sceneNumber}
                  actorRoster={actorRoster}
                  connections={conns.connections}
                  frames={frames}
                  selectedFrame={canvas.selectedFrame}
                  dragging={canvas.dragging}
                  showLocations={showLocations}
                  galleryOpen={galleryOpen}
                  frameRef={(el) => { frameRefs.current[frame.id] = el; }}
                  onMouseDown={(e) => canvas.startFrameDrag(e, frame)}
                  onPortLeftMouseUp={(e) => { e.stopPropagation(); conns.endConnect(frame.id); }}
                  onPortRightMouseDown={(e) => { e.stopPropagation(); conns.startConnect(e, frame.id); }}
                  onSettingsClick={() => setSettingsFrame(frame.id)}
                  onGalleryToggle={() => setGalleryOpen(galleryOpen === frame.id ? null : frame.id)}
                  onSelectImage={(imgId, src, desc, actors) => {
                    setFrames(prev => prev.map(f =>
                      f.id === frame.id ? { ...f, image: src, description: desc, actors, selectedImageId: imgId } : f
                    ));
                  }}
                  onLightboxOpen={(index) => setLightbox({ frameId: frame.id, index })}
                  onLocationGalleryOpen={(index) => setLocationGallery({ frameId: frame.id, index })}
                  onDeleteConnection={conns.deleteConnection}
                />
              </FrameContextMenu>
            );
          })}

          {/* Cast nodes */}
          {castNodes.map(node => {
            const actor = actorRoster.find(a => a.id === node.actorId);
            if (!actor) return null;
            return (
              <CastNodeCard
                key={node.id}
                node={node}
                actor={actor}
                sceneCount={frames.filter(f => f.actors.includes(node.actorId)).length}
                isSelected={canvas.selectedFrame === node.id}
                onMouseDown={(e) => canvas.startNodeDrag(e, node)}
                onPortRightMouseDown={(e) => { e.stopPropagation(); conns.startConnect(e, node.id); }}
                onPortLeftMouseUp={(e) => { e.stopPropagation(); conns.endConnect(node.id); }}
                onDelete={() => {
                  setCastNodes(prev => prev.filter(n => n.id !== node.id));
                  conns.removeConnectionsForNode(node.id);
                }}
              />
            );
          })}

          {/* Location nodes */}
          {locationNodes.map(node => {
            const img = locationImages[node.locationName];
            if (!img) return null;
            return (
              <LocationNodeCard
                key={node.id}
                node={node}
                image={img}
                sceneCount={frames.filter(f => f.location === node.locationName).length}
                isSelected={canvas.selectedFrame === node.id}
                onMouseDown={(e) => canvas.startNodeDrag(e, node)}
                onPortRightMouseDown={(e) => { e.stopPropagation(); conns.startConnect(e, node.id); }}
                onPortLeftMouseUp={(e) => { e.stopPropagation(); conns.endConnect(node.id); }}
                onDelete={() => {
                  setLocationNodes(prev => prev.filter(n => n.id !== node.id));
                  conns.removeConnectionsForNode(node.id);
                }}
              />
            );
          })}
        </div>

        {/* Context menu */}
        {canvasMenu && (
          <CanvasContextMenu
            position={canvasMenu}
            onAddFrame={() => { addFrame(canvasMenu.worldX, canvasMenu.worldY); setCanvasMenu(null); }}
            onAddCast={() => { setCastPickerPos(canvasMenu); setCanvasMenu(null); }}
            onAddLocation={() => { setLocationPickerPos(canvasMenu); setCanvasMenu(null); }}
            onAutoLayout={() => { canvas.autoLayout(); setCanvasMenu(null); }}
            onFitToScreen={() => { canvas.fitToScreen(frameHeights); setCanvasMenu(null); }}
            onSelectAll={() => { canvas.setSelectedFrame(null); setCanvasMenu(null); }}
            onClose={() => setCanvasMenu(null)}
          />
        )}

        {/* Pickers */}
        {castPickerPos && (
          <CastPickerMenu
            position={castPickerPos}
            actors={actorRoster}
            onSelect={(actor) => {
              setCastNodes(prev => [...prev, { id: `cast-${Date.now()}`, actorId: actor.id, x: castPickerPos.worldX - CAST_W / 2, y: castPickerPos.worldY }]);
              setCastPickerPos(null);
            }}
            onClose={() => setCastPickerPos(null)}
          />
        )}
        {locationPickerPos && (
          <LocationPickerMenu
            position={locationPickerPos}
            locations={locationImages}
            onSelect={(name) => {
              setLocationNodes(prev => [...prev, { id: `loc-${Date.now()}`, locationName: name, x: locationPickerPos.worldX - LOC_W / 2, y: locationPickerPos.worldY }]);
              setLocationPickerPos(null);
            }}
            onClose={() => setLocationPickerPos(null)}
          />
        )}

        {/* Minimap */}
        <Minimap
          frames={frames}
          castNodes={castNodes}
          locationNodes={locationNodes}
          selectedFrame={canvas.selectedFrame}
          pan={canvas.pan}
          zoom={canvas.zoom}
          containerWidth={canvas.containerRef.current?.clientWidth ?? 0}
          containerHeight={canvas.containerRef.current?.clientHeight ?? 0}
        />
      </div>

      {/* Settings panel */}
      {settingsFrame && (() => {
        const frame = frames.find(f => f.id === settingsFrame);
        if (!frame) return null;
        const sceneNum = sorted.findIndex(f => f.id === settingsFrame) + 1;
        return (
          <FrameSettingsPanel
            frame={frame}
            sceneNumber={sceneNum}
            actorRoster={actorRoster}
            onUpdate={(updated) => setFrames(prev => prev.map(f => f.id === updated.id ? updated : f))}
            onClose={() => setSettingsFrame(null)}
          />
        );
      })()}

      {/* Lightbox */}
      {lightbox && (() => {
        const frame = frames.find(f => f.id === lightbox.frameId);
        if (!frame || frame.generatedImages.length === 0) return null;
        return (
          <LightboxGallery
            frame={frame}
            index={lightbox.index}
            onClose={() => setLightbox(null)}
            onNavigate={(i) => setLightbox({ ...lightbox, index: i })}
            onSelectImage={(imgId, src, desc, actors) => {
              setFrames(prev => prev.map(f =>
                f.id === lightbox.frameId ? { ...f, image: src, description: desc, actors, selectedImageId: imgId } : f
              ));
            }}
          />
        );
      })()}

      {/* Location gallery */}
      {locationGallery && (() => {
        const frame = frames.find(f => f.id === locationGallery.frameId);
        if (!frame) return null;
        return (
          <LocationGalleryOverlay
            frame={frame}
            index={locationGallery.index}
            onClose={() => setLocationGallery(null)}
            onNavigate={(i) => setLocationGallery({ ...locationGallery, index: i })}
            onSelectLocation={(name) => {
              setFrames(prev => prev.map(f => f.id === locationGallery.frameId ? { ...f, location: name } : f));
            }}
          />
        );
      })()}
    </div>
  );
}
