import { createFileRoute } from "@tanstack/react-router";
import { apiClient } from "@/api/client";
import { tasks, memberById, projects, members } from "@/lib/mock";
import { useState, useEffect } from "react";
import { Plus, Search, Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PriorityBadge, TypeBadge } from "@/components/ui-bits";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/app/backlog")({ component: Backlog });

function Backlog() {
  const [localTasks, setLocalTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await apiClient<any>('/api/v1/tasks?page=1&limit=20');
        if (res.success && res.data && res.data.items) {
          const mapped = res.data.items.map((t: any) => ({
            ...t,
            id: t.id.toString(),
            aiHours: t.estimatedTime,
            assigneeId: t.assigneeId,
            assigneeObj: t.assignee,
            assignee: t.assigneeId,
            status: t.status.toLowerCase(),
            type: t.type ? t.type.charAt(0).toUpperCase() + t.type.slice(1).toLowerCase() : "Feature"
          }));
          setLocalTasks(mapped);
        }
      } catch (e) {
        console.error("Failed to fetch tasks", e);
      } finally {
        setLoadingTasks(false);
      }
    }
    fetchTasks();
  }, []);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  
  const [q, setQ] = useState("");
  const [priority, setPriority] = useState("all");
  const [type, setType] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [apiProjects, setApiProjects] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await apiClient<any>('/api/v1/projects?page=1&limit=10');
        if (response.success && response.data && response.data.items) {
          setApiProjects(response.data.items);
        }
      } catch (e) {
        console.error("Failed to fetch projects", e);
      }
    }
    fetchProjects();
  }, []);

  const filtered = localTasks.filter((t) =>
    t.title.toLowerCase().includes(q.toLowerCase()) &&
    (priority === "all" || (t.priority && t.priority.toLowerCase() === priority.toLowerCase())) &&
    (type === "all" || (t.type && t.type.toLowerCase() === type.toLowerCase())) &&
    (projectFilter === "all" || (t as any).projectId?.toString() === projectFilter.toString() || !(t as any).projectId)
  );

  const handleDelete = async (id: string) => {
    // Optimistic local update
    setLocalTasks(prev => prev.filter(t => t.id !== id));
    
    try {
      const response = await apiClient<any>(`/api/v1/tasks/${id}`, {
        method: 'DELETE'
      });
      
      if (response.success || response.statusCode === 200) {
        toast.success("Task deleted successfully");
      } else {
        toast.error(response.message || "Failed to delete task");
      }
    } catch (e: any) {
      console.error("Task deletion error", e);
      toast.error("An error occurred while deleting task");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    // Optimistic local update
    setLocalTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus as any } : t));
    
    try {
      const response = await apiClient<any>(`/api/v1/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus.toUpperCase() })
      });
      
      if (response.success || response.statusCode === 200) {
        toast.success("Status updated successfully");
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (e: any) {
      console.error("Status update error", e);
      toast.error("An error occurred while updating status");
    }
  };

  const selectedTask = localTasks.find(t => t.id === selectedTaskId);

  const statusLabel: Record<string, string> = {
    todo: "To Do", in_progress: "In Progress", review: "Review", done: "Done",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Backlog</h1>
          <p className="text-sm text-muted-foreground">{localTasks.length} items · refined and prioritized</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[220px] bg-card border-dashed"><SelectValue placeholder="Select Project" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {apiProjects.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <CreateTaskDialog onAdd={(t) => setLocalTasks([t, ...localTasks])} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks…" className="pl-9" />
        </div>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {["Low", "Medium", "High", "Critical"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {["Feature", "Bug", "Chore", "Spike"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-xs text-muted-foreground border-b">
            <tr>
              <th className="text-left p-4 font-medium">Task</th>
              <th className="text-left p-4 font-medium w-24">Priority</th>
              <th className="text-left p-4 font-medium w-24">Type</th>
              <th className="text-left p-4 font-medium w-24">AI Est.</th>
              <th className="text-left p-4 font-medium w-16">SP</th>
              <th className="text-left p-4 font-medium w-48">Assignee</th>
              <th className="text-left p-4 font-medium w-36">Status</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {loadingTasks ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="p-4"><Skeleton className="h-5 w-48" /></td>
                  <td className="p-4"><Skeleton className="h-5 w-16" /></td>
                  <td className="p-4"><Skeleton className="h-5 w-16" /></td>
                  <td className="p-4"><Skeleton className="h-6 w-16 rounded-md" /></td>
                  <td className="p-4"><Skeleton className="h-5 w-8" /></td>
                  <td className="p-4 flex items-center gap-2.5"><Skeleton className="size-6 rounded-full" /><Skeleton className="h-4 w-24" /></td>
                  <td className="p-4"><Skeleton className="h-8 w-[130px] rounded-md" /></td>
                  <td className="p-4 text-right"><Skeleton className="size-8 rounded-md ml-auto" /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No tasks found.</td></tr>
            ) : filtered.map((t) => {
              let m = { name: "Assigned User", avatar: "" };
              if (t.assigneeObj && t.assigneeObj.name) {
                m = { name: t.assigneeObj.name, avatar: t.assigneeObj.avatar || "" };
              } else if (t.assigneeObj && (t.assigneeObj.firstName || t.assigneeObj.lastName)) {
                m = { name: `${t.assigneeObj.firstName || ''} ${t.assigneeObj.lastName || ''}`.trim(), avatar: t.assigneeObj.avatar || "" };
              } else {
                m = memberById(t.assignee) || m;
              }
              return (
                <tr key={t.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors group">
                  <td className="p-4 font-medium">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedTaskId(t.id)}>
                      <span className="group-hover:underline decoration-primary/30 underline-offset-4 line-clamp-1">{t.title}</span>
                    </div>
                  </td>
                  <td className="p-4"><PriorityBadge p={t.priority} /></td>
                  <td className="p-4"><TypeBadge t={t.type} /></td>
                  <td className="p-4 tabular-nums">
                    <span className="inline-flex items-center gap-1.5 text-primary bg-primary/5 px-2 py-1 rounded-md text-xs font-medium">
                      <Sparkles className="size-3" /> {t.aiHours}h
                    </span>
                  </td>
                  <td className="p-4 tabular-nums font-medium text-muted-foreground">{t.storyPoints}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-6 border"><AvatarImage src={m.avatar} /><AvatarFallback>{m.name[0]}</AvatarFallback></Avatar>
                      <span className="truncate text-xs font-medium">{m.name}</span>
                    </div>
                  </td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <Select value={t.status} onValueChange={(val) => handleStatusChange(t.id, val)}>
                      <SelectTrigger className="h-8 text-xs w-[130px] bg-transparent hover:bg-muted/50 border-transparent hover:border-input shadow-none transition-all">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo"><div className="flex items-center"><span className="size-1.5 rounded-full bg-slate-500 mr-2"/>To Do</div></SelectItem>
                        <SelectItem value="in_progress"><div className="flex items-center"><span className="size-1.5 rounded-full bg-blue-500 mr-2"/>In Progress</div></SelectItem>
                        <SelectItem value="review"><div className="flex items-center"><span className="size-1.5 rounded-full bg-amber-500 mr-2"/>Review</div></SelectItem>
                        <SelectItem value="done"><div className="flex items-center"><span className="size-1.5 rounded-full bg-emerald-500 mr-2"/>Done</div></SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => { e.stopPropagation(); setTaskToDelete(t.id); }}
                      className="size-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Sheet open={!!selectedTaskId} onOpenChange={(open) => !open && setSelectedTaskId(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selectedTask && (
            <>
              <SheetHeader className="text-left pb-6 border-b mt-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-mono mb-2">
                  #{selectedTask.id}
                </div>
                <SheetTitle className="text-xl font-bold leading-tight">{selectedTask.title}</SheetTitle>
                <div className="flex flex-wrap gap-2 mt-4">
                  <PriorityBadge p={selectedTask.priority} />
                  <TypeBadge t={selectedTask.type} />
                </div>
              </SheetHeader>

              <div className="py-6 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Description</h4>
                  <div className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg leading-relaxed">
                    {selectedTask.description}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Assignee</div>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarImage src={selectedTask.assigneeObj?.avatar || memberById(selectedTask.assignee)?.avatar} />
                        <AvatarFallback>{(selectedTask.assigneeObj?.name?.[0] || selectedTask.assigneeObj?.firstName?.[0] || memberById(selectedTask.assignee)?.name?.[0] || "U").toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {selectedTask.assigneeObj?.name || (selectedTask.assigneeObj?.firstName ? `${selectedTask.assigneeObj.firstName} ${selectedTask.assigneeObj.lastName || ''}`.trim() : null) || memberById(selectedTask.assignee)?.name || "Assigned User"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div className="text-sm font-medium capitalize">{selectedTask.status.replace("_", " ")}</div>
                  </div>
                </div>

                <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-info/5 p-4">
                   <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3">
                     <Sparkles className="size-3.5" /> AI Estimates
                   </div>
                   <div className="grid grid-cols-4 gap-3 text-center mt-2">
                     <div>
                       <div className="text-xl font-semibold tabular-nums">{selectedTask.aiHours}h</div>
                       <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-1">Estimated</div>
                     </div>
                     <div>
                       <div className="text-xl font-semibold tabular-nums">{selectedTask.storyPoints}</div>
                       <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-1">Story Pts</div>
                     </div>
                     <div>
                       <div className="text-xl font-semibold">{selectedTask.complexity}</div>
                       <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-1">Complexity</div>
                     </div>
                     <div>
                       <div className="text-xl font-semibold tabular-nums text-success">{selectedTask.confidence}%</div>
                       <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-1">Confidence</div>
                     </div>
                   </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (taskToDelete) handleDelete(taskToDelete);
                setTaskToDelete(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CreateTaskDialog({ onAdd }: { onAdd?: (t: any) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [proj, setProj] = useState("");
  const [apiProjects, setApiProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  
  const [assignee, setAssignee] = useState("");
  const [apiAssignees, setApiAssignees] = useState<any[]>([]);
  const [loadingAssignees, setLoadingAssignees] = useState(true);
  
  const [sprint, setSprint] = useState("");
  const [apiSprints, setApiSprints] = useState<any[]>([]);
  const [loadingSprints, setLoadingSprints] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await apiClient<any>('/api/v1/projects?page=1&limit=10');
        if (response.success && response.data && response.data.items) {
          setApiProjects(response.data.items);
          if (response.data.items.length > 0) {
             setProj(response.data.items[0].id.toString());
          }
        }
      } catch (e) {
        console.error("Failed to fetch projects", e);
      } finally {
        setLoadingProjects(false);
      }
    }
    fetchProjects();
  }, []);
  
  useEffect(() => {
    async function fetchSprints() {
      try {
        const response = await apiClient<any>('/api/v1/sprints?page=1&limit=10');
        if (response.success && response.data && response.data.items) {
          setApiSprints(response.data.items);
          if (response.data.items.length > 0) {
             setSprint(response.data.items[0].id.toString());
          }
        }
      } catch (e) {
        console.error("Failed to fetch sprints", e);
      } finally {
        setLoadingSprints(false);
      }
    }
    fetchSprints();
  }, []);
  
  useEffect(() => {
    async function fetchAssignees() {
      try {
        const response = await apiClient<any>('/api/v1/teams/members');
        if (response.success && response.data && response.data.items) {
          setApiAssignees(response.data.items);
          if (response.data.items.length > 0) {
             setAssignee(response.data.items[0].id.toString());
          }
        }
      } catch (e) {
        console.error("Failed to fetch assignees", e);
      } finally {
        setLoadingAssignees(false);
      }
    }
    fetchAssignees();
  }, []);
  
  const [prio, setPrio] = useState("HIGH");
  const [status, setStatus] = useState("TODO");
  const [deadline, setDeadline] = useState("2026-06-25");
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [aiEst, setAiEst] = useState({
    storyPoints: 0,
    estimatedTime: 0,
    complexity: 0,
    confidence: 0
  });

  const handleGenerateAi = () => {
    setAiEst({
      storyPoints: 5,
      estimatedTime: 8.5,
      complexity: 7,
      confidence: 90
    });
    setShowPreview(true);
  };

  const handleCreate = async () => {
    if (!title) { toast.error("Title required"); return; }
    
    setIsSubmitting(true);
    
    // Construct the requested payload
    const payload = {
      title,
      projectId: parseInt(proj, 10),
      description: desc || "No description provided.",
      sprintId: parseInt(sprint, 10),
      assigneeId: assignee,
      priority: prio,
      status: status,
      storyPoints: aiEst.storyPoints,
      estimatedTime: aiEst.estimatedTime,
      complexity: aiEst.complexity,
      confidence: aiEst.confidence,
      deadline
    };
    
    try {
      const response = await apiClient<any>('/api/v1/tasks', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (response.success || response.statusCode === 201) {
        toast.success("Task created successfully!");
        
        // Fallback task object to allow the local table to keep rendering without breaking
        const t = {
          id: `T-${Math.floor(Math.random() * 9000) + 1000}`,
          title: payload.title,
          description: payload.description,
          priority: payload.priority,
          type: "Feature" as any, // keep type to prevent table break
          aiHours: payload.estimatedTime,
          storyPoints: payload.storyPoints,
          assignee: payload.assigneeId,
          status: payload.status.toLowerCase(), // mapping status for local table
          confidence: payload.confidence,
          complexity: payload.complexity >= 7 ? "High" : "Medium",
          projectId: proj,
        };
        
        onAdd?.(t);
        setOpen(false);
        
        // Reset state
        setTitle("");
        setDesc("");
        setShowPreview(false);
        setAiEst({ storyPoints: 0, estimatedTime: 0, complexity: 0, confidence: 0 });
      } else {
         toast.error(response.message || "Failed to create task");
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred while creating the task");
      console.error("Create task error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if(!o) setShowPreview(false); }}>
      <DialogTrigger asChild><Button className="gap-1.5"><Plus className="size-4" /> Create task</Button></DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Create new task</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Implement…" /></div>
          <div><Label>Description</Label><Textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3} placeholder="Acceptance criteria, links, context…" /></div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Project</Label>
              <Select value={proj} onValueChange={setProj}>
                <SelectTrigger><SelectValue placeholder={loadingProjects ? "Loading..." : "Select Project"} /></SelectTrigger>
                <SelectContent>
                  {apiProjects.map((p) => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sprint</Label>
              <Select value={sprint} onValueChange={setSprint}>
                <SelectTrigger><SelectValue placeholder={loadingSprints ? "Loading..." : "Select Sprint"} /></SelectTrigger>
                <SelectContent>
                  {apiSprints.map((s) => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Assignee</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger><SelectValue placeholder={loadingAssignees ? "Loading..." : "Select Assignee"} /></SelectTrigger>
                <SelectContent>
                  {apiAssignees.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-5">
                          <AvatarImage src={m.avatar || undefined} />
                          <AvatarFallback>{m.firstName ? m.firstName[0] : "U"}</AvatarFallback>
                        </Avatar>
                        {m.firstName} {m.lastName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Deadline</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select value={prio} onValueChange={setPrio}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["TODO", "IN_PROGRESS", "REVIEW", "DONE"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <Button variant="outline" type="button" className="w-full gap-2" onClick={handleGenerateAi}>
            <Sparkles className="size-4" /> Generate AI estimation
          </Button>

          {showPreview && (
            <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-info/5 p-4 animate-in-up">
              <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3">
                <Sparkles className="size-3.5" /> AI Estimates Preview
              </div>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div><div className="text-xl font-semibold tabular-nums">{aiEst.estimatedTime}h</div><div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-1">Estimated</div></div>
                <div><div className="text-xl font-semibold tabular-nums">{aiEst.storyPoints}</div><div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-1">Story Pts</div></div>
                <div><div className="text-xl font-semibold">{aiEst.complexity}</div><div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-1">Complexity</div></div>
                <div><div className="text-xl font-semibold tabular-nums text-success">{aiEst.confidence}%</div><div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-1">Confidence</div></div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleCreate} disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 size-4 animate-spin" /> Creating...</> : "Create task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
