"use client";

import { FormEvent, useMemo, useState } from "react";
import { Download, FilePlus2, Save } from "lucide-react";
import { ChecklistRun, PRODUCT_OPTIONS } from "@/types";
import { formatDateInput, maskCif, maskPhone, normalizePhone } from "@/lib/utils";
import { validateChecklistForm, zodErrorsToRecord } from "@/lib/validation";
import { useData } from "@/components/DataProvider";
import { useRole } from "@/components/RoleProvider";
import { DataTable } from "@/components/DataTable";
import { exportToExcel } from "@/lib/excel";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-bri-blue focus:ring-2 focus:ring-blue-100";

const checklistItems: Array<{ key: keyof ChecklistRun; label: string; critical?: boolean }> = [
  { key: "cif_checked", label: "CIF checked", critical: true },
  {
    key: "cif_matches_latest",
    label: "CIF matches latest customer information",
    critical: true
  },
  { key: "phone_exists", label: "Phone number exists", critical: true },
  { key: "phone_format_valid", label: "Phone number prefix 0 valid for BRISpot", critical: true },
  { key: "email_checked", label: "Email checked" },
  { key: "job_business_checked", label: "Job/business information checked" },
  { key: "payroll_checked", label: "Payroll data checked for Briguna", critical: true },
  { key: "supporting_docs_checked", label: "Supporting documents checked" },
  { key: "slik_checked", label: "SLIK/BI Checking checked", critical: true },
  {
    key: "brispot_matches_latest",
    label: "BRISpot data matches latest customer information",
    critical: true
  },
  { key: "no_data_mismatch", label: "No data mismatch found", critical: true }
];

function defaultChecklist(): ChecklistRun {
  return {
    run_date: formatDateInput(),
    product: "KPR",
    rm_name: "",
    cif: "",
    phone_number: "",
    normalized_phone: "",
    cif_checked: true,
    cif_matches_latest: true,
    phone_exists: true,
    phone_format_valid: true,
    email_checked: true,
    job_business_checked: true,
    payroll_checked: true,
    supporting_docs_checked: true,
    slik_checked: true,
    brispot_matches_latest: true,
    no_data_mismatch: true,
    notes: "",
    result_status: "Layak Dilanjutkan",
    created_case_id: null
  };
}

function criticalFailed(run: ChecklistRun) {
  return checklistItems.some((item) => {
    if (!item.critical) return false;
    if (item.key === "payroll_checked" && run.product !== "Briguna") return false;
    return !Boolean(run[item.key]);
  });
}

