"use client";

import { useMemo, useState } from "react";
import { Clipboard, Send } from "lucide-react";
import { ESCALATION_TARGET_OPTIONS, EscalationTarget } from "@/types";
import { generateEscalationText } from "@/lib/escalation";
import { formatDateInput, maskCif } from "@/lib/utils";
import { useData } from "@/components/DataProvider";
import { useRole } from "@/components/RoleProvider";
import { useToast } from "@/components/ToastProvider";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-bri-blue focus:ring-2 focus:ring-blue-100";

export function EscalationTemplate() {
  const { cases, updateCase } = useData();
  const { role } = useRole();
  const { toast } = useToast();
  const [caseId, setCaseId] = useState(cases[0]?.case_id || "");
  const [target, setTarget] = useState<EscalationTarget>("OPX");
  const selectedCase = useMemo(
    () => cases.find((item) => item.case_id === caseId) || cases[0],
    [caseId, cases]
  );
  const text = selectedCase ? generateEscalationText(selectedCase, target) : "";

  const copyText = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    toast({ type: "success", title: "Template eskalasi disalin" });
  };

  const markEscalated = async () => {
    if (!selectedCase) return;
    await updateCase(
      selectedCase.case_id,
      {
        status: "Escalated",
        escalation_required: true,
        escalation_date: formatDateInput(),
        escalation_target: target
      },
      role
    );
  };

  if (!cases.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-soft">
        <h2 className="text-lg font-semibold text-slate-950">Belum ada kasus</h2>
        <p className="mt-2 text-sm text-slate-500">
          Tambahkan kasus bad data terlebih dahulu untuk membuat template eskalasi.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-base font-semibold text-slate-950">Pilih Kasus</h2>
        <p className="mt-1 text-sm text-slate-500">
          Template akan menggunakan data termasking dan informasi follow-up terakhir.
        </p>

        <div className="mt-5 space-y-4">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Case ID
            </span>
            <select
              className={inputClass}
              value={selectedCase?.case_id || ""}
              onChange={(event) => setCaseId(event.target.value)}
            >
              {cases.map((item) => (
                <option key={item.case_id} value={item.case_id}>
                  {item.case_id} - {item.product} - {item.issue_category}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Target Eskalasi
            </span>
            <select
              className={inputClass}
              value={target}
              onChange={(event) => setTarget(event.target.value as EscalationTarget)}
            >
              {ESCALATION_TARGET_OPTIONS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          {selectedCase ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              <p>
                <span className="font-semibold">Produk:</span> {selectedCase.product}
              </p>
              <p>
                <span className="font-semibold">RM:</span> {selectedCase.rm_name}
              </p>
              <p>
                <span className="font-semibold">CIF:</span> {maskCif(selectedCase.cif)}
              </p>
              <p>
                <span className="font-semibold">Status:</span> {selectedCase.status}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Template Eskalasi</h2>
            <p className="text-sm text-slate-500">Copy-ready text untuk OPX/PO/Unit terkait.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={copyText}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Clipboard className="h-4 w-4" />
              Copy
            </button>
            <button
              type="button"
              onClick={markEscalated}
              className="inline-flex items-center gap-2 rounded-lg bg-bri-blue px-3 py-2 text-sm font-semibold text-white hover:bg-bri-navy"
            >
              <Send className="h-4 w-4" />
              Mark Escalated
            </button>
          </div>
        </div>
        <textarea
          className="mt-4 min-h-[560px] w-full rounded-lg border border-slate-300 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-800 outline-none focus:border-bri-blue focus:ring-2 focus:ring-blue-100"
          readOnly
          value={text}
        />
      </section>
    </div>
  );
}
