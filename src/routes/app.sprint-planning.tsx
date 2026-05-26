import { createFileRoute } from "@tanstack/react-router";
import { tasks as initialTasks, memberById, projects } from "@/lib/mock";
import { useMemo, useState } from "react";
import { PriorityBadge } from "@/components/ui-bits";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, Target, Plus, ArrowRightLeft, Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/app/sprint-planning")({ component: SprintPlanning });

// AI Date Math Helper: Adds working days to a date (skipping weekends)
function addWorkingDays(startDate: Date, days: number) {
  let date = new Date(startDate);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      added++;
    }
  }
  return date;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type SprintBlock = {
  id: string;
  name: string;
  goal: string;
  status: "planned" | "active" | "completed";
}

function SprintPlanning() {
  const [selectedProject, setSelectedProject] = useState(projects[0].id);
  const [tasks, setTasks] = useState(initialTasks.map(t => ({...t, sprint: "Backlog"}))); // Default all to backlog for demo
  const [sprints, setSprints] = useState<SprintBlock[]>([
    { id: "s1", name: "Sprint 1", goal: "Foundation & Setup", status: "planned" }
  ]);

  // 1. Filter tasks for the selected project
  const projectTasks = useMemo(() => tasks.filter(t => (t as any).projectId === selectedProject || !(t as any).projectId), [tasks, selectedProject]);
  
  // 2. Backlog Tasks
  const backlogTasks = projectTasks.filter(t => !t.sprint || t.sprint === "Backlog");

  // 3. AI Waterfall Timeline Calculation
  const TEAM_CAPACITY_HOURS_PER_DAY = 3 * 8; // 3 devs, 8 hours a day = 24h capacity per day
  
  const sprintData = useMemo(() => {
    let currentStartDate = new Date(); // The waterfall starts today
    
    return sprints.map(s => {
      const sTasks = projectTasks.filter(t => t.sprint === s.id);
      const totalHours = sTasks.reduce((acc, t) => acc + t.aiHours, 0);
      const totalSP = sTasks.reduce((acc, t) => acc + t.storyPoints, 0);
      
      // Calculate how many working days this Sprint requires based on tasks
      // Minimum 1 day even if empty, so the dates calculate nicely
      const requiredDays = Math.max(1, Math.ceil(totalHours / TEAM_CAPACITY_HOURS_PER_DAY));
      
      const startDate = new Date(currentStartDate);
      const endDate = addWorkingDays(startDate, requiredDays - 1); // -1 because start day is inclusive
      
      // The NEXT sprint starts the working day AFTER this one ends
      currentStartDate = addWorkingDays(endDate, 1);
      
      return {
        ...s,
        tasks: sTasks,
        totalHours,
        totalSP,
        requiredDays,
        startDate,
        endDate
      };
    });
  }, [sprints, projectTasks]);

  const handleCreateSprint = () => {
    const newId = `s${sprints.length + 1}`;
    setSprints([...sprints, { id: newId, name: `Sprint ${sprints.length + 1}`, goal: "", status: "planned" }]);
    toast.success(`Sprint ${sprints.length + 1} added!`);
  };

  const toggleSprintStatus = (sprintId: string) => {
    const sprint = sprints.find(s => s.id === sprintId);
    if (!sprint) return;

    if (sprint.status === "planned") {
      // Check if another sprint is active
      const hasActive = sprints.some(s => s.status === "active");
      if (hasActive) {
        toast.error("Finish the current active sprint before starting a new one.");
        return;
      }
      setSprints(sprints.map(s => s.id === sprintId ? { ...s, status: "active" } : s));
      toast.success(`${sprint.name} started! It is now visible on the Kanban board.`);
    } else if (sprint.status === "active") {
      setSprints(sprints.map(s => s.id === sprintId ? { ...s, status: "completed" } : s));
      toast.success(`${sprint.name} completed!`);
    }
  };

  const moveTask = (taskId: string, destSprintId: string | "Backlog") => {
    const destSprint = sprints.find(s => s.id === destSprintId);
    if (destSprint?.status === "completed") {
      toast.error("Cannot move tasks into a completed sprint.");
      return;
    }

    setTasks(tasks.map(t => t.id === taskId ? { ...t, sprint: destSprintId as any, projectId: selectedProject } : t));
    if (destSprintId !== "Backlog") {
      toast.success("Task moved to Sprint! AI recalculated the timeline.");
    } else {
      toast("Task returned to Backlog. Timelines adjusted.");
    }
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Header Area */}
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Sprints</h1>
          <p className="text-muted-foreground mt-1 text-sm">Drag tasks to build your sprints. AI auto-generates the delivery timelines.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[240px] bg-card border-dashed">
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-card">
                <Download className="size-4" /> Export Plan
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem onClick={() => toast.success("Project exported as CSV!")}>
                <FileSpreadsheet className="mr-2 size-4 text-emerald-600" /> Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success("Project exported as PDF!")}>
                <FileText className="mr-2 size-4 text-rose-600" /> Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Sprints Stack */}
      <div className="space-y-8">
        {sprintData.map((s, idx) => (
          <div key={s.id} className={`rounded-3xl border bg-card shadow-sm overflow-hidden transition-all ${s.status === 'active' ? 'ring-2 ring-primary shadow-md' : 'ring-1 ring-primary/10'} ${s.status === 'completed' ? 'opacity-70 grayscale-[30%]' : ''}`}>
            {/* Sprint Header */}
            <div className={`p-6 border-b ${s.status === 'active' ? 'bg-primary/5' : 'bg-gradient-to-r from-primary/[0.04] via-transparent to-transparent'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-xl flex items-center gap-2">
                      <Target className="size-5 text-primary" /> {s.name}
                    </h3>
                    {s.status === "active" && <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold uppercase tracking-wider">Active</span>}
                    {s.status === "completed" && <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-bold uppercase tracking-wider">Completed</span>}
                    {s.status === "planned" && <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-xs font-bold uppercase tracking-wider">Planned</span>}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1.5 flex items-center gap-3 font-medium">
                    <span className="flex items-center gap-1.5"><Calendar className="size-4" /> {formatDate(s.startDate)} - {formatDate(s.endDate)}</span>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-md flex items-center gap-1"><Sparkles className="size-3.5" /> AI Calc: {s.requiredDays} Working Days</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center justify-end gap-4 text-sm font-semibold tabular-nums">
                    <div className="flex flex-col items-end"><span className="text-muted-foreground text-xs font-medium">Est. Workload</span>{s.totalHours.toFixed(1)}h</div>
                    <div className="flex flex-col items-end"><span className="text-muted-foreground text-xs font-medium">Story Points</span>{s.totalSP} SP</div>
                  </div>
                  {s.status === "planned" && (
                    <Button onClick={() => toggleSprintStatus(s.id)}>Start Sprint</Button>
                  )}
                  {s.status === "active" && (
                    <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => toggleSprintStatus(s.id)}>Complete Sprint</Button>
                  )}
                </div>
              </div>
            </div>

            {/* Sprint Task List */}
            <div className="p-4 bg-muted/10 space-y-3 min-h-[120px]">
              {s.tasks.map((t) => (
                <TaskRow key={t.id} task={t} sprints={sprints} onMove={moveTask} currentContainer={s.id} />
              ))}
              {s.tasks.length === 0 && (
                <div className="h-[120px] rounded-xl flex flex-col items-center justify-center text-sm text-muted-foreground border-2 border-dashed border-muted bg-background/50">
                  <div className="size-10 rounded-full bg-muted/50 grid place-items-center mb-3"><Target className="size-5 text-muted-foreground/40" /></div>
                  <p className="font-medium text-foreground/70">Sprint is empty</p>
                  <p className="text-xs mt-1">Move tasks from the backlog below.</p>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="pt-2">
          <Button variant="outline" className="w-full h-14 rounded-2xl border-dashed border-2 bg-card/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all group" onClick={handleCreateSprint}>
            <Plus className="size-5 mr-2 group-hover:scale-125 transition-transform text-primary/70" /> 
            <span className="font-medium text-base">Create Next Sprint</span>
          </Button>
        </div>
      </div>

      {/* Backlog Section */}
      <div className="mt-20 rounded-3xl border bg-card shadow-md overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300 opacity-50"></div>
        <div className="p-6 border-b bg-muted/20 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-xl text-foreground/80 flex items-center gap-2">
              Product Backlog
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Unassigned tasks for this project ({backlogTasks.length})</p>
          </div>
        </div>
        <div className="p-4 bg-muted/10 space-y-3 min-h-[200px]">
          {backlogTasks.map((t) => (
            <TaskRow key={t.id} task={t} sprints={sprints} onMove={moveTask} currentContainer="Backlog" />
          ))}
          {backlogTasks.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <div className="size-16 rounded-full bg-muted/50 grid place-items-center mx-auto mb-4 border border-dashed"><Sparkles className="size-6 text-muted-foreground/40" /></div>
              <p className="font-medium text-base">All caught up!</p>
              <p className="text-sm mt-1">No more tasks left in the backlog for this project.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable Task Row Component
function TaskRow({ task, sprints, onMove, currentContainer }: { task: any, sprints: SprintBlock[], onMove: (id: string, dest: string) => void, currentContainer: string }) {
  const m = memberById(task.assignee)!;
  return (
    <div className="group rounded-xl border bg-background p-3 hover:shadow-md hover:border-primary/40 transition-all flex items-center gap-4">
      <div className="flex-1 min-w-0 flex items-center gap-4">
        <div className="w-20 shrink-0">
          <PriorityBadge p={task.priority} />
        </div>
        <div className="flex-1 truncate text-sm font-medium">
          <span className="text-[10px] font-mono text-muted-foreground mr-2">#{task.id}</span>
          {task.title}
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/5 px-2 py-1 rounded-md w-16 justify-center">
            <Sparkles className="size-3" />{task.aiHours}h
          </span>
          <Avatar className="size-7 border"><AvatarImage src={m.avatar} /><AvatarFallback>{m.name[0]}</AvatarFallback></Avatar>
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" className="h-8 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity w-[100px]">
            <ArrowRightLeft className="size-3 mr-2 text-muted-foreground"/> Move
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          {currentContainer !== "Backlog" && (
            <DropdownMenuItem onClick={() => onMove(task.id, "Backlog")} className="font-medium text-muted-foreground">
              Send to Backlog
            </DropdownMenuItem>
          )}
          {sprints.map(s => (
             currentContainer !== s.id && (
               <DropdownMenuItem key={s.id} onClick={() => onMove(task.id, s.id)} className="font-medium">
                 Move to {s.name}
               </DropdownMenuItem>
             )
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
