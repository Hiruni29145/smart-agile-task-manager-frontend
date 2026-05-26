import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FolderKanban, Users, ListTodo, Sparkles, Activity,
  ArrowUpRight, Plus, Calendar, Target, Clock, AlertTriangle, ShieldCheck
} from "lucide-react";
import { ProgressRing } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import {
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip
} from "recharts";
import { taskDistribution, activity, members, projects, tasks, aiHistory } from "@/lib/mock";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/dashboard")({ component: Dashboard });

function Dashboard() {
  // Global Aggregations
  const activeProjects = projects.filter(p => p.status === "Active").length;
  // Let's pretend each active project has 1 active sprint for the dashboard
  const activeSprints = activeProjects; 
  const openTasks = tasks.filter(t => t.status !== "done").length;
  const teamSize = members.length;
  const totalAiPredictions = aiHistory.length;
  
  // Team Health
  const overloadedMembers = members.filter(m => m.workload >= 90);
  const healthyMembers = members.filter(m => m.workload < 90);
  
  // Active Sprints Mock Data
  const sprintProgressList = projects.slice(0, 3).map((p, i) => {
    const total = 20 + i * 15;
    const done = 8 + i * 10;
    const percent = Math.round((done / total) * 100);
    return {
      project: p.name,
      sprintName: `Sprint ${10 + i}`,
      daysLeft: 5 - i,
      total,
      done,
      percent,
      color: p.color
    };
  });

  // Modify Weekly Activity to "Tasks Created vs Tasks Completed"
  const modifiedWeeklyActivity = [
    { day: "Mon", created: 12, completed: 8 },
    { day: "Tue", created: 5, completed: 15 },
    { day: "Wed", created: 8, completed: 10 },
    { day: "Thu", created: 3, completed: 12 },
    { day: "Fri", created: 15, completed: 6 },
    { day: "Sat", created: 2, completed: 1 },
    { day: "Sun", created: 0, completed: 0 },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Global overview of all projects, sprints, and team health.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 rounded-xl" asChild>
            <Link to="/app/projects"><FolderKanban className="size-4" /> View Projects</Link>
          </Button>
          <Button className="gap-2 rounded-xl" asChild>
            <Link to="/app/projects"><Plus className="size-4" /> Create Project</Link>
          </Button>
        </div>
      </div>

      {/* Top Executive Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="border rounded-3xl p-6 bg-card flex flex-col justify-between hover:shadow-md transition-all ring-1 ring-primary/5">
          <div className="flex items-center gap-3 mb-4 text-muted-foreground">
            <FolderKanban className="size-5" /> <span className="font-medium text-sm">Active Projects</span>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-4xl font-bold">{activeProjects}</div>
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-0 mb-1">+1 this month</Badge>
          </div>
        </div>
        <div className="border rounded-3xl p-6 bg-card flex flex-col justify-between hover:shadow-md transition-all ring-1 ring-primary/5">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <Calendar className="size-5" /> <span className="font-medium text-sm">Active Sprints</span>
          </div>
          <div className="text-4xl font-bold text-primary">{activeSprints}</div>
        </div>
        <div className="border rounded-3xl p-6 bg-card flex flex-col justify-between hover:shadow-md transition-all ring-1 ring-primary/5">
          <div className="flex items-center gap-3 mb-4 text-amber-500">
            <ListTodo className="size-5" /> <span className="font-medium text-sm">Open Tasks</span>
          </div>
          <div className="text-4xl font-bold">{openTasks}</div>
        </div>
        <div className="border rounded-3xl p-6 bg-card flex flex-col justify-between hover:shadow-md transition-all ring-1 ring-primary/5">
          <div className="flex items-center gap-3 mb-4 text-muted-foreground">
            <Users className="size-5" /> <span className="font-medium text-sm">Total Members</span>
          </div>
          <div className="text-4xl font-bold">{teamSize}</div>
        </div>
        <div className="border rounded-3xl p-6 bg-gradient-to-br from-primary/10 to-info/10 border-primary/20 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <Sparkles className="size-5" /> <span className="font-medium text-sm">AI Estimations</span>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-4xl font-bold text-primary">{totalAiPredictions}</div>
            <span className="text-xs font-bold text-primary/70">94% Acc</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Sprints Overview */}
        <div className="lg:col-span-2 rounded-3xl border bg-card p-6 shadow-sm ring-1 ring-primary/5 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-xl">Active Sprints Progress</h3>
              <p className="text-sm text-muted-foreground">Tracking completion across all ongoing projects.</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="rounded-xl">
              <Link to="/app/reports">View Reports <ArrowUpRight className="size-4 ml-1" /></Link>
            </Button>
          </div>
          
          <div className="space-y-6 flex-1">
            {sprintProgressList.map((sp, i) => (
              <div key={i} className="group p-4 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-colors border border-transparent hover:border-border">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="size-3 rounded-full shadow-sm" style={{ backgroundColor: sp.color }} />
                      <span className="font-semibold text-sm text-muted-foreground">{sp.project}</span>
                    </div>
                    <h4 className="font-bold text-xl leading-none">{sp.sprintName}</h4>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={sp.daysLeft <= 2 ? "border-destructive text-destructive bg-destructive/10 px-3 py-1" : "px-3 py-1 bg-background"}>
                      {sp.daysLeft} days left
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-muted-foreground">{sp.done} / {sp.total} Tasks Done</span>
                      <span className="text-primary">{sp.percent}%</span>
                    </div>
                    <div className="h-3 bg-muted/50 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-primary transition-all duration-1000 ease-out rounded-full shadow-sm" 
                        style={{ width: `${sp.percent}%`, backgroundColor: sp.color }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Distribution */}
        <div className="rounded-3xl border bg-card p-6 shadow-sm ring-1 ring-primary/5 flex flex-col">
          <div>
            <h3 className="font-bold text-xl">Global Distribution</h3>
            <p className="text-sm text-muted-foreground">Across all active projects</p>
          </div>
          <div className="flex-1 flex flex-col justify-center min-h-[200px]">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={taskDistribution} dataKey="value" innerRadius={60} outerRadius={90} paddingAngle={4}>
                  {taskDistribution.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 mt-2 text-sm font-medium">
              {taskDistribution.map((d) => (
                <div key={d.name} className="flex items-center gap-2 bg-muted/30 p-2 rounded-xl">
                  <span className="size-3 rounded-full shadow-sm" style={{ background: d.fill }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="ml-auto tabular-nums">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Team Health Workload */}
        <div className="rounded-3xl border bg-card p-6 shadow-sm ring-1 ring-primary/5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-xl">Team Health</h3>
              <p className="text-sm text-muted-foreground">Capacity management</p>
            </div>
            <Link to="/app/teams"><Button variant="ghost" size="icon" className="rounded-full"><ArrowUpRight className="size-5" /></Button></Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
              <ShieldCheck className="size-6 text-emerald-600 mb-2" />
              <span className="text-3xl font-bold text-emerald-600">{healthyMembers.length}</span>
              <span className="text-xs font-bold text-emerald-600/80 uppercase tracking-wider mt-1">Healthy</span>
            </div>
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
              <AlertTriangle className="size-6 text-destructive mb-2" />
              <span className="text-3xl font-bold text-destructive">{overloadedMembers.length}</span>
              <span className="text-xs font-bold text-destructive/80 uppercase tracking-wider mt-1">Overloaded</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">High Workload Alert</h4>
            {overloadedMembers.length > 0 ? overloadedMembers.map((m) => (
              <div key={m.id} className="flex items-center justify-between bg-muted/30 p-3 rounded-xl border">
                <div className="flex items-center gap-3">
                  <Avatar className="size-8 border"><AvatarImage src={m.avatar} /><AvatarFallback>{m.name[0]}</AvatarFallback></Avatar>
                  <span className="font-medium text-sm">{m.name}</span>
                </div>
                <Badge variant="destructive" className="bg-destructive/10 text-destructive border-0 hover:bg-destructive/10 px-2 py-1 text-xs">{m.workload}%</Badge>
              </div>
            )) : (
              <div className="text-sm text-muted-foreground text-center py-4 bg-muted/20 rounded-xl border border-dashed">All team members are at healthy capacity.</div>
            )}
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="rounded-3xl border bg-card p-6 shadow-sm ring-1 ring-primary/5">
          <div className="mb-6">
            <h3 className="font-bold text-xl">Weekly Output</h3>
            <p className="text-sm text-muted-foreground">Tasks Created vs Completed</p>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modifiedWeeklyActivity} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} cursor={{fill: 'var(--color-muted)', opacity: 0.2}} />
                <Bar dataKey="created" fill="var(--color-chart-1, #3b82f6)" radius={[4, 4, 0, 0]} name="Created" maxBarSize={20} />
                <Bar dataKey="completed" fill="var(--color-chart-3, #10b981)" radius={[4, 4, 0, 0]} name="Completed" maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent AI Predictions */}
        <div className="rounded-3xl border bg-card p-6 shadow-sm ring-1 ring-primary/5 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-xl flex items-center gap-2"><Sparkles className="size-5 text-primary" /> Recent AI Est.</h3>
              <p className="text-sm text-muted-foreground">Latest tasks processed</p>
            </div>
            <Link to="/app/ai-center"><Button variant="ghost" size="icon" className="rounded-full"><ArrowUpRight className="size-5" /></Button></Link>
          </div>
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {aiHistory.slice().reverse().slice(0, 4).map((h, i) => {
              const sp = h.predicted < 6 ? 3 : h.predicted < 12 ? 5 : 8;
              return (
                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-muted/20 hover:bg-muted/50 transition border border-transparent hover:border-border">
                  <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-sm border border-primary/20">
                    <Sparkles className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{h.task}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2 font-medium">
                      <span className="flex items-center gap-1"><Clock className="size-3"/> {h.predicted}h</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Target className="size-3"/> {sp} SP</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
