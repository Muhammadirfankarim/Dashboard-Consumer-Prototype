"use client";

import { AccessGuard } from "@/components/AccessGuard";
import { ChecklistForm } from "@/components/ChecklistForm";

export default function ChecklistPage() {
  return (
    <AccessGuard allowed={["Admin", "RM"]}>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-bri-blue">
            Checklist Pre-screening
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">
            Pre-screening Sebelum Prakarsa Kredit
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Validasi data dummy sebelum proses origination KPR atau Briguna dilanjutkan.
          </p>
        </div>
        <ChecklistForm />
      </div>
    </AccessGuard>
  );
}
