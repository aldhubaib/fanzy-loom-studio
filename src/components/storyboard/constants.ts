import actorMarlowe from "@/assets/actors/marlowe.png";
import actorVivian from "@/assets/actors/vivian.png";
import actorEddie from "@/assets/actors/eddie.png";

import locOffice from "@/assets/locations/office.jpg";
import locStreet from "@/assets/locations/street.jpg";
import locJazzClub from "@/assets/locations/jazz-club.jpg";
import locBridge from "@/assets/locations/bridge.jpg";

import frame1 from "@/assets/storyboard/frame-1.jpg";
import frame2 from "@/assets/storyboard/frame-2.jpg";
import frame3 from "@/assets/storyboard/frame-3.jpg";
import frame4 from "@/assets/storyboard/frame-4.jpg";
import frame5 from "@/assets/storyboard/frame-5.jpg";
import frame6 from "@/assets/storyboard/frame-6.jpg";

import type { Actor, FrameData, Connection } from "./types";

// Dimensions
export const FRAME_W = 280;
export const CAST_W = 180;
export const CAST_H = 240;
export const LOC_W = 200;
export const LOC_H = 160;

// Aspect ratios
export const ASPECT_RATIOS: Record<string, number> = {
  "16:9": Math.round(FRAME_W * 9 / 16),
  "2.39:1": Math.round(FRAME_W / 2.39),
  "1.85:1": Math.round(FRAME_W / 1.85),
  "4:3": Math.round(FRAME_W * 3 / 4),
  "9:16": Math.round(FRAME_W * 16 / 9),
  "1:1": FRAME_W,
};

export const CURRENT_ASPECT = "16:9";
export const IMAGE_H = ASPECT_RATIOS[CURRENT_ASPECT] ?? 158;
export const FRAME_H_BASE = IMAGE_H + 80;
export const PORT_Y = FRAME_H_BASE / 2;

// Layout
export const GRID_COLS = 3;
export const GAP_X = 340;
export const GAP_Y = 280;

// Location images
export const locationImages: Record<string, string> = {
  "Office": locOffice,
  "Street": locStreet,
  "Jazz Club": locJazzClub,
  "Bridge": locBridge,
};

// Shot descriptions
export const shotDescriptions: Record<string, string> = {
  "WIDE": "Wide Shot (WS) — Shows the full scene and environment, establishing location and context.",
  "MED": "Medium Shot (MS) — Frames the subject from the waist up, balancing character and environment.",
  "CU": "Close-Up (CU) — Tightly frames the subject's face or a detail, emphasizing emotion or importance.",
  "ECU": "Extreme Close-Up (ECU) — Focuses on a very small detail like eyes or an object.",
  "OTS": "Over-the-Shoulder (OTS) — Shot from behind one character looking at another, common in dialogue.",
  "POV": "Point of View (POV) — Shows the scene from a character's perspective.",
  "DYNAMIC": "Dynamic Shot — A moving camera shot (tracking, dolly, crane) adding energy and motion.",
  "LOW": "Low Angle — Camera looks up at the subject, conveying power or dominance.",
  "HIGH": "High Angle — Camera looks down at the subject, conveying vulnerability.",
  "AERIAL": "Aerial Shot — Captured from above, often via drone, showing a bird's-eye view.",
};

// Actor roster
export const actorRoster: Actor[] = [
  { id: "a1", name: "Marlowe", avatar: actorMarlowe },
  { id: "a2", name: "Vivian", avatar: actorVivian },
  { id: "a3", name: "Eddie", avatar: actorEddie },
];

