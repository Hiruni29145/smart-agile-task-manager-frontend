import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { members, tasks } from "@/lib/mock";
import { Plus, Mail, Search, MoreHorizontal, Edit, Trash2, LayoutGrid, List } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui-bits";
import { Users, UserCheck, AlertTriangle } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/app/teams")({ component: Teams });

function Teams() {
  const [teamMembers, setTeamMembers] = useState(members);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("Developer");
  const [newJobTitle, setNewJobTitle] = useState("");

  const filteredMembers = teamMembers.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()) || m.role.toLowerCase().includes(q.toLowerCase()));
  
  const selectedMember = teamMembers.find(m => m.id === selectedMemberId);
  const memberTasks = tasks.filter(t => t.assignee === selectedMemberId);

  const overloaded = teamMembers.filter((m) => m.workload >= 90).length;
  const active = teamMembers.filter((m) => m.status === "Active").length;

  const handleRemoveUser = (id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
    toast.success("User removed from team.");
  };

  const handleSaveEdit = () => {
    setTeamMembers(prev => prev.map(m => m.id === editingId ? { ...m, name: newName, role: newJobTitle || newRole } : m));
    setEditingId(null);
    toast.success("User updated successfully.");
  };

  const handleCreateUser = () => {
    if (!newName || !newEmail) {
      toast.error("Please enter a name and email.");
      return;
    }
    
    const newUser = {
      id: `u${Date.now()}`,
      name: newName,
      role: newJobTitle || newRole,
      avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(newName)}&backgroundColor=c0e2ff,b6e3f4,d1d4f9,ffd5dc`,
      workload: 0,
      status: "Active" as const,
      tasks: 0,
    };
    
    setTeamMembers([...teamMembers, newUser]);
    setIsDialogOpen(false);
    toast.success("User created successfully!");
    
    setNewName("");
    setNewEmail("");
    setNewRole("Developer");
    setNewJobTitle("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Teams</h1>
          <p className="text-sm text-muted-foreground">{teamMembers.length} members · 3 squads</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button className="gap-1.5"><Plus className="size-4" /> Add member</Button></DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Create Team Member</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Instantly provision an account for a new user.</p>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="e.g. Jane Doe" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={newEmail} onChange={e=>setNewEmail(e.target.value)} type="email" placeholder="jane@company.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>System Role</Label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Developer">Developer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Job Title (Optional)</Label>
                  <Input value={newJobTitle} onChange={e=>setNewJobTitle(e.target.value)} placeholder="e.g. QA Engineer" />
                </div>
              </div>
              <div className="space-y-1.5 pt-2">
                <Label>Temporary Password</Label>
                <div className="flex gap-2">
                  <Input readOnly value="Welcome123!" className="bg-muted text-muted-foreground font-mono" />
                  <Button variant="outline" onClick={() => toast.info("Password copied to clipboard!")}>Copy</Button>
                </div>
                <p className="text-xs text-muted-foreground">Share this password securely. They will be prompted to change it upon first login.</p>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0 mt-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateUser}>Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Members" value={teamMembers.length} icon={Users} />
        <StatCard label="Active Now" value={active} icon={UserCheck} accent="success" />
        <StatCard label="Overloaded" value={overloaded} icon={AlertTriangle} accent="warning" />
        <StatCard label="Avg Workload" value={teamMembers.length ? Math.round(teamMembers.reduce((a, m) => a + m.workload, 0) / teamMembers.length) : 0} suffix="%" icon={Users} accent="info" />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search team members by name or role…" className="pl-9" />
        </div>
        <div className="flex items-center rounded-lg border bg-card p-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            className="px-3"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            className="px-3"
            onClick={() => setViewMode("table")}
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMembers.map((m) => (
            <div key={m.id} onClick={() => setSelectedMemberId(m.id)} className="cursor-pointer group rounded-2xl border bg-card hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden flex flex-col relative">
              {/* Header / Banner */}
              <div className="h-20 bg-muted relative">
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50" />
                 <div className="absolute right-2 top-2">
                   <DropdownMenu>
                     <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                       <Button size="icon" variant="ghost" className="size-8 rounded-full bg-background/50 hover:bg-background"><MoreHorizontal className="size-4" /></Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                       <DropdownMenuItem onClick={() => {
                         setNewName(m.name);
                         setNewJobTitle(m.role);
                         setEditingId(m.id);
                       }}><Edit className="size-3.5 mr-2" />Edit Profile</DropdownMenuItem>
                       <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => handleRemoveUser(m.id)}><Trash2 className="size-3.5 mr-2" />Remove Member</DropdownMenuItem>
                     </DropdownMenuContent>
                   </DropdownMenu>
                 </div>
              </div>
              
              {/* Body */}
              <div className="px-5 pb-5 flex-1 flex flex-col items-center text-center -mt-10 relative z-10">
                <Avatar className="size-20 border-4 border-card shadow-sm ring-1 ring-border/50">
                  <AvatarImage src={m.avatar} /><AvatarFallback className="text-lg">{m.name[0]}</AvatarFallback>
                </Avatar>
                
                <div className="mt-3 w-full">
                  <h3 className="font-semibold text-lg tracking-tight group-hover:text-primary transition-colors">{m.name}</h3>
                  <p className="text-sm text-muted-foreground">{m.role}</p>
                  
                  <div className="mt-3 flex justify-center">
                    <Badge variant="secondary" className={`${m.status === "Active" ? "bg-emerald-500/10 text-emerald-600" : m.status === "Away" ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground"} border-0 hover:bg-transparent`}>
                      <span className={`size-1.5 rounded-full mr-1.5 ${m.status === "Active" ? "bg-emerald-500" : m.status === "Away" ? "bg-amber-500" : "bg-muted-foreground"}`} />
                      {m.status}
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 w-full grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-muted/30 border p-3 flex flex-col items-center justify-center">
                    <div className="text-xs text-muted-foreground mb-1">Open Tasks</div>
                    <div className="text-xl font-bold tabular-nums text-primary">{m.tasks}</div>
                  </div>
                  <div className="rounded-xl bg-muted/30 border p-3 flex flex-col items-center justify-center">
                    <div className="text-xs text-muted-foreground mb-1">Workload</div>
                    <div className="text-xl font-bold tabular-nums">{m.workload}%</div>
                  </div>
                </div>
                
                <div className="mt-5 w-full">
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className={m.workload >= 90 ? "text-destructive" : ""}>{m.workload >= 90 ? "Overloaded" : "Healthy"}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ease-out ${m.workload >= 90 ? "bg-destructive" : m.workload >= 75 ? "bg-warning" : "bg-primary"}`}
                      style={{ width: `${m.workload}%` }}
                    />
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
                <th className="text-left p-4 font-medium">Member</th>
                <th className="text-left p-4 font-medium">Role</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-center p-4 font-medium">Open Tasks</th>
                <th className="text-center p-4 font-medium">Workload</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredMembers.map((m) => (
                <tr key={m.id} onClick={() => setSelectedMemberId(m.id)} className="cursor-pointer hover:bg-muted/30 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8 border">
                        <AvatarImage src={m.avatar} />
                        <AvatarFallback>{m.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{m.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{m.role}</td>
                  <td className="p-4">
                    <Badge variant="secondary" className={`${m.status === "Active" ? "bg-emerald-500/10 text-emerald-600" : m.status === "Away" ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground"} border-0 hover:bg-transparent`}>
                      <span className={`size-1.5 rounded-full mr-1.5 ${m.status === "Active" ? "bg-emerald-500" : m.status === "Away" ? "bg-amber-500" : "bg-muted-foreground"}`} />
                      {m.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-center tabular-nums">{m.tasks}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ease-out ${m.workload >= 90 ? "bg-destructive" : m.workload >= 75 ? "bg-warning" : "bg-primary"}`}
                          style={{ width: `${m.workload}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums w-8">{m.workload}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button size="icon" variant="ghost" className="size-8 rounded-full"><MoreHorizontal className="size-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => {
                          setNewName(m.name);
                          setNewJobTitle(m.role);
                          setEditingId(m.id);
                        }}><Edit className="size-3.5 mr-2" />Edit Profile</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => handleRemoveUser(m.id)}><Trash2 className="size-3.5 mr-2" />Remove Member</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
          </DialogHeader>
          {editingId && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input value={newName} onChange={e=>setNewName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Job Title / Role</Label>
                <Input value={newJobTitle} onChange={e=>setNewJobTitle(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Profile Side Panel */}
      <Sheet open={!!selectedMemberId} onOpenChange={(open) => !open && setSelectedMemberId(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selectedMember && (
            <>
              <SheetHeader className="text-left pb-6 border-b mt-4">
                <div className="flex items-center gap-4">
                  <Avatar className="size-16 border-2 border-muted shadow-sm">
                    <AvatarImage src={selectedMember.avatar} />
                    <AvatarFallback>{selectedMember.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-xl font-bold">{selectedMember.name}</SheetTitle>
                    <SheetDescription className="text-sm mt-0.5">{selectedMember.role}</SheetDescription>
                    <Badge variant="secondary" className="mt-2 text-xs font-medium bg-muted border-0">
                      <span className={`size-1.5 rounded-full mr-1.5 ${selectedMember.status === "Active" ? "bg-emerald-500" : selectedMember.status === "Away" ? "bg-amber-500" : "bg-muted-foreground"}`} />
                      {selectedMember.status}
                    </Badge>
                  </div>
                </div>
              </SheetHeader>

              <div className="py-6 space-y-8">
                <div>
                  <h4 className="text-sm font-semibold mb-3">Workload & Capacity</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-muted/40 border p-3">
                      <div className="text-xs text-muted-foreground mb-1">Assigned Tasks</div>
                      <div className="text-xl font-bold text-primary">{memberTasks.length}</div>
                    </div>
                    <div className="rounded-xl bg-muted/40 border p-3">
                      <div className="text-xs text-muted-foreground mb-1">Current Workload</div>
                      <div className={`text-xl font-bold ${selectedMember.workload >= 90 ? "text-destructive" : ""}`}>{selectedMember.workload}%</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-3">Active Tasks</h4>
                  {memberTasks.length > 0 ? (
                    <div className="space-y-3">
                      {memberTasks.map((t) => (
                        <div key={t.id} className="p-3.5 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
                          <div className="font-medium text-sm leading-tight">{t.title}</div>
                          <div className="flex justify-between items-center mt-3">
                            <Badge variant="outline" className={`text-[10px] uppercase font-bold ${t.status === "done" ? "text-success border-success/30 bg-success/10" : "text-muted-foreground"}`}>
                              {t.status.replace("_", " ")}
                            </Badge>
                            <span className="text-xs font-medium text-muted-foreground">{t.storyPoints} Story Points</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 border rounded-xl border-dashed text-center text-sm text-muted-foreground bg-muted/20">
                      No active tasks assigned.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
