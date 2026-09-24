"use client";

import { useState, useEffect, useMemo } from "react";
import AdminLayoutShell from "@/components/AdminLayoutShell";
import AdvancedDataRecoveryReportModal, {
  AdvancedReportData,
} from "@/components/AdvancedDataRecoveryReportModal";
import ITManagementContractModal from "@/components/ITManagementContractModal";
import ModernDeleteModal from "@/components/ModernDeleteModal";
import {
  fetchReportsFromSupabase,
  deleteReportFromSupabase,
  DiagnosisReport,
} from "@/lib/reportData";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<DiagnosisReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMedia, setFilterMedia] = useState("ALL");
  const [selectedReport, setSelectedReport] = useState<Partial<AdvancedReportData> | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<DiagnosisReport | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await fetchReportsFromSupabase();
      if (data) {
        setReports(data);
      }
    } catch (e) {
      console.warn("Error fetching reports:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();

    const handleUpdate = () => loadReports();
    window.addEventListener("reports-updated", handleUpdate);
    const interval = setInterval(loadReports, 12000);

    return () => {
      window.removeEventListener("reports-updated", handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;
    setIsDeleting(true);
    try {
      const repId = reportToDelete.id || `DR-${reportToDelete.jobId}`;
      await deleteReportFromSupabase(repId);
      setReports((prev) => prev.filter((r) => r.id !== repId && r.jobId !== reportToDelete.jobId));
      setNotification(`✓ Forensic Report #${repId} deleted.`);
      setTimeout(() => setNotification(""), 4000);
      setReportToDelete(null);
    } catch (err) {
      console.error("Delete report err:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.jobId.toLowerCase().includes(q) ||
        r.clientName.toLowerCase().includes(q) ||
        r.brand.toLowerCase().includes(q) ||
        r.model.toLowerCase().includes(q) ||
        r.diagnosis.toLowerCase().includes(q) ||
        r.findings.toLowerCase().includes(q);

      if (filterMedia === "ALL") return matchesSearch;
      return matchesSearch && r.deviceType === filterMedia;
    });
  }, [reports, search, filterMedia]);

  const hddCount = reports.filter((r) => r.deviceType === "HDD").length;
  const ssdCount = reports.filter((r) => r.deviceType === "SSD" || r.deviceType === "NVMe").length;
  const flashCount = reports.filter((r) => r.deviceType === "FLASH").length;

  return (
    <AdminLayoutShell
      onNewJobClick={() => {
        setSelectedReport(null);
        setIsReportModalOpen(true);
      }}
      onCreateReportClick={() => {
        setSelectedReport(null);
        setIsReportModalOpen(true);
      }}
    >
      <div className="space-y-6 text-xs animate-in fade-in">
        {notification && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center justify-between shadow-2xs animate-in slide-in-from-top-2">
            <span>{notification}</span>
            <button onClick={() => setNotification("")} className="text-emerald-600 hover:text-emerald-950">
              ✕
            </button>
          </div>
        )}

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Forensic Lab Analytics &amp; Diagnosis Reports
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Verified recovery success scores, cleanroom turnaround times, and synchronized laboratory diagnosis registry
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                loadReports();
                setNotification("✓ Reports re-synchronized with ISO Class-5 benches!");
                setTimeout(() => setNotification(""), 3500);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span className="text-blue-600 font-bold">↻</span>
              <span>Sync Live</span>
            </button>

            <button
              type="button"
              onClick={() => setIsContractModalOpen(true)}
              className="rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>📄</span>
              <span>New IT SLA Contract</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedReport(null);
                setIsReportModalOpen(true);
              }}
              className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white transition shadow-md shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <span>+</span>
              <span>Author Lab Report</span>
            </button>
          </div>
        </div>

        {/* 1. TOP KPI ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs hover:shadow-xs transition">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Data Restored
            </span>
            <p className="text-3xl font-black text-slate-900 mt-1.5">142.8 TB</p>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-1.5">
              ↑ 18.2% vs last quarter
            </span>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs hover:shadow-xs transition">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Recovery Success Rate
            </span>
            <p className="text-3xl font-black text-emerald-600 mt-1.5">99.98%</p>
            <span className="text-[11px] text-slate-500 block mt-1.5">
              Certified Cleanroom Standard
            </span>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs hover:shadow-xs transition">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Avg Rush Turnaround
            </span>
            <p className="text-3xl font-black text-blue-600 mt-1.5">9.2 Hours</p>
            <span className="text-[11px] text-slate-500 block mt-1.5">
              12-Hour Priority SLA Target
            </span>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs hover:shadow-xs transition">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              15-Min SLA Compliance
            </span>
            <p className="text-3xl font-black text-emerald-600 mt-1.5">100.0%</p>
            <span className="text-[11px] text-slate-500 block mt-1.5">
              Zero breaches (past 12 mos)
            </span>
          </div>
        </div>

        {/* 2. MEDIA RECOVERY SUCCESS BREAKDOWN & CERTIFICATIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* STORAGE ARCHITECTURE VISUALIZER */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-900">
                Recovery Success Rate by Storage Architecture
              </h2>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                ISO Class-5 Bench
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Detailed statistical breakdown of hardware extraction across ISO Class-5 clean benches.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1.5">
                  <span>Enterprise RAID Arrays (RAID 0, 1, 5, 6, 10, ZFS)</span>
                  <span className="text-emerald-600 font-bold">100.0% Success</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1.5">
                  <span>Mechanical Hard Drives (Clicking Sliders &amp; Head Crashes)</span>
                  <span className="text-emerald-600 font-bold">99.8% Success</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "99.8%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1.5">
                  <span>Solid State Drives (M.2 PCIe NVMe &amp; SATA SSD)</span>
                  <span className="text-emerald-600 font-bold">99.6% Success</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "99.6%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1.5">
                  <span>BitLocker Encrypted &amp; Corrupted SQL Databases</span>
                  <span className="text-emerald-600 font-bold">100.0% Success</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* COMPLIANCE & ACCREDITATION AUDIT */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1">
                Forensic Cleanroom Certifications
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Audited laboratory standards ensuring strict legal admissibility of recovered digital evidence.
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-emerald-700 font-bold block mb-1">✓ ISO 14644-1 Class 5</span>
                  <p className="text-slate-600 text-[11px]">Maximum 3,520 particles per cubic meter of air at 0.5 microns.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-emerald-700 font-bold block mb-1">✓ SOC 2 Type II Certified</span>
                  <p className="text-slate-600 text-[11px]">Strict chain-of-custody tracking with cryptographic media write-blocking.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-emerald-700 font-bold block mb-1">✓ HIPAA &amp; GDPR Compliant</span>
                  <p className="text-slate-600 text-[11px]">Zero customer data retained after confirmed delivery and verification.</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Auditor: CyberTrust Lab</span>
              <span className="text-emerald-600 font-bold">100% Valid</span>
            </div>
          </div>
        </div>

        {/* 3. SYNCHRONIZED FORENSIC LABORATORY DIAGNOSIS REGISTRY */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Synchronized Laboratory Diagnosis Registry
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official bench diagnostic records synced with Supabase, technician portals, and client notifications
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                  Total Synced: <strong className="text-slate-900">{reports.length} Reports</strong>
                </span>
              </div>
            </div>

            {/* SEARCH & FILTERS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="relative w-full sm:w-80">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search by Job ID, client, serial, diagnosis..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-8 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto text-xs">
                {[
                  { id: "ALL", label: `All Media (${reports.length})` },
                  { id: "HDD", label: `Hard Drives (${hddCount})` },
                  { id: "SSD", label: `SSDs & NVMe (${ssdCount})` },
                  { id: "FLASH", label: `Flash (${flashCount})` },
                ].map((tab) => {
                  const isActive = filterMedia === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFilterMedia(tab.id)}
                      className={`rounded-xl px-3 py-1.5 font-bold transition text-xs cursor-pointer ${
                        isActive
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left text-slate-700">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Report ID</th>
                  <th className="px-5 py-3.5">Client</th>
                  <th className="px-5 py-3.5">Storage Architecture</th>
                  <th className="px-5 py-3.5">Primary Diagnosis</th>
                  <th className="px-5 py-3.5">Recovery Assessment</th>
                  <th className="px-5 py-3.5">Estimated Cost</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-slate-400 font-mono text-xs">
                      Synchronizing reports...
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                      <p className="font-semibold text-slate-700 text-sm">No diagnostic reports found</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Try adjusting your search criteria or author a new diagnostic report.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((r) => {
                    const cleanJobId = r.jobId || r.id.replace(/^DR-/i, "");
                    return (
                      <tr key={r.id || r.jobId} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-3.5 font-mono font-bold text-blue-600 whitespace-nowrap">
                          #{r.id || `DR-${cleanJobId}`}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-slate-900 block">{r.clientName}</span>
                          <span className="text-[11px] text-slate-500 font-mono">Serial: {r.serialNumber}</span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px]">
                            <span className="font-bold text-blue-600">{r.deviceType || "HDD"}</span>
                            <span>{r.capacity}</span>
                          </span>
                          <span className="block text-[10px] text-slate-500 mt-0.5 truncate max-w-[130px]">
                            {r.brand} {r.model}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 max-w-xs">
                          <span className="font-bold text-slate-800 block truncate">{r.diagnosis}</span>
                          <span className="text-[11px] text-slate-500 block truncate">{r.findings || r.symptoms}</span>
                        </td>
                        <td className="px-5 py-3.5 max-w-xs">
                          <span className="text-slate-700 block truncate">{r.recoveryAssessment}</span>
                          <span className="text-[11px] text-slate-500 font-mono block">ETA: {r.estimatedTime}</span>
                        </td>
                        <td className="px-5 py-3.5 font-mono font-bold text-emerald-600 whitespace-nowrap">
                          {r.finalRecoveryCost || "₹15,000–₹17,500"}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                            {r.recoveryStatus}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReport(r);
                                setIsReportModalOpen(true);
                              }}
                              className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                              title="Inspect Full Forensic Report &amp; Print"
                            >
                              <span>👁️</span>
                              <span>Inspect</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setReportToDelete(r)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition text-xs cursor-pointer"
                              title="Delete Report"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DELETE MODAL */}
        <ModernDeleteModal
          isOpen={!!reportToDelete}
          onClose={() => setReportToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Forensic Report"
          itemType="Diagnostic Report"
          itemName={
            reportToDelete
              ? `Report #${reportToDelete.id || `DR-${reportToDelete.jobId}`} (${reportToDelete.clientName})`
              : ""
          }
          description={
            reportToDelete
              ? `Are you sure you want to permanently delete Forensic Report #${reportToDelete.id || `DR-${reportToDelete.jobId}`} for client ${reportToDelete.clientName}? This action cannot be undone.`
              : ""
          }
          confirmButtonText="Delete Forensic Report"
          isDeleting={isDeleting}
        />

        {/* ADVANCED REPORT MODAL */}
        <AdvancedDataRecoveryReportModal
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false);
            setSelectedReport(null);
          }}
          initialData={selectedReport || undefined}
          onSaved={() => {
            loadReports();
            setIsReportModalOpen(false);
            setSelectedReport(null);
            setNotification("✓ Forensic Diagnosis Report saved & synchronized!");
            setTimeout(() => setNotification(""), 4000);
          }}
        />

        {/* MASTER IT MANAGEMENT CONTRACT MODAL */}
        <ITManagementContractModal
          isOpen={isContractModalOpen}
          onClose={() => setIsContractModalOpen(false)}
          onSaved={(saved) => {
            setIsContractModalOpen(false);
            setNotification(`✓ IT Management Contract #${saved.contractId} created for ${saved.clientCompany}!`);
            setTimeout(() => setNotification(""), 6000);
          }}
        />
      </div>
    </AdminLayoutShell>
  );
}
