import { Bell, Sun, Moon, Plus } from "lucide-react";
import { useState, useEffect } from "react";
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
import { apiClient } from "@/api/client";

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

  const [profile, setProfile] = useState<{ firstName?: string; lastName?: string; avatar?: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient<any>("/api/v1/auth/me");
        if (response.success && response.data) {
          setProfile(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch profile in nav:", error);
      }
    };
    fetchProfile();
  }, []);

  const segments = path.split("/").filter(Boolean);

  const displayName = profile?.firstName && profile?.lastName 
    ? `${profile.firstName} ${profile.lastName}` 
    : (role === "manager" ? "Alex Morgan" : "Aria Chen");

  const fallbackInitials = profile?.firstName && profile?.lastName 
    ? `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase() 
    : "ME";
    
  const avatarUrl = profile?.avatar || "https://api.dicebear.com/7.x/notionists/svg?seed=Me";

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
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{fallbackInitials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">
                {displayName}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">

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
