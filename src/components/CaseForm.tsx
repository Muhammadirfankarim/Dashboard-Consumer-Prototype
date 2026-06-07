"use client";

import { FormEvent, useMemo, useState } from "react";
import { Save, X } from "lucide-react";
import {
  BadDataCase,
  BUSINESS_IMPACT_OPTIONS,
  ISSUE_CATEGORY_OPTIONS,
  PROCESS_STAGE_OPTIONS,
  PRODUCT_OPTIONS,
  PRIORITY_OPTIONS,
  SOURCE_SYSTEM_OPTIONS,
  STATUS_OPTIONS
} from "@/types";
import { calculateSlaDueDate, formatDateInput, generateCaseId } from "@/lib/utils";
import { validateCaseForm, zodErrorsToRecord } from "@/lib/validation";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-bri-blue focus:ring-2 focus:ring-blue-100";
const labelClass = "text-xs font-semibold uppercase tracking-wide text-slate-500";

function cleanCase(data: BadDataCase): BadDataCase {
  return {
    ...data,
    cif: data.cif || null,
    customer_name: data.customer_name || null,
    phone_number: data.phone_number || null,
    issue_description: data.issue_description || null,
    business_impact: data.business_impact || null,
    assigned_pic: data.assigned_pic || null,
    target_resolution_date: data.target_resolution_date || null,
    closed_date: data.closed_date || null,
    action_taken: data.action_taken || null,
    escalation_date: data.escalation_date || null,
    escalation_target: data.escalation_target || null,
    evidence_note: data.evidence_note || null
  };
}

