"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { ROLE_OPTIONS, Role } from "@/types";

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("Admin");

  useEffect(() => {
    const saved = window.localStorage.getItem("brispot-role") as Role | null;
    if (saved && ROLE_OPTIONS.includes(saved)) setRoleState(saved);
  }, []);

  const setRole = (nextRole: Role) => {
    setRoleState(nextRole);
    window.localStorage.setItem("brispot-role", nextRole);
  };

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used inside RoleProvider");
  return context;
}
