import {
  FileText, LayoutGrid, Users, MapPin, Sparkles, Film, Download,
  Search, Settings, FolderOpen
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, SidebarHeader, useSidebar, SidebarSeparator,
} from "@/components/ui/sidebar";

const pipelineStages = [
  { title: "Script", icon: FileText },
  { title: "Storyboard", icon: LayoutGrid },
  { title: "Casting", icon: Users },
  { title: "Locations", icon: MapPin },
  { title: "Generation", icon: Sparkles },
  { title: "Timeline", icon: Film },
  { title: "Export", icon: Download },
];

const recentProjects = [
  { name: "The Last Deal", color: "from-amber-900/60 to-amber-700/30" },
  { name: "Sunrise Protocol", color: "from-cyan-900/60 to-blue-700/30" },
  { name: "Neon Ronin", color: "from-purple-900/60 to-pink-700/30" },
];

export function FanzySidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

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
            <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider">
              Recent Projects
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {recentProjects.map((project) => (
                  <SidebarMenuItem key={project.name}>
                    <SidebarMenuButton className="hover:bg-sidebar-accent/50 cursor-pointer">
                      <div className={`w-5 h-5 rounded bg-gradient-to-br ${project.color} flex-shrink-0`} />
                      <span className="text-sm truncate">{project.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider">
            Pipeline
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {pipelineStages.map((stage) => (
                <SidebarMenuItem key={stage.title}>
                  <SidebarMenuButton
                    className="opacity-40 cursor-not-allowed"
                    disabled
                  >
                    <stage.icon className="mr-2 h-4 w-4" />
                    {!collapsed && <span>{stage.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-accent/40 flex items-center justify-center text-xs font-semibold text-foreground">
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
