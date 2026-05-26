import { createFileRoute, Link } from "@tanstack/react-router";
import { ListTodo, CheckCircle2, Clock, Sparkles, ArrowRight, Play, Check, AlertCircle, Activity } from "lucide-react";
import { tasks, activity, members } from "@/lib/mock";
import { PriorityBadge } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dev/dashboard")({ component: DevDashboard });

function DevDashboard() {
  const me = members.find(m => m.id === "u1") || members[0];
  const mine = tasks.filter((t) => t.assignee === me.id);
  
  const completedTasks = mine.filter((t) => t.status === "done");
  const pendingTasks = mine.filter((t) => t.status !== "done");
  
  const inProgress = pendingTasks.filter(t => t.status === "in_progress");
  const todo = pendingTasks.filter(t => t.status === "todo");
  
  // Current Focus: First In Progress task, or first Todo
  const currentFocus = inProgress.length > 0 ? inProgress[0] : todo[0];
  
  // Upcoming Queue: Rest of pending tasks
  const upcoming = pendingTasks.filter(t => t.id !== currentFocus?.id).slice(0, 4);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {me.name.split(" ")[0]}</h1>
          <p className="text-sm text-muted-foreground mt-1">Here is your personal execution hub.</p>
        </div>
      </div>

      {currentFocus && (
        <div className="rounded-3xl border bg-card p-6 shadow-sm ring-1 ring-primary/5 bg-gradient-to-br from-background to-primary/[0.02] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
            <div className="flex-1 space-y-4">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1 uppercase tracking-wider font-bold">
                Current Focus
              </Badge>
              <div>
                <h2 className="text-2xl font-bold">{currentFocus.title}</h2>
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground font-medium">
                  <div className="flex items-center gap-1.5"><PriorityBadge p={currentFocus.priority} /> Priority</div>
                  <span className="opacity-50">|</span>
                  <div className="flex items-center gap-1.5"><Sparkles className="size-4 text-primary" /> {currentFocus.aiHours}h AI Est.</div>
                  <span className="opacity-50">|</span>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="size-4" /> {currentFocus.storyPoints} Story Points</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              {currentFocus.status === "todo" ? (
                <Button size="lg" className="rounded-xl px-8 shadow-md gap-2"><Play className="size-4" /> Start Work</Button>
              ) : (
                <Button size="lg" className="rounded-xl px-8 shadow-md gap-2 bg-success hover:bg-success/90 text-success-foreground"><Check className="size-4" /> Mark Complete</Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Personal Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border rounded-3xl p-6 bg-card flex flex-col justify-between hover:shadow-md transition-all ring-1 ring-primary/5">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <ListTodo className="size-5" /> <span className="font-medium text-sm">Assigned</span>
          </div>
          <div className="text-4xl font-bold">{mine.length}</div>
        </div>
        <div className="border rounded-3xl p-6 bg-card flex flex-col justify-between hover:shadow-md transition-all ring-1 ring-primary/5">
          <div className="flex items-center gap-3 mb-4 text-emerald-500">
            <CheckCircle2 className="size-5" /> <span className="font-medium text-sm">Completed</span>
          </div>
          <div className="text-4xl font-bold">{completedTasks.length}</div>
        </div>
        <div className="border rounded-3xl p-6 bg-card flex flex-col justify-between hover:shadow-md transition-all ring-1 ring-primary/5">
          <div className="flex items-center gap-3 mb-4 text-amber-500">
            <Clock className="size-5" /> <span className="font-medium text-sm">Pending</span>
          </div>
          <div className="text-4xl font-bold">{pendingTasks.length}</div>
        </div>
        <div className="border rounded-3xl p-6 bg-card flex flex-col justify-between hover:shadow-md transition-all ring-1 ring-primary/5">
          <div className="flex items-center gap-3 mb-4 text-muted-foreground">
            <Activity className="size-5" /> <span className="font-medium text-sm">My Workload</span>
          </div>
          <div className="flex items-end justify-between">
            <div className={`text-4xl font-bold ${me.workload > 90 ? 'text-destructive' : ''}`}>{me.workload}%</div>
            {me.workload > 90 && <AlertCircle className="size-5 text-destructive mb-1" />}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Tasks */}
        <div className="lg:col-span-2 rounded-3xl border bg-card p-6 shadow-sm ring-1 ring-primary/5 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-xl">Upcoming Queue</h3>
              <p className="text-sm text-muted-foreground">Next tasks on your plate</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="rounded-xl">
              <Link to="/dev/tasks">View All <ArrowRight className="size-4 ml-1" /></Link>
            </Button>
          </div>
          
          <div className="space-y-3 flex-1">
            {upcoming.map((t) => (
              <div key={t.id} className="group p-4 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-colors border border-transparent hover:border-border flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="font-bold text-base truncate">{t.title}</div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground font-medium">
                    <PriorityBadge p={t.priority} />
                    <span>·</span>
                    <span className="flex items-center gap-1 text-primary/80"><Sparkles className="size-3" /> {t.aiHours}h</span>
                    <span>·</span>
                    <span>{t.storyPoints} SP</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg shrink-0 hidden sm:flex">Details</Button>
              </div>
            ))}
            {upcoming.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8 bg-muted/20 rounded-2xl border border-dashed">
                Your queue is empty!
              </div>
            )}
          </div>
        </div>

        {/* My Sprint Status & Activity */}
        <div className="space-y-6">
          <div className="rounded-3xl border bg-card p-6 shadow-sm ring-1 ring-primary/5">
            <h3 className="font-bold text-xl mb-6">Sprint Status</h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-muted-foreground">Tasks Completed</span>
                  <span className="text-foreground">{completedTasks.length} / {mine.length}</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000 ease-out rounded-full shadow-sm" 
                    style={{ width: `${mine.length > 0 ? (completedTasks.length / mine.length) * 100 : 0}%` }} 
                  />
                </div>
              </div>
              <div className="bg-muted/30 rounded-2xl p-4 space-y-3 border">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Days Remaining</span>
                  <span className="font-bold text-base">5</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">My Story Points</span>
                  <span className="font-bold text-base">{mine.reduce((a, t) => a + t.storyPoints, 0)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-sm ring-1 ring-primary/5">
            <h3 className="font-bold text-xl mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {activity.slice(0, 4).map((a, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1">
                    <div className="size-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <div className="text-sm">
                      <span className="font-bold">{a.who}</span> <span className="text-muted-foreground">{a.what}</span> <span className="font-medium">{a.target}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 font-medium">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
