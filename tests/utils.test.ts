import { describe, expect, it } from "vitest";
import {
  calculateSlaDueDate,
  generateCaseId,
  isOverdue,
  maskCif,
  maskName,
  maskPhone,
  normalizePhone
} from "../src/lib/utils";
import { generateEscalationText } from "../src/lib/escalation";
import { BadDataCase } from "../src/types";

describe("bad data utility functions", () => {
  it("masks sensitive identifiers", () => {
    expect(maskCif("1234567890")).toBe("******7890");
    expect(maskPhone("081234567890")).toBe("0812****7890");
    expect(maskName("Nasabah Dummy 01")).toBe("N****** D**** 01");
  });

  it("normalizes Indonesian phone prefix 62 to 0", () => {
    expect(normalizePhone("6281234567890")).toBe("081234567890");
    expect(normalizePhone("81234567890")).toBe("081234567890");
  });

  it("calculates SLA due dates by priority", () => {
    expect(calculateSlaDueDate("2026-06-01", "Critical")).toBe("2026-06-02");
    expect(calculateSlaDueDate("2026-06-01", "High")).toBe("2026-06-03");
    expect(calculateSlaDueDate("2026-06-01", "Medium")).toBe("2026-06-06");
    expect(calculateSlaDueDate("2026-06-01", "Low")).toBe("2026-06-08");
  });

  it("generates deterministic case ids for the same day", () => {
    const date = new Date("2026-06-07T10:00:00");
    expect(generateCaseId(["BD-20260607-0001", "BD-20260607-0002"], date)).toBe(
      "BD-20260607-0003"
    );
  });

  it("detects overdue only for non-closed cases", () => {
    const today = new Date("2026-06-07T10:00:00");
    expect(isOverdue("2026-06-06", "Open", today)).toBe(true);
    expect(isOverdue("2026-06-06", "Closed", today)).toBe(false);
  });

  it("generates escalation text with masked CIF", () => {
    const caseData: BadDataCase = {
      case_id: "BD-20260607-0001",
      created_date: "2026-06-07",
      rm_name: "RM Demo",
      product: "KPR",
      cif: "1234567890",
      customer_name: "Nasabah Dummy",
      phone_number: "081234567890",
      issue_category: "CIF lama",
      source_system: "BRISpot",
      process_stage: "Pre-screening",
      issue_description: "Kronologi dummy.",
      business_impact: "SLA prakarsa terhambat",
      priority: "High",
      status: "Open",
      target_resolution_date: "2026-06-09"
    };
    const text = generateEscalationText(caseData, "OPX");
    expect(text).toContain("Subject: Eskalasi Kendala Bad Data BRISpot");
    expect(text).toContain("CIF: ******7890");
    expect(text).not.toContain("1234567890");
  });
});
