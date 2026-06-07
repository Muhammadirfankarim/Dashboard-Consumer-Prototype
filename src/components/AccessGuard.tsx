"use client";

import { ReactNode } from "react";
import { Lock } from "lucide-react";
import { Role } from "@/types";
import { useRole } from "@/components/RoleProvider";

export function AccessGuard({
  allowed,
  children
}: {
  allowed: Role[];
  children: ReactNode;
}) {
  const { role } = useRole();
  if (!allowed.includes(role)) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-soft">
        <Lock className="mx-auto h-10 w-10 text-slate-400" />
        <h2 className="mt-4 text-lg font-semibold text-slate-950">Akses dibatasi</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
          Role {role} hanya dapat mengakses halaman yang sesuai. Ubah role di header untuk
          simulasi akses MVP.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
