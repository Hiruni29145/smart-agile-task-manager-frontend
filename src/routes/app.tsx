import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useEffect } from "react";
import { useRole } from "@/lib/role";

export const Route = createFileRoute("/app")({ component: ManagerLayout });

function ManagerLayout() {
  const { setRole } = useRole();
  useEffect(() => { setRole("manager"); }, [setRole]);
  return <AppShell />;
}
