import { useMemo } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FanzySidebar } from "@/components/FanzySidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Image, Film, Camera } from "lucide-react";
import { mockProjects } from "@/data/mockProjects";
import { motion } from "framer-motion";
import type { CanvasState, FrameData } from "@/features/production-canvas/types";

interface GalleryImage {
  src: string;
  scene: string;
  description: string;
  projects: { id: string; title: string }[];
  shotCount: number;
}

function loadAllImages(): GalleryImage[] {
  const imgMap = new Map<string, GalleryImage>();

  for (const project of mockProjects) {
    const key = `canvas-${project.id}`;
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const state: CanvasState = JSON.parse(raw);
      const { frames = [] } = state;

      for (const frame of frames) {
        // Collect all images: the main image + generated images
        const allImages = new Set<string>();
        if (frame.image) allImages.add(frame.image);
        if (frame.generatedImages) frame.generatedImages.forEach((img: string) => allImages.add(img));

        for (const src of allImages) {
          if (imgMap.has(src)) {
            const existing = imgMap.get(src)!;
            if (!existing.projects.find((p) => p.id === project.id)) {
              existing.projects.push({ id: project.id, title: project.title });
            }
            existing.shotCount += 1;
          } else {
            imgMap.set(src, {
              src,
              scene: frame.scene,
              description: frame.description,
              projects: [{ id: project.id, title: project.title }],
              shotCount: 1,
            });
          }
        }
      }
    } catch {
      // skip
    }
  }

  return Array.from(imgMap.values());
}

const GalleryPage = () => {
  const allImages = useMemo(() => loadAllImages(), []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <FanzySidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center px-4 border-b border-border bg-background/80 backdrop-blur-sm">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <nav className="flex items-center gap-1 text-sm ml-3">
              <span className="text-muted-foreground">Fanzy</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground font-medium">Gallery</span>
            </nav>
          </header>

          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Gallery</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {allImages.length} generated images across all projects
                </p>
              </div>

              {allImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <Image className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">No images yet</h2>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Images you generate in your project canvases will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {allImages.map((img, i) => (
                    <motion.div
                      key={`${img.src}-${i}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.04 }}
                      className="break-inside-avoid group rounded-lg border border-border bg-card overflow-hidden"
                    >
                      {/* Image */}
                      <div className="relative overflow-hidden">
                        <img
                          src={img.src}
                          alt={img.description}
                          className="w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-xs text-white line-clamp-2">{img.description}</p>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3 space-y-2">
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Film className="w-3 h-3" />
                            <span>{img.projects.length} {img.projects.length === 1 ? "project" : "projects"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            <span>{img.shotCount} {img.shotCount === 1 ? "shot" : "shots"}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {img.projects.map((p) => (
                            <span
                              key={p.id}
                              className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                            >
                              {p.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default GalleryPage;
