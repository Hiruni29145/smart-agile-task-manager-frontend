import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Calendar, CheckCircle2, Clock, Target, Flag, AlertCircle, CalendarDays } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";
import { apiClient } from "@/api/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, isBefore, isSameDay, startOfDay } from "date-fns";

export const Route = createFileRoute("/dev/sprint")({ component: DevSprint });

interface Project {
  id: number;
  name: string;
}

interface BurndownPoint {
  day: string;
  ideal: number;
  actual: number;
}

interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
}

interface SprintMetrics {
  myStoryPoints: number;
  completedSp: number;
  remainingSp: number;
}

interface SprintData {
  sprintId: number;
  sprintNo: number;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  metrics: SprintMetrics;
  burndownData: BurndownPoint[];
  timeline: TimelineEvent[];
}

function DevSprint() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [sprintData, setSprintData] = useState<SprintData | null>(null);
  
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingSprint, setIsLoadingSprint] = useState(false);
  const [sprintError, setSprintError] = useState<string | null>(null);

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await apiClient<any>("/api/v1/developer/projects/active");
        if (response.success && response.data?.items) {
          setProjects(response.data.items);
          if (response.data.items.length > 0) {
            setSelectedProjectId(response.data.items[0].id.toString());
          }
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setIsLoadingProjects(false);
      }
    };
    
    fetchProjects();
  }, []);

  // Fetch sprint data when selectedProjectId changes
  useEffect(() => {
    if (!selectedProjectId) return;

    const fetchSprint = async () => {
      setIsLoadingSprint(true);
      setSprintError(null);
      try {
        const response = await apiClient<any>(`/api/v1/developer/sprint/active?projectId=${selectedProjectId}`);
        if (response.success && response.data) {
          setSprintData(response.data);
        } else {
          setSprintData(null);
          setSprintError(response.message || "No active sprint found.");
        }
      } catch (error) {
        console.error("Failed to fetch sprint data:", error);
        setSprintData(null);
        setSprintError("Failed to fetch sprint data.");
      } finally {
        setIsLoadingSprint(false);
      }
    };

    fetchSprint();
  }, [selectedProjectId]);

  const timelineWithStatus = useMemo(() => {
    if (!sprintData?.timeline) return [];
    
    const today = startOfDay(new Date());
    
    return sprintData.timeline.map((event, i) => {
      const eventDate = startOfDay(new Date(event.date));
      let status: "done" | "active" | "next" = "next";
      
      if (isBefore(eventDate, today)) {
        status = "done";
      } else if (isSameDay(eventDate, today)) {
        status = "active";
      }
      
      // Basic heuristic for icons
      let Icon = CheckCircle2;
      if (i === 0) Icon = Flag;
      if (i === sprintData.timeline.length - 1) Icon = Target;
      if (event.title.toLowerCase().includes("freeze") || event.title.toLowerCase().includes("qa")) Icon = AlertCircle;
      
      return {
        ...event,
        status,
        Icon,
        formattedDate: format(new Date(event.date), "MMM dd")
      };
    });
  }, [sprintData?.timeline]);

  const formattedDateRange = useMemo(() => {
    if (!sprintData) return "";
    try {
      const start = format(new Date(sprintData.startDate), "MMM dd");
      const end = format(new Date(sprintData.endDate), "MMM dd");
      return `${start} – ${end}`;
    } catch {
      return "";
    }
  }, [sprintData]);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 gap-4">
        <div>
          {(isLoadingProjects || isLoadingSprint) ? (
            <Skeleton className="h-10 w-40 mb-2" />
          ) : sprintData ? (
            <h1 className="text-3xl font-bold tracking-tight">Sprint {sprintData.sprintNo}</h1>
          ) : (
            <h1 className="text-3xl font-bold tracking-tight text-muted-foreground">No Active Sprint</h1>
          )}
          
          {(isLoadingProjects || isLoadingSprint) ? (
            <Skeleton className="h-5 w-64" />
          ) : sprintData ? (
            <p className="text-sm text-muted-foreground mt-1">
              {formattedDateRange} · <span className="font-medium text-primary">{sprintData.daysRemaining} days remaining</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">
              Select a project to view its active sprint.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isLoadingProjects ? (
            <Skeleton className="h-10 w-[200px] rounded-xl" />
          ) : projects.length > 0 ? (
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-[240px] h-10 rounded-xl bg-card border-primary/20 hover:border-primary/50 transition-colors shadow-sm">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-lg border-primary/10">
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()} className="rounded-lg cursor-pointer">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-sm text-muted-foreground px-4 py-2 border rounded-xl bg-muted/30">
              No active projects
            </div>
          )}
        </div>
      </div>

      {(isLoadingProjects || isLoadingSprint) ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="border rounded-3xl p-6 bg-card h-[130px]">
                <Skeleton className="h-5 w-32 mb-6" />
                <Skeleton className="h-10 w-16" />
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-3xl border bg-card p-6 h-[400px]">
              <Skeleton className="h-6 w-40 mb-6" />
              <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>
            <div className="rounded-3xl border bg-card p-6 h-[400px]">
              <Skeleton className="h-6 w-40 mb-6" />
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="size-8 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : sprintError ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4">
          <div className="size-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
            <CalendarDays className="size-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Active Sprint</h2>
          <p className="text-muted-foreground max-w-sm">
            {sprintError}
          </p>
        </div>
      ) : sprintData ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border rounded-3xl p-6 bg-card flex flex-col justify-between hover:shadow-md transition-all ring-1 ring-primary/5">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <Calendar className="size-5" /> <span className="font-medium text-sm">Current Sprint</span>
              </div>
              <div className="text-4xl font-bold">{sprintData.sprintNo}</div>
            </div>
            <div className="border rounded-3xl p-6 bg-card flex flex-col justify-between hover:shadow-md transition-all ring-1 ring-primary/5 bg-primary/[0.02]">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <Target className="size-5" /> <span className="font-medium text-sm">My Story Points</span>
              </div>
              <div className="text-4xl font-bold text-primary">{sprintData.metrics.myStoryPoints}</div>
            </div>
            <div className="border rounded-3xl p-6 bg-card flex flex-col justify-between hover:shadow-md transition-all ring-1 ring-primary/5">
              <div className="flex items-center gap-3 mb-4 text-emerald-500">
                <CheckCircle2 className="size-5" /> <span className="font-medium text-sm">Completed SP</span>
              </div>
              <div className="text-4xl font-bold">{sprintData.metrics.completedSp}</div>
            </div>
            <div className="border rounded-3xl p-6 bg-card flex flex-col justify-between hover:shadow-md transition-all ring-1 ring-primary/5">
              <div className="flex items-center gap-3 mb-4 text-amber-500">
                <Clock className="size-5" /> <span className="font-medium text-sm">Remaining SP</span>
              </div>
              <div className="text-4xl font-bold">{sprintData.metrics.remainingSp}</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-3xl border bg-card p-6 shadow-sm ring-1 ring-primary/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl">My Burndown</h3>
                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="size-2 rounded-full border border-muted-foreground border-dashed bg-transparent"/> Ideal</span>
                  <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary"/> Actual</span>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sprintData.burndownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ds" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                      itemStyle={{ color: "var(--color-foreground)", fontSize: 13, fontWeight: 500 }}
                    />
                    <Area type="monotone" dataKey="ideal" stroke="var(--color-muted-foreground)" strokeDasharray="4 4" fill="transparent" strokeWidth={2} />
                    <Area type="monotone" dataKey="actual" stroke="var(--color-primary)" strokeWidth={3} fill="url(#ds)" activeDot={{ r: 6, fill: "var(--color-primary)", stroke: "var(--color-background)", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-3xl border bg-card p-6 shadow-sm ring-1 ring-primary/5 flex flex-col">
              <h3 className="font-bold text-xl mb-6">Sprint Timeline</h3>
              <div className="relative pl-6 border-l-2 border-border/60 space-y-8 flex-1 py-2">
                {timelineWithStatus.map((e, i) => {
                  const Icon = e.Icon;
                  return (
                    <div key={i} className="relative group">
                      <span className={cn(
                        "absolute -left-[35px] top-0.5 size-5 rounded-full ring-4 ring-card flex items-center justify-center transition-all",
                        e.status === "done" ? "bg-primary text-primary-foreground" : 
                        e.status === "active" ? "bg-warning text-warning-foreground animate-pulse shadow-lg shadow-warning/30" : 
                        "bg-muted border border-border text-muted-foreground"
                      )}>
                        <Icon className="size-3" />
                      </span>
                      <div className="flex flex-col">
                        <span className={cn("text-xs font-bold uppercase tracking-wider mb-1", e.status === "active" ? "text-warning" : "text-muted-foreground")}>
                          {e.formattedDate}
                        </span>
                        <span className={cn("text-sm font-semibold", e.status === "next" ? "text-muted-foreground" : "text-foreground")}>
                          {e.title}
                        </span>
                        {e.description && (
                          <span className="text-xs text-muted-foreground mt-0.5">{e.description}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
