import { createFileRoute } from "@tanstack/react-router";
import { Calendar, CheckCircle2, Clock, Target, Flag, AlertCircle } from "lucide-react";
import { sprintProgress } from "@/lib/mock";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dev/sprint")({ component: DevSprint });

function DevSprint() {
  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sprint 14</h1>
          <p className="text-sm text-muted-foreground mt-1">Mar 18 – Apr 1 · <span className="font-medium text-primary">5 days remaining</span></p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border rounded-3xl p-6 bg-card flex flex-col justify-between hover:shadow-md transition-all ring-1 ring-primary/5">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <Calendar className="size-5" /> <span className="font-medium text-sm">Current Sprint</span>
          </div>
          <div className="text-4xl font-bold">14</div>
        </div>
        <div className="border rounded-3xl p-6 bg-card flex flex-col justify-between hover:shadow-md transition-all ring-1 ring-primary/5 bg-primary/[0.02]">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <Target className="size-5" /> <span className="font-medium text-sm">My Story Points</span>
          </div>
          <div className="text-4xl font-bold text-primary">13</div>
        </div>
        <div className="border rounded-3xl p-6 bg-card flex flex-col justify-between hover:shadow-md transition-all ring-1 ring-primary/5">
          <div className="flex items-center gap-3 mb-4 text-emerald-500">
            <CheckCircle2 className="size-5" /> <span className="font-medium text-sm">Completed SP</span>
          </div>
          <div className="text-4xl font-bold">8</div>
        </div>
        <div className="border rounded-3xl p-6 bg-card flex flex-col justify-between hover:shadow-md transition-all ring-1 ring-primary/5">
          <div className="flex items-center gap-3 mb-4 text-amber-500">
            <Clock className="size-5" /> <span className="font-medium text-sm">Remaining SP</span>
          </div>
          <div className="text-4xl font-bold">5</div>
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
              <AreaChart data={sprintProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Area type="monotone" dataKey="remaining" stroke="var(--color-primary)" strokeWidth={3} fill="url(#ds)" activeDot={{ r: 6, fill: "var(--color-primary)", stroke: "var(--color-background)", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-sm ring-1 ring-primary/5 flex flex-col">
          <h3 className="font-bold text-xl mb-6">Sprint Timeline</h3>
          <div className="relative pl-6 border-l-2 border-border/60 space-y-8 flex-1 py-2">
            {[
              { d: "Mar 18", t: "Sprint started", s: "done", i: Flag },
              { d: "Mar 21", t: "Daily standup · 8 SP committed", s: "done", i: CheckCircle2 },
              { d: "Mar 24", t: "Mid-sprint review", s: "done", i: CheckCircle2 },
              { d: "Mar 28", t: "Code freeze for QA", s: "active", i: AlertCircle },
              { d: "Apr 01", t: "Sprint ends · retro", s: "next", i: Target },
            ].map((e, i) => {
              const Icon = e.i;
              return (
                <div key={i} className="relative group">
                  <span className={cn(
                    "absolute -left-[35px] top-0.5 size-5 rounded-full ring-4 ring-card flex items-center justify-center transition-all",
                    e.s === "done" ? "bg-primary text-primary-foreground" : 
                    e.s === "active" ? "bg-warning text-warning-foreground animate-pulse shadow-lg shadow-warning/30" : 
                    "bg-muted border border-border text-muted-foreground"
                  )}>
                    <Icon className="size-3" />
                  </span>
                  <div className="flex flex-col">
                    <span className={cn("text-xs font-bold uppercase tracking-wider mb-1", e.s === "active" ? "text-warning" : "text-muted-foreground")}>{e.d}</span>
                    <span className={cn("text-sm font-semibold", e.s === "next" ? "text-muted-foreground" : "text-foreground")}>{e.t}</span>
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