// Initial data
export const initialFrames: FrameData[] = [
  {
    id: "f1", x: 80, y: 80, image: frame1, scene: "SC 1", shot: "WIDE",
    description: "Marlowe sits at his desk, smoke curling from a cigarette.", duration: "4s", actors: ["a1"], location: "Office",
    generatedImages: [
      { id: "g1a", src: frame1, description: "Marlowe at desk — wide establishing", actors: ["a1"] },
      { id: "g1b", src: frame4, description: "Marlowe at desk — close-up on face", actors: ["a1"] },
      { id: "g1c", src: frame5, description: "Marlowe and Vivian at desk — alternate", actors: ["a1", "a2"] },
      { id: "g1d", src: frame2, description: "Marlowe at desk — noir lighting", actors: ["a1"] },
      { id: "g1e", src: frame3, description: "Marlowe at desk — jazz club angle", actors: ["a1", "a3"] },
      { id: "g1f", src: frame6, description: "Marlowe at desk — dramatic low angle", actors: ["a1"] },
      { id: "g1g", src: frame5, description: "Marlowe at desk — silhouette", actors: ["a1"] },
      { id: "g1h", src: frame4, description: "Marlowe at desk — overhead shot", actors: ["a1"] },
      { id: "g1i", src: frame3, description: "Marlowe and Eddie at desk", actors: ["a1", "a3"] },
    ],
    selectedImageId: "g1a",
  },
  {
    id: "f2", x: 420, y: 80, image: frame2, scene: "SC 1", shot: "MED",
    description: "Vivian appears in the rain-soaked alley.", duration: "3s", actors: ["a2"],
    generatedImages: [
      { id: "g2a", src: frame2, description: "Vivian in alley — medium shot", actors: ["a2"] },
      { id: "g2b", src: frame3, description: "Vivian enters the jazz club", actors: ["a2", "a3"] },
    ],
    selectedImageId: "g2a",
  },
  {
    id: "f3", x: 760, y: 80, image: frame3, scene: "SC 2", shot: "WIDE",
    description: "The Blue Note Jazz Club — establishing shot.", duration: "5s", actors: ["a3"], location: "Jazz Club",
    generatedImages: [], selectedImageId: null,
  },
  {
    id: "f4", x: 80, y: 360, image: frame4, scene: "SC 2", shot: "CU",
    description: "Marlowe examines a photograph under his desk lamp.", duration: "3s", actors: ["a1"], location: "Office",
    generatedImages: [
      { id: "g4a", src: frame4, description: "Marlowe with photo — close-up", actors: ["a1"] },
      { id: "g4b", src: frame1, description: "Marlowe with photo — wide shot", actors: ["a1"] },
      { id: "g4c", src: frame6, description: "Marlowe hands photo to Eddie", actors: ["a1", "a3"] },
      { id: "g4d", src: frame2, description: "Vivian looks at the photo", actors: ["a2"] },
      { id: "g4e", src: frame3, description: "Photo on desk — overhead angle", actors: ["a1"] },
      { id: "g4f", src: frame5, description: "Marlowe studying photo — silhouette", actors: ["a1"] },
      { id: "g4g", src: frame1, description: "Marlowe burns the photo", actors: ["a1"] },
      { id: "g4h", src: frame6, description: "Eddie grabs the photo", actors: ["a3"] },
      { id: "g4i", src: frame2, description: "Vivian and Marlowe argue over photo", actors: ["a1", "a2"] },
      { id: "g4j", src: frame5, description: "Photo falls to the floor — low angle", actors: ["a1"] },
    ],
    selectedImageId: "g4a",
  },
  {
    id: "f5", x: 420, y: 360, image: frame5, scene: "SC 3", shot: "WIDE",
    description: "Two silhouettes meet on the foggy bridge.", duration: "6s", actors: ["a1", "a2"], location: "Bridge",
    generatedImages: [
      { id: "g5a", src: frame5, description: "Two silhouettes on bridge — wide", actors: ["a1", "a2"] },
      { id: "g5b", src: frame1, description: "Marlowe alone on bridge", actors: ["a1"] },
      { id: "g5c", src: frame2, description: "Vivian alone on bridge", actors: ["a2"] },
      { id: "g5d", src: frame3, description: "Eddie watches from below", actors: ["a3"] },
      { id: "g5e", src: frame6, description: "All three meet on bridge", actors: ["a1", "a2", "a3"] },
      { id: "g5f", src: frame4, description: "Bridge from above — aerial", actors: ["a1", "a2"] },
    ],
    selectedImageId: "g5a",
  },
  {
    id: "f6", x: 760, y: 360, image: frame6, scene: "SC 3", shot: "DYNAMIC",
    description: "Car chase through wet city streets.", duration: "4s", actors: ["a1"], location: "Street",
    generatedImages: [], selectedImageId: null,
  },
];

export const initialConnections: Connection[] = [
  { from: "f1", to: "f2" },
  { from: "f2", to: "f3" },
  { from: "f3", to: "f4" },
  { from: "f4", to: "f5" },
  { from: "f5", to: "f6" },
];
