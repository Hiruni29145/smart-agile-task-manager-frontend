import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Sparkles, Wand2, Activity, Target, Zap, Clock } from "lucide-react";
import { apiClient } from "@/api/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

import { ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from "recharts";

export const Route = createFileRoute("/app/ai-center")({ component: AICenter });

function AICenter() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("High");
  const [type, setType] = useState("Feature");
  
  const [isPredicting, setIsPredicting] = useState(false);
  const [aiEst, setAiEst] = useState<{
    storyPoints: number;
    estimatedTime: number;
    complexity: string;
    confidence: number;
  } | null>(null);

  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = async () => {
    try {
      const response = await apiClient<any>('/api/v1/ai-center/estimations');
      if (response.success && response.data && response.data.items) {
        setHistoryItems(response.data.items);
      }
    } catch (error) {
      console.error("Failed to fetch prediction history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const chartData = historyItems.slice().reverse().map((item, i) => ({
    id: `P${i + 1}`,
    accuracy: item.confidenceScore || 0,
  }));

  const handlePredict = async () => {
    if (!title) {
      toast.error("Please enter a task title");
      return;
    }
    
    setIsPredicting(true);
    setAiEst(null);
    
    try {
      const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'http://127.0.0.1:8083';
      const response = await fetch(`${AI_API_URL}/api/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          task_name: title,
          description: desc,
          priority: priority,
          task_type: type
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate AI estimation. Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const estimatedTime = parseFloat(data["Estimated Hours"]?.replace('h', '') || '0');
      const confidence = parseFloat(data["Confidence Score"]?.replace('%', '') || '0');
      const storyPoints = data["Story Points"] || 0;
      const complexity = data["Complexity"] || "Medium";
      
      setAiEst({
        storyPoints,
        estimatedTime,
        complexity,
        confidence
      });
      
      const optimisticItem = {
        id: `temp-${Date.now()}`,
        taskTitle: title,
        estimatedHours: estimatedTime,
        storyPoints: storyPoints,
        complexity: complexity,
        confidenceScore: confidence
      };
      
      setHistoryItems(prev => [optimisticItem, ...prev]);
      
      apiClient('/api/v1/ai-center/estimations', {
        method: 'POST',
        body: JSON.stringify({
          taskTitle: title,
          description: desc || "No description provided",
          priority: priority.toUpperCase(),
          taskType: type.toUpperCase(),
          estimatedHours: estimatedTime,
          storyPoints: storyPoints,
          complexity: complexity,
          confidenceScore: confidence
        })
      }).then(() => {
        fetchHistory();
      }).catch(saveError => {
        console.error("Failed to save estimation to history:", saveError);
        toast.error("Estimation generated, but failed to save to history.");
        setHistoryItems(prev => prev.filter(i => i.id !== optimisticItem.id));
      });
      
    } catch (error: any) {
       console.error("AI Estimation error:", error);
       toast.error(error.message || "An error occurred during AI estimation");
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl"><Sparkles className="size-6 text-primary" /></div>
            AI Estimation Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Predict task effort with 94% accuracy based on historical sprint data.</p>
        </div>
      </div>



      <div className="grid lg:grid-cols-12 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-5 rounded-3xl border bg-card p-6 shadow-sm ring-1 ring-primary/5">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Sparkles className="size-5 text-primary" /> New Estimation</h3>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Task Title</Label>
              <Input className="h-11 bg-muted/50 focus:bg-background transition-colors" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Description & Context</Label>
              <Textarea className="bg-muted/50 focus:bg-background transition-colors resize-none" rows={4} placeholder="Provide context, acceptance criteria, or technical details..." value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="h-11 bg-muted/50 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Low", "Medium", "High", "Critical"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-11 bg-muted/50 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Feature", "Bug", "Chore", "Spike"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handlePredict} disabled={isPredicting || title.length === 0} className="w-full h-12 rounded-xl text-base gap-2 mt-4 shadow-md hover:shadow-lg transition-all">
              {isPredicting ? <Activity className="size-5 animate-pulse" /> : <Wand2 className="size-5" />}
              {isPredicting ? "Analyzing complexity..." : "Generate Estimate"}
            </Button>
          </div>
        </div>

        {/* Prediction Output */}
        <div className="lg:col-span-7 flex flex-col">
          {aiEst ? (
            <div className="flex-1 rounded-3xl border shadow-sm relative overflow-hidden transition-all duration-500 flex flex-col justify-center p-8 bg-gradient-to-br from-primary/10 via-card to-info/5 border-primary/30">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary w-fit rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles className="size-3.5" /> AI Prediction Ready
              </div>
              
              <h3 className="font-bold text-2xl mb-8 leading-tight">{title || "Untitled Task"}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border bg-background/60 backdrop-blur-xl p-5 hover:bg-background transition-colors shadow-sm">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2"><Clock className="size-4"/> Estimated Hours</div>
                  <div className="text-4xl font-bold tabular-nums text-primary">{aiEst.estimatedTime.toFixed(1)}h</div>
                </div>
                <div className="rounded-2xl border bg-background/60 backdrop-blur-xl p-5 hover:bg-background transition-colors shadow-sm">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2"><Target className="size-4"/> Story Points</div>
                  <div className="text-4xl font-bold tabular-nums">{aiEst.storyPoints}</div>
                </div>
                <div className="rounded-2xl border bg-background/60 backdrop-blur-xl p-5 hover:bg-background transition-colors shadow-sm">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2"><Zap className="size-4"/> Complexity</div>
                  <div className={`text-4xl font-bold ${aiEst.complexity === "High" ? "text-rose-500" : aiEst.complexity === "Medium" ? "text-amber-500" : "text-emerald-500"}`}>{aiEst.complexity}</div>
                </div>
                <div className="rounded-2xl border bg-background/60 backdrop-blur-xl p-5 hover:bg-background transition-colors shadow-sm">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2"><Activity className="size-4"/> Confidence Score</div>
                  <div className="text-4xl font-bold tabular-nums text-success">{aiEst.confidence}%</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 rounded-3xl border border-dashed shadow-sm flex flex-col items-center justify-center p-8 bg-muted/10 text-muted-foreground min-h-[300px]">
              {isPredicting ? (
                 <div className="flex flex-col items-center gap-4">
                   <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                   <p className="font-medium text-primary animate-pulse">Running Neural Models...</p>
                 </div>
              ) : (
                 <div className="flex flex-col items-center gap-3 text-center max-w-sm">
                   <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                     <Wand2 className="size-6 text-primary" />
                   </div>
                   <h3 className="font-semibold text-lg text-foreground">Waiting for input</h3>
                   <p className="text-sm">Enter task details on the left and generate an estimate to see AI predictions here.</p>
                 </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Accuracy Chart */}
        <div className="rounded-3xl border bg-card p-6 shadow-sm ring-1 ring-primary/5">
          <div className="mb-6">
            <h3 className="font-bold text-lg">Model Accuracy over Time</h3>
            <p className="text-sm text-muted-foreground">The AI learns from past sprints to improve future estimations.</p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="id" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} domain={[60, 100]} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                <Area type="monotone" dataKey="accuracy" stroke="var(--color-primary)" strokeWidth={3} fill="url(#accGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prediction History Table */}
        <div className="rounded-3xl border bg-card overflow-hidden shadow-sm flex flex-col ring-1 ring-primary/5">
          <div className="p-6 border-b bg-muted/20">
            <h3 className="font-bold text-lg">Prediction History</h3>
            <p className="text-sm text-muted-foreground">Recent task estimations vs actual logged time.</p>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground sticky top-0 backdrop-blur-md">
                <tr>
                  <th className="text-left p-4 font-medium">Task</th>
                  <th className="text-right p-4 font-medium">Hours</th>
                  <th className="text-right p-4 font-medium">Story Points</th>
                  <th className="text-right p-4 font-medium">Complexity</th>
                  <th className="text-right p-4 font-medium">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loadingHistory ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading history...</td></tr>
                ) : historyItems.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No prediction history yet.</td></tr>
                ) : historyItems.slice(0, 6).map((h) => {
                  const comp = h.complexity || "Medium";
                  const pString = typeof h.estimatedHours === 'number' ? h.estimatedHours.toFixed(1) : h.estimatedHours;
                  return (
                    <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium truncate max-w-[200px]" title={h.taskTitle}>{h.taskTitle}</td>
                      <td className="p-4 text-right tabular-nums font-semibold text-primary">{pString}h</td>
                      <td className="p-4 text-right tabular-nums">{h.storyPoints}</td>
                      <td className="p-4 text-right">
                        <span className={`text-xs font-bold ${comp === "High" ? "text-rose-500" : comp === "Medium" ? "text-amber-500" : "text-emerald-500"}`}>{comp}</span>
                      </td>
                      <td className="p-4 text-right tabular-nums text-success font-medium">{h.confidenceScore}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
