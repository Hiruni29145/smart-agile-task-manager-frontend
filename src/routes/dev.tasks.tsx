import { createFileRoute } from "@tanstack/react-router";
import { tasks } from "@/lib/mock";
import { useState } from "react";
import { PriorityBadge } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, LayoutGrid, List, Search, MoreHorizontal, Clock, Target, Play, Check, ChevronDown, AlignLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dev/tasks")({ component: MyTasks });

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do", color: "bg-slate-500" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-500" },
  { value: "review", label: "Review", color: "bg-amber-500" },
  { value: "done", label: "Done", color: "bg-emerald-500" },
];

const statusLabelMap: Record<string, string> = {
  todo: "To Do", in_progress: "In Progress", review: "Review", done: "Done",
};
const statusColorMap: Record<string, string> = {
  todo: "bg-slate-500", in_progress: "bg-blue-500", review: "bg-amber-500", done: "bg-emerald-500",
};

function MyTasks() {
  const mine = tasks.filter((t) => t.assignee === "u1");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchQ, setSearchQ] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  // Log Time Dialog state
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false);
  const [logHours, setLogHours] = useState("");

  const filteredTasks = mine.filter(t => {
    if (filterStatus !== "All" && t.status !== filterStatus) return false;
    if (searchQ && !t.title.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  const selected = mine.find((t) => t.id === selectedTaskId);

  const handleUpdateStatus = (taskId: string, newStatus: string) => {
    // In a real app, update DB. Here we just toast.
    toast.success(`Status updated to ${statusLabelMap[newStatus]}`);
  };

  const handleLogTime = () => {
    if (!logHours) return;
    toast.success(`Logged ${logHours} hours successfully!`);
    setIsLogTimeOpen(false);
    setLogHours("");
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-end justify-between flex-wrap gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and execute your assigned workload.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border bg-card p-1 shadow-sm">
            <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" className="px-3" onClick={() => setViewMode("grid")}>
              <LayoutGrid className="size-4" />
            </Button>
            <Button variant={viewMode === "table" ? "secondary" : "ghost"} size="sm" className="px-3" onClick={() => setViewMode("table")}>
              <List className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar w-full sm:w-auto">
          <Badge 
            variant="outline" 
            className={cn("cursor-pointer px-4 py-1.5 text-sm whitespace-nowrap", filterStatus === "All" ? "bg-primary/10 text-primary border-primary/30" : "hover:bg-muted")}
            onClick={() => setFilterStatus("All")}
          >
            All Tasks
          </Badge>
          {STATUS_OPTIONS.map(s => (
            <Badge 
              key={s.value} 
              variant="outline" 
              className={cn("cursor-pointer px-4 py-1.5 text-sm whitespace-nowrap", filterStatus === s.value ? "bg-primary/10 text-primary border-primary/30" : "hover:bg-muted")}
              onClick={() => setFilterStatus(s.value)}
            >
              <div className={cn("size-1.5 rounded-full mr-2", s.color)} />
              {s.label}
            </Badge>
          ))}
        </div>
        
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            value={searchQ} 
            onChange={(e) => setSearchQ(e.target.value)} 
            placeholder="Search tasks..." 
            className="pl-9 rounded-xl bg-card" 
          />
        </div>
      </div>

      {/* Main Content */}
      {viewMode === "grid" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map(t => (
            <div key={t.id} onClick={() => setSelectedTaskId(t.id)} className="group cursor-pointer rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md transition-all hover:border-primary/30 flex flex-col h-full ring-1 ring-primary/5">
              <div className="flex justify-between items-start mb-3">
                <Badge variant="secondary" className="bg-muted text-muted-foreground border-0 font-medium tracking-wide text-xs">
                  {t.type}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" className="h-7 text-xs rounded-lg gap-1 border-dashed">
                      <div className={cn("size-1.5 rounded-full", statusColorMap[t.status])} />
                      {statusLabelMap[t.status]}
                      <ChevronDown className="size-3 text-muted-foreground ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    {STATUS_OPTIONS.map(s => (
                      <DropdownMenuItem key={s.value} onClick={() => handleUpdateStatus(t.id, s.value)}>
                        <div className={cn("size-2 rounded-full mr-2", s.color)} />
                        {s.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors leading-tight">
                {t.title}
              </h3>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                {t.description}
              </p>
              
              <div className="pt-4 border-t flex items-center justify-between text-xs font-medium text-muted-foreground">
                <PriorityBadge p={t.priority} />
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-primary/80" title="AI Estimated Hours"><Sparkles className="size-3" /> {t.aiHours}h</span>
                  <span className="flex items-center gap-1" title="Actual Logged Hours"><Clock className="size-3" /> {t.actualHours ?? 0}h</span>
                  <span className="flex items-center gap-1" title="Story Points"><Target className="size-3" /> {t.storyPoints}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredTasks.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-2xl bg-muted/10">
              No tasks found matching your filters.
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden ring-1 ring-primary/5">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground border-b">
              <tr>
                <th className="text-left p-4 font-semibold">Task</th>
                <th className="text-left p-4 font-semibold w-36">Status</th>
                <th className="text-left p-4 font-semibold w-28">Priority</th>
                <th className="text-right p-4 font-semibold w-24">AI Est.</th>
                <th className="text-right p-4 font-semibold w-24">Logged</th>
                <th className="text-center p-4 font-semibold w-16">SP</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTasks.map((t) => (
                <tr key={t.id} onClick={() => setSelectedTaskId(t.id)} className="hover:bg-muted/30 cursor-pointer transition-colors group">
                  <td className="p-4">
                    <div className="font-medium group-hover:text-primary transition-colors">{t.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 truncate max-w-md">{t.description}</div>
                  </td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 text-xs rounded-lg gap-2 justify-start w-full hover:bg-muted/50 border border-transparent hover:border-border">
                          <div className={cn("size-2 rounded-full", statusColorMap[t.status])} />
                          {statusLabelMap[t.status]}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {STATUS_OPTIONS.map(s => (
                          <DropdownMenuItem key={s.value} onClick={() => handleUpdateStatus(t.id, s.value)}>
                            <div className={cn("size-2 rounded-full mr-2", s.color)} />
                            {s.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                  <td className="p-4"><PriorityBadge p={t.priority} /></td>
                  <td className="p-4 text-right font-medium text-primary/80 tabular-nums"><Sparkles className="size-3 inline-block mr-1 opacity-50" />{t.aiHours}h</td>
                  <td className="p-4 text-right font-medium tabular-nums">{t.actualHours ?? 0}h</td>
                  <td className="p-4 text-center font-medium tabular-nums">{t.storyPoints}</td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground bg-muted/10">No tasks found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Details Sheet */}
      <Sheet open={!!selectedTaskId} onOpenChange={(o) => !o && setSelectedTaskId(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selected && (() => {
            const logged = selected.actualHours ?? 0;
            const estimated = selected.aiHours;
            const percent = Math.min((logged / estimated) * 100, 100);
            const isOver = logged > estimated;
            
            return (
              <>
                <SheetHeader className="pb-6 border-b text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold bg-muted/50">
                      {selected.id}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-bold border-0 bg-primary/10 text-primary">
                      {selected.type}
                    </Badge>
                  </div>
                  <SheetTitle className="text-xl leading-tight">{selected.title}</SheetTitle>
                  <SheetDescription className="mt-2 text-sm">
                    {selected.description}
                  </SheetDescription>
                </SheetHeader>
                
                <div className="py-6 space-y-8">
                  {/* Status & Actions */}
                  <div className="flex flex-col gap-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between rounded-xl h-12 shadow-sm border-dashed">
                          <span className="flex items-center gap-2">
                            <span className="text-muted-foreground">Status:</span>
                            <div className={cn("size-2 rounded-full", statusColorMap[selected.status])} />
                            <span className="font-semibold">{statusLabelMap[selected.status]}</span>
                          </span>
                          <ChevronDown className="size-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                        {STATUS_OPTIONS.map(s => (
                          <DropdownMenuItem key={s.value} onClick={() => handleUpdateStatus(selected.id, s.value)} className="py-2.5">
                            <div className={cn("size-2 rounded-full mr-2", s.color)} />
                            {s.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button className="w-full rounded-xl h-12 shadow-md gap-2" onClick={() => setIsLogTimeOpen(true)}>
                      <Clock className="size-4" /> Log Time Worked
                    </Button>
                  </div>

                  {/* Estimation Tracker */}
                  <div className="rounded-2xl border bg-muted/10 p-5 space-y-4">
                    <h4 className="font-semibold text-sm flex items-center gap-2"><AlignLeft className="size-4" /> Estimation Tracker</h4>
                    
                    <div>
                      <div className="flex justify-between text-sm font-bold mb-2">
                        <span className={isOver ? "text-destructive" : "text-foreground"}>{logged}h Logged</span>
                        <span className="text-muted-foreground">{estimated}h AI Est.</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden relative">
                        <div 
                          className={cn("h-full transition-all duration-1000 ease-out rounded-full", isOver ? "bg-destructive" : "bg-primary")} 
                          style={{ width: `${percent}%` }} 
                        />
                        {isOver && (
                          <div className="absolute top-0 right-0 h-full w-full bg-destructive/20 border-l-2 border-destructive" style={{ left: '100%' }} />
                        )}
                      </div>
                      {isOver && <p className="text-xs text-destructive mt-2 font-medium">You have exceeded the AI's estimation.</p>}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border bg-card p-4">
                      <div className="text-xs text-muted-foreground mb-1">Priority</div>
                      <PriorityBadge p={selected.priority} />
                    </div>
                    <div className="rounded-2xl border bg-card p-4">
                      <div className="text-xs text-muted-foreground mb-1">Story Points</div>
                      <div className="text-xl font-bold">{selected.storyPoints}</div>
                    </div>
                    <div className="rounded-2xl border bg-card p-4 bg-primary/[0.02]">
                      <div className="text-xs text-primary/80 font-medium mb-1 flex items-center gap-1"><Sparkles className="size-3" /> AI Confidence</div>
                      <div className="text-xl font-bold text-primary">{selected.confidence}%</div>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* Log Time Dialog */}
      <Dialog open={isLogTimeOpen} onOpenChange={setIsLogTimeOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Log Time</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Hours Worked</Label>
              <Input 
                type="number" 
                min="0.5" 
                step="0.5" 
                placeholder="e.g. 2.5" 
                value={logHours} 
                onChange={(e) => setLogHours(e.target.value)} 
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogTimeOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleLogTime} className="rounded-xl">Save Log</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
