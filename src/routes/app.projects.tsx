import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { projects, memberById, members } from "@/lib/mock";
import { Plus, Search, LayoutGrid, List, MoreHorizontal, Archive, Edit, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/app/projects")({ component: Projects });

function Projects() {
  const navigate = useNavigate();
  const [localProjects, setLocalProjects] = useState(projects);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [view, setView] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<"All" | "Active" | "Completed" | "Archived">("All");
  const [q, setQ] = useState("");

  const filtered = localProjects.filter(
    (p) => (filter === "All" || p.status === filter) && p.name.toLowerCase().includes(q.toLowerCase())
  );

  const handleStatusChange = (id: string, status: "Active" | "Completed" | "Archived") => {
    setLocalProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    toast.success(`Project marked as ${status}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">{localProjects.length} workspaces · {localProjects.filter(p=>p.status==="Active").length} active</p>
        </div>
        <Dialog>
          <DialogTrigger asChild><Button className="gap-1.5"><Plus className="size-4" /> New Project</Button></DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create new project</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Set up a new workspace for your team.</p>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3 space-y-1.5">
                  <Label>Name</Label>
                  <Input placeholder="e.g. Helios Analytics" />
                </div>
                <div className="col-span-1 space-y-1.5">
                  <Label>Key</Label>
                  <Input placeholder="HEL" className="uppercase" maxLength={4} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea rows={3} placeholder="Briefly describe the project..." />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <DialogTrigger asChild><Button variant="outline">Cancel</Button></DialogTrigger>
              <Button onClick={() => toast.success("Project created (demo)")}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects…" className="pl-9" />
        </div>
        <div className="flex p-1 rounded-md bg-muted text-sm">
          {(["All", "Active", "Completed", "Archived"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 h-7 rounded text-xs font-medium transition ${filter === f ? "bg-card shadow-sm" : "text-muted-foreground"}`}
            >{f}</button>
          ))}
        </div>
        <div className="ml-auto flex p-1 rounded-md border">
          <button onClick={() => setView("grid")} className={`size-7 grid place-items-center rounded ${view === "grid" ? "bg-muted" : ""}`}><LayoutGrid className="size-4" /></button>
          <button onClick={() => setView("list")} className={`size-7 grid place-items-center rounded ${view === "list" ? "bg-muted" : ""}`}><List className="size-4" /></button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.id} onClick={() => navigate({ to: "/app/backlog" })} className="cursor-pointer group flex flex-col rounded-xl border bg-card overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <div className={`h-28 bg-gradient-to-br ${p.color} relative`}>
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-5 pt-0 flex-1 flex flex-col">
                <div className="size-14 rounded-xl bg-card border shadow-sm grid place-items-center font-bold text-primary text-xl -mt-7 relative z-10 ring-4 ring-card">
                  {p.name[0]}
                </div>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold tracking-tight text-base leading-tight group-hover:text-primary transition-colors">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                      <span className={`inline-block size-1.5 rounded-full ${p.status === "Active" ? "bg-emerald-500" : p.status === "Completed" ? "bg-blue-500" : "bg-muted-foreground"}`} />
                      {p.sprint}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button size="icon" variant="ghost" className="size-8 -mr-2"><MoreHorizontal className="size-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => navigate({ to: "/app/backlog" })}><ExternalLink className="size-3.5 mr-2" />Open Backlog</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingId(p.id)}><Edit className="size-3.5 mr-2" />Edit</DropdownMenuItem>
                      {p.status !== "Completed" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(p.id, "Completed")}><LayoutGrid className="size-3.5 mr-2" />Mark Completed</DropdownMenuItem>
                      )}
                      {p.status !== "Active" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(p.id, "Active")}><LayoutGrid className="size-3.5 mr-2" />Mark Active</DropdownMenuItem>
                      )}
                      {p.status !== "Archived" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(p.id, "Archived")}><Archive className="size-3.5 mr-2" />Archive</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2 leading-relaxed flex-1">{p.description}</p>
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-medium text-muted-foreground">Progress</span>
                    <span className="font-semibold tabular-nums">{p.progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {p.members.map((mid) => {
                      const m = memberById(mid)!;
                      return (
                        <Avatar key={mid} className="size-8 border-2 border-card ring-1 ring-border/50 transition-transform group-hover:translate-x-0.5">
                          <AvatarImage src={m.avatar} /><AvatarFallback>{m.name[0]}</AvatarFallback>
                        </Avatar>
                      );
                    })}
                  </div>
                  <Badge variant="secondary" className="px-2.5 py-0.5 font-medium bg-muted/40 text-muted-foreground hover:bg-muted/80 transition-colors">
                    {p.openTasks} open
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Sprint</th>
                <th className="text-left p-3">Progress</th>
                <th className="text-left p-3">Members</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/30 transition">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3 text-muted-foreground">{p.sprint}</td>
                  <td className="p-3 w-48">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="text-xs tabular-nums w-9">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex -space-x-2">
                      {p.members.map((mid) => {
                        const m = memberById(mid)!;
                        return (
                          <Avatar key={mid} className="size-6 border-2 border-card">
                            <AvatarImage src={m.avatar} /><AvatarFallback>{m.name[0]}</AvatarFallback>
                          </Avatar>
                        );
                      })}
                    </div>
                  </td>
                  <td className="p-3"><Badge variant="secondary">{p.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">Update project details.</p>
          </DialogHeader>
          {editingId && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3 space-y-1.5">
                  <Label>Name</Label>
                  <Input defaultValue={localProjects.find((p) => p.id === editingId)?.name} />
                </div>
                <div className="col-span-1 space-y-1.5">
                  <Label>Key</Label>
                  <Input defaultValue={editingId.replace("p", "PRJ-")} className="uppercase" maxLength={4} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea rows={3} defaultValue={localProjects.find((p) => p.id === editingId)?.description} />
              </div>
              <DialogFooter className="gap-2 sm:gap-0 mt-4">
                <Button variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                <Button onClick={() => { setEditingId(null); toast.success("Project updated"); }}>Save Changes</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
