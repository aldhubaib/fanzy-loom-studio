import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Share2, Activity, X, Send, Copy, Check, Link2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  mockCollabUsers, mockComments, mockActivity,
  type CollabUser, type Comment, type ActivityItem,
} from "../data/mockCollab";

function UserInitials({ name, color, size = "sm" }: { name: string; color: string; size?: "sm" | "md" }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  const s = size === "sm" ? "w-7 h-7 text-[10px]" : "w-8 h-8 text-xs";
  return (
    <div
      className={cn("rounded-full flex items-center justify-center font-semibold text-white shrink-0", s)}
      style={{ backgroundColor: color }}
      title={name}
    >
      {initials}
    </div>
  );
}

// ─── Presence Avatars ──────────────────────────────────────
export const CollabPresence = memo(function CollabPresence({
  onOpenComments,
  onOpenActivity,
  onOpenShare,
}: {
  onOpenComments: () => void;
  onOpenActivity: () => void;
  onOpenShare: () => void;
}) {
  const onlineUsers = mockCollabUsers.filter((u) => u.online);
  const offlineCount = mockCollabUsers.length - onlineUsers.length;

  return (
    <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
      {/* Action buttons */}
      <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-card/90 backdrop-blur-md border border-border shadow-lg">
        <button
          onClick={onOpenComments}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors relative"
          title="Comments"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center">
            {mockComments.length}
          </span>
        </button>
        <button
          onClick={onOpenActivity}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          title="Activity"
        >
          <Activity className="w-4 h-4" />
        </button>
        <button
          onClick={onOpenShare}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          title="Share"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* User avatars */}
      <div className="flex items-center px-2 py-1.5 rounded-xl bg-card/90 backdrop-blur-md border border-border shadow-lg">
        <div className="flex -space-x-2">
          {onlineUsers.map((u) => (
            <div key={u.id} className="relative">
              <UserInitials name={u.name} color={u.color} />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>
          ))}
        </div>
        {offlineCount > 0 && (
          <span className="ml-2 text-[10px] text-muted-foreground font-medium">+{offlineCount}</span>
        )}
      </div>
    </div>
  );
});

// ─── Comments Panel ────────────────────────────────────────
export const CommentsPanel = memo(function CommentsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [newComment, setNewComment] = useState("");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="absolute top-16 right-3 z-40 w-80 max-h-[70vh] rounded-xl bg-card/95 backdrop-blur-md border border-border shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Comments</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{mockComments.length}</span>
            </div>
            <button onClick={onClose} className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {mockComments.map((c) => (
              <div key={c.id} className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <UserInitials name={c.userName} color={c.userColor} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{c.userName}</span>
                      <span className="text-[10px] text-muted-foreground">{c.timestamp}</span>
                    </div>
                    {c.elementLabel && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground inline-block mt-0.5 mb-1">
                        📌 {c.elementLabel}
                      </span>
                    )}
                    <p className="text-xs text-foreground/80 leading-relaxed">{c.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="min-h-[36px] max-h-[80px] text-xs resize-none flex-1"
              />
              <Button
                size="sm"
                className="shrink-0 h-9 w-9 p-0"
                onClick={() => {
                  if (newComment.trim()) {
                    toast.success("Comment added");
                    setNewComment("");
                  }
                }}
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// ─── Activity Feed ─────────────────────────────────────────
export const ActivityFeed = memo(function ActivityFeed({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="absolute top-16 right-3 z-40 w-72 max-h-[60vh] rounded-xl bg-card/95 backdrop-blur-md border border-border shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Activity</h3>
            </div>
            <button onClick={onClose} className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {mockActivity.map((a) => (
              <div key={a.id} className="flex items-start gap-2">
                <UserInitials name={a.userName} color={a.userColor} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    <span className="font-semibold text-foreground">{a.userName}</span>{" "}
                    {a.action}
                  </p>
                  <span className="text-[10px] text-muted-foreground">{a.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// ─── Share Dialog ──────────────────────────────────────────
export const ShareDialog = memo(function ShareDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const mockLink = "https://fanzy.app/invite/abc123xyz";

  const copyLink = () => {
    navigator.clipboard.writeText(mockLink).catch(() => {});
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">Share Canvas</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Link */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Invite Link</label>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground truncate">
                <Link2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{mockLink}</span>
              </div>
              <Button size="sm" variant="outline" onClick={copyLink} className="shrink-0">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>

          {/* Permission */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Anyone with the link can</label>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary border border-border text-xs">
              <span className="text-foreground">Edit</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </div>

          <Separator />

          {/* Members */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground font-medium">Members ({mockCollabUsers.length})</label>
            <div className="space-y-2">
              {mockCollabUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-2">
                  <UserInitials name={u.name} color={u.color} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{u.name}</p>
                  </div>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                    u.online ? "bg-emerald-500/10 text-emerald-500" : "bg-secondary text-muted-foreground"
                  )}>
                    {u.online ? "Online" : "Offline"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
