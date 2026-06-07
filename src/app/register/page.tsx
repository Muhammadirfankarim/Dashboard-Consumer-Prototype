"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Download, Edit3, Plus, Trash2, X } from "lucide-react";
import { AccessGuard } from "@/components/AccessGuard";
import { CaseForm } from "@/components/CaseForm";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { useData } from "@/components/DataProvider";
import { useRole } from "@/components/RoleProvider";
import {
  BadDataCase,
  ISSUE_CATEGORY_OPTIONS,
  PRIORITY_OPTIONS,
  PRODUCT_OPTIONS,
  STATUS_OPTIONS
} from "@/types";
import {
  cn,
  formatDisplayDate,
  isOverdue,
  maskCif,
  maskName,
  maskPhone,
  priorityTone,
  statusTone
} from "@/lib/utils";
import { exportToExcel } from "@/lib/excel";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-bri-blue focus:ring-2 focus:ring-blue-100";

export default function RegisterPage() {
  const { cases, loading, createCase, updateCase, deleteCase, closeCase } = useData();
  const { role } = useRole();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [product, setProduct] = useState("");
  const [priority, setPriority] = useState("");
  const [issueCategory, setIssueCategory] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<BadDataCase | null>(null);

  const filtered = useMemo(() => {
    const lower = query.toLowerCase();
    return cases.filter((item) => {
      if (status && item.status !== status) return false;
      if (product && item.product !== product) return false;
      if (priority && item.priority !== priority) return false;
      if (issueCategory && item.issue_category !== issueCategory) return false;
      if (fromDate && item.created_date < fromDate) return false;
      if (toDate && item.created_date > toDate) return false;
      if (!lower) return true;
      return [
        item.case_id,
        item.rm_name,
        item.product,
        item.issue_category,
        item.status,
        item.source_system
      ]
        .join(" ")
        .toLowerCase()
        .includes(lower);
    });
  }, [cases, fromDate, issueCategory, priority, product, query, status, toDate]);

  const canCreate = role === "Admin" || role === "RM";
  const canExport = role !== "Viewer";
  const canDelete = role === "Admin";
  const canEdit = (item: BadDataCase) => role === "Admin" || (role === "RM" && item.created_by === "RM");

  const submitCase = async (caseData: BadDataCase) => {
    if (editingCase) {
      await updateCase(editingCase.case_id, caseData, role);
    } else {
      await createCase(caseData, role);
    }
    setEditingCase(null);
    setFormOpen(false);
  };

  const columns: DataTableColumn<BadDataCase>[] = [
    { header: "Case ID", cell: (row) => <span className="font-semibold text-bri-blue">{row.case_id}</span> },
    { header: "Tanggal", cell: (row) => formatDisplayDate(row.created_date) },
    { header: "RM", cell: (row) => row.rm_name },
    { header: "Produk", cell: (row) => row.product },
    { header: "CIF", cell: (row) => maskCif(row.cif) },
    { header: "Nama", cell: (row) => maskName(row.customer_name) },
    { header: "Phone", cell: (row) => maskPhone(row.phone_number) },
    { header: "Kategori", cell: (row) => row.issue_category, className: "max-w-[260px] whitespace-normal" },
    { header: "Source", cell: (row) => row.source_system },
    {
      header: "Priority",
      cell: (row) => (
        <span className={cn("rounded-full px-2 py-1 text-xs font-semibold ring-1", priorityTone(row.priority))}>
          {row.priority}
        </span>
      )
    },
    {
      header: "Status",
      cell: (row) => (
        <span className={cn("rounded-full px-2 py-1 text-xs font-semibold ring-1", statusTone(row.status))}>
          {row.status}
        </span>
      )
    },
    { header: "Target", cell: (row) => formatDisplayDate(row.target_resolution_date) },
    {
      header: "Overdue",
      cell: (row) =>
        isOverdue(row.target_resolution_date, row.status) ? (
          <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200">
            Ya
          </span>
        ) : (
          <span className="text-slate-400">Tidak</span>
        )
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-1">
          {canEdit(row) ? (
            <button
              type="button"
              onClick={() => {
                setEditingCase(row);
                setFormOpen(true);
              }}
              className="rounded-lg p-2 text-slate-600 hover:bg-blue-50 hover:text-bri-blue"
              title="Edit kasus"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          ) : null}
          {canEdit(row) && row.status !== "Closed" ? (
            <button
              type="button"
              onClick={() => void closeCase(row.case_id, role)}
              className="rounded-lg p-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              title="Close kasus"
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
          ) : null}
          {canDelete ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Hapus kasus ${row.case_id}?`)) void deleteCase(row.case_id, role);
              }}
              className="rounded-lg p-2 text-slate-600 hover:bg-red-50 hover:text-red-700"
              title="Hapus kasus"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      )
    }
  ];

  return (
    <AccessGuard allowed={["Admin", "RM"]}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-bri-blue">
              Bad Data Register
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">
              Register Monitoring Kasus Bad Data
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Dokumentasikan kasus bad data, pantau status, SLA, PIC, dan catatan eskalasi.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canExport ? (
              <button
                type="button"
                onClick={() =>
                  exportToExcel(
                    filtered.map((item) => ({
                      case_id: item.case_id,
                      created_date: item.created_date,
                      rm_name: item.rm_name,
                      product: item.product,
                      cif_masked: maskCif(item.cif),
                      customer_name_masked: maskName(item.customer_name),
                      phone_masked: maskPhone(item.phone_number),
                      issue_category: item.issue_category,
                      source_system: item.source_system,
                      process_stage: item.process_stage,
                      business_impact: item.business_impact || "",
                      priority: item.priority,
                      status: item.status,
                      assigned_pic: item.assigned_pic || "",
                      target_resolution_date: item.target_resolution_date || "",
                      closed_date: item.closed_date || "",
                      escalation_required: item.escalation_required ? "Yes" : "No",
                      escalation_date: item.escalation_date || "",
                      escalation_target: item.escalation_target || ""
                    })),
                    "bad-data-register.xlsx"
                  )
                }
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-4 w-4" />
                Export Excel
              </button>
            ) : null}
            {canCreate ? (
              <button
                type="button"
                onClick={() => {
                  setEditingCase(null);
                  setFormOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-bri-blue px-4 py-2 text-sm font-semibold text-white hover:bg-bri-navy"
              >
                <Plus className="h-4 w-4" />
                Tambah Kasus
              </button>
            ) : null}
          </div>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
          <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-7">
            <input
              className={`${inputClass} md:col-span-2`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari case ID, RM, produk, kategori, status"
            />
            <select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">Semua status</option>
              {STATUS_OPTIONS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select className={inputClass} value={product} onChange={(event) => setProduct(event.target.value)}>
              <option value="">Semua produk</option>
              {PRODUCT_OPTIONS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select className={inputClass} value={priority} onChange={(event) => setPriority(event.target.value)}>
              <option value="">Semua priority</option>
              {PRIORITY_OPTIONS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <input
              type="date"
              className={inputClass}
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
            <input
              type="date"
              className={inputClass}
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <select
              className={`${inputClass} max-w-md`}
              value={issueCategory}
              onChange={(event) => setIssueCategory(event.target.value)}
            >
              <option value="">Semua issue category</option>
              {ISSUE_CATEGORY_OPTIONS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStatus("");
                setProduct("");
                setPriority("");
                setIssueCategory("");
                setFromDate("");
                setToDate("");
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              Reset Filter
            </button>
          </div>
        </section>

        <DataTable
          data={filtered}
          columns={columns}
          rowKey={(row) => row.case_id}
          loading={loading}
          emptyMessage="Tidak ada kasus yang sesuai filter."
        />

        {formOpen ? (
          <div className="fixed inset-0 z-40 overflow-y-auto bg-slate-950/40 p-4">
            <div className="mx-auto my-8 max-w-6xl rounded-lg bg-white p-5 shadow-2xl">
              <CaseForm
                initialCase={editingCase}
                existingCaseIds={cases.map((item) => item.case_id)}
                createdBy={role}
                onSubmit={submitCase}
                onCancel={() => {
                  setEditingCase(null);
                  setFormOpen(false);
                }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </AccessGuard>
  );
}
