import { useParams } from "react-router-dom";
import { mockProjects } from "@/data/mockProjects";
import { ScriptEditor } from "@/components/script/ScriptEditor";
import { ConceptEditor } from "@/components/concept/ConceptEditor";
import { FloatingToolbar } from "@/components/FloatingToolbar";
import {
  Lightbulb, FileText, LayoutGrid, Users, MapPin, Sparkles, Film, Download
} from "lucide-react";

const stageConfig: Record<string, { title: string; icon: React.ElementType; description: string }> = {
  concept: { title: "Concept", icon: Lightbulb, description: "Define your film's core idea, genre, tone, and visual style before diving into the script." },
  script: { title: "Script", icon: FileText, description: "Write and structure your screenplay." },
  storyboard: { title: "Storyboard", icon: LayoutGrid, description: "Visualize each scene with AI-generated storyboard frames." },
  casting: { title: "Casting", icon: Users, description: "Define your characters' appearances, voices, and personalities." },
  locations: { title: "Locations", icon: MapPin, description: "Scout and design your film locations." },
  generation: { title: "Generation", icon: Sparkles, description: "Generate final shots and sequences using AI." },
  timeline: { title: "Timeline", icon: Film, description: "Arrange your generated shots into a timeline." },
  export: { title: "Export", icon: Download, description: "Export your final cut in various formats." },
};

export default function ProjectPage() {
  const { projectId, stage } = useParams();
  const isNewProject = projectId === "new";
  const project = isNewProject
    ? { id: "new", title: "New Project", genre: "—", scenes: 0, characters: 0, locations: 0, pipelineComplete: 0, pipelineTotal: 8, editedAgo: "just now", gradient: "" }
    : mockProjects.find(p => p.id === projectId);
  const currentStage = stageConfig[stage || "concept"];

  if (!project) {
    return (
      <div className="min-h-screen relative bg-background">
        <FloatingToolbar projectTitle="Unknown" currentStage={stage} />
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">Project not found.</p>
        </div>
      </div>
    );
  }

  const StageIcon = currentStage?.icon || Lightbulb;

  return (
    <div className="min-h-screen relative bg-background">
      <FloatingToolbar projectTitle={project.title} currentStage={stage} />

      <main className="h-screen overflow-hidden">
        {stage === "concept" ? (
          <ConceptEditor projectId={projectId} />
        ) : stage === "script" ? (
          <ScriptEditor />
        ) : (
          <div className="p-8 pt-20 h-full overflow-auto">
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
  );
}
