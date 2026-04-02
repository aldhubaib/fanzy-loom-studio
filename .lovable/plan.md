
# Collaboration UI (Mock Data)

## 1. Live User Presence
- Floating avatar stack in the top-right area of the canvas (as a floating toolbar per memory rule)
- Show 3-4 mock users with colored rings indicating online status
- Tooltip on hover showing user name
- "+2 more" overflow indicator

## 2. Comments & Notes Panel
- Floating comment button in the toolbar
- Opens a slide-out panel with mock comments
- Each comment: user avatar, name, timestamp, text, and optional "pinned to element" tag
- Add comment input at bottom

## 3. Share Link Dialog
- Share button next to the presence avatars
- Dialog with a mock link and copy button
- Permission dropdown (View / Edit)
- Mock invited users list

## 4. Activity Feed
- Small floating panel (toggleable) showing recent actions
- "Jack added Shot SC 7", "Vivian commented on SC 3", etc.
- Timestamps and user avatars

All data is hardcoded mock — no backend needed. Components will be floating overlays (per project memory: no docked toolbars).