export function ChecklistForm() {
  const { checklistRuns, createChecklistRun, createCaseFromChecklist } = useData();
  const { role } = useRole();
  const [form, setForm] = useState<ChecklistRun>(defaultChecklist());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const normalizedPhone = normalizePhone(form.phone_number);
  const phoneSuggestion =
    form.phone_number?.replace(/\D/g, "").startsWith("62") && normalizedPhone
      ? normalizedPhone
      : "";
  const failedCritical = criticalFailed(form);

  const visibleHistory = useMemo(() => checklistRuns.slice(0, 25), [checklistRuns]);

  const update = <K extends keyof ChecklistRun>(key: K, value: ChecklistRun[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const prepare = () => {
    const resultStatus = failedCritical ? "Perlu Pengkinian" : "Layak Dilanjutkan";
    return {
      ...form,
      normalized_phone: normalizedPhone,
      result_status: resultStatus
    };
  };

  const saveChecklist = async (event: FormEvent) => {
    event.preventDefault();
    const payload = prepare();
    const parsed = validateChecklistForm(payload);
    if (!parsed.success) {
      setErrors(zodErrorsToRecord(parsed.error));
      return;
    }
    setErrors({});
    setSaving(true);
    const saved = await createChecklistRun(parsed.data as ChecklistRun, role);
    if (saved) setForm(defaultChecklist());
    setSaving(false);
  };

  const createCase = async () => {
    const payload = prepare();
    const parsed = validateChecklistForm(payload);
    if (!parsed.success) {
      setErrors(zodErrorsToRecord(parsed.error));
      return;
    }
    setSaving(true);
    const result = await createCaseFromChecklist(parsed.data as ChecklistRun, role);
    if (result.caseData) setForm(defaultChecklist());
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={saveChecklist} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-4 md:grid-cols-4">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tanggal
            </span>
            <input
              type="date"
              className={inputClass}
              value={form.run_date}
              onChange={(event) => update("run_date", event.target.value)}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Produk
            </span>
            <select
              className={inputClass}
              value={form.product}
              onChange={(event) => update("product", event.target.value as ChecklistRun["product"])}
            >
              {PRODUCT_OPTIONS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              RM Name
            </span>
            <input
              className={inputClass}
              value={form.rm_name}
              onChange={(event) => update("rm_name", event.target.value)}
              placeholder="RM Demo"
            />
            {errors.rm_name ? <p className="text-xs text-red-600">{errors.rm_name}</p> : null}
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              CIF Dummy
            </span>
            <input
              className={inputClass}
              value={form.cif || ""}
              onChange={(event) => update("cif", event.target.value)}
              placeholder="900000000001"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Nomor HP Dummy
            </span>
            <input
              className={inputClass}
              value={form.phone_number || ""}
              onChange={(event) => update("phone_number", event.target.value)}
              placeholder="628000000001"
            />
          </label>
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
            <p className="font-semibold">Normalisasi nomor HP</p>
            <p className="mt-1">
              {phoneSuggestion
                ? `Saran format BRISpot: ${phoneSuggestion}`
                : normalizedPhone
                  ? `Format terbaca: ${normalizedPhone}`
                  : "Isi nomor HP dummy untuk melihat saran normalisasi."}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {checklistItems.map((item) => {
            const isPayroll = item.key === "payroll_checked";
            const disabled = isPayroll && form.product !== "Briguna";
            return (
              <label
                key={item.key}
                className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={Boolean(form[item.key])}
                  disabled={disabled}
                  onChange={(event) => update(item.key, event.target.checked as never)}
                  className="h-4 w-4 rounded border-slate-300 text-bri-blue"
                />
                <span className={disabled ? "text-slate-400" : "text-slate-700"}>
                  {item.label}
                </span>
              </label>
            );
          })}
        </div>

        <label className="mt-4 block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Notes
          </span>
          <textarea
            className={`${inputClass} min-h-24`}
            value={form.notes || ""}
            onChange={(event) => update("notes", event.target.value)}
            placeholder="Catatan pre-screening dummy."
          />
        </label>

        {failedCritical ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium leading-6 text-red-800">
            Data belum layak untuk dilanjutkan ke prakarsa. Buat kasus bad data atau lakukan
            pengkinian terlebih dahulu.
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            Checklist lolos untuk simulasi. Pastikan tetap menggunakan data dummy.
          </div>
        )}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={createCase}
            disabled={!failedCritical || saving}
            className="inline-flex items-center gap-2 rounded-lg border border-bri-blue bg-white px-4 py-2 text-sm font-semibold text-bri-blue hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FilePlus2 className="h-4 w-4" />
            Buat Kasus dari Checklist
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-bri-blue px-4 py-2 text-sm font-semibold text-white hover:bg-bri-navy disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Menyimpan..." : "Simpan Checklist"}
          </button>
        </div>
      </form>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Checklist History</h2>
            <p className="text-sm text-slate-500">Riwayat pre-screening terakhir.</p>
          </div>
          <button
            type="button"
            onClick={() =>
              exportToExcel(
                checklistRuns.map((item) => ({
                  run_date: item.run_date,
                  product: item.product,
                  rm_name: item.rm_name,
                  cif_masked: maskCif(item.cif),
                  phone_masked: maskPhone(item.phone_number),
                  result_status: item.result_status,
                  created_case_id: item.created_case_id || "",
                  notes: item.notes || ""
                })),
                "checklist-history.xlsx"
              )
            }
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </button>
        </div>
        <DataTable
          data={visibleHistory}
          rowKey={(row) => row.id || `${row.run_date}-${row.rm_name}-${row.created_case_id || ""}`}
          emptyMessage="Belum ada riwayat checklist."
          columns={[
            { header: "Tanggal", cell: (row) => row.run_date },
            { header: "Produk", cell: (row) => row.product },
            { header: "RM", cell: (row) => row.rm_name },
            { header: "CIF", cell: (row) => maskCif(row.cif) },
            { header: "Phone", cell: (row) => maskPhone(row.phone_number) },
            { header: "Result", cell: (row) => row.result_status || "-" },
            { header: "Created Case", cell: (row) => row.created_case_id || "-" }
          ]}
        />
      </section>
    </div>
  );
}
