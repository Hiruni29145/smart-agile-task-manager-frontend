import { createFileRoute } from "@tanstack/react-router";
import { tasks as initialTasks, memberById, projects, type Status } from "@/lib/mock";
import { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PriorityBadge } from "@/components/ui-bits";
import { Sparkles, Target, Play, Calendar, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/app/kanban")({ component: Kanban });

const columns: { id: Status; label: string; tone: string }[] = [
  { id: "todo", label: "To Do", tone: "bg-muted-foreground" },
  { id: "in_progress", label: "In Progress", tone: "bg-info" },
  { id: "review", label: "In Review", tone: "bg-warning" },
  { id: "done", label: "Done", tone: "bg-success" },
];

function Kanban() {
  const [selectedProject, setSelectedProject] = useState(projects[0].id);
  // Add a fake sprint identifier to tasks for demo purposes if they don't have one
  const [tasks, setTasks] = useState(initialTasks.map(t => ({ ...t, sprint: t.sprint || "s1", projectId: selectedProject })));
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<Status | null>(null);

  // Mock Active Sprints per project
  // In a real app, this comes from the global store updated by Sprint Planning
  const activeSprints: Record<string, { id: string, name: string, end: string } | null> = {
    [projects[0].id]: { id: "s1", name: "Sprint 1", end: "May 30" },
    [projects[1].id]: null, // Imagine this project hasn't started a sprint yet
  };

  const activeSprint = activeSprints[selectedProject];

  // Filter tasks to only show those belonging to the currently ACTIVE sprint of the selected project
  const sprintTasks = useMemo(() => {
    if (!activeSprint) return [];
    return tasks.filter(t => (t as any).projectId === selectedProject && t.sprint === activeSprint.id);
  }, [tasks, selectedProject, activeSprint]);

  const handleDrop = (col: Status) => {
    if (!dragId) return;
    setTasks((ts) => ts.map((t) => (t.id === dragId ? { ...t, status: col } : t)));
    setDragId(null);
    setOverCol(null);
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between shrink-0 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Sprint Board</h1>
          <p className="text-sm text-muted-foreground mt-1">Developers execute the active sprint tasks here.</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[240px] bg-card border-dashed">
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!activeSprint ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl bg-card">
           <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
             <Play className="size-6 text-muted-foreground" />
           </div>
           <h2 className="text-xl font-bold">No Active Sprint</h2>
           <p className="text-muted-foreground mt-2 max-w-sm text-center text-sm">
             There is no ongoing sprint for this project. A Project Manager must click "Start Sprint" on the Sprint Planning page.
           </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between shrink-0 bg-primary/5 border border-primary/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Target className="size-5 text-primary" />
              <h2 className="text-xl font-bold text-primary">{activeSprint.name}</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Play className="size-3"/> Ongoing</span>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium">
              <span className="flex items-center gap-1.5 text-muted-foreground"><Calendar className="size-4"/> Deadline: {activeSprint.end}</span>
              <span className="text-muted-foreground/50">•</span>
              <span className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-1 rounded"><Sparkles className="size-3"/> AI Sprint Health: On Track</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 flex-1 min-h-0 overflow-hidden pb-4">
            {columns.map((col) => {
              const items = sprintTasks.filter((t) => t.status === col.id);
              const over = overCol === col.id;
              
              // Visual styling for Done column
              const isDone = col.id === "done";

              return (
                <div
                  key={col.id}
                  onDragOver={(e) => { e.preventDefault(); setOverCol(col.id); }}
                  onDragLeave={() => setOverCol((c) => (c === col.id ? null : c))}
                  onDrop={() => handleDrop(col.id)}
                  className={`rounded-2xl border bg-card flex flex-col transition-all ${over ? "border-primary ring-2 ring-primary/20 bg-primary/5" : ""} ${isDone ? "bg-success/5 border-success/20" : ""}`}
                >
                  <div className={`p-4 border-b flex items-center justify-between ${isDone ? "bg-success/10" : "bg-muted/30"}`}>
                    <div className="flex items-center gap-2">
                      {isDone ? <CheckCircle2 className="size-4 text-success" /> : <span className={`size-2.5 rounded-full ${col.tone}`} />}
                      <h3 className={`font-semibold ${isDone ? "text-success" : ""}`}>{col.label}</h3>
                      <span className="text-xs bg-background px-2 py-0.5 rounded-full tabular-nums border">{items.length}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/10">
                    {items.map((t) => {
                      const m = memberById(t.assignee)!;
                      return (
                        <div
                          key={t.id}
                          draggable
                          onDragStart={() => setDragId(t.id)}
                          onDragEnd={() => setDragId(null)}
                          className={`group rounded-xl border bg-background p-4 cursor-grab transition-all hover:shadow-md hover:border-primary/40 ${dragId === t.id ? "opacity-40 rotate-2 scale-95" : ""}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <PriorityBadge p={t.priority} />
                              <span className="text-[10px] font-mono text-muted-foreground ml-1">#{t.id}</span>
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                              <Sparkles className="size-3" />{t.aiHours}h
                            </span>
                          </div>
                          <div className={`text-sm font-medium leading-snug mb-4 ${isDone ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">{t.storyPoints} SP</div>
                            <Avatar className="size-6 border shadow-sm group-hover:scale-110 transition-transform"><AvatarImage src={m.avatar} /><AvatarFallback>{m.name[0]}</AvatarFallback></Avatar>
                          </div>
                        </div>
                      );
                    })}
                    {items.length === 0 && (
                      <div className="text-center py-12 text-sm text-muted-foreground border-2 border-dashed rounded-xl m-2 opacity-50">
                        Drag tasks here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
