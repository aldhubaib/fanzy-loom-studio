## Unified Production Canvas

### New Node Types
1. **Cast Card** — Actor portrait (like the Jack Marlowe reference), name, description, scene count badge, generated images count. Draggable on canvas.
2. **Location Card** — Location image, name. Draggable on canvas.
3. **Shot Frame** — Existing frame cards (unchanged).

### Canvas Menu Update
Add to the right-click context menu:
- **Add Cast Member** — opens a picker to choose from the actor roster, places a cast card at the click position
- **Add Location** — opens a picker to choose from available locations, places a location card at the click position

### Connections
- Cast cards can connect to Shot frames (showing which actor appears in which shot)
- Location cards can connect to Shot frames (showing where each shot takes place)
- Connection lines are color-coded: amber for shots, a different color for cast/location links

### Visual Design
- Cast cards: Portrait-heavy (like reference), ~200px wide, rounded corners, dark card style
- Location cards: Landscape image, ~200px wide, similar card style
- Both types are draggable, selectable, and deletable like shot frames

### Pipeline Impact
- Casting and Locations pages remain as dedicated editors
- The Shots canvas becomes the unified "production board" view
