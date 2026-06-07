import { BadDataCase, CaseStatus } from "@/types";
import { agingDays, isOverdue, overdueDays } from "@/lib/utils";

export interface CountDatum {
  name: string;
  value: number;
}

export function countBy<T>(rows: T[], picker: (row: T) => string | null | undefined) {
  const map = new Map<string, number>();
  rows.forEach((row) => {
    const key = picker(row) || "Tidak Diisi";
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
}

export function filterCasesByPeriod(cases: BadDataCase[], from?: string, to?: string) {
  return cases.filter((item) => {
    const created = new Date(`${item.created_date}T00:00:00`).getTime();
    if (from && created < new Date(`${from}T00:00:00`).getTime()) return false;
    if (to && created > new Date(`${to}T00:00:00`).getTime()) return false;
    return true;
  });
}

export function dashboardMetrics(cases: BadDataCase[]) {
  const statuses: CaseStatus[] = [
    "Open",
    "In Progress",
    "Escalated",
    "Waiting Feedback",
    "Closed"
  ];
  const totalAging = cases.reduce((sum, item) => sum + agingDays(item.created_date), 0);
  const overdue = cases.filter((item) =>
    isOverdue(item.target_resolution_date, item.status)
  ).length;

  return {
    total: cases.length,
    statusCounts: statuses.reduce<Record<CaseStatus, number>>((acc, status) => {
      acc[status] = cases.filter((item) => item.status === status).length;
      return acc;
    }, {} as Record<CaseStatus, number>),
    overdue,
    averageAging: cases.length ? Math.round((totalAging / cases.length) * 10) / 10 : 0,
    productCounts: countBy(cases, (item) => item.product)
  };
}

export function monthlyTrend(cases: BadDataCase[]) {
  const map = new Map<string, number>();
  cases.forEach((item) => {
    const date = new Date(`${item.created_date}T00:00:00`);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => ({ name, value }));
}

export function slaOverdueDistribution(cases: BadDataCase[]) {
  const buckets = [
    { name: "Tidak overdue", min: 0, max: 0 },
    { name: "1-2 hari", min: 1, max: 2 },
    { name: "3-5 hari", min: 3, max: 5 },
    { name: ">5 hari", min: 6, max: Number.POSITIVE_INFINITY }
  ];
  return buckets.map((bucket) => ({
    name: bucket.name,
    value:
      bucket.name === "Tidak overdue"
        ? cases.filter((item) => !isOverdue(item.target_resolution_date, item.status)).length
        : cases.filter((item) => {
            const days = overdueDays(item.target_resolution_date, item.status);
            return days >= bucket.min && days <= bucket.max;
          }).length
  }));
}

export function topOverdueCases(cases: BadDataCase[], limit = 5) {
  return cases
    .filter((item) => isOverdue(item.target_resolution_date, item.status))
    .map((item) => ({
      ...item,
      overdue_days: overdueDays(item.target_resolution_date, item.status)
    }))
    .sort((a, b) => b.overdue_days - a.overdue_days)
    .slice(0, limit);
}

export function summaryRows(cases: BadDataCase[]) {
  return [
    { metric: "Total kasus", value: cases.length },
    { metric: "Open", value: cases.filter((item) => item.status === "Open").length },
    {
      metric: "In Progress",
      value: cases.filter((item) => item.status === "In Progress").length
    },
    {
      metric: "Escalated",
      value: cases.filter((item) => item.status === "Escalated").length
    },
    {
      metric: "Waiting Feedback",
      value: cases.filter((item) => item.status === "Waiting Feedback").length
    },
    { metric: "Closed", value: cases.filter((item) => item.status === "Closed").length },
    {
      metric: "Overdue SLA",
      value: cases.filter((item) => isOverdue(item.target_resolution_date, item.status)).length
    }
  ];
}
