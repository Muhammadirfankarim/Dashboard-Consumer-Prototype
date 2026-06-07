"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import {
  AlertTriangle,
  BarChart3,
  ClipboardCheck,
  Database,
  Gauge,
  Menu,
  MessageSquareText,
  Settings,
  ShieldCheck,
  Table2
} from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { useRole } from "@/components/RoleProvider";
import { ROLE_OPTIONS } from "@/types";
import { useData } from "@/components/DataProvider";
import { cn } from "@/lib/utils";

const mobileNav = [
  { href: "/dashboard/", label: "Dashboard", icon: Gauge, viewer: true },
  { href: "/register/", label: "Register", icon: Table2, viewer: false },
  { href: "/checklist/", label: "Checklist", icon: ClipboardCheck, viewer: false },
  { href: "/escalation/", label: "Escalation", icon: MessageSquareText, viewer: false },
  { href: "/reports/", label: "Reports", icon: BarChart3, viewer: true },
  { href: "/settings/", label: "Settings", icon: Settings, viewer: false }
];

export function AppShell({ children }: { children: ReactNode }) {
  const { role, setRole } = useRole();
  const { storageMode } = useData();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 lg:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <Link
                  href="/dashboard/"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-bri-blue text-white lg:hidden"
                  title="Buka dashboard"
                >
                  <Menu className="h-5 w-5" />
                </Link>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-bri-blue">
                    Quick-win branch monitoring tool
                  </p>
                  <h2 className="truncate text-base font-semibold text-slate-950 sm:text-lg">
                    BRISpot Bad Data Monitoring & Escalation Dashboard
                  </h2>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 sm:flex">
                  <Database className="h-4 w-4 text-bri-blue" />
                  {storageMode === "supabase" ? "Supabase" : "Demo mode"}
                </div>
                <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <ShieldCheck className="h-4 w-4 text-bri-blue" />
                  <span className="hidden text-slate-600 sm:inline">Role</span>
                  <select
                    value={role}
                    onChange={(event) => setRole(event.target.value as typeof role)}
                    className="bg-transparent text-sm font-semibold text-slate-900 outline-none"
                  >
                    {ROLE_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="border-t border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900 lg:px-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  Gunakan data dummy. Jangan memasukkan CIF, nama, atau nomor HP nasabah asli
                  pada MVP ini.
                </span>
              </div>
            </div>
            <nav className="flex gap-2 overflow-x-auto border-t border-slate-200 bg-white px-4 py-2 lg:hidden">
              {mobileNav.map((item) => {
                const Icon = item.icon;
                const disabled = role === "Viewer" && !item.viewer;
                const active = pathname === item.href || pathname.startsWith(item.href);
                if (disabled) {
                  return (
                    <span
                      key={item.href}
                      className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-400"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold",
                      active ? "bg-bri-blue text-white" : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>
          <main className="mx-auto w-full max-w-[1500px] px-4 py-6 lg:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
