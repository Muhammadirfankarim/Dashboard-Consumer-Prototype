import * as XLSX from "xlsx";

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  sheetName = "Data"
) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

export function exportWorkbook(
  sheets: Array<{ name: string; data: Record<string, unknown>[] }>,
  filename: string
) {
  const workbook = XLSX.utils.book_new();
  sheets.forEach((sheet) => {
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(sheet.data),
      sheet.name.slice(0, 31)
    );
  });
  XLSX.writeFile(workbook, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

export function downloadCsvTemplate() {
  const headers = [
    "created_date",
    "rm_name",
    "product",
    "cif",
    "customer_name",
    "phone_number",
    "issue_category",
    "source_system",
    "process_stage",
    "issue_description",
    "business_impact",
    "priority",
    "status",
    "assigned_pic",
    "target_resolution_date",
    "action_taken",
    "escalation_required",
    "escalation_target",
    "evidence_note",
    "created_by"
  ];
  const example = [
    "2026-06-07",
    "RM Demo",
    "KPR",
    "900000009999",
    "Nasabah Dummy",
    "628000009999",
    "Nomor HP format 62",
    "PIS",
    "Pre-screening",
    "Nomor HP dummy perlu dinormalisasi",
    "Input ulang oleh RM",
    "Medium",
    "Open",
    "PIC Demo",
    "2026-06-12",
    "Catatan tindakan dummy",
    "false",
    "",
    "Catatan bukti dummy",
    "RM"
  ];
  const csv = `${headers.join(",")}\n${example
    .map((value) => `"${String(value).replaceAll('"', '""')}"`)
    .join(",")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "bad-data-cases-template.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
