import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Zap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/hooks/queries/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const forgotPasswordMutation = useForgotPassword();
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    forgotPasswordMutation.mutate({ email }, {
      onSuccess: (res: any) => {
        toast.success(res?.message || "Password reset instructions sent to your email");
        navigate({ to: "/" });
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to send reset instructions.");
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
          <h2 className="text-2xl font-semibold tracking-tight">Forgot Password</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your email address and we will send you instructions to reset your password.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={forgotPasswordMutation.isPending}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={forgotPasswordMutation.isPending}>
            {forgotPasswordMutation.isPending ? "Sending..." : "Send reset link"}
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
