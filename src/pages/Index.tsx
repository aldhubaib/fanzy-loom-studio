import { SidebarProvider } from "@/components/ui/sidebar";
import { FanzySidebar } from "@/components/FanzySidebar";
import { TopBar } from "@/components/TopBar";
import { ProjectCard } from "@/components/ProjectCard";
import { NewProjectCard } from "@/components/NewProjectCard";
import { mockProjects } from "@/data/mockProjects";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleNewProject = () => {
    // Generate a simple new project ID
    const newId = `new-${Date.now()}`;
    navigate(`/project/${newId}/canvas`);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <FanzySidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onNewProject={handleNewProject} />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Projects</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {mockProjects.length} films in your studio
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <NewProjectCard onClick={handleNewProject} />
                {mockProjects.map((project, i) => (
                  <ProjectCard key={project.id} project={project} index={i + 1} />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
