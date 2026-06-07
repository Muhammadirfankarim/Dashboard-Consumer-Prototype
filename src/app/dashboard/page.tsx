"use client";

import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  FileWarning,
  Hourglass,
  Layers3,
  MessageSquareWarning,
  TrendingUp
} from "lucide-react";
import { useData } from "@/components/DataProvider";
import { KpiCard } from "@/components/KpiCard";
import { LoadingBlock } from "@/components/LoadingBlock";
import { DashboardCharts } from "@/components/charts/DashboardCharts";
import { dashboardMetrics } from "@/lib/analytics";

export default function DashboardPage() {
  const { cases, loading, storageMode } = useData();
  const metrics = dashboardMetrics(cases);

  if (loading) return <LoadingBlock label="Memuat dashboard..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-bri-blue">Dashboard</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">
            Monitoring Bad Data Consumer Credit Origination
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Pantau kasus bad data KPR dan Briguna, status follow-up, SLA, sumber masalah, dan
            kebutuhan eskalasi OPX/PO.
          </p>
        </div>
        {storageMode === "demo" ? (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            Mode demo aktif. Konfigurasi Supabase untuk data persisten.
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total kasus bad data" value={metrics.total} icon={<FileWarning className="h-5 w-5" />} />
        <KpiCard label="Kasus Open" value={metrics.statusCounts.Open} icon={<AlertTriangle className="h-5 w-5" />} />
        <KpiCard label="In Progress" value={metrics.statusCounts["In Progress"]} icon={<Hourglass className="h-5 w-5" />} />
        <KpiCard label="Escalated" value={metrics.statusCounts.Escalated} icon={<MessageSquareWarning className="h-5 w-5" />} />
        <KpiCard label="Waiting Feedback" value={metrics.statusCounts["Waiting Feedback"]} icon={<Clock className="h-5 w-5" />} />
        <KpiCard label="Closed" value={metrics.statusCounts.Closed} icon={<CheckCircle2 className="h-5 w-5" />} />
        <KpiCard label="Overdue SLA" value={metrics.overdue} helper="Current date > target resolution dan status belum Closed." icon={<TrendingUp className="h-5 w-5" />} />
        <KpiCard label="Average aging days" value={metrics.averageAging} helper="Rata-rata umur kasus sejak tanggal temuan." icon={<BarChart3 className="h-5 w-5" />} />
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex items-center gap-2">
          <Layers3 className="h-5 w-5 text-bri-blue" />
          <h2 className="text-base font-semibold text-slate-950">Total Cases by Product</h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {metrics.productCounts.map((item) => (
            <div key={item.name} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">{item.name}</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {cases.length ? (
        <DashboardCharts cases={cases} />
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-soft">
          <p className="text-sm text-slate-500">Belum ada kasus untuk divisualisasikan.</p>
        </div>
      )}
    </div>
  );
}
