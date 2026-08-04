import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Zap, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPassword } from "@/hooks/queries/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || "",
    }
  },
  component: ResetPassword,
});

function ResetPassword() {
  const search = useSearch({ from: '/reset-password' }) as any;
  const token = search.token || "";
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  
  const resetPasswordMutation = useResetPassword();
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }
    
    if (!newPassword || !confirmPassword) {
      toast.error("Please enter both password fields.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    resetPasswordMutation.mutate({ token, newPassword, confirmPassword }, {
      onSuccess: (res: any) => {
        toast.success(res?.message || "Password successfully reset. You can now login.");
        navigate({ to: "/" });
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to reset password.");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 lg:p-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-2 mb-8 justify-center lg:justify-start">
          <div className="size-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <Zap className="size-4" />
          </div>
          <span className="font-semibold text-xl">Agilix</span>
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Set New Password</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="newPw">New Password</Label>
              <div className="relative">
                <Input 
                  id="newPw" 
                  type={showPw ? "text" : "password"} 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={resetPasswordMutation.isPending}
                  required
                />
                <button type="button" onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="confirmPw">Confirm Password</Label>
              <Input 
                id="confirmPw" 
                type={showPw ? "text" : "password"} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={resetPasswordMutation.isPending}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={resetPasswordMutation.isPending}>
            {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
          </Button>
          
          <div className="text-center mt-4">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="size-4" /> Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
