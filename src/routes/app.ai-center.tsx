import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Wand2, Activity, Target, Zap, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { aiHistory } from "@/lib/mock";
import { ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from "recharts";

export const Route = createFileRoute("/app/ai-center")({ component: AICenter });

function AICenter() {
  const [title, setTitle] = useState("Implement realtime presence for collab editor");
  const [isPredicting, setIsPredicting] = useState(false);
  const [shown, setShown] = useState(true);
  
  const len = title.length;
  const aiH = Math.max(2, len * 0.35);
  const storyPoints = aiH < 6 ? 3 : aiH < 12 ? 5 : 8;
  const complexity = aiH < 6 ? "Low" : aiH < 12 ? "Medium" : "High";

  const handlePredict = () => {
    setIsPredicting(true);
    setShown(false);
    setTimeout(() => {
      setIsPredicting(false);
      setShown(true);
    }, 800);
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

      {/* Top Overview Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border rounded-3xl p-6 bg-card flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4 text-muted-foreground">
            <Target className="size-5" /> <span className="font-medium text-sm">Predictions Made</span>
          </div>
          <div className="text-4xl font-bold">142</div>
        </div>
        <div className="border rounded-3xl p-6 bg-primary/5 border-primary/20 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <Activity className="size-5" /> <span className="font-medium text-sm">Model Accuracy</span>
          </div>
          <div className="text-4xl font-bold text-primary">94.2%</div>
        </div>
        <div className="border rounded-3xl p-6 bg-card flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4 text-emerald-600">
            <Clock className="size-5" /> <span className="font-medium text-sm">Time Saved (hrs)</span>
          </div>
          <div className="text-4xl font-bold">38</div>
        </div>
        <div className="border rounded-3xl p-6 bg-card flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4 text-muted-foreground">
            <Wand2 className="size-5" /> <span className="font-medium text-sm">Engine Version</span>
          </div>
          <div className="text-4xl font-bold">v3.2</div>
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
              <Textarea className="bg-muted/50 focus:bg-background transition-colors resize-none" rows={4} placeholder="Provide context, acceptance criteria, or technical details..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Priority</Label>
                <Select defaultValue="High">
                  <SelectTrigger className="h-11 bg-muted/50 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Low", "Medium", "High", "Critical"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Type</Label>
                <Select defaultValue="Feature">
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
          <div className={`flex-1 rounded-3xl border shadow-sm relative overflow-hidden transition-all duration-500 flex flex-col justify-center p-8 ${shown ? "bg-gradient-to-br from-primary/10 via-card to-info/5 border-primary/30 scale-100 opacity-100" : "bg-card scale-95 opacity-50 blur-sm"}`}>
            {!shown && isPredicting && (
               <div className="absolute inset-0 flex items-center justify-center z-10 backdrop-blur-md bg-background/50">
                 <div className="flex flex-col items-center gap-4">
                   <div className="size-16 rounded-full border-4 border-primary border-t-transparent animate-spin shadow-lg" />
                   <p className="font-bold text-lg text-primary animate-pulse tracking-wide">Running Neural Models...</p>
                 </div>
               </div>
            )}
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary w-fit rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="size-3.5" /> AI Prediction Ready
            </div>
            
            <h3 className="font-bold text-2xl mb-8 leading-tight">{title || "Untitled Task"}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border bg-background/60 backdrop-blur-xl p-5 hover:bg-background transition-colors shadow-sm">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2"><Clock className="size-4"/> Estimated Hours</div>
                <div className="text-4xl font-bold tabular-nums text-primary">{aiH.toFixed(1)}h</div>
              </div>
              <div className="rounded-2xl border bg-background/60 backdrop-blur-xl p-5 hover:bg-background transition-colors shadow-sm">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2"><Target className="size-4"/> Story Points</div>
                <div className="text-4xl font-bold tabular-nums">{storyPoints}</div>
              </div>
              <div className="rounded-2xl border bg-background/60 backdrop-blur-xl p-5 hover:bg-background transition-colors shadow-sm">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2"><Zap className="size-4"/> Complexity</div>
                <div className={`text-4xl font-bold ${complexity === "High" ? "text-rose-500" : complexity === "Medium" ? "text-amber-500" : "text-emerald-500"}`}>{complexity}</div>
              </div>
              <div className="rounded-2xl border bg-background/60 backdrop-blur-xl p-5 hover:bg-background transition-colors shadow-sm">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2"><Activity className="size-4"/> Confidence Score</div>
                <div className="text-4xl font-bold tabular-nums text-success">87%</div>
              </div>
            </div>
          </div>
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
              <AreaChart data={aiHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
                {aiHistory.slice().reverse().map((h) => {
                  const sp = h.predicted < 6 ? 3 : h.predicted < 12 ? 5 : 8;
                  const comp = h.predicted < 6 ? "Low" : h.predicted < 12 ? "Medium" : "High";
                  return (
                    <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium truncate max-w-[200px]">{h.task}</td>
                      <td className="p-4 text-right tabular-nums font-semibold text-primary">{h.predicted}h</td>
                      <td className="p-4 text-right tabular-nums">{sp}</td>
                      <td className="p-4 text-right">
                        <span className={`text-xs font-bold ${comp === "High" ? "text-rose-500" : comp === "Medium" ? "text-amber-500" : "text-emerald-500"}`}>{comp}</span>
                      </td>
                      <td className="p-4 text-right tabular-nums text-success font-medium">{h.accuracy.toFixed(0)}%</td>
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
