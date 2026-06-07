"use client";

import { AccessGuard } from "@/components/AccessGuard";
import { EscalationTemplate } from "@/components/EscalationTemplate";

export default function EscalationPage() {
  return (
    <AccessGuard allowed={["Admin", "RM"]}>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-bri-blue">
            Escalation Generator
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">
            Template Eskalasi OPX/PO
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Generate pesan eskalasi terstruktur berdasarkan kasus bad data yang sudah dicatat.
          </p>
        </div>
        <EscalationTemplate />
      </div>
    </AccessGuard>
  );
}
