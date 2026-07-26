import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FolderKanban, Users, ListTodo, Calendar,
  Trello, BarChart3, Sparkles, Settings, Activity, User as UserIcon,
  ChevronLeft, ChevronRight, Zap,
} from "lucide-react";
import { useRole } from "@/lib/role";
import { useState } from "react";
import { cn } from "@/lib/utils";

const managerNav = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/projects", label: "Projects", icon: FolderKanban },
  { to: "/app/teams", label: "Teams", icon: Users },
  { to: "/app/backlog", label: "Backlog", icon: ListTodo },
  { to: "/app/sprint-planning", label: "Sprint Planning", icon: Calendar },
  { to: "/app/kanban", label: "Kanban", icon: Trello },
  { to: "/app/reports", label: "Reports", icon: BarChart3 },
  { to: "/app/ai-center", label: "AI Center", icon: Sparkles },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

const devNav = [
  { to: "/dev/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dev/tasks", label: "My Tasks", icon: ListTodo },
  { to: "/dev/sprint", label: "Sprint", icon: Calendar },
  { to: "/dev/profile", label: "Profile", icon: UserIcon },
];

export function AppSidebar() {
  const { role } = useRole();
  const nav = role === "manager" ? managerNav : devNav;
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-out hidden md:flex flex-col",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      <div className="flex items-center gap-2 px-4 h-16 border-b border-sidebar-border">
        <div className="size-8 rounded-lg bg-primary text-primary-foreground grid place-items-center shrink-0">
          <Zap className="size-4" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight animate-fade">
            <span className="font-semibold text-sm">Agilix</span>
            <span className="text-[10px] text-muted-foreground">AI Sprint OS</span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3 space-y-0.5">
        {nav.map((item) => {
          const active = path === item.to || path.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className={cn("size-4 shrink-0", active && "text-primary")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && active && (
                <span className="ml-auto size-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="m-3 flex items-center justify-center gap-2 h-9 rounded-md border border-sidebar-border text-xs text-muted-foreground hover:bg-sidebar-accent transition"
      >
        {collapsed ? <ChevronRight className="size-4" /> : <><ChevronLeft className="size-4" /> Collapse</>}
      </button>
    </aside>
  );
}
