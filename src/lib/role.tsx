import { createContext, useContext, useEffect, useState } from "react";

export type Role = "manager" | "developer";
const RoleCtx = createContext<{ role: Role; setRole: (r: Role) => void }>({
  role: "manager",
  setRole: () => {},
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>("manager");
  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("satm-role")) as Role | null;
    if (saved === "manager" || saved === "developer") setRoleState(saved);
  }, []);
  const setRole = (r: Role) => {
    setRoleState(r);
    localStorage.setItem("satm-role", r);
  };
  return <RoleCtx.Provider value={{ role, setRole }}>{children}</RoleCtx.Provider>;
}

export const useRole = () => useContext(RoleCtx);
