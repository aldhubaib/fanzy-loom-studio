import { Actor } from "../types";

export interface CollabUser {
  id: string;
  name: string;
  avatar: string;
  color: string;
  online: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userColor: string;
  text: string;
  timestamp: string;
  elementId?: string;
  elementLabel?: string;
}

export interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userColor: string;
  action: string;
  timestamp: string;
}

export const mockCollabUsers: CollabUser[] = [
  { id: "u1", name: "Jane Director", avatar: "", color: "hsl(35 90% 55%)", online: true },
  { id: "u2", name: "Alex DP", avatar: "", color: "hsl(200 80% 55%)", online: true },
  { id: "u3", name: "Sam Writer", avatar: "", color: "hsl(140 70% 45%)", online: true },
  { id: "u4", name: "Mia Editor", avatar: "", color: "hsl(280 70% 55%)", online: false },
  { id: "u5", name: "Leo VFX", avatar: "", color: "hsl(350 75% 55%)", online: false },
];

export const mockComments: Comment[] = [
  { id: "c1", userId: "u2", userName: "Alex DP", userAvatar: "", userColor: "hsl(200 80% 55%)", text: "The lighting in SC 1 needs to be more dramatic — think hard shadows from the desk lamp.", timestamp: "2 min ago", elementId: "f1", elementLabel: "SC 1 — Wide" },
  { id: "c2", userId: "u3", userName: "Sam Writer", userAvatar: "", userColor: "hsl(140 70% 45%)", text: "I've updated the script for the alley scene. Vivian's entrance should feel more mysterious.", timestamp: "15 min ago", elementId: "f2", elementLabel: "SC 2 — Med" },
  { id: "c3", userId: "u1", userName: "Jane Director", userAvatar: "", userColor: "hsl(35 90% 55%)", text: "Love the bridge composition! Let's keep the fog heavy in this one.", timestamp: "1 hr ago", elementId: "f5", elementLabel: "SC 5 — Wide" },
  { id: "c4", userId: "u4", userName: "Mia Editor", userAvatar: "", userColor: "hsl(280 70% 55%)", text: "The pacing between SC 3 and SC 4 feels too fast. Consider a 1s transition.", timestamp: "3 hr ago" },
];

export const mockActivity: ActivityItem[] = [
  { id: "a1", userId: "u2", userName: "Alex DP", userAvatar: "", userColor: "hsl(200 80% 55%)", action: "updated shot type on SC 4 to Close-Up", timestamp: "Just now" },
  { id: "a2", userId: "u1", userName: "Jane Director", userAvatar: "", userColor: "hsl(35 90% 55%)", action: "added a new shot SC 7", timestamp: "5 min ago" },
  { id: "a3", userId: "u3", userName: "Sam Writer", userAvatar: "", userColor: "hsl(140 70% 45%)", action: "commented on SC 2", timestamp: "15 min ago" },
  { id: "a4", userId: "u2", userName: "Alex DP", userAvatar: "", userColor: "hsl(200 80% 55%)", action: "changed location on SC 6 to Warehouse", timestamp: "30 min ago" },
  { id: "a5", userId: "u4", userName: "Mia Editor", userAvatar: "", userColor: "hsl(280 70% 55%)", action: "left a note about pacing", timestamp: "3 hr ago" },
  { id: "a6", userId: "u1", userName: "Jane Director", userAvatar: "", userColor: "hsl(35 90% 55%)", action: "connected Eddie to SC 3", timestamp: "4 hr ago" },
];
