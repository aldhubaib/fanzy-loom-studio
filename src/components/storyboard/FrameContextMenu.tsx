import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ArrowLeft, ArrowRight, Copy, Trash2, ArrowUpToLine, ArrowDownToLine } from "lucide-react";

interface FrameContextMenuProps {
  children: React.ReactNode;
  frameIndex: number;
  totalFrames: number;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveToStart: () => void;
  onMoveToEnd: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function FrameContextMenu({
  children,
  frameIndex,
  totalFrames,
  onMoveLeft,
  onMoveRight,
  onMoveToStart,
  onMoveToEnd,
  onDuplicate,
  onDelete,
}: FrameContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={onMoveLeft} disabled={frameIndex === 0}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Move Left
        </ContextMenuItem>
        <ContextMenuItem onClick={onMoveRight} disabled={frameIndex === totalFrames - 1}>
          <ArrowRight className="w-4 h-4 mr-2" />
          Move Right
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onMoveToStart} disabled={frameIndex === 0}>
          <ArrowUpToLine className="w-4 h-4 mr-2" />
          Move to Start
        </ContextMenuItem>
        <ContextMenuItem onClick={onMoveToEnd} disabled={frameIndex === totalFrames - 1}>
          <ArrowDownToLine className="w-4 h-4 mr-2" />
          Move to End
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onDuplicate}>
          <Copy className="w-4 h-4 mr-2" />
          Duplicate
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Frame
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
