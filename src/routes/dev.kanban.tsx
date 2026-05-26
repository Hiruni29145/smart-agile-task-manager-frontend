import { createFileRoute } from "@tanstack/react-router";
import { tasks as initialTasks, type Status } from "@/lib/mock";
import { useState } from "react";
import { PriorityBadge } from "@/components/ui-bits";
import { Sparkles, Clock, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dev/kanban")({ component: DevKanban });

const cols: { id: Status; label: string; tone: string; bgTone: string }[] = [
  { id: "todo", label: "To Do", tone: "bg-slate-500", bgTone: "bg-slate-500/5 border-slate-500/10" },
  { id: "in_progress", label: "In Progress", tone: "bg-blue-500", bgTone: "bg-blue-500/5 border-blue-500/10" },
  { id: "done", label: "Done", tone: "bg-emerald-500", bgTone: "bg-emerald-500/5 border-emerald-500/10" },
];

function DevKanban() {
  const [tasks, setTasks] = useState(initialTasks.filter((t) => t.assignee === "u1").map((t) => ({ ...t, status: t.status === "review" ? "in_progress" as Status : t.status })));
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<Status | null>(null);

  const drop = (col: Status) => {
    if (!drag) return;
    setTasks((ts) => ts.map((t) => (t.id === drag ? { ...t, status: col } : t)));
    setDrag(null);
    setOver(null);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Board</h1>
          <p className="text-sm text-muted-foreground mt-1">Personal kanban workflow · Drag and drop tasks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cols.map((c) => {
          const items = tasks.filter((t) => t.status === c.id);
          const isOver = over === c.id;
          return (
            <div
              key={c.id}
              onDragOver={(e) => { e.preventDefault(); setOver(c.id); }}
              onDragLeave={() => setOver((o) => (o === c.id ? null : o))}
              onDrop={() => drop(c.id)}
              className={cn(
                "rounded-3xl border p-4 transition-all duration-300",
                c.bgTone,
                isOver ? "ring-2 ring-primary/30 bg-primary/5 border-primary/20 scale-[1.01]" : ""
              )}
            >
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2.5 rounded-full shadow-sm", c.tone)} />
                  <h3 className="font-semibold text-lg">{c.label}</h3>
                </div>
                <span className="text-xs font-bold text-muted-foreground bg-background/50 px-2.5 py-1 rounded-full border shadow-sm">
                  {items.length}
                </span>
              </div>
              
              <div className="space-y-3 min-h-[300px]">
                {items.map((t) => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={() => setDrag(t.id)}
                    onDragEnd={() => setDrag(null)}
                    className={cn(
                      "rounded-2xl border bg-card p-4 cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:border-primary/30",
                      drag === t.id ? "opacity-30 scale-95 shadow-none" : "shadow-sm"
                    )}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <PriorityBadge p={t.priority} />
                      <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                        {t.type}
                      </span>
                    </div>
                    <div className="font-semibold text-sm leading-snug mb-3 group-hover:text-primary transition-colors">
                      {t.title}
                    </div>
                    <div className="pt-3 border-t flex items-center gap-4 text-xs font-medium text-muted-foreground">
                      <span className="flex items-center gap-1 text-primary/80"><Sparkles className="size-3" />{t.aiHours}h</span>
                      <span className="flex items-center gap-1"><Clock className="size-3" />{t.actualHours ?? 0}h</span>
                      <span className="flex items-center gap-1"><Target className="size-3" />{t.storyPoints}</span>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed border-muted-foreground/20 rounded-2xl bg-background/30">
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center mb-2">
                      <span className="size-2 rounded-full bg-muted-foreground/30" />
                    </div>
                    <span className="text-sm font-medium">Drop tasks here</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
