import { useMemo } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FanzySidebar } from "@/components/FanzySidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Users, Film, Camera } from "lucide-react";
import { mockProjects } from "@/data/mockProjects";
import { motion } from "framer-motion";
import type { Actor, FrameData } from "@/features/production-canvas/types";
import type { CanvasState } from "@/features/production-canvas/types";

interface CastWithStats extends Actor {
  projects: { id: string; title: string }[];
  totalShots: number;
}

function loadAllCast(): CastWithStats[] {
  const castMap = new Map<string, CastWithStats>();

  for (const project of mockProjects) {
    const key = `canvas-${project.id}`;
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const state: CanvasState = JSON.parse(raw);
      const { actors = [], frames = [] } = state;

      for (const actor of actors) {
        const shotCount = frames.filter((f: FrameData) => f.actors.includes(actor.id)).length;

        if (castMap.has(actor.id)) {
          const existing = castMap.get(actor.id)!;
          existing.projects.push({ id: project.id, title: project.title });
          existing.totalShots += shotCount;
        } else {
          castMap.set(actor.id, {
            ...actor,
            projects: [{ id: project.id, title: project.title }],
            totalShots: shotCount,
          });
        }
      }
    } catch {
      // skip corrupt data
    }
  }

  return Array.from(castMap.values());
}

const CastPage = () => {
  const allCast = useMemo(() => loadAllCast(), []);

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
              <span className="text-foreground font-medium">Cast</span>
            </nav>
          </header>

          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Cast Library</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {allCast.length} characters across all projects
                </p>
              </div>

              {allCast.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">No cast yet</h2>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Characters you create in your project canvases will appear here for easy reuse.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {allCast.map((actor, i) => (
                    <motion.div
                      key={actor.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                      className="group rounded-lg border border-border bg-card overflow-hidden"
                    >
                      {/* Portrait */}
                      <div className="relative aspect-[3/2] bg-secondary overflow-hidden">
                        <img
                          src={actor.portrait}
                          alt={actor.name}
                          className="w-full h-full object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-lg font-bold text-white">{actor.name}</h3>
                          <span className="text-xs text-white/70">{actor.role}</span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-4 space-y-3">
                        <p className="text-xs text-muted-foreground line-clamp-2">{actor.description}</p>

                        {/* Attributes */}
                        <div className="flex flex-wrap gap-1.5">
                          {actor.gender && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                              {actor.gender}
                            </span>
                          )}
                          {actor.ageRange && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                              {actor.ageRange}
                            </span>
                          )}
                          {actor.bodyType && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                              {actor.bodyType}
                            </span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 pt-1 border-t border-border">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Film className="w-3.5 h-3.5" />
                            <span>{actor.projects.length} {actor.projects.length === 1 ? "project" : "projects"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Camera className="w-3.5 h-3.5" />
                            <span>{actor.totalShots} {actor.totalShots === 1 ? "shot" : "shots"}</span>
                          </div>
                        </div>

                        {/* Project tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {actor.projects.map((p) => (
                            <span
                              key={p.id}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
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

export default CastPage;
