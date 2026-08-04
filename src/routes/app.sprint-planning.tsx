import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Target, Plus, Download, FileSpreadsheet, FileText, ChevronLeft, ChevronRight, Loader2, Sparkles, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { apiClient } from "@/api/client";
import { PriorityBadge } from "@/components/ui-bits";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/app/sprint-planning")({ component: SprintPlanning });

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

function getWorkingDays(startDateStr: string, endDateStr: string) {
  if (!startDateStr || !endDateStr) return 0;
  let date = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  let days = 0;
  while (date <= endDate) {
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      days++;
    }
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function TaskRow({ task }: { task: Task }) {
  const m = task.assignee;
  return (
    <div className="group rounded-xl border bg-background p-3 hover:shadow-md hover:border-primary/40 transition-all flex items-center gap-4">
      <div className="flex-1 min-w-0 flex items-center gap-4">
        <div className="w-24 shrink-0">
          <PriorityBadge p={task.priority} />
        </div>
        <div className="flex-1 truncate text-sm font-medium">
          <span className="text-[10px] font-mono text-muted-foreground mr-2">#{task.id}</span>
          {task.title}
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/5 px-2.5 py-1 rounded-md min-w-[4rem] justify-center">
            <Sparkles className="size-3" />{task.estimatedTime ?? 0}h
          </span>
          {m ? (
            <Avatar className="size-7 border bg-primary/10">
              <AvatarFallback className="text-xs font-medium text-primary">{m.name[0]}</AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="size-7 border bg-muted">
              <AvatarFallback className="text-xs font-medium text-muted-foreground">?</AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  );
}

function SprintTasks({ sprintId }: { sprintId: number }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['sprint-tasks', sprintId],
    queryFn: () => apiClient<PaginatedResponse<Task>>(`/api/v1/sprints/${sprintId}/tasks`)
  });

  if (isLoading) {
    return (
      <div className="p-4 bg-muted/10 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-background p-3 flex items-center gap-4">
            <div className="flex-1 min-w-0 flex items-center gap-4">
              <div className="w-24 shrink-0"><Skeleton className="h-5 w-16" /></div>
              <div className="flex-1 flex items-center gap-2"><Skeleton className="h-3 w-10" /><Skeleton className="h-4 w-1/3" /></div>
              <div className="flex items-center gap-4 shrink-0">
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="size-7 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-destructive text-sm bg-muted/10">
        Failed to load tasks for this sprint.
      </div>
    );
  }

  const tasks = data?.data?.items || [];

  if (tasks.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 min-h-[120px]">
        <div className="size-10 rounded-full bg-muted/50 grid place-items-center mb-3"><Target className="size-5 text-muted-foreground/40" /></div>
        <p className="font-medium text-sm">Sprint is empty</p>
        <p className="text-xs mt-1">No tasks have been added to this sprint yet.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-muted/10 space-y-3">
      {tasks.map(t => (
        <TaskRow key={t.id} task={t} />
      ))}
    </div>
  );
}

function SprintPlanning() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [expandedSprints, setExpandedSprints] = useState<Record<number, boolean>>({});
  
  // Create Sprint Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newSprintData, setNewSprintData] = useState({ projectId: '', name: '', sprintNo: '', startDate: '', endDate: '' });
  const [sprintToDelete, setSprintToDelete] = useState<number | null>(null);

  const limit = 5;
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

  const { data, isLoading, isError } = useQuery({
    queryKey: ['sprints'],
    queryFn: () => apiClient<PaginatedResponse<Sprint>>(`/api/v1/sprints?page=1&limit=50`)
  });

  const updateSprintStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      return apiClient(`/api/v1/sprints/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    },
    onSuccess: () => {
      toast.success("Sprint status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
    },
    onError: () => {
      toast.error("Failed to update sprint status.");
    }
  });

  const createSprintMutation = useMutation({
    mutationFn: async (newSprint: any) => {
      return apiClient('/api/v1/sprints', {
        method: 'POST',
        body: JSON.stringify(newSprint)
      });
    },
    onSuccess: async (response: any) => {
      toast.success("Sprint created successfully!");
      setIsCreateOpen(false);
      setNewSprintData({ projectId: '', name: '', sprintNo: '', startDate: '', endDate: '' });
      setPage(1); // Reset to first page to see the newly created sprint
      
      const newSprint = response?.data;
      if (newSprint) {
        queryClient.setQueryData(['sprints'], (old: any) => {
          if (!old || !old.data || !old.data.items) return old;
          return {
            ...old,
            data: {
              ...old.data,
              items: [newSprint, ...old.data.items]
            }
          };
        });
      }
      
      // Still invalidate in the background to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
    },
    onError: () => {
      toast.error("Failed to create sprint.");
    }
  });

  const deleteSprintMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiClient(`/api/v1/sprints/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: (_, deletedId) => {
      toast.success("Sprint deleted successfully!");
      
      queryClient.setQueryData(['sprints'], (old: any) => {
        if (!old || !old.data || !old.data.items) return old;
        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.filter((s: Sprint) => s.id !== deletedId)
          }
        };
      });
      
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      setSprintToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete sprint.");
    }
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSprintData.projectId) {
      toast.error("Please select a project.");
      return;
    }
    createSprintMutation.mutate({
      projectId: Number(newSprintData.projectId),
      name: newSprintData.name,
      sprintNo: Number(newSprintData.sprintNo),
      startDate: newSprintData.startDate,
      endDate: newSprintData.endDate,
      status: "PLANNED" // Hardcoded status as requested
    });
  };

  const allSprints = data?.data?.items || [];
  const projectSprints = selectedProject 
    ? allSprints.filter(s => s.projectId === selectedProject) 
    : allSprints;
    
  const totalPages = Math.ceil(projectSprints.length / limit) || 1;
  const sprints = projectSprints.slice((page - 1) * limit, page * limit);
  
  const meta = {
    page,
    limit,
    total: projectSprints.length,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  };

  const toggleSprint = (id: number) => {
    setExpandedSprints(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Header Area */}
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Sprints</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your project sprints and delivery timelines.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select 
            value={selectedProject ? selectedProject.toString() : ""} 
            onValueChange={(val) => {
              setSelectedProject(Number(val));
              setPage(1);
            }}
            disabled={isProjectsLoading}
          >
            <SelectTrigger className="w-[240px] bg-card border-dashed">
              <SelectValue placeholder={isProjectsLoading ? "Loading projects..." : "Select Project"} />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button 
            onClick={() => {
              setNewSprintData(prev => ({ ...prev, projectId: selectedProject ? selectedProject.toString() : '' }));
              setIsCreateOpen(true);
            }} 
            className="gap-2 shadow-sm"
            disabled={isProjectsLoading}
          >
            <Plus className="size-4" /> Create Sprint
          </Button>
        </div>
      </div>

      {/* Sprints Stack */}
      <div className="space-y-8">
        {isLoading && (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-3xl border bg-card shadow-sm overflow-hidden ring-1 ring-primary/10">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-5 rounded-full" />
                      <Skeleton className="h-7 w-48" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <div className="mt-1.5 flex items-center gap-3 ml-7">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-6 w-32 rounded-md" />
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center justify-end gap-4">
                      <div className="flex flex-col items-end gap-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-9 w-24 rounded-md" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {isError && (
          <div className="text-center py-12 text-destructive">
            Failed to load sprints.
          </div>
        )}

        {!isLoading && !isError && sprints.length === 0 && (
          <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-3xl bg-card">
            <Target className="size-10 mx-auto mb-4 text-muted-foreground/40" />
            <p className="font-medium text-lg">No sprints found</p>
            <p className="text-sm mt-1">Create a new sprint to get started.</p>
          </div>
        )}

        {sprints.map((s) => {
          const statusLower = s.status.toLowerCase();
          const isActive = statusLower === 'active';
          const isCompleted = statusLower === 'completed';
          const isPlanned = statusLower === 'planned';
          const isExpanded = expandedSprints[s.id];

          return (
            <div key={s.id} className={`rounded-3xl border bg-card shadow-sm overflow-hidden transition-all ${isActive ? 'ring-2 ring-primary shadow-md' : 'ring-1 ring-primary/10'} ${isCompleted ? 'opacity-70 grayscale-[30%]' : ''}`}>
              {/* Sprint Header */}
              <div 
                className={`p-6 cursor-pointer hover:bg-muted/30 transition-colors ${isActive ? 'bg-primary/5' : 'bg-gradient-to-r from-primary/[0.04] via-transparent to-transparent'}`}
                onClick={() => toggleSprint(s.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-xl flex items-center gap-2">
                        <Target className="size-5 text-primary" /> {s.name}
                      </h3>
                      {isActive && <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold uppercase tracking-wider">Active</span>}
                      {isCompleted && <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-bold uppercase tracking-wider">Completed</span>}
                      {isPlanned && <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-xs font-bold uppercase tracking-wider">Planned</span>}
                      {!isActive && !isCompleted && !isPlanned && (
                         <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600 text-xs font-bold uppercase tracking-wider">{s.status}</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1.5 flex items-center gap-3 font-medium ml-7">
                      <span className="flex items-center gap-1.5"><Calendar className="size-4" /> {formatDate(s.startDate)} - {formatDate(s.endDate)}</span>
                      <span className="text-muted-foreground/50">•</span>
                      <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-md flex items-center gap-1">Duration: {getWorkingDays(s.startDate, s.endDate)} Working Days</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center justify-end gap-4 text-sm font-semibold tabular-nums">
                      <div className="flex flex-col items-end"><span className="text-muted-foreground text-xs font-medium">Est. Workload</span>{s.estimatedWorkload ?? 0}h</div>
                      <div className="flex flex-col items-end"><span className="text-muted-foreground text-xs font-medium">Story Points</span>{s.storyPoints ?? 0} SP</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isPlanned && (
                        <Button 
                          size="sm" 
                          onClick={(e) => { e.stopPropagation(); updateSprintStatus.mutate({ id: s.id, status: 'ACTIVE' }); }}
                          disabled={updateSprintStatus.isPending}
                        >
                          Start Sprint
                        </Button>
                      )}
                      {isActive && (
                        <Button 
                          size="sm" 
                          variant="default" 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white" 
                          onClick={(e) => { e.stopPropagation(); updateSprintStatus.mutate({ id: s.id, status: 'COMPLETED' }); }}
                          disabled={updateSprintStatus.isPending}
                        >
                          Complete Sprint
                        </Button>
                      )}
                      <Button variant={isExpanded ? "default" : "secondary"} size="sm" className="gap-2 pointer-events-none">
                        {isExpanded ? 'Hide Tasks' : 'View Tasks'}
                        {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-1"
                        onClick={(e) => { e.stopPropagation(); setSprintToDelete(s.id); }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sprint Tasks Area (Expandable) */}
              {isExpanded && (
                <div className="border-t border-dashed">
                  <SprintTasks sprintId={s.id} />
                </div>
              )}
            </div>
          );
        })}

        {/* Pagination Controls */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!meta.hasPreviousPage}
              className="gap-1"
            >
              <ChevronLeft className="size-4" /> Previous
            </Button>
            <span className="text-sm font-medium text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={!meta.hasNextPage}
              className="gap-1"
            >
              Next <ChevronRight className="size-4" />
            </Button>
          </div>
        )}


      </div>

      {/* Create Sprint Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Sprint</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="createProjectId">Project</Label>
              <Select 
                value={newSprintData.projectId} 
                onValueChange={(val) => setNewSprintData({...newSprintData, projectId: val})}
              >
                <SelectTrigger id="createProjectId">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Sprint Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Sprint 1 - Alpha Release" 
                value={newSprintData.name}
                onChange={e => setNewSprintData({...newSprintData, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sprintNo">Sprint Number</Label>
              <Input 
                id="sprintNo" 
                type="number" 
                min="1"
                placeholder="e.g. 1" 
                value={newSprintData.sprintNo}
                onChange={e => setNewSprintData({...newSprintData, sprintNo: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  value={newSprintData.startDate}
                  onChange={e => setNewSprintData({...newSprintData, startDate: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input 
                  id="endDate" 
                  type="date" 
                  value={newSprintData.endDate}
                  onChange={e => setNewSprintData({...newSprintData, endDate: e.target.value})}
                  required
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createSprintMutation.isPending}>
                {createSprintMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                ) : (
                  "Create Sprint"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!sprintToDelete} onOpenChange={(open) => !open && setSprintToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this sprint. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSprintMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                sprintToDelete && deleteSprintMutation.mutate(sprintToDelete);
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={deleteSprintMutation.isPending}
            >
              {deleteSprintMutation.isPending ? <><Loader2 className="size-4 mr-2 animate-spin" /> Deleting...</> : "Delete Sprint"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
