export type Product = "KPR" | "Briguna" | "Others";
export type Priority = "Low" | "Medium" | "High" | "Critical";
export type CaseStatus =
  | "Open"
  | "In Progress"
  | "Escalated"
  | "Waiting Feedback"
  | "Closed";
export type Role = "Admin" | "RM" | "Viewer";

export type IssueCategory =
  | "CIF lama"
  | "Nomor HP format 62"
  | "Nomor HP Data Leads tidak sesuai"
  | "Data tidak tersimpan"
  | "Data revert saat submit/prakarsa"
  | "Tidak ada notifikasi simpan data"
  | "Tidak ada audit log"
  | "Sinkronisasi PIS/Data Lakes belum optimal"
  | "Lainnya";

export type SourceSystem =
  | "BRISpot"
  | "PIS"
  | "Data Leads"
  | "Data Lakes"
  | "Kantor Pusat"
  | "Input RM"
  | "Lainnya";

export type ProcessStage =
  | "Pengecekan awal"
  | "Pre-screening"
  | "Pengkinian data"
  | "Submit prakarsa"
  | "Eskalasi"
  | "Lainnya";

export type BusinessImpact =
  | "Pengkinian manual berulang"
  | "SLA prakarsa terhambat"
  | "Input ulang oleh RM"
  | "Risiko data tidak valid"
  | "Nasabah menunggu lebih lama"
  | "Lainnya";

export type EscalationTarget = "OPX" | "PO" | "Unit Data" | "Other";

export interface BadDataCase {
  id?: string;
  case_id: string;
  created_date: string;
  rm_name: string;
  product: Product;
  cif?: string | null;
  customer_name?: string | null;
  phone_number?: string | null;
  issue_category: IssueCategory;
  source_system: SourceSystem;
  process_stage: ProcessStage;
  issue_description?: string | null;
  business_impact?: BusinessImpact | string | null;
  priority: Priority;
  status: CaseStatus;
  assigned_pic?: string | null;
  target_resolution_date?: string | null;
  closed_date?: string | null;
  action_taken?: string | null;
  escalation_required?: boolean | null;
  escalation_date?: string | null;
  escalation_target?: EscalationTarget | string | null;
  evidence_note?: string | null;
  created_by?: string | null;
  updated_at?: string | null;
}

export interface ChecklistRun {
  id?: string;
  run_date: string;
  product: Product;
  rm_name: string;
  cif?: string | null;
  phone_number?: string | null;
  normalized_phone?: string | null;
  cif_checked: boolean;
  cif_matches_latest: boolean;
  phone_exists: boolean;
  phone_format_valid: boolean;
  email_checked: boolean;
  job_business_checked: boolean;
  payroll_checked: boolean;
  supporting_docs_checked: boolean;
  slik_checked: boolean;
  brispot_matches_latest: boolean;
  no_data_mismatch: boolean;
  notes?: string | null;
  result_status?: string | null;
  created_case_id?: string | null;
  created_at?: string | null;
}

export interface AuditLog {
  id?: string;
  timestamp?: string;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  performed_by?: string | null;
  old_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
}

export const PRODUCT_OPTIONS: Product[] = ["KPR", "Briguna", "Others"];
export const PRIORITY_OPTIONS: Priority[] = ["Low", "Medium", "High", "Critical"];
export const STATUS_OPTIONS: CaseStatus[] = [
  "Open",
  "In Progress",
  "Escalated",
  "Waiting Feedback",
  "Closed"
];
export const ROLE_OPTIONS: Role[] = ["Admin", "RM", "Viewer"];
export const ISSUE_CATEGORY_OPTIONS: IssueCategory[] = [
  "CIF lama",
  "Nomor HP format 62",
  "Nomor HP Data Leads tidak sesuai",
  "Data tidak tersimpan",
  "Data revert saat submit/prakarsa",
  "Tidak ada notifikasi simpan data",
  "Tidak ada audit log",
  "Sinkronisasi PIS/Data Lakes belum optimal",
  "Lainnya"
];
export const SOURCE_SYSTEM_OPTIONS: SourceSystem[] = [
  "BRISpot",
  "PIS",
  "Data Leads",
  "Data Lakes",
  "Kantor Pusat",
  "Input RM",
  "Lainnya"
];
export const PROCESS_STAGE_OPTIONS: ProcessStage[] = [
  "Pengecekan awal",
  "Pre-screening",
  "Pengkinian data",
  "Submit prakarsa",
  "Eskalasi",
  "Lainnya"
];
export const BUSINESS_IMPACT_OPTIONS: BusinessImpact[] = [
  "Pengkinian manual berulang",
  "SLA prakarsa terhambat",
  "Input ulang oleh RM",
  "Risiko data tidak valid",
  "Nasabah menunggu lebih lama",
  "Lainnya"
];
export const ESCALATION_TARGET_OPTIONS: EscalationTarget[] = [
  "OPX",
  "PO",
  "Unit Data",
  "Other"
];
