"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ChevronLeft,
  ClipboardCheck,
  Gauge,
  Lock,
  MessageSquareText,
  Settings,
  Table2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/components/RoleProvider";

const navItems = [
  { href: "/dashboard/", label: "Dashboard", icon: Gauge, viewer: true },
  { href: "/register/", label: "Bad Data Register", icon: Table2, viewer: false },
  { href: "/checklist/", label: "Checklist Pre-screening", icon: ClipboardCheck, viewer: false },
  { href: "/escalation/", label: "Escalation Generator", icon: MessageSquareText, viewer: false },
  { href: "/reports/", label: "Reports", icon: BarChart3, viewer: true },
  { href: "/settings/", label: "Settings", icon: Settings, viewer: false }
];

type AppSidebarProps = {
  onCollapse: () => void;
};

export function AppSidebar({ onCollapse }: AppSidebarProps) {
  const pathname = usePathname();
  const { role } = useRole();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold uppercase tracking-wide text-bri-blue">
                BRI KC Sudirman Semanggi
              </div>
              <h1 className="mt-2 text-xl font-bold leading-7 text-slate-950">
                BRISpot Bad Data Monitoring
              </h1>
            </div>
            <button
              type="button"
              onClick={onCollapse}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-bri-blue"
              aria-label="Sembunyikan sidebar"
              title="Sembunyikan sidebar"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href);
            const disabled = role === "Viewer" && !item.viewer;
            if (disabled) {
              return (
                <div
                  key={item.href}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400"
                  title="Viewer hanya dapat mengakses Dashboard dan Reports"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <Lock className="h-3.5 w-3.5" />
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-bri-blue text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-4 text-xs leading-5 text-slate-500">
          Gunakan data dummy. Jangan memasukkan data nasabah asli pada MVP ini.
        </div>
      </div>
    </aside>
  );
}
