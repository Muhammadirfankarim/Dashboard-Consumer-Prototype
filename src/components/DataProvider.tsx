"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { BadDataCase, ChecklistRun, IssueCategory, Role } from "@/types";
import { sampleCases, sampleChecklistRuns } from "@/lib/sampleData";
import { getSupabaseClient } from "@/lib/supabaseClient";
import {
  calculateSlaDueDate,
  formatDateInput,
  generateCaseId,
  normalizePhone,
  sortCasesNewestFirst
} from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

interface DataContextValue {
  cases: BadDataCase[];
  checklistRuns: ChecklistRun[];
  loading: boolean;
  storageMode: "supabase" | "demo";
  refresh: () => Promise<void>;
  createCase: (caseData: BadDataCase, role: Role) => Promise<BadDataCase | null>;
  updateCase: (
    caseId: string,
    patch: Partial<BadDataCase>,
    role: Role
  ) => Promise<BadDataCase | null>;
  deleteCase: (caseId: string, role: Role) => Promise<void>;
  closeCase: (caseId: string, role: Role) => Promise<void>;
  createChecklistRun: (
    run: ChecklistRun,
    role: Role
  ) => Promise<ChecklistRun | null>;
  createCaseFromChecklist: (
    run: ChecklistRun,
    role: Role
  ) => Promise<{ caseData: BadDataCase | null; checklist: ChecklistRun | null }>;
  loadSampleData: (role: Role) => Promise<void>;
  resetSampleData: (role: Role) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

function stripGeneratedFields(caseData: BadDataCase) {
  const rest = { ...caseData };
  delete rest.id;
  delete rest.updated_at;
  return rest;
}

function stripChecklistGeneratedFields(run: ChecklistRun) {
  const rest = { ...run };
  delete rest.id;
  delete rest.created_at;
  return rest;
}

function failedChecklistItems(run: ChecklistRun) {
  const failures: string[] = [];
  if (!run.cif_checked) failures.push("CIF belum dicek");
  if (!run.cif_matches_latest) failures.push("CIF tidak sesuai data terbaru");
  if (!run.phone_exists) failures.push("Nomor HP belum tersedia");
  if (!run.phone_format_valid) failures.push("Format nomor HP belum valid untuk BRISpot");
  if (!run.email_checked) failures.push("Email belum dicek");
  if (!run.job_business_checked) failures.push("Data pekerjaan/usaha belum dicek");
  if (run.product === "Briguna" && !run.payroll_checked) {
    failures.push("Data payroll Briguna belum dicek");
  }
  if (!run.supporting_docs_checked) failures.push("Dokumen pendukung belum lengkap");
  if (!run.slik_checked) failures.push("SLIK/BI Checking belum dicek");
  if (!run.brispot_matches_latest) failures.push("Data BRISpot belum sesuai data terbaru");
  if (!run.no_data_mismatch) failures.push("Masih ada mismatch data");
  return failures;
}

function inferIssueCategory(run: ChecklistRun): IssueCategory {
  if (!run.phone_format_valid && run.phone_number?.replace(/\D/g, "").startsWith("62")) {
    return "Nomor HP format 62";
  }
  if (!run.cif_matches_latest) return "CIF lama";
  if (!run.brispot_matches_latest) return "Data tidak tersimpan";
  return "Lainnya";
}

async function writeAuditLog(
  action: string,
  entityType: string,
  entityId: string | null,
  role: Role,
  oldValue: Record<string, unknown> | null,
  newValue: Record<string, unknown> | null
) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase.from("audit_logs").insert({
    action,
    entity_type: entityType,
    entity_id: entityId,
    performed_by: role,
    old_value: oldValue,
    new_value: newValue
  });
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<BadDataCase[]>(sampleCases);
  const [checklistRuns, setChecklistRuns] = useState<ChecklistRun[]>(sampleChecklistRuns);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const storageMode = getSupabaseClient() ? "supabase" : "demo";

