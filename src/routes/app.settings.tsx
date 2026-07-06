import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, CheckCircle2, MessageSquare, AlertCircle, User, UploadCloud, Clock, Phone, Camera, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/api/client";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/app/settings")({ component: Settings });

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
}

function Settings() {
  const hash = useRouterState({ select: (s) => s.location.hash });
  const [activeTab, setActiveTab] = useState("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (hash === "notifications") {
      setActiveTab("notifications");
    }
  }, [hash]);
  
  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient<any>("/api/v1/auth/me");
        if (response.success && response.data) {
          const { firstName, lastName, phone, avatar } = response.data;
          if (firstName) setFirstName(firstName);
          if (lastName) setLastName(lastName);
          if (phone) setPhoneNumber(phone);
          if (avatar) setAvatarPreview(avatar);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    fetchProfile();
  }, []);
  
  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (page === 1) setIsLoadingNotifications(true);
        else setIsLoadingMore(true);
        
        const response = await apiClient<any>(`/api/v1/notifications?page=${page}`);
        if (response.success && response.data) {
          if (page === 1) {
            setNotifications(response.data.items || []);
          } else {
            setNotifications(prev => [...prev, ...(response.data.items || [])]);
          }
          setUnreadCount(response.data.stats?.totalUnread || 0);
          setHasNextPage(response.data.meta?.hasNextPage || false);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setIsLoadingNotifications(false);
        setIsLoadingMore(false);
      }
    };
    fetchNotifications();
  }, [page]);

  const handleMarkAsRead = async (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await apiClient(`/api/v1/notifications/read/${id}`, {
        method: "PUT"
      });
    } catch (error) {
      console.error(`Failed to mark notification ${id} as read:`, error);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n));
      setUnreadCount(prev => prev + 1);
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await apiClient(`/api/v1/notifications/read/all`, {
        method: "PUT"
      });
    } catch (error) {
      console.error(`Failed to mark all notifications as read:`, error);
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'AUTH':
        return { icon: User, color: "text-blue-500", bg: "bg-blue-500/10" };
      case 'SUCCESS':
        return { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" };
      case 'INFO':
      default:
        return { icon: Bell, color: "text-primary", bg: "bg-primary/10" };
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const token = localStorage.getItem('accessToken');
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      
      const response = await fetch(`${BASE_URL}/api/v1/storage/upload/profile`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      
      if (!response.ok) throw new Error("Failed to upload image");
      
      const data = await response.json();
      if (data.success && data.data?.url) {
        setAvatarPreview(data.data.url);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const response = await apiClient("/api/v1/auth/profile/update", {
        method: "PUT",
        body: JSON.stringify({
          firstName,
          lastName,
          phoneNumber,
          avatar: avatarPreview
        })
      });
      if (response.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-2">Manage your profile information and notification preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left group",
                activeTab === "profile" 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              <User className={cn("size-4 transition-transform", activeTab === "profile" ? "scale-110" : "group-hover:scale-110")} /> Personal Profile
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all text-left group",
                activeTab === "notifications" 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Bell className={cn("size-4 transition-transform", activeTab === "notifications" ? "scale-110" : "group-hover:scale-110")} /> Notifications
              </div>
              {unreadCount > 0 && (
                <Badge variant="secondary" className={cn(
                  "rounded-full px-1.5 min-w-[20px] text-center border-0 transition-colors",
                  activeTab === "notifications" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary text-primary-foreground"
                )}>{unreadCount}</Badge>
              )}
            </button>
          </nav>
        </aside>

        {/* Settings Content */}
        <main className="flex-1 min-w-0">
          {activeTab === "profile" && (
            isLoadingProfile ? (
              <div className="space-y-8">
                <div className="rounded-3xl border bg-card/50 p-8 shadow-sm ring-1 ring-primary/10 relative overflow-hidden">
                  <Skeleton className="h-7 w-48 mb-6" />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 p-6 rounded-2xl border-2 border-dashed border-muted/50">
                    <Skeleton className="size-28 rounded-full" />
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-64" />
                      </div>
                      <div className="flex gap-3">
                        <Skeleton className="h-10 w-32 rounded-xl" />
                        <Skeleton className="h-10 w-24 rounded-xl" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border bg-card/50 p-8 shadow-sm ring-1 ring-primary/10 relative overflow-hidden">
                  <Skeleton className="h-7 w-48 mb-6" />
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2.5">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                    <div className="space-y-2.5">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                    <div className="space-y-2.5 sm:col-span-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Avatar Upload Section */}
              <div className="rounded-3xl border bg-card/50 backdrop-blur-sm p-8 shadow-sm ring-1 ring-primary/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
                <h2 className="text-xl font-bold mb-6 relative z-10 flex items-center gap-2">
                  <Camera className="size-5 text-primary" /> Profile Picture
                </h2>
                
                <div 
                  className={cn(
                    "relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-8 p-6 rounded-2xl border-2 border-dashed transition-all duration-300",
                    isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="relative group/avatar cursor-pointer" onClick={() => !isUploading && fileInputRef.current?.click()}>
                    <Avatar className={cn("size-28 border-4 shadow-xl ring-4 ring-primary/10 transition-transform duration-300", !isUploading && "group-hover/avatar:scale-105")}>
                      <AvatarImage src={avatarPreview} className={cn(isUploading && "opacity-50 blur-sm transition-all")} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-xl font-bold text-primary">
                        {firstName ? firstName.charAt(0).toUpperCase() : ""}{lastName ? lastName.charAt(0).toUpperCase() : ""}
                      </AvatarFallback>
                    </Avatar>
                    
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="size-8 text-primary animate-spin drop-shadow-md" />
                      </div>
                    )}
                    
                    {!isUploading && (
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                        <Camera className="size-8 text-white drop-shadow-md" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">Upload Media</h3>
                      <p className="text-sm text-muted-foreground mt-1">Drag and drop your image here, or click to browse.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/png, image/jpeg, image/gif"
                        onChange={handleFileSelect}
                      />
                      <Button 
                        onClick={() => fileInputRef.current?.click()} 
                        disabled={isUploading}
                        className="rounded-xl gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
                      >
                        {isUploading ? (
                          <><Loader2 className="size-4 animate-spin" /> Uploading...</>
                        ) : (
                          <><UploadCloud className="size-4" /> Browse Files</>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        disabled={isUploading}
                        onClick={() => setAvatarPreview("")}
                        className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 transition-colors"
                      >
                        Remove
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground/80 flex items-center gap-1.5">
                      <ImageIcon className="size-3" /> Supports PNG, JPG or GIF (Max 2MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Details Section */}
              <div className="rounded-3xl border bg-card/50 backdrop-blur-sm p-8 shadow-sm ring-1 ring-primary/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tl from-primary/5 to-transparent opacity-50" />
                <h2 className="text-xl font-bold mb-6 relative z-10 flex items-center gap-2">
                  <User className="size-5 text-primary" /> Personal Details
                </h2>
                
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6 relative z-10">
                  <div className="space-y-2.5 group">
                    <Label className="text-muted-foreground ml-1 font-medium group-focus-within:text-primary transition-colors">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)}
                        className="pl-11 h-12 bg-muted/40 rounded-xl focus:bg-background border-transparent focus:border-primary/50 shadow-sm transition-all" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2.5 group">
                    <Label className="text-muted-foreground ml-1 font-medium group-focus-within:text-primary transition-colors">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)}
                        className="pl-11 h-12 bg-muted/40 rounded-xl focus:bg-background border-transparent focus:border-primary/50 shadow-sm transition-all" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2.5 group sm:col-span-2">
                    <Label className="text-muted-foreground ml-1 font-medium group-focus-within:text-primary transition-colors">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="pl-11 h-12 bg-muted/40 rounded-xl focus:bg-background border-transparent focus:border-primary/50 shadow-sm transition-all" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 items-center gap-4">
                {saveSuccess && (
                  <span className="text-sm font-medium text-emerald-500 flex items-center gap-1.5 animate-in fade-in slide-in-from-right-4">
                    <CheckCircle2 className="size-4" /> Profile updated successfully!
                  </span>
                )}
                <Button 
                  size="lg" 
                  onClick={handleSaveChanges}
                  disabled={isSaving || isUploading}
                  className="rounded-xl px-10 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all gap-2"
                >
                  {isSaving ? (
                    <><Loader2 className="size-4 animate-spin" /> Saving...</>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
            )
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-3xl border bg-card shadow-sm overflow-hidden flex flex-col ring-1 ring-primary/5">
                <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/10">
                  <div>
                    <h2 className="text-xl font-bold">Activity Inbox</h2>
                    <p className="text-sm text-muted-foreground mt-1">Review your recent alerts and project updates.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                    className="rounded-lg gap-2 self-start sm:self-auto hover:bg-primary/5 hover:text-primary border-primary/20 transition-colors"
                  >
                    <CheckCircle2 className="size-4" /> Mark all as read
                  </Button>
                </div>
                
                <div className="divide-y flex-1 relative min-h-[200px]">
                  {isLoadingNotifications ? (
                    <div className="flex flex-col divide-y w-full">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="p-5 flex items-start gap-4">
                          <Skeleton className="size-11 rounded-2xl shrink-0" />
                          <div className="flex-1 space-y-2 pt-1">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-3 w-16 mt-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Bell className="size-12 opacity-20 mb-4" />
                      <p>No notifications yet.</p>
                    </div>
                  ) : null}
                  
                  {notifications.map((n: any) => {
                    const style = getNotificationStyle(n.type);
                    const unread = !n.isRead;
                    return (
                      <div key={n.id} className={cn(
                        "p-5 transition-colors flex items-start gap-4 relative group",
                        unread ? "bg-primary/[0.02] hover:bg-primary/5" : "hover:bg-muted/30"
                      )}>
                        {unread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />}
                        
                        <div className={`p-3 rounded-2xl ${style.bg} shrink-0 ring-1 ring-inset ring-foreground/5 shadow-inner`}>
                          <style.icon className={`size-5 ${style.color}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className={cn("text-base transition-colors group-hover:text-primary", unread ? "font-bold text-foreground" : "font-medium text-foreground/80")}>
                            {n.title}
                          </p>
                          {n.message && <p className="text-sm text-foreground/70 mt-0.5">{n.message}</p>}
                          <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-2">
                            <Clock className="size-3" /> {timeAgo(n.createdAt)}
                          </p>
                        </div>
                        
                        {unread && (
                          <div className="shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleMarkAsRead(n.id)}
                              className="rounded-full size-8 text-muted-foreground hover:text-primary hover:bg-primary/10 shadow-sm border border-transparent hover:border-primary/20 transition-all"
                            >
                              <CheckCircle2 className="size-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {notifications.length > 0 && hasNextPage && (
                  <div className="p-4 border-t bg-muted/10 text-center">
                    <Button 
                      variant="ghost" 
                      disabled={isLoadingMore}
                      onClick={() => setPage(p => p + 1)}
                      className="text-muted-foreground hover:text-primary hover:bg-primary/5 w-full rounded-xl transition-colors"
                    >
                      {isLoadingMore ? <><Loader2 className="size-4 animate-spin mr-2"/> Loading...</> : "View older notifications..."}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
