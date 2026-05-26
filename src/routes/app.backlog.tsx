import { createFileRoute } from "@tanstack/react-router";
import { tasks, memberById, projects, members } from "@/lib/mock";
import { useState } from "react";
import { Plus, Search, Sparkles } from "lucide-react";
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MoreHorizontal, Trash2 } from "lucide-react";

export const Route = createFileRoute("/app/backlog")({ component: Backlog });

function Backlog() {
  const [localTasks, setLocalTasks] = useState(tasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  const [q, setQ] = useState("");
  const [priority, setPriority] = useState("all");
  const [type, setType] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  const filtered = localTasks.filter((t) =>
    t.title.toLowerCase().includes(q.toLowerCase()) &&
    (priority === "all" || t.priority === priority) &&
    (type === "all" || t.type === type) &&
    (projectFilter === "all" || (t as any).projectId === projectFilter || !(t as any).projectId)
  );

  const handleDelete = (id: string) => {
    setLocalTasks(prev => prev.filter(t => t.id !== id));
    toast.success("Task deleted");
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setLocalTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus as any } : t));
    toast.success("Status updated");
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
              {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
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
            {filtered.map((t) => {
              const m = memberById(t.assignee)!;
              return (
                <tr key={t.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors group">
                  <td className="p-4 font-medium">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedTaskId(t.id)}>
                      <span className="text-muted-foreground text-xs font-mono bg-muted/50 px-1.5 py-0.5 rounded group-hover:bg-primary/10 group-hover:text-primary transition-colors">#{t.id}</span>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="size-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => handleDelete(t.id)}>
                          <Trash2 className="size-4 mr-2" /> Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                      <Avatar className="size-6"><AvatarImage src={memberById(selectedTask.assignee)?.avatar} /><AvatarFallback>U</AvatarFallback></Avatar>
                      <span className="text-sm font-medium">{memberById(selectedTask.assignee)?.name}</span>
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
    </div>
  );
}

function CreateTaskDialog({ onAdd }: { onAdd?: (t: any) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [proj, setProj] = useState(projects[0].id);
  const [assignee, setAssignee] = useState(members[0].id);
  const [prio, setPrio] = useState("Medium");
  const [type, setType] = useState("Feature");
  const [showPreview, setShowPreview] = useState(false);
  const aiH = Math.max(2, title.length * 0.4);

  const handleCreate = () => {
    if (!title) { toast.error("Title required"); return; }
    const t = {
      id: `T-${Math.floor(Math.random() * 9000) + 1000}`,
      title,
      description: desc || "No description provided.",
      priority: prio as any,
      type: type as any,
      aiHours: parseFloat(aiH.toFixed(1)),
      storyPoints: aiH < 6 ? 3 : aiH < 12 ? 5 : 8,
      assignee,
      status: "todo" as any,
      confidence: 87,
      complexity: aiH < 6 ? "Low" : aiH < 12 ? "Medium" : "High",
      projectId: proj,
    };
    onAdd?.(t);
    toast.success("Task created and estimated via AI!");
    setOpen(false);
    
    // Reset
    setTitle("");
    setDesc("");
    setShowPreview(false);
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
                <SelectTrigger><SelectValue placeholder="Select Project" /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assignee</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger><SelectValue placeholder="Select Assignee" /></SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-5"><AvatarImage src={m.avatar}/><AvatarFallback>{m.name[0]}</AvatarFallback></Avatar>
                        {m.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select value={prio} onValueChange={setPrio}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Low", "Medium", "High", "Critical"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Task type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Feature", "Bug", "Chore", "Spike"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <Button variant="outline" type="button" className="w-full gap-2" onClick={() => setShowPreview(true)}>
            <Sparkles className="size-4" /> Generate AI estimation
          </Button>

          {showPreview && (
            <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-info/5 p-4 animate-in-up">
              <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3">
                <Sparkles className="size-3.5" /> AI Preview
              </div>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div><div className="text-xl font-semibold tabular-nums">{aiH.toFixed(1)}h</div><div className="text-[10px] text-muted-foreground">Estimated</div></div>
                <div><div className="text-xl font-semibold tabular-nums">{aiH < 6 ? 3 : aiH < 12 ? 5 : 8}</div><div className="text-[10px] text-muted-foreground">Story Points</div></div>
                <div><div className="text-xl font-semibold">{aiH < 6 ? "Low" : aiH < 12 ? "Med" : "High"}</div><div className="text-[10px] text-muted-foreground">Complexity</div></div>
                <div><div className="text-xl font-semibold tabular-nums">87%</div><div className="text-[10px] text-muted-foreground">Confidence</div></div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter><Button onClick={handleCreate}>Create task</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
