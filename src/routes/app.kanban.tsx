import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PriorityBadge } from "@/components/ui-bits";
import { Sparkles, Target, Play, Calendar, CheckCircle2, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/app/kanban")({ component: Kanban });

type Project = {
  id: number;
  name: string;
};

type Sprint = {
  id: number;
  name: string;
  sprintNo: number;
  status: string;
  startDate: string;
  endDate: string;
  projectId: number;
  createdAt: string;
  updatedAt: string;
  estimatedWorkload: number;
  storyPoints: number;
};

type Task = {
  id: number;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  storyPoints: number;
  estimatedTime: number;
  realTime: number;
  complexity: number;
  confidence: number;
  deadline: string;
  projectId: number;
  sprintId: number;
  assigneeId: string;
  assignee: {
      id: string;
      name: string;
  } | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
};

type PaginatedResponse<T> = {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

const columns: { id: string; label: string; tone: string }[] = [
  { id: "TODO", label: "To Do", tone: "bg-muted-foreground" },
  { id: "IN_PROGRESS", label: "In Progress", tone: "bg-info" },
  { id: "REVIEW", label: "In Review", tone: "bg-warning" },
  { id: "DONE", label: "Done", tone: "bg-success" },
];

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Kanban() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const queryClient = useQueryClient();
  
  // Fetch Projects dynamically
  const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient<PaginatedResponse<Project>>(`/api/v1/projects?page=1&limit=50`)
  });
  
  const projects = projectsData?.data?.items || [];

  // Auto-select the first project when loaded
  useEffect(() => {
    if (!selectedProject && projects.length > 0) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject]);

  // Fetch all sprints to find the active one for the selected project
  const { data: sprintsData, isLoading: isSprintsLoading } = useQuery({
    queryKey: ['sprints', 1, 50],
    queryFn: () => apiClient<PaginatedResponse<Sprint>>(`/api/v1/sprints?page=1&limit=50`)
  });

  const allSprints = sprintsData?.data?.items || [];
  const activeSprint = allSprints.find(s => s.projectId === selectedProject && s.status === 'ACTIVE');

  // Fetch tasks for the active sprint
  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ['sprint-tasks', activeSprint?.id],
    queryFn: () => apiClient<PaginatedResponse<Task>>(`/api/v1/sprints/${activeSprint?.id}/tasks`),
    enabled: !!activeSprint?.id
  });

  const sprintTasks = tasksData?.data?.items || [];

  // Local state for dragging tasks
  const [dragId, setDragId] = useState<number | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const [pendingTasks, setPendingTasks] = useState<Record<number, boolean>>({});
  
  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number, status: string }) => {
      return apiClient(`/api/v1/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    },
    onMutate: async ({ taskId, status }) => {
      setPendingTasks(prev => ({ ...prev, [taskId]: true }));
      await queryClient.cancelQueries({ queryKey: ['sprint-tasks', activeSprint?.id] });
      const previousTasks = queryClient.getQueryData(['sprint-tasks', activeSprint?.id]);
      
      queryClient.setQueryData(['sprint-tasks', activeSprint?.id], (old: any) => {
        if (!old || !old.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.map((t: Task) => t.id === taskId ? { ...t, status } : t)
          }
        };
      });
      
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['sprint-tasks', activeSprint?.id], context.previousTasks);
      }
      toast.error("Failed to update task status.");
    },
    onSettled: (data, error, variables) => {
      setPendingTasks(prev => {
        const next = { ...prev };
        delete next[variables.taskId];
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['sprint-tasks', activeSprint?.id] });
    }
  });

  const handleDrop = (colId: string) => {
    if (!dragId) return;
    updateTaskStatus.mutate({ taskId: dragId, status: colId });
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
          <Select 
            value={selectedProject ? selectedProject.toString() : ""} 
            onValueChange={(val) => setSelectedProject(Number(val))}
            disabled={isProjectsLoading}
          >
            <SelectTrigger className="w-[240px] bg-card border-dashed">
              <SelectValue placeholder={isProjectsLoading ? "Loading projects..." : "Select Project"} />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isProjectsLoading || isSprintsLoading ? (
        <div className="flex-1 flex flex-col space-y-6">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 flex-1 min-h-0 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border bg-card flex flex-col">
                <div className="p-4 border-b">
                  <Skeleton className="h-6 w-1/3" />
                </div>
                <div className="flex-1 p-3 space-y-3">
                  <Skeleton className="h-28 w-full rounded-xl" />
                  <Skeleton className="h-28 w-full rounded-xl" />
                  <Skeleton className="h-28 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : !activeSprint ? (
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
              <span className="flex items-center gap-1.5 text-muted-foreground"><Calendar className="size-4"/> Deadline: {formatDate(activeSprint.endDate)}</span>
              <span className="text-muted-foreground/50">•</span>
              <span className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-1 rounded"><Sparkles className="size-3"/> AI Sprint Health: On Track</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 flex-1 min-h-0 overflow-hidden pb-4">
            {columns.map((col) => {
              const items = sprintTasks.filter((t) => t.status === col.id);
              const over = overCol === col.id;
              
              // Visual styling for Done column
              const isDone = col.id === "DONE";

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
                    {isTasksLoading && (
                      <div className="flex justify-center p-4">
                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    {!isTasksLoading && items.map((t) => {
                      const isPending = pendingTasks[t.id];
                      const m = t.assignee;
                      return (
                        <div
                          key={t.id}
                          draggable={!isPending}
                          onDragStart={() => setDragId(t.id)}
                          onDragEnd={() => setDragId(null)}
                          className={`relative group rounded-xl border bg-background p-4 ${!isPending ? 'cursor-grab' : 'cursor-wait'} transition-all hover:shadow-md hover:border-primary/40 ${dragId === t.id ? "opacity-40 rotate-2 scale-95" : ""} ${isPending ? "opacity-60 ring-2 ring-primary/40 pointer-events-none" : ""}`}
                        >
                          {isPending && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 rounded-xl backdrop-blur-[1px]">
                              <Loader2 className="size-6 animate-spin text-primary drop-shadow-sm" />
                            </div>
                          )}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <PriorityBadge p={t.priority} />
                              <span className="text-[10px] font-mono text-muted-foreground ml-1">#{t.id}</span>
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                              <Sparkles className="size-3" />{t.estimatedTime ?? 0}h
                            </span>
                          </div>
                          <div className={`text-sm font-medium leading-snug mb-4 ${isDone ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">{t.storyPoints ?? 0} SP</div>
                            {m ? (
                              <Avatar className="size-6 border shadow-sm group-hover:scale-110 transition-transform">
                                <AvatarFallback className="text-[10px] font-medium">{m.name[0]}</AvatarFallback>
                              </Avatar>
                            ) : (
                              <Avatar className="size-6 border shadow-sm group-hover:scale-110 transition-transform bg-muted">
                                <AvatarFallback className="text-[10px] text-muted-foreground font-medium">?</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {!isTasksLoading && items.length === 0 && (
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
