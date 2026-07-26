import { createFileRoute, Link } from "@tanstack/react-router";
import { ListTodo, CheckCircle2, Clock, Sparkles, ArrowRight, AlertCircle, Activity } from "lucide-react";
import { PriorityBadge } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Task {
  id: number;
  title: string;
  priority: string;
  estimatedTime: number;
  storyPoints: number;
}

interface ActivityItem {
  id: number;
  user: string;
  action: string;
  target: string;
  timeAgo: string;
}

interface DevDashboardResponse {
  currentFocus: any | null;
  metrics: {
    assigned: number;
    completed: number;
    pending: number;
    workloadPercentage: number;
  };
  upcomingQueue: Task[];
  sprintStatus: {
    tasksCompleted: number;
    tasksTotal: number;
    daysRemaining: number;
    myStoryPoints: number;
  };
  recentActivity: ActivityItem[];
}

export const Route = createFileRoute("/dev/dashboard")({ component: DevDashboard });

function DevDashboard() {
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['dev-dashboard'],
    queryFn: () => apiClient<DevDashboardResponse>('/api/v1/developer/dashboard')
  });

  const data = response?.data;

  if (isLoading || !data) {
    return (
      <div className="space-y-8 pb-20">
        <div className="flex items-center justify-between border-b pb-6">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-[120px] rounded-3xl" />
          <Skeleton className="h-[120px] rounded-3xl" />
          <Skeleton className="h-[120px] rounded-3xl" />
          <Skeleton className="h-[120px] rounded-3xl" />
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[400px] rounded-3xl" />
          <Skeleton className="h-[400px] rounded-3xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-destructive border border-destructive/20 rounded-3xl bg-destructive/10 text-center font-medium">
        Failed to load dashboard data. Please try again.
      </div>
    );
  }

  const { metrics, upcomingQueue, sprintStatus, recentActivity } = data;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, Developer</h1>
          <p className="text-sm text-muted-foreground mt-1">Here is your personal execution hub.</p>
        </div>
      </div>


      {/* Personal Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border rounded-3xl p-6 bg-card flex flex-col justify-between hover:shadow-md transition-all ring-1 ring-primary/5">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <ListTodo className="size-5" /> <span className="font-medium text-sm">Assigned</span>
          </div>
          <div className="text-4xl font-bold">{metrics.assigned}</div>
        </div>
        <div className="border rounded-3xl p-6 bg-card flex flex-col justify-between hover:shadow-md transition-all ring-1 ring-primary/5">
          <div className="flex items-center gap-3 mb-4 text-emerald-500">
            <CheckCircle2 className="size-5" /> <span className="font-medium text-sm">Completed</span>
          </div>
          <div className="text-4xl font-bold">{metrics.completed}</div>
        </div>
        <div className="border rounded-3xl p-6 bg-card flex flex-col justify-between hover:shadow-md transition-all ring-1 ring-primary/5">
          <div className="flex items-center gap-3 mb-4 text-amber-500">
            <Clock className="size-5" /> <span className="font-medium text-sm">Pending</span>
          </div>
          <div className="text-4xl font-bold">{metrics.pending}</div>
        </div>
        <div className="border rounded-3xl p-6 bg-card flex flex-col justify-between hover:shadow-md transition-all ring-1 ring-primary/5">
          <div className="flex items-center gap-3 mb-4 text-muted-foreground">
            <Activity className="size-5" /> <span className="font-medium text-sm">My Workload</span>
          </div>
          <div className="flex items-end justify-between">
            <div className={`text-4xl font-bold ${metrics.workloadPercentage > 90 ? 'text-destructive' : ''}`}>{metrics.workloadPercentage}%</div>
            {metrics.workloadPercentage > 90 && <AlertCircle className="size-5 text-destructive mb-1" />}
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
            {upcomingQueue.map((t) => (
              <div key={t.id} className="group p-4 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-colors border border-transparent hover:border-border flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="font-bold text-base truncate">{t.title}</div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground font-medium">
                    <PriorityBadge p={t.priority.toLowerCase()} />
                    <span>·</span>
                    <span className="flex items-center gap-1 text-primary/80"><Sparkles className="size-3" /> {t.estimatedTime}h</span>
                    <span>·</span>
                    <span>{t.storyPoints} SP</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg shrink-0 hidden sm:flex">Details</Button>
              </div>
            ))}
            {upcomingQueue.length === 0 && (
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
                  <span className="text-foreground">{sprintStatus.tasksCompleted} / {sprintStatus.tasksTotal}</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000 ease-out rounded-full shadow-sm" 
                    style={{ width: `${sprintStatus.tasksTotal > 0 ? (sprintStatus.tasksCompleted / sprintStatus.tasksTotal) * 100 : 0}%` }} 
                  />
                </div>
              </div>
              <div className="bg-muted/30 rounded-2xl p-4 space-y-3 border">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Days Remaining</span>
                  <span className="font-bold text-base">{sprintStatus.daysRemaining}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">My Story Points</span>
                  <span className="font-bold text-base">{sprintStatus.myStoryPoints}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-sm ring-1 ring-primary/5">
            <h3 className="font-bold text-xl mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((a, i) => (
                <div key={a.id || i} className="flex gap-4">
                  <div className="mt-1">
                    <div className="size-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <div className="text-sm">
                      <span className="font-bold">{a.user}</span> <span className="text-muted-foreground">{a.action}</span> <span className="font-medium">{a.target}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 font-medium">{a.timeAgo}</div>
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