  const refresh = useCallback(async () => {
    const supabase = getSupabaseClient();
    setLoading(true);
    try {
      if (!supabase) {
        setCases(sortCasesNewestFirst(sampleCases));
        setChecklistRuns(sampleChecklistRuns);
        return;
      }

      const [caseResponse, checklistResponse] = await Promise.all([
        supabase.from("bad_data_cases").select("*").order("created_date", { ascending: false }),
        supabase.from("checklist_runs").select("*").order("run_date", { ascending: false })
      ]);

      if (caseResponse.error) throw caseResponse.error;
      if (checklistResponse.error) throw checklistResponse.error;

      setCases(sortCasesNewestFirst((caseResponse.data || []) as BadDataCase[]));
      setChecklistRuns((checklistResponse.data || []) as ChecklistRun[]);
    } catch (error) {
      toast({
        type: "error",
        title: "Gagal memuat data",
        message: error instanceof Error ? error.message : "Periksa konfigurasi Supabase."
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createCase = useCallback(
    async (caseData: BadDataCase, role: Role) => {
      const supabase = getSupabaseClient();
      const record: BadDataCase = {
        ...caseData,
        case_id: caseData.case_id || generateCaseId(cases.map((item) => item.case_id)),
        phone_number: normalizePhone(caseData.phone_number),
        created_by: caseData.created_by || role,
        escalation_required: Boolean(caseData.escalation_required),
        target_resolution_date:
          caseData.target_resolution_date ||
          calculateSlaDueDate(caseData.created_date, caseData.priority)
      };

      try {
        if (!supabase) {
          const localRecord = {
            ...record,
            id: crypto.randomUUID(),
            updated_at: new Date().toISOString()
          };
          setCases((items) => sortCasesNewestFirst([localRecord, ...items]));
          toast({
            type: "info",
            title: "Kasus tersimpan di mode demo",
            message: "Hubungkan Supabase agar data tersimpan permanen."
          });
          return localRecord;
        }

        const response = await supabase
          .from("bad_data_cases")
          .insert(stripGeneratedFields(record))
          .select()
          .single();
        if (response.error) throw response.error;
        await writeAuditLog(
          "CREATE_CASE",
          "bad_data_cases",
          record.case_id,
          role,
          null,
          record as unknown as Record<string, unknown>
        );
        setCases((items) => sortCasesNewestFirst([response.data as BadDataCase, ...items]));
        toast({ type: "success", title: "Kasus bad data berhasil dibuat" });
        return response.data as BadDataCase;
      } catch (error) {
        toast({
          type: "error",
          title: "Gagal membuat kasus",
          message: error instanceof Error ? error.message : "Terjadi kesalahan."
        });
        return null;
      }
    },
    [cases, toast]
  );

  const updateCase = useCallback(
    async (caseId: string, patch: Partial<BadDataCase>, role: Role) => {
      const supabase = getSupabaseClient();
      const oldRecord = cases.find((item) => item.case_id === caseId || item.id === caseId);
      if (!oldRecord) return null;
      const merged = {
        ...oldRecord,
        ...patch,
        phone_number: patch.phone_number ? normalizePhone(patch.phone_number) : oldRecord.phone_number
      } as BadDataCase;

      try {
        if (!supabase) {
          setCases((items) =>
            sortCasesNewestFirst(
              items.map((item) =>
                item.case_id === oldRecord.case_id ? { ...merged, updated_at: new Date().toISOString() } : item
              )
            )
          );
          toast({
            type: "info",
            title: "Perubahan tersimpan di mode demo",
            message: "Hubungkan Supabase agar data tersimpan permanen."
          });
          return merged;
        }

        const response = await supabase
          .from("bad_data_cases")
          .update(stripGeneratedFields(merged))
          .eq("case_id", oldRecord.case_id)
          .select()
          .single();
        if (response.error) throw response.error;
        await writeAuditLog(
          "UPDATE_CASE",
          "bad_data_cases",
          oldRecord.case_id,
          role,
          oldRecord as unknown as Record<string, unknown>,
          response.data as Record<string, unknown>
        );
        setCases((items) =>
          sortCasesNewestFirst(
            items.map((item) =>
              item.case_id === oldRecord.case_id ? (response.data as BadDataCase) : item
            )
          )
        );
        toast({ type: "success", title: "Kasus berhasil diperbarui" });
        return response.data as BadDataCase;
      } catch (error) {
        toast({
          type: "error",
          title: "Gagal memperbarui kasus",
          message: error instanceof Error ? error.message : "Terjadi kesalahan."
        });
        return null;
      }
    },
    [cases, toast]
  );

  const deleteCase = useCallback(
    async (caseId: string, role: Role) => {
      const supabase = getSupabaseClient();
      const oldRecord = cases.find((item) => item.case_id === caseId || item.id === caseId);
      if (!oldRecord) return;

      try {
        if (supabase) {
          const response = await supabase
            .from("bad_data_cases")
            .delete()
            .eq("case_id", oldRecord.case_id);
          if (response.error) throw response.error;
          await writeAuditLog(
            "DELETE_CASE",
            "bad_data_cases",
            oldRecord.case_id,
            role,
            oldRecord as unknown as Record<string, unknown>,
            null
          );
        }
        setCases((items) => items.filter((item) => item.case_id !== oldRecord.case_id));
        toast({ type: "success", title: "Kasus berhasil dihapus" });
      } catch (error) {
        toast({
          type: "error",
          title: "Gagal menghapus kasus",
          message: error instanceof Error ? error.message : "Terjadi kesalahan."
        });
      }
    },
    [cases, toast]
  );

  const closeCase = useCallback(
    async (caseId: string, role: Role) => {
      await updateCase(
        caseId,
        {
          status: "Closed",
          closed_date: formatDateInput()
        },
        role
      );
    },
    [updateCase]
  );

  const createChecklistRun = useCallback(
    async (run: ChecklistRun, role: Role) => {
      const supabase = getSupabaseClient();
      const failures = failedChecklistItems(run);
      const record: ChecklistRun = {
        ...run,
        normalized_phone: normalizePhone(run.phone_number),
        result_status: failures.length ? "Perlu Pengkinian" : "Layak Dilanjutkan"
      };

      try {
        if (!supabase) {
          const localRecord = {
            ...record,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString()
          };
          setChecklistRuns((items) => [localRecord, ...items]);
          toast({
            type: "info",
            title: "Checklist tersimpan di mode demo",
            message: "Hubungkan Supabase agar data tersimpan permanen."
          });
          return localRecord;
        }

        const response = await supabase
          .from("checklist_runs")
          .insert(stripChecklistGeneratedFields(record))
          .select()
          .single();
        if (response.error) throw response.error;
        await writeAuditLog(
          "CREATE_CHECKLIST",
          "checklist_runs",
          response.data.id,
          role,
          null,
          response.data as Record<string, unknown>
        );
        setChecklistRuns((items) => [response.data as ChecklistRun, ...items]);
        toast({ type: "success", title: "Checklist pre-screening berhasil disimpan" });
        return response.data as ChecklistRun;
      } catch (error) {
        toast({
          type: "error",
          title: "Gagal menyimpan checklist",
          message: error instanceof Error ? error.message : "Terjadi kesalahan."
        });
        return null;
      }
    },
    [toast]
  );

  const createCaseFromChecklist = useCallback(
    async (run: ChecklistRun, role: Role) => {
      const failures = failedChecklistItems(run);
      const caseData: BadDataCase = {
        case_id: generateCaseId(cases.map((item) => item.case_id)),
        created_date: formatDateInput(),
        rm_name: run.rm_name,
        product: run.product,
        cif: run.cif,
        customer_name: "Nasabah Dummy Checklist",
        phone_number: normalizePhone(run.phone_number),
        issue_category: inferIssueCategory(run),
        source_system: "BRISpot",
        process_stage: "Pre-screening",
        issue_description: failures.join("; ") || "Checklist pre-screening memerlukan tindak lanjut.",
        business_impact: "Risiko data tidak valid",
        priority: failures.length >= 3 ? "High" : "Medium",
        status: "Open",
        assigned_pic: run.rm_name,
        target_resolution_date: calculateSlaDueDate(
          formatDateInput(),
          failures.length >= 3 ? "High" : "Medium"
        ),
        closed_date: null,
        action_taken: "Kasus otomatis dibuat dari hasil checklist pre-screening.",
        escalation_required: false,
        escalation_date: null,
        escalation_target: null,
        evidence_note: run.notes || "Catatan checklist pre-screening dummy.",
        created_by: role
      };

      const createdCase = await createCase(caseData, role);
      const savedChecklist = await createChecklistRun(
        {
          ...run,
          created_case_id: createdCase?.case_id || null
        },
        role
      );
      return { caseData: createdCase, checklist: savedChecklist };
    },
    [cases, createCase, createChecklistRun]
  );

  const loadSampleData = useCallback(
    async (role: Role) => {
      const supabase = getSupabaseClient();
      try {
        if (!supabase) {
          setCases(sortCasesNewestFirst(sampleCases));
          setChecklistRuns(sampleChecklistRuns);
          toast({
            type: "info",
            title: "Sample data dimuat di mode demo",
            message: "Hubungkan Supabase agar data tersimpan permanen."
          });
          return;
        }
        const response = await supabase
          .from("bad_data_cases")
          .upsert(sampleCases.map(stripGeneratedFields), { onConflict: "case_id" });
        if (response.error) throw response.error;
        await writeAuditLog("LOAD_SAMPLE", "bad_data_cases", null, role, null, {
          total: sampleCases.length
        });
        await refresh();
        toast({ type: "success", title: "Sample data berhasil dimuat" });
      } catch (error) {
        toast({
          type: "error",
          title: "Gagal memuat sample data",
          message: error instanceof Error ? error.message : "Terjadi kesalahan."
        });
      }
    },
    [refresh, toast]
  );

  const resetSampleData = useCallback(
    async (role: Role) => {
      const supabase = getSupabaseClient();
      try {
        if (!supabase) {
          setCases(sortCasesNewestFirst(sampleCases));
          setChecklistRuns(sampleChecklistRuns);
          toast({
            type: "info",
            title: "Sample data direset di mode demo",
            message: "Hubungkan Supabase agar data tersimpan permanen."
          });
          return;
        }
        await supabase.from("audit_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await supabase
          .from("checklist_runs")
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000");
        const deleteResponse = await supabase
          .from("bad_data_cases")
          .delete()
          .neq("case_id", "__never__");
        if (deleteResponse.error) throw deleteResponse.error;
        await supabase.from("bad_data_cases").insert(sampleCases.map(stripGeneratedFields));
        await writeAuditLog("RESET_SAMPLE", "bad_data_cases", null, role, null, {
          total: sampleCases.length
        });
        await refresh();
        toast({ type: "success", title: "Sample data berhasil direset" });
      } catch (error) {
        toast({
          type: "error",
          title: "Gagal reset sample data",
          message: error instanceof Error ? error.message : "Terjadi kesalahan."
        });
      }
    },
    [refresh, toast]
  );

  const value = useMemo<DataContextValue>(
    () => ({
      cases,
      checklistRuns,
      loading,
      storageMode,
      refresh,
      createCase,
      updateCase,
      deleteCase,
      closeCase,
      createChecklistRun,
      createCaseFromChecklist,
      loadSampleData,
      resetSampleData
    }),
    [
      cases,
      checklistRuns,
      loading,
      storageMode,
      refresh,
      createCase,
      updateCase,
      deleteCase,
      closeCase,
      createChecklistRun,
      createCaseFromChecklist,
      loadSampleData,
      resetSampleData
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used inside DataProvider");
  return context;
}
