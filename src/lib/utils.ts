import { BadDataCase, CaseStatus, Priority } from "@/types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDateInput(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function formatDisplayDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

export function generateCaseId(existingCaseIds: string[] = [], date = new Date()) {
  const yyyymmdd = formatDateInput(date).replaceAll("-", "");
  const prefix = `BD-${yyyymmdd}-`;
  const nextNumber =
    existingCaseIds
      .filter((caseId) => caseId.startsWith(prefix))
      .map((caseId) => Number(caseId.slice(prefix.length)))
      .filter((value) => Number.isFinite(value))
      .sort((a, b) => b - a)[0] ?? 0;

  return `${prefix}${String(nextNumber + 1).padStart(4, "0")}`;
}

export function maskCif(cif?: string | null) {
  if (!cif) return "-";
  const cleaned = String(cif).replace(/\D/g, "");
  if (!cleaned) return "-";
  return `******${cleaned.slice(-4)}`;
}

export function normalizePhone(phone?: string | null) {
  if (!phone) return "";
  const cleaned = String(phone).replace(/[^\d]/g, "");
  if (cleaned.startsWith("62")) return `0${cleaned.slice(2)}`;
  if (cleaned.startsWith("8")) return `0${cleaned}`;
  return cleaned;
}

export function maskPhone(phone?: string | null) {
  const normalized = normalizePhone(phone);
  if (!normalized) return "-";
  if (normalized.length <= 8) return `${normalized.slice(0, 2)}****`;
  return `${normalized.slice(0, 4)}****${normalized.slice(-4)}`;
}

export function maskName(name?: string | null) {
  if (!name) return "-";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => {
      if (/^\d+$/.test(part)) return part;
      if (part.length <= 1) return part;
      return `${part[0]}${"*".repeat(part.length - 1)}`;
    })
    .join(" ");
}

export function calculateSlaDueDate(createdDate: string, priority: Priority) {
  const slaDays: Record<Priority, number> = {
    Critical: 1,
    High: 2,
    Medium: 5,
    Low: 7
  };
  const date = new Date(`${createdDate}T00:00:00`);
  date.setDate(date.getDate() + slaDays[priority]);
  return formatDateInput(date);
}

export function isOverdue(
  targetResolutionDate?: string | null,
  status?: CaseStatus | string | null,
  currentDate = new Date()
) {
  if (!targetResolutionDate || status === "Closed") return false;
  const today = new Date(formatDateInput(currentDate));
  const target = new Date(`${targetResolutionDate}T00:00:00`);
  return today.getTime() > target.getTime();
}

export function agingDays(createdDate?: string | null, endDate = new Date()) {
  if (!createdDate) return 0;
  const start = new Date(`${createdDate}T00:00:00`);
  const end = new Date(formatDateInput(endDate));
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86400000));
}

export function overdueDays(targetResolutionDate?: string | null, status?: string | null) {
  if (!isOverdue(targetResolutionDate, status)) return 0;
  const target = new Date(`${targetResolutionDate}T00:00:00`);
  const today = new Date(formatDateInput());
  return Math.max(0, Math.floor((today.getTime() - target.getTime()) / 86400000));
}

export function sortCasesNewestFirst(cases: BadDataCase[]) {
  return [...cases].sort((a, b) => {
    const dateDiff =
      new Date(`${b.created_date}T00:00:00`).getTime() -
      new Date(`${a.created_date}T00:00:00`).getTime();
    if (dateDiff !== 0) return dateDiff;
    return b.case_id.localeCompare(a.case_id);
  });
}

export function validDateString(value?: string | null) {
  if (!value) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

export function statusTone(status: string) {
  if (status === "Closed") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "Escalated") return "bg-orange-50 text-orange-700 ring-orange-200";
  if (status === "Waiting Feedback") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (status === "In Progress") return "bg-sky-50 text-sky-700 ring-sky-200";
  return "bg-slate-50 text-slate-700 ring-slate-200";
}

export function priorityTone(priority: string) {
  if (priority === "Critical") return "bg-red-50 text-red-700 ring-red-200";
  if (priority === "High") return "bg-orange-50 text-orange-700 ring-orange-200";
  if (priority === "Medium") return "bg-blue-50 text-blue-700 ring-blue-200";
  return "bg-slate-50 text-slate-700 ring-slate-200";
}
