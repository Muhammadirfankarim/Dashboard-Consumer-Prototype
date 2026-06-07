import { z } from "zod";
import { normalizePhone, validDateString } from "@/lib/utils";

const productValues = ["KPR", "Briguna", "Others"] as const;
const priorityValues = ["Low", "Medium", "High", "Critical"] as const;
const statusValues = ["Open", "In Progress", "Escalated", "Waiting Feedback", "Closed"] as const;
const issueCategoryValues = [
  "CIF lama",
  "Nomor HP format 62",
  "Nomor HP Data Leads tidak sesuai",
  "Data tidak tersimpan",
  "Data revert saat submit/prakarsa",
  "Tidak ada notifikasi simpan data",
  "Tidak ada audit log",
  "Sinkronisasi PIS/Data Lakes belum optimal",
  "Lainnya"
] as const;
const sourceSystemValues = [
  "BRISpot",
  "PIS",
  "Data Leads",
  "Data Lakes",
  "Kantor Pusat",
  "Input RM",
  "Lainnya"
] as const;
const processStageValues = [
  "Pengecekan awal",
  "Pre-screening",
  "Pengkinian data",
  "Submit prakarsa",
  "Eskalasi",
  "Lainnya"
] as const;
const businessImpactValues = [
  "Pengkinian manual berulang",
  "SLA prakarsa terhambat",
  "Input ulang oleh RM",
  "Risiko data tidak valid",
  "Nasabah menunggu lebih lama",
  "Lainnya"
] as const;
const escalationTargetValues = ["OPX", "PO", "Unit Data", "Other"] as const;

const requiredDate = z.string().refine(validDateString, "Tanggal tidak valid");
const optionalDate = z
  .string()
  .optional()
  .nullable()
  .refine((value) => !value || validDateString(value), "Tanggal tidak valid");

export const caseFormSchema = z.object({
  id: z.string().optional(),
  case_id: z.string().min(1, "Case ID wajib ada"),
  created_date: requiredDate,
  rm_name: z.string().min(2, "Nama RM wajib diisi"),
  product: z.enum(productValues),
  cif: z.string().optional().nullable(),
  customer_name: z.string().optional().nullable(),
  phone_number: z
    .string()
    .optional()
    .nullable()
    .transform((value) => (value ? normalizePhone(value) : value)),
  issue_category: z.enum(issueCategoryValues),
  source_system: z.enum(sourceSystemValues),
  process_stage: z.enum(processStageValues),
  issue_description: z.string().optional().nullable(),
  business_impact: z.enum(businessImpactValues).or(z.literal("")).optional().nullable(),
  priority: z.enum(priorityValues),
  status: z.enum(statusValues),
  assigned_pic: z.string().optional().nullable(),
  target_resolution_date: optionalDate,
  closed_date: optionalDate,
  action_taken: z.string().optional().nullable(),
  escalation_required: z.boolean().optional().nullable(),
  escalation_date: optionalDate,
  escalation_target: z.enum(escalationTargetValues).or(z.literal("")).optional().nullable(),
  evidence_note: z.string().optional().nullable(),
  created_by: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable()
});

export const checklistSchema = z.object({
  id: z.string().optional(),
  run_date: requiredDate,
  product: z.enum(productValues),
  rm_name: z.string().min(2, "Nama RM wajib diisi"),
  cif: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  normalized_phone: z.string().optional().nullable(),
  cif_checked: z.boolean(),
  cif_matches_latest: z.boolean(),
  phone_exists: z.boolean(),
  phone_format_valid: z.boolean(),
  email_checked: z.boolean(),
  job_business_checked: z.boolean(),
  payroll_checked: z.boolean(),
  supporting_docs_checked: z.boolean(),
  slik_checked: z.boolean(),
  brispot_matches_latest: z.boolean(),
  no_data_mismatch: z.boolean(),
  notes: z.string().optional().nullable(),
  result_status: z.string().optional().nullable(),
  created_case_id: z.string().optional().nullable(),
  created_at: z.string().optional().nullable()
});

export type CaseFormInput = z.infer<typeof caseFormSchema>;
export type ChecklistFormInput = z.infer<typeof checklistSchema>;

export function validateCaseForm(data: unknown) {
  return caseFormSchema.safeParse(data);
}

export function validateChecklistForm(data: unknown) {
  return checklistSchema.safeParse(data);
}

export function zodErrorsToRecord(error: z.ZodError) {
  return error.issues.reduce<Record<string, string>>((acc, issue) => {
    const key = issue.path.join(".");
    if (!acc[key]) acc[key] = issue.message;
    return acc;
  }, {});
}
