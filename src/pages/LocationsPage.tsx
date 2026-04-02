import { useMemo } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FanzySidebar } from "@/components/FanzySidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { MapPin, Film, Camera } from "lucide-react";
import { mockProjects } from "@/data/mockProjects";
import { motion } from "framer-motion";
import { locationDetailOptions } from "@/features/production-canvas/constants";
import type { CanvasState, LocationData } from "@/features/production-canvas/types";
import type { FrameData, LocationNode } from "@/features/production-canvas/types";

interface LocationWithStats {
  name: string;
  image: string;
  projects: { id: string; title: string }[];
  totalShots: number;
}

function loadAllLocations(): LocationWithStats[] {
  const locMap = new Map<string, LocationWithStats>();

  for (const project of mockProjects) {
    const key = `canvas-${project.id}`;
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const state: CanvasState = JSON.parse(raw);
      const { frames = [], locationNodes = [], locations = [] } = state;

      // Build a map of locationId -> LocationData for quick lookup
      const locDataMap = new Map<string, LocationData>();
      locations.forEach((l: LocationData) => locDataMap.set(l.id, l));

      // Collect unique location names from location nodes
      const locationNames = new Set<string>();
      locationNodes.forEach((ln: LocationNode) => {
        const ld = locDataMap.get(ln.locationId);
        if (ld) locationNames.add(ld.name);
      });
      frames.forEach((f: FrameData) => { if (f.location) locationNames.add(f.location); });

      for (const locName of locationNames) {
        const shotCount = frames.filter((f: FrameData) => f.location === locName).length;
        // Find image from location data first, then fallback to detail options
        const locData = locations.find((l: LocationData) => l.name === locName);
        const opt = locationDetailOptions.find((l) => l.value === locName);
        const image = locData?.portrait || opt?.img || "";

        if (locMap.has(locName)) {
          const existing = locMap.get(locName)!;
          existing.projects.push({ id: project.id, title: project.title });
          existing.totalShots += shotCount;
        } else {
          locMap.set(locName, {
            name: locName,
            image,
            projects: [{ id: project.id, title: project.title }],
            totalShots: shotCount,
          });
        }
      }
    } catch {
      // skip corrupt data
    }
  }

  return Array.from(locMap.values());
}

const LocationsPage = () => {
  const allLocations = useMemo(() => loadAllLocations(), []);

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
              <span className="text-foreground font-medium">Locations</span>
            </nav>
          </header>

          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Locations Library</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {allLocations.length} locations across all projects
                </p>
              </div>

              {allLocations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <MapPin className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">No locations yet</h2>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Locations you use in your project canvases will appear here for easy reuse.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {allLocations.map((loc, i) => (
                    <motion.div
                      key={loc.name}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                      className="group rounded-lg border border-border bg-card overflow-hidden"
                    >
                      {/* Location Image */}
                      <div className="relative aspect-[16/9] bg-secondary overflow-hidden">
                        {loc.image ? (
                          <img
                            src={loc.image}
                            alt={loc.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="w-10 h-10 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-lg font-bold text-white">{loc.name}</h3>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Film className="w-3.5 h-3.5" />
                            <span>{loc.projects.length} {loc.projects.length === 1 ? "project" : "projects"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5" />
                            <span>{loc.totalShots} {loc.totalShots === 1 ? "shot" : "shots"}</span>
                          </div>
                        </div>

                        {/* Project tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {loc.projects.map((p) => (
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

export default LocationsPage;
