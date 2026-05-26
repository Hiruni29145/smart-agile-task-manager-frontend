import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard, FolderKanban, ListTodo, Trello, Sparkles, Settings, Users,
} from "lucide-react";

const items = [
  { label: "Dashboard", to: "/app/dashboard", icon: LayoutDashboard },
  { label: "Projects", to: "/app/projects", icon: FolderKanban },
  { label: "Backlog", to: "/app/backlog", icon: ListTodo },
  { label: "Kanban", to: "/app/kanban", icon: Trello },
  { label: "AI Center", to: "/app/ai-center", icon: Sparkles },
  { label: "Teams", to: "/app/teams", icon: Users },
  { label: "Settings", to: "/app/settings", icon: Settings },
];

export function CommandPalette({
  open, onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command, jump to a page…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <CommandItem
                key={it.to}
                onSelect={() => {
                  navigate({ to: it.to });
                  onOpenChange(false);
                }}
              >
                <Icon className="mr-2 size-4" />
                {it.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          <CommandItem>+ Create task</CommandItem>
          <CommandItem>+ New project</CommandItem>
          <CommandItem>+ Start sprint</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
