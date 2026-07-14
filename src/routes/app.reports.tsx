import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, BarChart2, Loader2, Sparkles, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import {
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export const Route = createFileRoute("/app/reports")({ component: Reports });

function Reports() {
  const [selectedProject, setSelectedProject] = useState<number | "">("");
  const [selectedSprint, setSelectedSprint] = useState<number | "">("");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<{
    projectId: number;
    sprintId: number;
  } | null>(null);

  // Fetch Projects
  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['reports-projects'],
    queryFn: () => apiClient<any>('/api/v1/projects?page=1&limit=50')
  });
  const projectsList = projectsData?.data?.items || [];

  // Fetch Sprints
  const { data: sprintsData, isLoading: isLoadingSprints } = useQuery({
    queryKey: ['reports-sprints'],
    queryFn: () => apiClient<any>('/api/v1/sprints?page=1&limit=50')
  });
  const sprintsList = sprintsData?.data?.items || [];
  
  // Filter sprints for selected project
  const availableSprints = selectedProject 
    ? sprintsList.filter((s: any) => String(s.projectId) === String(selectedProject) || (s.project && String(s.project.id) === String(selectedProject)))
    : [];

  const handleGenerate = () => {
    if (!selectedProject || !selectedSprint) {
      toast.error("Please select both a project and a sprint");
      return;
    }
    setIsGenerating(true);
    setGeneratedReport(null);
    
    // Slight delay for effect since it's a "generator" UX
    setTimeout(() => {
      setGeneratedReport({
        projectId: Number(selectedProject),
        sprintId: Number(selectedSprint)
      });
      setIsGenerating(false);
      toast.success("Sprint Analytics Dashboard generated!");
    }, 600);
  };

  // Fetch tasks for the generated report
  const { data: tasksData, isFetching: isTasksFetching } = useQuery({
    queryKey: ['reports-tasks', generatedReport?.sprintId],
    queryFn: () => apiClient<any>(`/api/v1/sprints/${generatedReport?.sprintId}/tasks`),
    enabled: !!generatedReport?.sprintId
  });

  const sprintTasks = tasksData?.data?.items || [];

  const { statusData, assigneeData, typeData, priorityData } = useMemo(() => {
    if (!sprintTasks.length) return { statusData: [], assigneeData: [], typeData: [], priorityData: [] };

    // 1. Status Distribution
    // 1. Status Distribution
    // 1. Status Distribution
    const statusCounts = sprintTasks.reduce((acc: any, t: any) => {
      const status = t.status || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, { 'TODO': 0, 'IN_PROGRESS': 0, 'REVIEW': 0, 'DONE': 0 });
    const statusData = Object.entries(statusCounts).map(([name, value]) => {
      const upperName = String(name).toUpperCase();
      const formattedName = upperName === 'IN_PROGRESS' ? 'In Progress' : 
                            upperName === 'TODO' ? 'To Do' :
                            upperName.charAt(0) + upperName.slice(1).toLowerCase();
      
      const fill = upperName === 'DONE' ? '#10b981' : 
                   upperName === 'IN_PROGRESS' ? '#3b82f6' : 
                   upperName === 'REVIEW' ? '#f59e0b' : '#6366f1'; // Indigo for To Do (premium)
      return { name: formattedName, value, fill };
    });

    // 2. Story Points by Assignee
    const assigneeMap = sprintTasks.reduce((acc: any, t: any) => {
      const name = t.assignee?.name || 'Unassigned';
      acc[name] = (acc[name] || 0) + (t.storyPoints || 0);
      return acc;
    }, {});
    const assigneeData = Object.entries(assigneeMap)
      .map(([name, points]) => ({ name, points }))
      .sort((a: any, b: any) => b.points - a.points);

    // 3. Type Breakdown
    const typeCounts = sprintTasks.reduce((acc: any, t: any) => {
      const type = t.type || 'UNKNOWN';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, { 'FEATURE': 0, 'BUG': 0, 'CHORE': 0, 'SPIKE': 0 });
    const typeData = Object.entries(typeCounts).map(([name, value]) => {
      const upperName = String(name).toUpperCase();
      const fill = upperName === 'FEATURE' ? '#3b82f6' : 
                   upperName === 'BUG' ? '#ef4444' : 
                   upperName === 'CHORE' ? '#8b5cf6' : 
                   upperName === 'SPIKE' ? '#f59e0b' : '#64748b';
      const formattedName = upperName.charAt(0) + upperName.slice(1).toLowerCase();
      return { name: formattedName, value, fill };
    });

    // 4. Priority Analysis
    const priorityCounts = sprintTasks.reduce((acc: any, t: any) => {
      const priority = t.priority || 'UNKNOWN';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, { 'LOW': 0, 'MEDIUM': 0, 'HIGH': 0, 'CRITICAL': 0 });
    const priorityData = Object.entries(priorityCounts).map(([name, count]) => {
      const upperName = String(name).toUpperCase();
      const fill = upperName === 'HIGH' || upperName === 'CRITICAL' ? '#ef4444' : 
                   upperName === 'MEDIUM' ? '#f59e0b' : 
                   upperName === 'LOW' ? '#10b981' : '#64748b';
      const formattedName = upperName.charAt(0) + upperName.slice(1).toLowerCase();
      return { name: formattedName, count, fill };
    });

    return { statusData, assigneeData, typeData, priorityData };
  }, [sprintTasks]);

  const renderDashboard = () => {
    if (!generatedReport) return null;

    if (isTasksFetching && sprintTasks.length === 0) {
      return (
        <div className="h-[400px] border-2 border-dashed rounded-3xl bg-card flex flex-col items-center justify-center">
          <Loader2 className="size-10 animate-spin text-primary mb-4" />
          <p className="font-medium">Fetching sprint data...</p>
        </div>
      );
    }

    return (
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart 1: Status */}
        <div className="border rounded-2xl p-5 bg-card shadow-sm flex flex-col ring-1 ring-primary/5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">Task Status</h3>
              <p className="text-xs text-muted-foreground">Distribution of sprint tasks</p>
            </div>
          </div>
          <div className="flex-1 min-h-[260px] flex items-center justify-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} label>
                    {statusData.map((d: any, i: number) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, background: 'var(--color-popover)', border: '1px solid var(--color-border)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-sm">No tasks in sprint</p>}
          </div>
        </div>

        {/* Chart 2: Assignee points */}
        <div className="border rounded-2xl p-5 bg-card shadow-sm flex flex-col ring-1 ring-primary/5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">Workload Allocation</h3>
              <p className="text-xs text-muted-foreground">Story points per assignee</p>
            </div>
          </div>
          <div className="flex-1 min-h-[260px]">
             {assigneeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assigneeData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--color-border)" />
                  <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" width={90} stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, background: 'var(--color-popover)', border: '1px solid var(--color-border)' }} cursor={{fill: 'var(--color-muted)', opacity: 0.2}} />
                  <Bar dataKey="points" fill="var(--color-primary)" radius={[0, 4, 4, 0]} maxBarSize={30} name="Story Points" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center"><p className="text-muted-foreground text-sm">No tasks assigned</p></div>}
          </div>
        </div>
        
        {/* Chart 3: Type Breakdown */}
        <div className="border rounded-2xl p-5 bg-card shadow-sm flex flex-col ring-1 ring-primary/5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">Task Type</h3>
              <p className="text-xs text-muted-foreground">Breakdown by category</p>
            </div>
          </div>
          <div className="flex-1 min-h-[260px] flex items-center justify-center">
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} label>
                    {typeData.map((d: any, i: number) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, background: 'var(--color-popover)', border: '1px solid var(--color-border)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-sm">No tasks in sprint</p>}
          </div>
        </div>

        {/* Chart 4: Priority */}
        <div className="border rounded-2xl p-5 bg-card shadow-sm flex flex-col ring-1 ring-primary/5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">Priority Analysis</h3>
              <p className="text-xs text-muted-foreground">Tasks grouped by priority</p>
            </div>
          </div>
          <div className="flex-1 min-h-[260px]">
             {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, background: 'var(--color-popover)', border: '1px solid var(--color-border)' }} cursor={{fill: 'var(--color-muted)', opacity: 0.2}} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40} name="Tasks">
                    {priorityData.map((d: any, i: number) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center"><p className="text-muted-foreground text-sm">No tasks in sprint</p></div>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate comprehensive analytics dashboards on demand</p>
        </div>
      </div>

      {/* Generator Control Panel */}
      <div className="bg-card border rounded-3xl p-6 shadow-sm ring-1 ring-primary/5 bg-gradient-to-br from-primary/[0.02] to-transparent">
        <h2 className="font-semibold mb-4 flex items-center gap-2 text-lg"><LayoutDashboard className="size-5 text-primary"/> Dashboard Generator</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">1. Select Project</label>
            <Select 
               value={selectedProject ? String(selectedProject) : ""} 
               onValueChange={(val) => {
                 setSelectedProject(Number(val));
                 setSelectedSprint(""); // Reset sprint when project changes
               }}
            >
              <SelectTrigger className="bg-background h-12 rounded-xl">
                <SelectValue placeholder={isLoadingProjects ? "Loading projects..." : "Select Project"} />
              </SelectTrigger>
              <SelectContent>
                {projectsList.map((p: any) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">2. Select Sprint</label>
            <Select 
               value={selectedSprint ? String(selectedSprint) : ""} 
               onValueChange={(val) => setSelectedSprint(Number(val))}
               disabled={!selectedProject || isLoadingSprints}
            >
              <SelectTrigger className="bg-background h-12 rounded-xl">
                <SelectValue placeholder={
                  !selectedProject ? "Select a project first" : 
                  isLoadingSprints ? "Loading sprints..." : 
                  availableSprints.length === 0 ? "No sprints available" : "Select Sprint"
                } />
              </SelectTrigger>
              <SelectContent>
                {availableSprints.map((s: any) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.status})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end pt-5 border-t border-dashed">
          <Button onClick={handleGenerate} disabled={isGenerating || !selectedProject || !selectedSprint} size="lg" className="min-w-[220px] h-12 rounded-xl gap-2 transition-all">
            {isGenerating ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
            {isGenerating ? "Compiling Dashboard..." : "Generate Dashboard"}
          </Button>
        </div>
      </div>

      {/* Generated Canvas Area */}
      <div className="mt-8 relative min-h-[400px]">
        {isGenerating ? (
          <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-primary/30 animate-in fade-in duration-200">
            <Loader2 className="size-10 animate-spin text-primary mb-4" />
            <p className="text-primary font-medium text-lg animate-pulse">Computing real-time analytics...</p>
          </div>
        ) : null}

        {generatedReport ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BarChart2 className="size-6 text-primary" /> Generated Analytics
              </h2>
              <Button variant="outline" className="gap-2 rounded-xl"><Download className="size-4" /> Export Entire Dashboard</Button>
            </div>
            {renderDashboard()}
          </div>
        ) : !isGenerating && (
          <div className="h-[400px] border-2 border-dashed rounded-3xl bg-muted/10 flex flex-col items-center justify-center text-muted-foreground transition-all">
            <div className="size-20 rounded-full bg-muted/40 flex items-center justify-center mb-4 border">
              <LayoutDashboard className="size-10 opacity-40" />
            </div>
            <p className="font-semibold text-xl text-foreground/80 mb-2">Ready to generate</p>
            <p className="text-sm max-w-sm text-center">Select your project and sprint above to instantly generate a comprehensive 4-chart analytical dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
}
