import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { projects, sprintProgress, taskDistribution, velocity, weeklyActivity } from "@/lib/mock";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, BarChart2, Loader2, Sparkles, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";

export const Route = createFileRoute("/app/reports")({ component: Reports });

function Reports() {
  const [selectedProject, setSelectedProject] = useState(projects[0].id);
  const [selectedTimeframe, setSelectedTimeframe] = useState("last_sprint");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<{
    project: string;
    timeframe: string;
  } | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedReport(null);
    
    // Fake generation delay for effect
    setTimeout(() => {
      setGeneratedReport({
        project: selectedProject,
        timeframe: selectedTimeframe
      });
      setIsGenerating(false);
      toast.success("Project Report Dashboard generated!");
    }, 800);
  };

  const renderDashboard = () => {
    if (!generatedReport) return null;

    return (
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart 1: Burndown */}
        <div className="border rounded-2xl p-5 bg-card shadow-sm flex flex-col hover:shadow-md transition-shadow ring-1 ring-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">Sprint Burndown</h3>
              <p className="text-xs text-muted-foreground">Ideal vs actual remaining work</p>
            </div>
            <Button variant="outline" size="icon" className="size-8"><Download className="size-4" /></Button>
          </div>
          <div className="flex-1 min-h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sprintProgress} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="b1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Area dataKey="ideal" stroke="var(--color-muted-foreground)" strokeDasharray="4 4" fill="transparent" name="Ideal Trend" />
                <Area dataKey="remaining" stroke="var(--color-primary)" strokeWidth={3} fill="url(#b1)" name="Actual Remaining" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Velocity */}
        <div className="border rounded-2xl p-5 bg-card shadow-sm flex flex-col hover:shadow-md transition-shadow ring-1 ring-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">Sprint Velocity</h3>
              <p className="text-xs text-muted-foreground">Story points completed over time</p>
            </div>
            <Button variant="outline" size="icon" className="size-8"><Download className="size-4" /></Button>
          </div>
          <div className="flex-1 min-h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocity} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="sprint" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} cursor={{fill: 'var(--color-muted)', opacity: 0.2}} />
                <Bar dataKey="points" fill="var(--color-primary)" radius={[6, 6, 0, 0]} name="Story Points" maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Distribution */}
        <div className="border rounded-2xl p-5 bg-card shadow-sm flex flex-col hover:shadow-md transition-shadow ring-1 ring-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">Task Distribution</h3>
              <p className="text-xs text-muted-foreground">Breakdown of task types</p>
            </div>
            <Button variant="outline" size="icon" className="size-8"><Download className="size-4" /></Button>
          </div>
          <div className="flex-1 min-h-[260px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={taskDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} label>
                  {taskDistribution.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Weekly Activity */}
        <div className="border rounded-2xl p-5 bg-card shadow-sm flex flex-col hover:shadow-md transition-shadow ring-1 ring-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">Weekly Activity</h3>
              <p className="text-xs text-muted-foreground">Commits and tasks over the week</p>
            </div>
            <Button variant="outline" size="icon" className="size-8"><Download className="size-4" /></Button>
          </div>
          <div className="flex-1 min-h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} cursor={{fill: 'var(--color-muted)', opacity: 0.2}} />
                <Bar dataKey="commits" fill="var(--color-chart-1, #3b82f6)" radius={[4, 4, 0, 0]} name="Commits" maxBarSize={30} />
                <Bar dataKey="tasks" fill="var(--color-chart-3, #10b981)" radius={[4, 4, 0, 0]} name="Tasks" maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
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
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="bg-background h-12 rounded-xl">
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">2. Select Timeframe</label>
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="bg-background h-12 rounded-xl">
                <SelectValue placeholder="Select Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_sprint">Last Sprint</SelectItem>
                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                <SelectItem value="all_time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end pt-5 border-t border-dashed">
          <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="min-w-[220px] h-12 rounded-xl gap-2 transition-all">
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
            <p className="text-primary font-medium text-lg animate-pulse">Compiling 4 reports...</p>
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
            <p className="text-sm max-w-sm text-center">Select your project and timeframe above to instantly generate a comprehensive 4-chart dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
}
