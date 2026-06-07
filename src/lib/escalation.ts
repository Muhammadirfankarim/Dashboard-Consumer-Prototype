import { BadDataCase, EscalationTarget } from "@/types";
import { formatDisplayDate, maskCif } from "@/lib/utils";

export function generateEscalationText(
  caseData: BadDataCase,
  target?: EscalationTarget | string
) {
  const escalationTarget = target || caseData.escalation_target || "OPX/PO/Unit Terkait";

  return `Subject: Eskalasi Kendala Bad Data BRISpot - ${caseData.case_id} - ${caseData.product}

Yth. Tim ${escalationTarget},

Mohon bantuan tindak lanjut atas kendala bad data berikut:

Case ID: ${caseData.case_id}
Produk: ${caseData.product}
RM: ${caseData.rm_name}
CIF: ${maskCif(caseData.cif)}
Tahap Proses: ${caseData.process_stage}
Kategori Kendala: ${caseData.issue_category}
Sumber Data/System: ${caseData.source_system}
Prioritas: ${caseData.priority}
Dampak Bisnis: ${caseData.business_impact || "-"}
Tanggal Temuan: ${formatDisplayDate(caseData.created_date)}
Target Penyelesaian: ${formatDisplayDate(caseData.target_resolution_date)}

Kronologi Singkat:
${caseData.issue_description || "-"}

Tindakan yang Sudah Dilakukan di Cabang:
${caseData.action_taken || "-"}

Bukti Pendukung:
${caseData.evidence_note || "-"}

Mohon arahan dan tindak lanjut agar proses prakarsa kredit dapat dilanjutkan.

Terima kasih.
BRI Kantor Cabang Sudirman Semanggi`;
}
