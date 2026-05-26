import { Bell, Sun, Moon, Plus } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useRole } from "@/lib/role";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const labelMap: Record<string, string> = {
  app: "Manager", dev: "Developer",
  dashboard: "Dashboard", projects: "Projects", teams: "Teams",
  backlog: "Backlog", "sprint-planning": "Sprint Planning",
  kanban: "Kanban", workload: "Workload", reports: "Reports",
  "ai-center": "AI Center", settings: "Settings",
  tasks: "My Tasks", sprint: "Sprint", profile: "Profile",
};

export function TopNav({ onNewTask }: { onNewTask?: () => void }) {
  const { theme, toggle } = useTheme();
  const { role, setRole } = useRole();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const segments = path.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-30 h-16 border-b bg-background/80 backdrop-blur-md flex items-center px-4 md:px-6 gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
        {segments.map((s, i) => (
          <span key={i} className="flex items-center gap-2 min-w-0">
            {i > 0 && <span className="opacity-40">/</span>}
            <span className={i === segments.length - 1 ? "text-foreground font-medium truncate" : "truncate"}>
              {labelMap[s] ?? s}
            </span>
          </span>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {role === "manager" && (
          <Button size="sm" className="hidden md:inline-flex gap-1.5 rounded-lg mr-1" onClick={onNewTask}>
            <Plus className="size-4" /> New Task
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="size-4" />
              <span className="absolute top-2 right-2 size-1.5 rounded-full bg-primary animate-pulse" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-xl">
            <DropdownMenuLabel className="flex items-center justify-between pb-2">
              <span>Notifications</span>
              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs font-normal text-muted-foreground hover:text-foreground" onClick={() => toast.success("All marked as read")}>
                Mark all as read
              </Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[
              { t: "AI predicted 8.5h for new task", s: "2 min ago" },
              { t: "Marcus assigned you a Critical bug", s: "12 min ago" },
              { t: "Sprint 14 ends in 2 days", s: "1 hr ago" },
              { t: "Aria completed 'Dark mode tokens'", s: "2 hr ago" },
            ].map((n, i) => (
              <DropdownMenuItem key={i} className="flex flex-col items-start gap-1 py-3 px-3 cursor-pointer">
                <span className="text-sm font-medium leading-none">{n.t}</span>
                <span className="text-xs text-muted-foreground">{n.s}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="outline" className="w-full text-xs rounded-lg" asChild>
                <Link to={role === "manager" ? "/app/settings" : "/dev/profile"} hash="notifications">View all notifications</Link>
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme" className="rounded-full">
          {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full pl-1 pr-3 h-9 hover:bg-muted transition">
              <Avatar className="size-7 border">
                <AvatarImage src="https://api.dicebear.com/7.x/notionists/svg?seed=Me" />
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">
                {role === "manager" ? "Alex Morgan" : "Aria Chen"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuLabel>Switch role (demo)</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setRole("manager")} asChild>
              <Link to="/app/dashboard">Project Manager</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRole("developer")} asChild>
              <Link to="/dev/dashboard">Developer</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={role === "manager" ? "/app/settings" : "/dev/profile"}>Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/">Sign out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
