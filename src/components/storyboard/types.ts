export interface FrameData {
  id: string;
  x: number;
  y: number;
  image: string;
  scene: string;
  shot: string;
  description: string;
  duration: string;
  actors: string[];
  generatedImages: GeneratedImage[];
  selectedImageId: string | null;
  location?: string;
  actorWardrobe?: Record<string, string>;
}

export interface GeneratedImage {
  id: string;
  src: string;
  description: string;
  actors: string[];
}

export interface Actor {
  id: string;
  name: string;
  avatar: string;
}

export interface CastNode {
  id: string;
  actorId: string;
  x: number;
  y: number;
}

export interface LocationNode {
  id: string;
  locationName: string;
  x: number;
  y: number;
}

export interface Connection {
  from: string;
  to: string;
}

export type Tool = "select" | "hand";
