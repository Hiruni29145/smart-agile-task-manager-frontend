import { Outlet } from "@tanstack/react-router";
import { AppSidebar } from "./AppSidebar";
import { TopNav } from "./TopNav";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

import { useRole } from "@/lib/role";

export function AppShell() {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const { role } = useRole();

  const handleCreateTask = () => {
    setIsTaskModalOpen(false);
    toast.success("Task created successfully", {
      description: "AI is currently estimating the effort for this task."
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopNav onNewTask={() => setIsTaskModalOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 animate-in-up">
          <Outlet />
        </main>
      </div>


      {/* Global New Task Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="space-y-2">
              <Label>Task Title</Label>
              <Input placeholder="e.g. Implement user authentication..." className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe the task details..." className="rounded-xl min-h-[120px] resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project</Label>
                <Select defaultValue="p1">
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="p1">Project Alpha</SelectItem>
                    <SelectItem value="p2">Project Beta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assignee</Label>
                <Select>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    <SelectItem value="m1">Aria Chen</SelectItem>
                    <SelectItem value="m2">Marcus Johnson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsTaskModalOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleCreateTask} className="rounded-xl">Create & Estimate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
