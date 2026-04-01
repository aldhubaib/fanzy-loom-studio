import { useParams, Link, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FanzySidebar } from "@/components/FanzySidebar";
import { mockProjects } from "@/data/mockProjects";
import { ScriptEditor } from "@/components/script/ScriptEditor";
import { ConceptEditor } from "@/components/concept/ConceptEditor";
import {
  Lightbulb, FileText, LayoutGrid, Users, MapPin, Sparkles, Film, Download, ArrowLeft
} from "lucide-react";

const stageConfig: Record<string, { title: string; icon: React.ElementType; description: string }> = {
  concept: { title: "Concept", icon: Lightbulb, description: "Define your film's core idea, genre, tone, and visual style before diving into the script." },
  script: { title: "Script", icon: FileText, description: "Write and structure your screenplay. AI can help generate dialogue, scene descriptions, and plot points." },
  storyboard: { title: "Storyboard", icon: LayoutGrid, description: "Visualize each scene with AI-generated storyboard frames. Arrange and annotate your shots." },
  casting: { title: "Casting", icon: Users, description: "Define your characters' appearances, voices, and personalities. AI generates consistent character models." },
  locations: { title: "Locations", icon: MapPin, description: "Scout and design your film locations. Generate environments that match your story's world." },
  generation: { title: "Generation", icon: Sparkles, description: "Generate final shots and sequences using AI. Combine characters, locations, and camera angles." },
  timeline: { title: "Timeline", icon: Film, description: "Arrange your generated shots into a timeline. Add transitions, pacing, and sound design cues." },
  export: { title: "Export", icon: Download, description: "Export your final cut in various formats. Add titles, credits, and finishing touches." },
};

export default function ProjectPage() {
  const { projectId, stage } = useParams();
  const project = mockProjects.find(p => p.id === projectId);
  const currentStage = stageConfig[stage || "concept"];

  if (!project) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <FanzySidebar />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Project not found.</p>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  const StageIcon = currentStage?.icon || Lightbulb;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <FanzySidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <nav className="flex items-center gap-1 text-sm">
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">All Projects</Link>
                <span className="text-muted-foreground">/</span>
                <span className="text-foreground font-medium">{project.title}</span>
                {currentStage && (
                  <>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-primary font-medium">{currentStage.title}</span>
                  </>
                )}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-secondary">{project.genre}</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-accent/40 flex items-center justify-center text-xs font-semibold text-foreground">
                JD
              </div>
            </div>
          </header>

          {/* Stage content */}
          <main className="flex-1 overflow-hidden">
            {stage === "concept" ? (
              <ConceptEditor projectId={projectId} />
            ) : stage === "script" ? (
              <ScriptEditor />
            ) : (
              <div className="p-8 h-full overflow-auto">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <StageIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">{currentStage?.title}</h1>
                      <p className="text-sm text-muted-foreground mt-0.5">{currentStage?.description}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border-2 border-dashed border-border bg-card/50 min-h-[400px] flex flex-col items-center justify-center gap-4 p-8">
                    <StageIcon className="w-16 h-16 text-muted-foreground/30" />
                    <p className="text-muted-foreground text-center max-w-md">
                      This is where the <span className="text-foreground font-medium">{currentStage?.title}</span> workspace will live.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
