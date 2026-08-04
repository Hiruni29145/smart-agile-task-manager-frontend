import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Zap, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useRole, type Role } from "@/lib/role";
import { useLogin } from "@/hooks/queries/useAuth";

import { toast } from "sonner";

export const Route = createFileRoute("/")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const { setRole } = useRole();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  
  const loginMutation = useLogin();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    loginMutation.mutate({ email, password }, {
      onSuccess: async (loginResponse) => {
        // 1. Save tokens
        const tokens = loginResponse.data.tokens;
        if (tokens?.accessToken) {
          localStorage.setItem("accessToken", tokens.accessToken);
        }
        if (tokens?.refreshToken) {
          localStorage.setItem("refreshToken", tokens.refreshToken);
        }

        const userRole = loginResponse.data.role;

        // 2. Identify Role and Redirect
        if (userRole === "SUPER_ADMIN" || userRole === "ADMIN") {
          setRole("manager");
          navigate({ to: "/app/dashboard" });
        } else if (userRole === "DEVELOPER") {
          setRole("developer");
          navigate({ to: "/dev/dashboard" });
        } else {
          toast.error("Unknown user role.");
        }
      },
      onError: (error: any) => {
        toast.error(error.message || "Login failed. Please check your credentials.");
      }
    });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* LEFT: AI illustration */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <Zap className="size-5" />
          </div>
          <span className="font-semibold tracking-tight">Agilix</span>
        </div>

        <div className="relative">
          <div className="absolute -top-20 -left-10 size-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute top-20 left-40 size-56 rounded-full bg-info/20 blur-3xl" />
          <div className="relative space-y-6">
            <div className="inline-flex items-center gap-2 px-3 h-7 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Sparkles className="size-3" /> AI Effort Estimation, in real time
            </div>
            <h1 className="text-5xl font-semibold tracking-tight leading-[1.05]">
              Plan smarter sprints<br />with an AI co-pilot.
            </h1>
            <p className="text-muted-foreground max-w-md">
              Predict story points, balance team workload, and ship sprints with confidence.
              Built for modern engineering teams.
            </p>
            <div className="grid grid-cols-3 gap-3 max-w-md pt-4">
              {[
                { k: "94%", v: "AI accuracy" },
                { k: "47", v: "Velocity" },
                { k: "6 teams", v: "Aligned" },
              ].map((s) => (
                <div key={s.v} className="rounded-xl border bg-card/60 backdrop-blur px-4 py-3">
                  <div className="text-2xl font-semibold">{s.k}</div>
                  <div className="text-xs text-muted-foreground">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">© 2026 Agilix Labs</div>
      </div>

      {/* RIGHT: Login card */}
      <div className="flex items-center justify-center p-6 lg:p-10 relative">
        <form onSubmit={submit} className="w-full max-w-md space-y-6">
          <div className="space-y-2 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
                <Zap className="size-4" />
              </div>
              <span className="font-semibold">Agilix</span>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1">Sign in to continue to your workspace.</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loginMutation.isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw">Password</Label>
              <div className="relative">
                <Input 
                  id="pw" 
                  type={showPw ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loginMutation.isPending}
                />
                <button type="button" onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox defaultChecked disabled={loginMutation.isPending} /> Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
            </div>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Signing in..." : "Sign in"} <ArrowRight className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
