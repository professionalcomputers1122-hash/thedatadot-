"use client";

export interface DiagnosisReport {
  id: string; // e.g. "DR-2003"
  jobId: string;
  reportDateIso: string;
  recoveryDateIso: string;
  clientName: string;
  deviceType: "HDD" | "SSD" | "NVMe" | "FLASH";
  brand: string;
  model: string;
  serialNumber: string;
  capacity: string;
  iface: string;
  fileSystem: string;
  diagnosis: string;
  symptoms: string;
  findings: string;
  recoveryMethod: string;
  recoveryAssessment: string;
  estimatedTime: string;
  diagnosisCharge: string;
  finalRecoveryCost: string;
  recoveryStatus: string;
  recoveredData: string;
  dataVerification: string;
  createdAt?: string;
  updatedAt?: string;
}

export const REPORTS_STORAGE_KEY = "tdd_diagnosis_reports";

// Initial sample report matching user's exact test case
export const defaultSampleReport: DiagnosisReport = {
  id: "DR-2003",
  jobId: "2003",
  reportDateIso: "2026-09-19",
  recoveryDateIso: "2026-09-29",
  clientName: "Sanjay Vignesh",
  deviceType: "HDD",
  brand: "Seagate",
  model: "Barracuda",
  serialNumber: "ABC123456",
  capacity: "1TB",
  iface: "SATA",
  fileSystem: "NTFS",
  diagnosis: "Head failure",
  symptoms: "Clicking sound, drive not detecting",
  findings: "Read/write heads completely damaged",
  recoveryMethod: "Head replacement and controlled data imaging",
  recoveryAssessment: "Recovery possible, subject to platter condition",
  estimatedTime: "7–10 Business Days",
  diagnosisCharge: "₹750",
  finalRecoveryCost: "₹15,000–₹17,500",
  recoveryStatus: "Pending",
  recoveredData: "-",
  dataVerification: "Pending",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function getLocalStoredReports(): DiagnosisReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Error reading local reports:", e);
  }
  return [];
}

export function saveLocalStoredReports(reports: DiagnosisReport[], emitEvent = false): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
    if (emitEvent) {
      window.dispatchEvent(new Event("reports-updated"));
    }
  } catch (e) {
    console.warn("Error writing local reports:", e);
  }
}

export async function fetchReportsFromSupabase(): Promise<DiagnosisReport[]> {
  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/reports");
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.reports)) {
          saveLocalStoredReports(json.reports, false);
          return json.reports;
        }
      }
    }
  } catch (apiErr) {
    console.warn("API /api/reports fetch fallback:", apiErr);
  }
  return getLocalStoredReports();
}

export async function saveReportToSupabase(
  reportData: Partial<DiagnosisReport>
): Promise<DiagnosisReport> {
  const rawJob = reportData.jobId || `${Math.floor(1000 + Math.random() * 9000)}`;
  let savedReport: DiagnosisReport = {
    ...defaultSampleReport,
    ...reportData,
    jobId: rawJob,
    id: reportData.id || `DR-${rawJob}`,
    updatedAt: new Date().toISOString(),
  };

  try {
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(savedReport),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.report) {
        savedReport = json.report;
      }
    }
  } catch (apiErr) {
    console.warn("API save report fallback to local storage:", apiErr);
  }

  // Update localStorage cache
  const local = getLocalStoredReports();
  const existingIdx = local.findIndex(
    (r) => r.id === savedReport.id || r.jobId === savedReport.jobId || `DR-${r.jobId}` === savedReport.id
  );
  if (existingIdx >= 0) {
    local[existingIdx] = savedReport;
  } else {
    local.unshift(savedReport);
  }
  saveLocalStoredReports(local, false);

  return savedReport;
}

export async function deleteReportFromSupabase(reportId: string): Promise<boolean> {
  const cleanId = reportId.trim();
  const rawId = cleanId.replace(/^DR-/i, "").replace(/^RPT-/i, "");
  const drId = `DR-${rawId}`;

  try {
    await fetch(`/api/reports/${encodeURIComponent(cleanId)}`, {
      method: "DELETE",
    });
  } catch (apiErr) {
    console.warn("API delete report fallback:", apiErr);
  }

  // Remove all variants from localStorage cache
  const local = getLocalStoredReports().filter((r) => {
    const rId = (r.id || "").toLowerCase();
    const rJob = (r.jobId || "").toLowerCase();
    return (
      rId !== cleanId.toLowerCase() &&
      rId !== rawId.toLowerCase() &&
      rId !== drId.toLowerCase() &&
      rJob !== cleanId.toLowerCase() &&
      rJob !== rawId.toLowerCase()
    );
  });
  saveLocalStoredReports(local, false);
  return true;
}
