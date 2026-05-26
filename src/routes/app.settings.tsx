import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, CheckCircle2, MessageSquare, AlertCircle, User, UploadCloud, Clock, Mail, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/settings")({ component: Settings });

function Settings() {
  const hash = useRouterState({ select: (s) => s.location.hash });
  const [activeTab, setActiveTab] = useState("profile");
  
  useEffect(() => {
    if (hash === "notifications") {
      setActiveTab("notifications");
    }
  }, [hash]);
  
  const notifications = [
    { id: 1, title: "Alex mentioned you in PROJ-42", time: "10m ago", icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10", unread: true },
    { id: 2, title: "Sprint 4 has started", time: "2h ago", icon: Bell, color: "text-primary", bg: "bg-primary/10", unread: true },
    { id: 3, title: "Build failed for frontend-app", time: "5h ago", icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10", unread: false },
    { id: 4, title: "Task PROJ-18 moved to Done", time: "1d ago", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", unread: false },
  ];

  return (
    <div className="pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-2">Manage your profile information and notification preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left",
                activeTab === "profile" 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <User className="size-4" /> Personal Profile
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all text-left",
                activeTab === "notifications" 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Bell className="size-4" /> Notifications
              </div>
              <Badge variant="secondary" className="bg-primary text-primary-foreground rounded-full px-1.5 min-w-[20px] text-center border-0">2</Badge>
            </button>
          </nav>
        </aside>

        {/* Settings Content */}
        <main className="flex-1 min-w-0">
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-3xl border bg-card p-8 shadow-sm ring-1 ring-primary/5">
                <h2 className="text-xl font-bold mb-6">Profile Picture</h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <Avatar className="size-24 border-4 shadow-md ring-2 ring-primary/10">
                    <AvatarImage src="https://api.dicebear.com/7.x/notionists/svg?seed=Me" />
                    <AvatarFallback>ME</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap gap-3">
                      <Button className="rounded-xl gap-2"><UploadCloud className="size-4" /> Upload new image</Button>
                      <Button variant="outline" className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20">Remove</Button>
                    </div>
                    <p className="text-sm text-muted-foreground">At least 256x256px PNG or JPG file. Max 2MB.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border bg-card p-8 shadow-sm ring-1 ring-primary/5">
                <h2 className="text-xl font-bold mb-6">Personal Details</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground ml-1">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input defaultValue="Alex Morgan" className="pl-10 h-12 bg-muted/30 rounded-xl focus:bg-background transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground ml-1">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input defaultValue="alex@agilix.app" className="pl-10 h-12 bg-muted/30 rounded-xl focus:bg-background transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground ml-1">Job Title</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input defaultValue="Engineering Manager" className="pl-10 h-12 bg-muted/30 rounded-xl focus:bg-background transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground ml-1">Timezone</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input defaultValue="UTC-5 (EST)" className="pl-10 h-12 bg-muted/30 rounded-xl focus:bg-background transition-colors" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button size="lg" className="rounded-xl px-10 text-base shadow-md hover:shadow-lg transition-all">Save Changes</Button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-3xl border bg-card shadow-sm overflow-hidden flex flex-col ring-1 ring-primary/5">
                <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/10">
                  <div>
                    <h2 className="text-xl font-bold">Activity Inbox</h2>
                    <p className="text-sm text-muted-foreground mt-1">Review your recent alerts and project updates.</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg gap-2 self-start sm:self-auto"><CheckCircle2 className="size-4" /> Mark all as read</Button>
                </div>
                
                <div className="divide-y flex-1">
                  {notifications.map(n => (
                    <div key={n.id} className={cn(
                      "p-5 transition-colors flex items-start gap-4 relative group",
                      n.unread ? "bg-primary/[0.02] hover:bg-primary/5" : "hover:bg-muted/30"
                    )}>
                      {n.unread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                      
                      <div className={`p-3 rounded-2xl ${n.bg} shrink-0 ring-1 ring-inset ring-foreground/5`}>
                        <n.icon className={`size-5 ${n.color}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className={cn("text-base", n.unread ? "font-bold text-foreground" : "font-medium text-foreground/80")}>
                          {n.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-2">
                          <Clock className="size-3" /> {n.time}
                        </p>
                      </div>
                      
                      <div className="shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="rounded-full size-8 text-muted-foreground hover:text-foreground bg-background shadow-sm border">
                          <CheckCircle2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 border-t bg-muted/10 text-center">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground w-full rounded-xl">View older notifications...</Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
