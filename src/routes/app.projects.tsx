import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { Plus, Search, LayoutGrid, List, MoreHorizontal, Archive, Edit, ExternalLink, Calendar as CalendarIcon, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useCreateProject, useProjects, useUpdateProject, useDeleteProject } from "@/hooks/queries/useProjects";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/app/projects")({ component: Projects });

function Projects() {
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [view, setView] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<"All" | "Active" | "Completed" | "Archived">("All");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: projectsData, isLoading } = useProjects(page, limit);
  const remoteProjects = projectsData?.data?.items || [];
  const meta = projectsData?.data?.meta;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState<Date>();

  const createProjectMutation = useCreateProject();
  const deleteProjectMutation = useDeleteProject();

  const handleCreateProject = () => {
    if (!name || !key || !description || !deadline) {
      toast.error("Please fill in all fields.");
      return;
    }
    
    createProjectMutation.mutate({
      name,
      key,
      description,
      deadline: format(deadline, "yyyy-MM-dd")
    }, {
      onSuccess: () => {
        toast.success("Project created successfully");
        setIsDialogOpen(false);
        setName("");
        setKey("");
        setDescription("");
        setDeadline(undefined);
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create project");
      }
    });
  };

  const handleDeleteProject = () => {
    if (deletingId) {
      deleteProjectMutation.mutate(deletingId, {
        onSuccess: () => {
          toast.success("Project deleted successfully");
          setDeletingId(null);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to delete project");
          setDeletingId(null);
        }
      });
    }
  };

  const filtered = remoteProjects.filter(
    (p) => (filter === "All" || p.status.toUpperCase() === filter.toUpperCase()) && p.name.toLowerCase().includes(q.toLowerCase())
  );

  const updateProjectMutation = useUpdateProject();
  const handleStatusChange = (id: number, status: string) => {
    toast.promise(
      updateProjectMutation.mutateAsync({ id, data: { status } }),
      {
        loading: `Marking as ${status.toLowerCase()}...`,
        success: `Project marked as ${status}`,
        error: (err: any) => err.message || "Failed to update status",
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">{meta?.total || 0} workspaces · {remoteProjects.filter(p=>p.status==="ACTIVE").length} active</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Helios Analytics" />
                </div>
                <div className="col-span-1 space-y-1.5">
                  <Label>Key</Label>
                  <Input value={key} onChange={e => setKey(e.target.value.toUpperCase())} placeholder="HEL" className="uppercase" maxLength={4} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Briefly describe the project..." />
              </div>

              <div className="space-y-1.5 flex flex-col">
                <Label>Deadline</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deadline && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deadline}
                      onSelect={setDeadline}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateProject} disabled={createProjectMutation.isPending}>
                {createProjectMutation.isPending ? "Creating..." : "Create"}
              </Button>
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
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col rounded-xl border bg-card overflow-hidden">
                <Skeleton className="h-28 w-full rounded-none" />
                <div className="p-5 pt-0 flex-1 flex flex-col">
                  <Skeleton className="size-14 rounded-xl -mt-7 relative z-10" />
                  <div className="mt-3 space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="mt-5 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="mt-5 pt-4 border-t flex items-center justify-between">
                    <Skeleton className="size-8 rounded-full" />
                  </div>
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="col-span-full py-10 text-center text-muted-foreground">No projects found.</div>
          ) : filtered.map((p) => (
            <div key={p.id} onClick={() => navigate({ to: "/app/backlog" })} className="cursor-pointer group flex flex-col rounded-xl border bg-card overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <div className={`h-28 bg-gradient-to-br from-primary/20 to-primary/5 relative`}>
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-5 pt-0 flex-1 flex flex-col">
                <div className="size-14 rounded-xl bg-card border shadow-sm grid place-items-center font-bold text-primary text-xl -mt-7 relative z-10 ring-4 ring-card">
                  {p.name[0].toUpperCase()}
                </div>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold tracking-tight text-base leading-tight group-hover:text-primary transition-colors">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                      <span className={`inline-block size-1.5 rounded-full ${p.status === "ACTIVE" ? "bg-emerald-500" : p.status === "COMPLETED" ? "bg-blue-500" : "bg-muted-foreground"}`} />
                      <span className="capitalize">{p.status.toLowerCase()}</span> &bull; {p.deadline ? format(new Date(p.deadline), "MMM d, yyyy") : "No deadline"}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button size="icon" variant="ghost" className="size-8 -mr-2"><MoreHorizontal className="size-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => navigate({ to: "/app/backlog" })}><ExternalLink className="size-3.5 mr-2" />Open Backlog</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingId(p.id.toString())}><Edit className="size-3.5 mr-2" />Edit</DropdownMenuItem>
                      {p.status !== "COMPLETED" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(p.id, "COMPLETED")}><LayoutGrid className="size-3.5 mr-2" />Mark Completed</DropdownMenuItem>
                      )}
                      {p.status !== "ACTIVE" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(p.id, "ACTIVE")}><LayoutGrid className="size-3.5 mr-2" />Mark Active</DropdownMenuItem>
                      )}
                      {p.status !== "ARCHIVED" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(p.id, "ARCHIVED")}><Archive className="size-3.5 mr-2" />Archive</DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeletingId(p.id)}><Trash className="size-3.5 mr-2" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2 leading-relaxed flex-1">{p.description}</p>
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-medium text-muted-foreground">Progress</span>
                    <span className="font-semibold tabular-nums">{p.progress || 0}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${p.progress || 0}%` }} />
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t flex items-center justify-between">
                  <div className="flex -space-x-2">
                    <Avatar className="size-8 border-2 border-card ring-1 ring-border/50">
                      <AvatarFallback>{p.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
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
                <th className="text-left p-3">Deadline</th>
                <th className="text-left p-3">Progress</th>
                <th className="text-left p-3">Members</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3"><Skeleton className="h-5 w-32" /></td>
                    <td className="p-3"><Skeleton className="h-5 w-24" /></td>
                    <td className="p-3"><Skeleton className="h-5 w-48" /></td>
                    <td className="p-3"><Skeleton className="size-6 rounded-full" /></td>
                    <td className="p-3"><Skeleton className="h-6 w-20 rounded-full" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">No projects found.</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/30 transition">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3 text-muted-foreground">{p.deadline ? format(new Date(p.deadline), "MMM d, yyyy") : "No deadline"}</td>
                  <td className="p-3 w-48">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${p.progress || 0}%` }} />
                      </div>
                      <span className="text-xs tabular-nums w-9">{p.progress || 0}%</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex -space-x-2">
                      <Avatar className="size-6 border-2 border-card">
                        <AvatarFallback>{p.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </div>
                  </td>
                  <td className="p-3"><Badge variant="secondary" className="capitalize">{p.status.toLowerCase()}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination component */}
      {meta && meta.totalPages > 1 && (
        <Pagination className="pt-4 pb-2 border-t mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => { e.preventDefault(); if (meta.hasPreviousPage) setPage(p => p - 1); }}
                className={!meta.hasPreviousPage ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({ length: meta.totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink 
                  href="#" 
                  isActive={page === i + 1}
                  onClick={(e) => { e.preventDefault(); setPage(i + 1); }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => { e.preventDefault(); if (meta.hasNextPage) setPage(p => p + 1); }}
                className={!meta.hasNextPage ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">Update project details.</p>
          </DialogHeader>
          {editingId && remoteProjects.find((p) => p.id.toString() === editingId) && (
            <EditProjectForm 
              project={remoteProjects.find((p) => p.id.toString() === editingId)} 
              onClose={() => setEditingId(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProjectMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); handleDeleteProject(); }}
              disabled={deleteProjectMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProjectMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EditProjectForm({ project, onClose }: { project: any, onClose: () => void }) {
  const [name, setName] = useState(project.name);
  const [key, setKey] = useState(project.key);
  const [description, setDescription] = useState(project.description);
  const [status, setStatus] = useState(project.status);
  const [deadline, setDeadline] = useState<Date | undefined>(project.deadline ? new Date(project.deadline) : undefined);
  
  const updateMutation = useUpdateProject();

  const handleSave = () => {
    updateMutation.mutate({
      id: project.id,
      data: {
        name,
        key,
        description,
        status,
        deadline: deadline ? format(deadline, "yyyy-MM-dd") : undefined,
      }
    }, {
      onSuccess: () => {
        toast.success("Project updated successfully");
        onClose();
      },
      onError: (err: any) => toast.error(err.message || "Failed to update project")
    });
  };

  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-3 space-y-1.5">
          <Label>Name</Label>
          <Input value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="col-span-1 space-y-1.5">
          <Label>Key</Label>
          <Input value={key} onChange={e => setKey(e.target.value.toUpperCase())} className="uppercase" maxLength={4} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5 flex flex-col">
          <Label>Status</Label>
          <select 
            className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={status} 
            onChange={e => setStatus(e.target.value)}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
        <div className="space-y-1.5 flex flex-col">
          <Label>Deadline</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !deadline && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={deadline}
                onSelect={setDeadline}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <DialogFooter className="gap-2 sm:gap-0 mt-4">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </div>
  );
}