export function CaseForm({
  initialCase,
  existingCaseIds,
  createdBy,
  onSubmit,
  onCancel
}: {
  initialCase?: BadDataCase | null;
  existingCaseIds: string[];
  createdBy: string;
  onSubmit: (caseData: BadDataCase) => Promise<void>;
  onCancel: () => void;
}) {
  const isEdit = Boolean(initialCase);
  const defaultCase = useMemo<BadDataCase>(
    () => ({
      case_id: generateCaseId(existingCaseIds),
      created_date: formatDateInput(),
      rm_name: "",
      product: "KPR",
      cif: "",
      customer_name: "",
      phone_number: "",
      issue_category: "CIF lama",
      source_system: "BRISpot",
      process_stage: "Pengecekan awal",
      issue_description: "",
      business_impact: "SLA prakarsa terhambat",
      priority: "Medium",
      status: "Open",
      assigned_pic: "",
      target_resolution_date: calculateSlaDueDate(formatDateInput(), "Medium"),
      closed_date: "",
      action_taken: "",
      escalation_required: false,
      escalation_date: "",
      escalation_target: "",
      evidence_note: "",
      created_by: createdBy
    }),
    [createdBy, existingCaseIds]
  );
  const [form, setForm] = useState<BadDataCase>(initialCase || defaultCase);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof BadDataCase>(key: K, value: BadDataCase[K]) => {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (!isEdit && (key === "created_date" || key === "priority")) {
        next.target_resolution_date = calculateSlaDueDate(next.created_date, next.priority);
      }
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = validateCaseForm(cleanCase(form));
    if (!parsed.success) {
      setErrors(zodErrorsToRecord(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    await onSubmit(parsed.data as BadDataCase);
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            {isEdit ? "Edit Kasus Bad Data" : "Tambah Kasus Bad Data"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Semua data pada MVP harus dummy dan tampilan tabel akan selalu dimasking.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          title="Tutup form"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-1">
          <span className={labelClass}>Case ID</span>
          <input className={inputClass} value={form.case_id} readOnly />
          {errors.case_id ? <p className="text-xs text-red-600">{errors.case_id}</p> : null}
        </label>
        <label className="space-y-1">
          <span className={labelClass}>Tanggal Temuan</span>
          <input
            type="date"
            className={inputClass}
            value={form.created_date}
            onChange={(event) => update("created_date", event.target.value)}
          />
          {errors.created_date ? <p className="text-xs text-red-600">{errors.created_date}</p> : null}
        </label>
        <label className="space-y-1">
          <span className={labelClass}>RM Name</span>
          <input
            className={inputClass}
            value={form.rm_name}
            onChange={(event) => update("rm_name", event.target.value)}
            placeholder="RM Demo"
          />
          {errors.rm_name ? <p className="text-xs text-red-600">{errors.rm_name}</p> : null}
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="space-y-1">
          <span className={labelClass}>Produk</span>
          <select
            className={inputClass}
            value={form.product}
            onChange={(event) => update("product", event.target.value as BadDataCase["product"])}
          >
            {PRODUCT_OPTIONS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className={labelClass}>CIF Dummy</span>
          <input
            className={inputClass}
            value={form.cif || ""}
            onChange={(event) => update("cif", event.target.value)}
            placeholder="900000000001"
          />
        </label>
        <label className="space-y-1">
          <span className={labelClass}>Nama Dummy</span>
          <input
            className={inputClass}
            value={form.customer_name || ""}
            onChange={(event) => update("customer_name", event.target.value)}
            placeholder="Nasabah Dummy 01"
          />
        </label>
        <label className="space-y-1">
          <span className={labelClass}>Nomor HP Dummy</span>
          <input
            className={inputClass}
            value={form.phone_number || ""}
            onChange={(event) => update("phone_number", event.target.value)}
            placeholder="628000000001"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-1">
          <span className={labelClass}>Kategori Kendala</span>
          <select
            className={inputClass}
            value={form.issue_category}
            onChange={(event) =>
              update("issue_category", event.target.value as BadDataCase["issue_category"])
            }
          >
            {ISSUE_CATEGORY_OPTIONS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className={labelClass}>Sumber Data/System</span>
          <select
            className={inputClass}
            value={form.source_system}
            onChange={(event) =>
              update("source_system", event.target.value as BadDataCase["source_system"])
            }
          >
            {SOURCE_SYSTEM_OPTIONS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className={labelClass}>Tahap Proses</span>
          <select
            className={inputClass}
            value={form.process_stage}
            onChange={(event) =>
              update("process_stage", event.target.value as BadDataCase["process_stage"])
            }
          >
            {PROCESS_STAGE_OPTIONS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="space-y-1">
        <span className={labelClass}>Deskripsi Kendala</span>
        <textarea
          className={`${inputClass} min-h-24`}
          value={form.issue_description || ""}
          onChange={(event) => update("issue_description", event.target.value)}
          placeholder="Jelaskan kronologi singkat kendala bad data dummy."
        />
      </label>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="space-y-1">
          <span className={labelClass}>Dampak Bisnis</span>
          <select
            className={inputClass}
            value={form.business_impact || ""}
            onChange={(event) => update("business_impact", event.target.value)}
          >
            {BUSINESS_IMPACT_OPTIONS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className={labelClass}>Prioritas</span>
          <select
            className={inputClass}
            value={form.priority}
            onChange={(event) => update("priority", event.target.value as BadDataCase["priority"])}
          >
            {PRIORITY_OPTIONS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className={labelClass}>Status</span>
          <select
            className={inputClass}
            value={form.status}
            onChange={(event) => update("status", event.target.value as BadDataCase["status"])}
          >
            {STATUS_OPTIONS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className={labelClass}>Assigned PIC</span>
          <input
            className={inputClass}
            value={form.assigned_pic || ""}
            onChange={(event) => update("assigned_pic", event.target.value)}
            placeholder="OPX Demo / PO Demo"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-1">
          <span className={labelClass}>Target Penyelesaian</span>
          <input
            type="date"
            className={inputClass}
            value={form.target_resolution_date || ""}
            onChange={(event) => update("target_resolution_date", event.target.value)}
          />
          {errors.target_resolution_date ? (
            <p className="text-xs text-red-600">{errors.target_resolution_date}</p>
          ) : (
            <p className="text-xs text-slate-500">Auto-suggested mengikuti prioritas.</p>
          )}
        </label>
        <label className="space-y-1">
          <span className={labelClass}>Tanggal Closed</span>
          <input
            type="date"
            className={inputClass}
            value={form.closed_date || ""}
            onChange={(event) => update("closed_date", event.target.value)}
          />
        </label>
        <label className="space-y-1">
          <span className={labelClass}>Target Eskalasi</span>
          <select
            className={inputClass}
            value={form.escalation_target || ""}
            onChange={(event) => update("escalation_target", event.target.value)}
          >
            <option value="">Belum ditentukan</option>
            <option value="OPX">OPX</option>
            <option value="PO">PO</option>
            <option value="Unit Data">Unit Data</option>
            <option value="Other">Other</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className={labelClass}>Action Taken</span>
          <textarea
            className={`${inputClass} min-h-24`}
            value={form.action_taken || ""}
            onChange={(event) => update("action_taken", event.target.value)}
            placeholder="Tindakan yang sudah dilakukan di cabang."
          />
        </label>
        <label className="space-y-1">
          <span className={labelClass}>Evidence Note</span>
          <textarea
            className={`${inputClass} min-h-24`}
            value={form.evidence_note || ""}
            onChange={(event) => update("evidence_note", event.target.value)}
            placeholder="Catatan bukti pendukung tekstual, tanpa upload."
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <input
            type="checkbox"
            checked={Boolean(form.escalation_required)}
            onChange={(event) => update("escalation_required", event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-bri-blue"
          />
          <span className="text-sm font-medium text-slate-700">Eskalasi diperlukan</span>
        </label>
        <label className="space-y-1">
          <span className={labelClass}>Tanggal Eskalasi</span>
          <input
            type="date"
            className={inputClass}
            value={form.escalation_date || ""}
            onChange={(event) => update("escalation_date", event.target.value)}
          />
        </label>
        <label className="space-y-1">
          <span className={labelClass}>Created By</span>
          <input
            className={inputClass}
            value={form.created_by || createdBy}
            onChange={(event) => update("created_by", event.target.value)}
          />
        </label>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <X className="h-4 w-4" />
          Batal
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-bri-blue px-4 py-2 text-sm font-semibold text-white hover:bg-bri-navy disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {submitting ? "Menyimpan..." : "Simpan Kasus"}
        </button>
      </div>
    </form>
  );
}
