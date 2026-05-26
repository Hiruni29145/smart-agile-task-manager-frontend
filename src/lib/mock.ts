export type Priority = "Low" | "Medium" | "High" | "Critical";
export type Status = "todo" | "in_progress" | "review" | "done";
export type TaskType = "Feature" | "Bug" | "Chore" | "Spike";

export interface Member {
  id: string;
  name: string;
  role: string;
  avatar: string;
  workload: number;
  status: "Active" | "Away" | "Offline";
  tasks: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  type: TaskType;
  aiHours: number;
  storyPoints: number;
  assignee: string;
  status: Status;
  sprint?: string;
  actualHours?: number;
  confidence: number;
  complexity: "Low" | "Medium" | "High";
}

export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  sprint: string;
  members: string[];
  openTasks: number;
  status: "Active" | "Completed" | "Archived";
  color: string;
}

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=c0e2ff,b6e3f4,d1d4f9,ffd5dc`;

export const members: Member[] = [
  { id: "u1", name: "Aria Chen", role: "Senior Frontend", avatar: avatar("Aria"), workload: 82, status: "Active", tasks: 7 },
  { id: "u2", name: "Marcus Reid", role: "Backend Lead", avatar: avatar("Marcus"), workload: 95, status: "Active", tasks: 9 },
  { id: "u3", name: "Sofia Park", role: "UX Engineer", avatar: avatar("Sofia"), workload: 60, status: "Active", tasks: 5 },
  { id: "u4", name: "Jonas Weber", role: "DevOps", avatar: avatar("Jonas"), workload: 45, status: "Away", tasks: 3 },
  { id: "u5", name: "Priya Nair", role: "Mobile Dev", avatar: avatar("Priya"), workload: 70, status: "Active", tasks: 6 },
  { id: "u6", name: "Theo Laurent", role: "QA Engineer", avatar: avatar("Theo"), workload: 55, status: "Offline", tasks: 4 },
];

export const projects: Project[] = [
  { id: "p1", name: "Helios Analytics", description: "Real-time BI dashboard for enterprise customers.", progress: 68, sprint: "Sprint 14", members: ["u1", "u2", "u3"], openTasks: 24, status: "Active", color: "from-blue-500/20 to-sky-400/10" },
  { id: "p2", name: "Atlas Mobile", description: "Cross-platform mobile companion app.", progress: 41, sprint: "Sprint 7", members: ["u5", "u3", "u6"], openTasks: 31, status: "Active", color: "from-indigo-500/20 to-blue-400/10" },
  { id: "p3", name: "Nova Payments", description: "PCI-compliant checkout & billing service.", progress: 89, sprint: "Sprint 22", members: ["u2", "u4"], openTasks: 11, status: "Active", color: "from-emerald-500/20 to-teal-400/10" },
  { id: "p4", name: "Orion CMS", description: "Headless content platform.", progress: 100, sprint: "Done", members: ["u1", "u3"], openTasks: 0, status: "Completed", color: "from-violet-500/20 to-fuchsia-400/10" },
  { id: "p5", name: "Lumen Auth", description: "Identity & SSO service.", progress: 22, sprint: "Sprint 3", members: ["u2", "u4", "u6"], openTasks: 18, status: "Active", color: "from-amber-500/20 to-orange-400/10" },
  { id: "p6", name: "Pulse Notifications", description: "Multi-channel notification engine.", progress: 0, sprint: "—", members: ["u5"], openTasks: 0, status: "Archived", color: "from-rose-500/20 to-pink-400/10" },
];

const titles = [
  "Implement OAuth2 PKCE flow",
  "Refactor billing webhook handler",
  "Add dark mode tokens to design system",
  "Optimize dashboard query (n+1)",
  "Build Kanban drag-and-drop",
  "Sprint velocity chart",
  "Email digest scheduler",
  "Push notification service worker",
  "Multi-tenant org switcher",
  "Audit log viewer",
  "Realtime presence indicators",
  "CSV export for reports",
  "Stripe customer portal",
  "Onboarding tour for PMs",
  "Mobile splash screen",
  "Error boundary telemetry",
  "Permission matrix editor",
  "AI estimation feedback loop",
  "Backlog grooming filters",
  "Release notes generator",
];

const priorities: Priority[] = ["Low", "Medium", "High", "Critical"];
const types: TaskType[] = ["Feature", "Bug", "Chore", "Spike"];
const statuses: Status[] = ["todo", "in_progress", "review", "done"];

export const tasks: Task[] = titles.map((title, i) => {
  const aiHours = 2 + ((i * 7) % 22);
  return {
    id: `t${i + 1}`,
    title,
    description: `${title}. Includes acceptance criteria, design review, and rollout plan.`,
    priority: priorities[i % priorities.length],
    type: types[i % types.length],
    aiHours,
    storyPoints: [1, 2, 3, 5, 8][i % 5],
    assignee: members[i % members.length].id,
    status: statuses[i % statuses.length],
    sprint: i % 3 === 0 ? "Sprint 14" : i % 3 === 1 ? "Backlog" : "Sprint 15",
    actualHours: i % 4 === 0 ? aiHours - 1 : aiHours + 2,
    confidence: 70 + ((i * 13) % 28),
    complexity: (["Low", "Medium", "High"] as const)[i % 3],
  };
});

export const sprintProgress = Array.from({ length: 10 }, (_, i) => ({
  day: `D${i + 1}`,
  remaining: Math.max(2, 80 - i * 8 - (i % 2) * 3),
  ideal: 80 - i * 8,
}));

export const velocity = [
  { sprint: "S9", points: 32 }, { sprint: "S10", points: 38 }, { sprint: "S11", points: 41 },
  { sprint: "S12", points: 36 }, { sprint: "S13", points: 44 }, { sprint: "S14", points: 47 },
];

export const taskDistribution = [
  { name: "Feature", value: 42, fill: "var(--chart-1)" },
  { name: "Bug", value: 18, fill: "var(--chart-4)" },
  { name: "Chore", value: 24, fill: "var(--chart-3)" },
  { name: "Spike", value: 11, fill: "var(--chart-5)" },
];

export const weeklyActivity = [
  { day: "Mon", commits: 24, tasks: 8 },
  { day: "Tue", commits: 31, tasks: 11 },
  { day: "Wed", commits: 28, tasks: 9 },
  { day: "Thu", commits: 42, tasks: 14 },
  { day: "Fri", commits: 36, tasks: 12 },
  { day: "Sat", commits: 9, tasks: 2 },
  { day: "Sun", commits: 4, tasks: 1 },
];

export const activity = [
  { who: "Aria Chen", what: "moved", target: "Implement OAuth2 PKCE flow", to: "In Progress", time: "2m" },
  { who: "Marcus Reid", what: "commented on", target: "Refactor billing webhook", to: "", time: "12m" },
  { who: "AI Estimator", what: "predicted", target: "Push notification service worker", to: "8.5h · 5 SP", time: "24m" },
  { who: "Sofia Park", what: "completed", target: "Add dark mode tokens", to: "", time: "1h" },
  { who: "Priya Nair", what: "created", target: "Mobile splash screen", to: "", time: "3h" },
  { who: "Jonas Weber", what: "started", target: "Sprint 15", to: "", time: "yesterday" },
];

export const aiHistory = tasks.slice(0, 8).map((t) => ({
  id: t.id,
  task: t.title,
  predicted: t.aiHours,
  actual: t.actualHours ?? t.aiHours,
  diff: ((t.actualHours ?? t.aiHours) - t.aiHours).toFixed(1),
  accuracy: 100 - Math.abs(((t.actualHours ?? t.aiHours) - t.aiHours) / t.aiHours) * 100,
}));

export const memberById = (id: string) => members.find((m) => m.id === id);
