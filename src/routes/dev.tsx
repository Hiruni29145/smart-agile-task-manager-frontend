import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useEffect } from "react";
import { useRole } from "@/lib/role";

export const Route = createFileRoute("/dev")({ component: DevLayout });

function DevLayout() {
  const { setRole } = useRole();
  useEffect(() => { setRole("developer"); }, [setRole]);
  return <AppShell />;
}
