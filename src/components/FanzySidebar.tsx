import {
  Sparkles, Film,
  Search, Settings, FolderOpen, Users, MapPin, Image
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useParams, Link } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, SidebarHeader, useSidebar, SidebarSeparator,
} from "@/components/ui/sidebar";
import { mockProjects } from "@/data/mockProjects";

const pipelineStages = [
  { title: "Canvas", slug: "canvas", icon: Sparkles },
];

const recentProjects = [
  { id: "1", name: "The Last Deal", color: "from-amber-900/60 to-amber-700/30" },
  { id: "2", name: "Sunrise Protocol", color: "from-cyan-900/60 to-blue-700/30" },
  { id: "4", name: "Neon Ronin", color: "from-purple-900/60 to-pink-700/30" },
];

export function FanzySidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const params = useParams();
  const projectId = params.projectId;
  const isInsideProject = !!projectId;
  const currentProject = isInsideProject ? mockProjects.find(p => p.id === projectId) : null;

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <Film className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-foreground tracking-tight">Fanzy</span>
          )}
        </div>
        {!collapsed && (
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full bg-secondary rounded-md pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" end activeClassName="bg-sidebar-accent text-foreground font-medium" className="hover:bg-sidebar-accent/50">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    {!collapsed && <span>All Projects</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/cast" activeClassName="bg-sidebar-accent text-foreground font-medium" className="hover:bg-sidebar-accent/50">
                      <Users className="mr-2 h-4 w-4" />
                      <span>Cast</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/locations" activeClassName="bg-sidebar-accent text-foreground font-medium" className="hover:bg-sidebar-accent/50">
                      <MapPin className="mr-2 h-4 w-4" />
                      <span>Locations</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/gallery" activeClassName="bg-sidebar-accent text-foreground font-medium" className="hover:bg-sidebar-accent/50">
                      <Image className="mr-2 h-4 w-4" />
                      <span>Gallery</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isInsideProject && (
          <>
            <SidebarSeparator />
            {!collapsed && currentProject && (
              <div className="px-4 py-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Project</p>
                <p className="text-sm font-semibold text-foreground truncate mt-0.5">{currentProject.title}</p>
              </div>
            )}
            <SidebarGroup>
              <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider">
                Pipeline
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {pipelineStages.map((stage, i) => (
                    <SidebarMenuItem key={stage.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={`/project/${projectId}/${stage.slug}`}
                          activeClassName="bg-sidebar-accent text-foreground font-medium"
                          className="hover:bg-sidebar-accent/50"
                        >
                          <stage.icon className="mr-2 h-4 w-4" />
                          {!collapsed && <span>{stage.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <div className="flex items-center gap-3 justify-center group-data-[state=expanded]:justify-start">
          <div className="w-8 h-8 min-w-[2rem] min-h-[2rem] rounded-full bg-gradient-to-br from-primary/60 to-accent/40 flex items-center justify-center text-xs font-semibold text-foreground shrink-0">
            JD
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Jane Director</p>
                <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
              </div>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
