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
import { apiClient } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/app/dashboard")({ component: Dashboard });

function Dashboard() {
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient<any>('/api/v1/dashboard/stats')
  });
  const stats = statsData?.data || { activeProjects: 0, activeSprints: 0, openTasks: 0, totalMembers: 0 };

  // Global Aggregations
  const activeProjects = stats.activeProjects;
  const activeSprints = stats.activeSprints; 
  const openTasks = stats.openTasks;
  const teamSize = stats.totalMembers;
  
  const { data: activeSprintsData, isLoading: isLoadingActiveSprints } = useQuery({
    queryKey: ['dashboard-active-sprints'],
    queryFn: () => apiClient<any>('/api/v1/dashboard/active-sprints')
  });
  const activeSprintsList = activeSprintsData?.data?.items || [];

  const { data: globalDistData, isLoading: isLoadingGlobalDist } = useQuery({
    queryKey: ['dashboard-global-distribution'],
    queryFn: () => apiClient<any>('/api/v1/dashboard/global-distribution')
  });
  const distRaw = globalDistData?.data || { feature: 0, bug: 0, chore: 0, spike: 0 };
  const taskDistributionData = [
    { name: "Feature", value: distRaw.feature || 0, fill: "var(--color-chart-1, #3b82f6)" },
    { name: "Bug", value: distRaw.bug || 0, fill: "var(--color-chart-2, #f59e0b)" },
    { name: "Chore", value: distRaw.chore || 0, fill: "var(--color-chart-3, #10b981)" },
    { name: "Spike", value: distRaw.spike || 0, fill: "var(--color-chart-4, #a855f7)" }
  ];
  const totalDist = taskDistributionData.reduce((acc, curr) => acc + curr.value, 0);
  const pieData = totalDist === 0 ? [{ name: "No tasks", value: 1, fill: "var(--color-muted)" }] : taskDistributionData;
  
  const { data: teamsStatsData, isLoading: isLoadingTeamStats } = useQuery({
    queryKey: ['dashboard-team-stats'],
    queryFn: () => apiClient<any>('/api/v1/teams/stats')
  });
  const teamStats = teamsStatsData?.data || { totalDeveloper: 0, activeNow: 0, overloaded: 0, avgWorkload: 0 };

  const { data: teamMembersData, isLoading: isLoadingTeamMembers } = useQuery({
    queryKey: ['dashboard-team-members'],
    queryFn: () => apiClient<any>('/api/v1/teams/members')
  });
  const teamMembersList = teamMembersData?.data?.items || [];
  const overloadedMembers = teamMembersList.filter((m: any) => m.workloadPercentage >= 90);
  const healthyMembers = teamMembersList.filter((m: any) => m.workloadPercentage < 90);

  const { data: recentTasksData, isLoading: isLoadingRecentTasks } = useQuery({
    queryKey: ['dashboard-recent-tasks'],
    queryFn: () => apiClient<any>('/api/v1/tasks?page=1&limit=5')
  });
  const recentTasksList = recentTasksData?.data?.items || [];

  const { data: recentNotifsData, isLoading: isLoadingRecentNotifs } = useQuery({
    queryKey: ['dashboard-recent-notifications'],
    queryFn: () => apiClient<any>('/api/v1/notifications?page=1')
  });
  const recentNotificationsList = recentNotifsData?.data?.items?.slice(0, 5) || [];

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
        </div>
      </div>

      {/* Top Executive Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoadingStats ? (
          Array.from({ length: 4 }).map((_, i) => (
             <div key={i} className="border rounded-3xl p-6 bg-card flex flex-col justify-between h-[132px] ring-1 ring-primary/5">
                <Skeleton className="h-5 w-32 mb-4" />
                <Skeleton className="h-10 w-16" />
             </div>
          ))
        ) : (
          <>
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
          </>
        )}
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
            {isLoadingActiveSprints ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 rounded-2xl bg-muted/20 border border-transparent">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Skeleton className="size-3 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-6 w-48 mt-1" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-md" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                      <Skeleton className="h-3 w-full rounded-full" />
                    </div>
                  </div>
                </div>
              ))
            ) : activeSprintsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-10">
                <Target className="size-10 mb-4 opacity-20" />
                <p>No active sprints right now.</p>
              </div>
            ) : (
              activeSprintsList.map((sp: any, i: number) => (
                <div key={sp.sprintId || i} className="group p-4 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-colors border border-transparent hover:border-border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="size-3 rounded-full shadow-sm bg-primary/40" />
                        <span className="font-semibold text-sm text-muted-foreground">{sp.projectName}</span>
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
                        <span className="text-muted-foreground">{sp.completedTasks} / {sp.totalTasks} Tasks Done</span>
                        <span className="text-primary">{sp.progressPercentage}%</span>
                      </div>
                      <div className="h-3 bg-muted/50 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-primary transition-all duration-1000 ease-out rounded-full shadow-sm" 
                          style={{ width: `${sp.progressPercentage}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Task Distribution */}
        <div className="rounded-3xl border bg-card p-6 shadow-sm ring-1 ring-primary/5 flex flex-col">
          <div>
            <h3 className="font-bold text-xl">Global Distribution</h3>
            <p className="text-sm text-muted-foreground">Across all active projects</p>
          </div>
          {isLoadingGlobalDist ? (
            <div className="flex-1 flex flex-col justify-center items-center mt-6">
              <Skeleton className="size-48 rounded-full mb-6" />
              <div className="grid grid-cols-2 gap-3 w-full">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col mt-6">
              <div className="flex-1 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius="65%" outerRadius="90%" paddingAngle={totalDist === 0 ? 0 : 4}>
                      {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    {totalDist > 0 && <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />}
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6 text-sm font-medium">
                {taskDistributionData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 bg-muted/30 p-2.5 rounded-xl border border-transparent hover:border-border transition-colors">
                    <span className="size-3 rounded-full shadow-sm shrink-0" style={{ background: d.fill }} />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="ml-auto tabular-nums font-bold text-foreground/80">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Team Health Workload */}
        <div className="rounded-3xl border bg-card p-6 shadow-sm ring-1 ring-primary/5 flex flex-col">
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
              {isLoadingTeamStats ? <Skeleton className="h-8 w-10 mb-1" /> : <span className="text-3xl font-bold text-emerald-600">{healthyMembers.length}</span>}
              <span className="text-xs font-bold text-emerald-600/80 uppercase tracking-wider mt-1">Healthy</span>
            </div>
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
              <AlertTriangle className="size-6 text-destructive mb-2" />
              {isLoadingTeamStats ? <Skeleton className="h-8 w-10 mb-1" /> : <span className="text-3xl font-bold text-destructive">{overloadedMembers.length}</span>}
              <span className="text-xs font-bold text-destructive/80 uppercase tracking-wider mt-1">Overloaded</span>
            </div>
          </div>
          
          <div className="space-y-4 flex-1">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">High Workload Alert</h4>
            {isLoadingTeamMembers ? (
               <Skeleton className="h-14 w-full rounded-xl" />
            ) : overloadedMembers.length > 0 ? (
              overloadedMembers.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between bg-muted/30 p-3 rounded-xl border">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8 border"><AvatarImage src={m.avatar} /><AvatarFallback>{m.firstName?.[0]}</AvatarFallback></Avatar>
                    <span className="font-medium text-sm">{m.firstName} {m.lastName}</span>
                  </div>
                  <Badge variant="destructive" className="bg-destructive/10 text-destructive border-0 hover:bg-destructive/10 px-2 py-1 text-xs">{m.workloadPercentage}%</Badge>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4 bg-muted/20 rounded-xl border border-dashed flex-1 h-[60px] flex items-center justify-center">All team members are at healthy capacity.</div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-3xl border bg-card p-6 shadow-sm ring-1 ring-primary/5 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-xl flex items-center gap-2"><Activity className="size-5 text-primary" /> Recent Activity</h3>
              <p className="text-sm text-muted-foreground">Latest notifications</p>
            </div>
            <Link to="/app/settings"><Button variant="ghost" size="icon" className="rounded-full"><ArrowUpRight className="size-5" /></Button></Link>
          </div>
          <div className="space-y-4 flex-1 flex flex-col">
            {isLoadingRecentNotifs ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2 mt-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))
            ) : recentNotificationsList.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-10 bg-muted/20 rounded-xl border border-dashed flex-1 flex flex-col justify-center items-center">
                 <Activity className="size-8 opacity-20 mb-2" />
                 No recent activity.
              </div>
            ) : (
              recentNotificationsList.map((notif: any, i: number) => (
                <div key={i} className="flex gap-3 p-2 rounded-xl hover:bg-muted/30 transition">
                  <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                     <Activity className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm leading-snug">{notif.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(notif.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="rounded-3xl border bg-card p-6 shadow-sm ring-1 ring-primary/5 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-xl flex items-center gap-2"><ListTodo className="size-5 text-primary" /> Recent Tasks</h3>
              <p className="text-sm text-muted-foreground">Latest updates in pipeline</p>
            </div>
            <Link to="/app/backlog"><Button variant="ghost" size="icon" className="rounded-full"><ArrowUpRight className="size-5" /></Button></Link>
          </div>
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {isLoadingRecentTasks ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))
            ) : recentTasksList.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-10 bg-muted/20 rounded-xl border border-dashed flex-1 flex flex-col justify-center items-center">
                 <ListTodo className="size-8 opacity-20 mb-2" />
                 No recent tasks.
              </div>
            ) : (
              recentTasksList.map((task: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-muted/20 hover:bg-muted/50 transition border border-transparent hover:border-border">
                  <div className={`w-1.5 h-10 rounded-full shrink-0 ${task.priority === 'High' ? 'bg-destructive' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{task.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2 font-medium">
                      <span className="flex items-center gap-1 text-foreground/80">{task.status}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">{task.type}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
