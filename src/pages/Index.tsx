import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FanzySidebar } from "@/components/FanzySidebar";
import { TopBar } from "@/components/TopBar";
import { ProjectCard } from "@/components/ProjectCard";
import { NewProjectCard } from "@/components/NewProjectCard";
import { NewProjectModal } from "@/components/NewProjectModal";
import { mockProjects } from "@/data/mockProjects";

const Index = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <FanzySidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onNewProject={() => setModalOpen(true)} />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Projects</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {mockProjects.length} films in your studio
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <NewProjectCard onClick={() => setModalOpen(true)} />
                {mockProjects.map((project, i) => (
                  <ProjectCard key={project.id} project={project} index={i + 1} />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      <NewProjectModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </SidebarProvider>
  );
};

export default Index;
