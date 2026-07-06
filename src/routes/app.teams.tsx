import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Mail, Search, MoreHorizontal, Edit, Trash2, LayoutGrid, List, Loader2 } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/api/client";

export const Route = createFileRoute("/app/teams")({ component: Teams });

function Teams() {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isFetchingMembers, setIsFetchingMembers] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    totalDeveloper: 0,
    activeNow: 0,
    overloaded: 0,
    avgWorkload: 0,
  });

  useEffect(() => {
    const fetchMembers = async () => {
      setIsFetchingMembers(true);
      try {
        const response = await apiClient<any>("/api/v1/teams/members", { method: "GET" });
        if (response.success && response.data?.items) {
          const membersData = response.data.items.map((item: any) => ({
            id: item.id,
            name: `${item.firstName} ${item.lastName}`,
            role: item.jobDescription || "Member",
            avatar: item.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(item.firstName + " " + item.lastName)}&backgroundColor=c0e2ff,b6e3f4,d1d4f9,ffd5dc`,
            workload: item.workloadPercentage || 0,
            status: item.isOnline ? "Active" : "Away",
            tasks: item.openTasks || 0,
            capacityStatus: item.capacityStatus
          }));
          setTeamMembers(membersData);
        }
      } catch (error) {
        toast.error("Failed to load team members");
      } finally {
        setIsFetchingMembers(false);
      }
    };

    const fetchStats = async () => {
      try {
        const response = await apiClient<any>("/api/v1/teams/stats", { method: "GET" });
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        toast.error("Failed to load team stats");
      }
    };

    fetchMembers();
    fetchStats();
  }, []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  
  const [newName, setNewName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState("DEVELOPER");
  const [newJobTitle, setNewJobTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const filteredMembers = teamMembers.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()) || m.role.toLowerCase().includes(q.toLowerCase()));
  
  const selectedMember = teamMembers.find(m => m.id === selectedMemberId);

  const handleRemoveUser = (id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
    toast.success("User removed from team.");
  };

  const handleSaveEdit = () => {
    setTeamMembers(prev => prev.map(m => m.id === editingId ? { ...m, name: newName, role: newJobTitle || newRole } : m));
    setEditingId(null);
    toast.success("User updated successfully.");
  };

  const handleCreateUser = async () => {
    if (!firstName || !lastName || !newEmail || !newPhone) {
      toast.error("Please fill in all required fields (First Name, Last Name, Email, Phone).");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient<any>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({
          firstName,
          lastName,
          jobDescription: newJobTitle || newRole,
          phone: newPhone,
          role: newRole,
          email: newEmail,
          password: "Nirmal@123"
        })
      });

      if (response.success || response.statusCode === 201) {
        const newUser = {
          id: `u${Date.now()}`,
          name: `${firstName} ${lastName}`,
          role: newJobTitle || newRole,
          avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(firstName + " " + lastName)}&backgroundColor=c0e2ff,b6e3f4,d1d4f9,ffd5dc`,
          workload: 0,
          status: "Active" as const,
          tasks: 0,
        };
        
        setTeamMembers([...teamMembers, newUser]);
        setIsDialogOpen(false);
        toast.success("User created successfully!");
        
        setFirstName("");
        setLastName("");
        setNewEmail("");
        setNewPhone("");
        setNewRole("DEVELOPER");
        setNewJobTitle("");
      } else {
        toast.error(response.message || "Failed to create user.");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Teams</h1>
          <p className="text-sm text-muted-foreground">{stats.totalDeveloper} members · 3 squads</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button className="gap-1.5"><Plus className="size-4" /> Add member</Button></DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Create Team Member</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Instantly provision an account for a new user.</p>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>First Name</Label>
                  <Input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="e.g. John" />
                </div>
                <div className="space-y-1.5">
                  <Label>Last Name</Label>
                  <Input value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="e.g. Doe" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input value={newEmail} onChange={e=>setNewEmail(e.target.value)} type="email" placeholder="jane@company.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input value={newPhone} onChange={e=>setNewPhone(e.target.value)} placeholder="+94771434562" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>System Role</Label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="DEVELOPER">Developer</SelectItem>
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
                  <Input readOnly value="Nirmal@123" className="bg-muted text-muted-foreground font-mono" />
                  <Button variant="outline" onClick={() => {
                    navigator.clipboard.writeText("Nirmal@123");
                    toast.info("Password copied to clipboard!");
                  }}>Copy</Button>
                </div>
                <p className="text-xs text-muted-foreground">Share this password securely. They will be prompted to change it upon first login.</p>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0 mt-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>Cancel</Button>
              <Button onClick={handleCreateUser} disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Members" value={stats.totalDeveloper} icon={Users} />
        <StatCard label="Active Now" value={stats.activeNow} icon={UserCheck} accent="success" />
        <StatCard label="Overloaded" value={stats.overloaded} icon={AlertTriangle} accent="warning" />
        <StatCard label="Avg Workload" value={stats.avgWorkload} suffix="%" icon={Users} accent="info" />
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

      {isFetchingMembers ? (
        viewMode === "grid" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border bg-card flex flex-col relative overflow-hidden">
                <Skeleton className="h-20 w-full rounded-none" />
                <div className="px-5 pb-5 flex-1 flex flex-col items-center text-center -mt-10 relative z-10">
                  <Skeleton className="size-20 rounded-full border-4 border-card shadow-sm ring-1 ring-border/50 mb-4" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-6 w-16 rounded-full mb-6" />
                  <div className="grid grid-cols-2 gap-3 w-full mb-5">
                    <Skeleton className="h-[72px] rounded-xl" />
                    <Skeleton className="h-[72px] rounded-xl" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="size-8 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        )
      ) : viewMode === "grid" ? (
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
                    <span className={`font-semibold ${m.capacityStatus === 'Overloaded' ? 'text-destructive' : m.capacityStatus === 'Healthy' ? 'text-emerald-500' : 'text-foreground'}`}>{m.capacityStatus || "Unknown"}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-1000 ease-out bg-primary"
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
                          className="h-full transition-all duration-1000 ease-out bg-primary"
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
                      <div className="text-xl font-bold text-primary">{selectedMember.tasks}</div>
                    </div>
                    <div className="rounded-xl bg-muted/40 border p-3">
                      <div className="text-xs text-muted-foreground mb-1">Current Workload</div>
                      <div className="text-xl font-bold">{selectedMember.workload}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
