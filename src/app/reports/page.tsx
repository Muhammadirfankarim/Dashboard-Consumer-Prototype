"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { useData } from "@/components/DataProvider";
import { useRole } from "@/components/RoleProvider";
import {
  countBy,
  filterCasesByPeriod,
  summaryRows,
  topOverdueCases
} from "@/lib/analytics";
import { exportWorkbook } from "@/lib/excel";
import { formatDisplayDate, maskCif, maskName, overdueDays } from "@/lib/utils";

const inputClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-bri-blue focus:ring-2 focus:ring-blue-100";

export default function ReportsPage() {
  const { cases } = useData();
  const { role } = useRole();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const filtered = useMemo(
    () => filterCasesByPeriod(cases, fromDate, toDate),
    [cases, fromDate, toDate]
  );
  const summaries = summaryRows(filtered);
  const topIssues = countBy(filtered, (item) => item.issue_category).slice(0, 5);
  const overdue = topOverdueCases(filtered, 5);
  const byRm = countBy(filtered, (item) => item.rm_name);
  const byProduct = countBy(filtered, (item) => item.product);
  const canExport = role !== "Viewer";

  const exportReport = () => {
    exportWorkbook(
      [
        { name: "Summary", data: summaries },
        { name: "Status", data: countBy(filtered, (item) => item.status) },
        { name: "Top Issues", data: topIssues },
        {
          name: "Top Overdue",
          data: overdue.map((item) => ({
            case_id: item.case_id,
            product: item.product,
            rm_name: item.rm_name,
            cif_masked: maskCif(item.cif),
            customer_name_masked: maskName(item.customer_name),
            issue_category: item.issue_category,
            priority: item.priority,
            status: item.status,
            target_resolution_date: item.target_resolution_date,
            overdue_days: overdueDays(item.target_resolution_date, item.status)
          }))
        },
        { name: "By RM", data: byRm },
        { name: "By Product", data: byProduct }
      ],
      "bad-data-summary-report.xlsx"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-bri-blue">Reports</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">
            Summary Report Bad Data
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Ringkasan periodik untuk mentor, RM, branch leader, dan koordinasi OPX/PO.
          </p>
        </div>
        {canExport ? (
          <button
            type="button"
            onClick={exportReport}
            className="inline-flex items-center gap-2 rounded-lg bg-bri-blue px-4 py-2 text-sm font-semibold text-white hover:bg-bri-navy"
          >
            <Download className="h-4 w-4" />
            Export Summary
          </button>
        ) : null}
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Dari
            <input
              type="date"
              className={inputClass}
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Sampai
            <input
              type="date"
              className={inputClass}
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setFromDate("");
              setToDate("");
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-950">Summary by Period</h2>
          <DataTable
            data={summaries}
            rowKey={(row) => row.metric}
            columns={[
              { header: "Metric", cell: (row) => row.metric },
              { header: "Value", cell: (row) => row.value }
            ]}
          />
        </section>
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-950">Total Cases by Status</h2>
          <DataTable
            data={countBy(filtered, (item) => item.status)}
            rowKey={(row) => row.name}
            columns={[
              { header: "Status", cell: (row) => row.name },
              { header: "Total", cell: (row) => row.value }
            ]}
          />
        </section>
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-950">Top 5 Issue Categories</h2>
          <DataTable
            data={topIssues}
            rowKey={(row) => row.name}
            columns={[
              { header: "Issue Category", cell: (row) => row.name },
              { header: "Total", cell: (row) => row.value }
            ]}
          />
        </section>
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-950">Cases by Product</h2>
          <DataTable
            data={byProduct}
            rowKey={(row) => row.name}
            columns={[
              { header: "Produk", cell: (row) => row.name },
              { header: "Total", cell: (row) => row.value }
            ]}
          />
        </section>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-950">Top 5 Overdue Cases</h2>
        <DataTable
          data={overdue}
          rowKey={(row) => row.case_id}
          emptyMessage="Tidak ada kasus overdue pada periode ini."
          columns={[
            { header: "Case ID", cell: (row) => row.case_id },
            { header: "Tanggal", cell: (row) => formatDisplayDate(row.created_date) },
            { header: "RM", cell: (row) => row.rm_name },
            { header: "Produk", cell: (row) => row.product },
            { header: "CIF", cell: (row) => maskCif(row.cif) },
            { header: "Nama", cell: (row) => maskName(row.customer_name) },
            { header: "Issue", cell: (row) => row.issue_category, className: "max-w-[260px] whitespace-normal" },
            { header: "Target", cell: (row) => formatDisplayDate(row.target_resolution_date) },
            { header: "Overdue Days", cell: (row) => overdueDays(row.target_resolution_date, row.status) }
          ]}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-950">Cases by RM</h2>
        <DataTable
          data={byRm}
          rowKey={(row) => row.name}
          columns={[
            { header: "RM", cell: (row) => row.name },
            { header: "Total", cell: (row) => row.value }
          ]}
        />
      </section>
    </div>
  );
}
