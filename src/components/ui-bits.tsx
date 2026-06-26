import { useEffect, useState } from "react";

export function useCounter(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export function StatCard({
  label, value, suffix = "", trend, icon: Icon, accent = "primary",
}: {
  label: string; value: number; suffix?: string;
  trend?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "primary" | "success" | "warning" | "info";
}) {
  const v = useCounter(value);
  const colorMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    info: "bg-info/10 text-info",
  };
  return (
    <div className="rounded-xl border bg-card p-5 lift">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className={`size-9 rounded-lg grid place-items-center ${colorMap[accent]}`}>
          <Icon className="size-4" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight tabular-nums">{v}{suffix}</span>
        {trend && <span className="text-xs text-success font-medium">{trend}</span>}
      </div>
    </div>
  );
}

export function ProgressRing({ value, size = 72, stroke = 6, label }: { value: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--color-muted)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="var(--color-primary)" strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-sm font-semibold tabular-nums">{value}%</div>
          {label && <div className="text-[10px] text-muted-foreground">{label}</div>}
        </div>
      </div>
    </div>
  );
}

export function PriorityBadge({ p }: { p: string }) {
  const m: Record<string, string> = {
    Low: "bg-muted text-muted-foreground",
    Medium: "bg-info/15 text-info",
    High: "bg-warning/20 text-warning-foreground",
    Critical: "bg-destructive/15 text-destructive",
    LOW: "bg-muted text-muted-foreground",
    MEDIUM: "bg-info/15 text-info",
    HIGH: "bg-warning/20 text-warning-foreground",
    CRITICAL: "bg-destructive/15 text-destructive",
  };
  return <span className={`inline-flex items-center px-2 h-5 rounded text-[10px] font-medium ${m[p]}`}>{p}</span>;
}

export function TypeBadge({ t }: { t: string }) {
  const m: Record<string, string> = {
    Feature: "bg-primary/10 text-primary",
    Bug: "bg-destructive/10 text-destructive",
    Chore: "bg-muted text-muted-foreground",
    Spike: "bg-info/10 text-info",
  };
  return <span className={`inline-flex items-center px-2 h-5 rounded text-[10px] font-medium ${m[t]}`}>{t}</span>;
}
