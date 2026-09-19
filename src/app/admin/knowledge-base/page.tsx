"use client";

import { useState } from "react";
import AdminLayoutShell from "@/components/AdminLayoutShell";

interface KBArticle {
  id: string;
  title: string;
  category: string;
  views: number;
  lastUpdated: string;
}

export default function AdminKnowledgeBasePage() {
  const [articles, setArticles] = useState<KBArticle[]>([
    {
      id: "kb-1",
      title: "Immediate Protocol: What to Do If a Hard Drive Starts Clicking",
      category: "Data Recovery",
      views: 1420,
      lastUpdated: "Sep 10, 2026",
    },
    {
      id: "kb-2",
      title: "How to Safely Pack Hard Drives and NVMe SSDs for Courier Transit",
      category: "Data Recovery",
      views: 890,
      lastUpdated: "Sep 08, 2026",
    },
    {
      id: "kb-3",
      title: "Emergency Ransomware Playbook: First 15 Minutes Checklist",
      category: "Cybersecurity",
      views: 2150,
      lastUpdated: "Sep 02, 2026",
    },
    {
      id: "kb-4",
      title: "How to Restore Accidentally Deleted Files in Microsoft 365 & OneDrive",
      category: "Cloud Solutions",
      views: 640,
      lastUpdated: "Aug 25, 2026",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCat, setNewCat] = useState("Data Recovery");
  const [notification, setNotification] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setArticles([
      ...articles,
      {
        id: `kb-${articles.length + 1}`,
        title: newTitle,
        category: newCat,
        views: 0,
        lastUpdated: "Just now",
      },
    ]);
    setShowModal(false);
    setNewTitle("");
    setNotification(`Guide "${newTitle}" added to Customer Knowledge Base.`);
    setTimeout(() => setNotification(""), 4000);
  };

  return (
    <AdminLayoutShell
      title="Customer Knowledge Base Manager"
      subtitle="Publish technical troubleshooting articles and emergency playbooks to /customer/knowledge-base"
      actions={
        <button
          onClick={() => setShowModal(true)}
          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-xs"
        >
          + Add Help Article
        </button>
      }
    >
      <div className="space-y-6 text-xs">
        {notification && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-bold text-emerald-800 flex items-center justify-between shadow-2xs">
            <span>✓ {notification}</span>
            <button onClick={() => setNotification("")} className="text-emerald-600 hover:text-emerald-900">✕</button>
          </div>
        )}

        <div className="rounded-3xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Guide Title</th>
                  <th className="px-5 py-3.5">Domain</th>
                  <th className="px-5 py-3.5">Customer Views</th>
                  <th className="px-5 py-3.5">Last Updated</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {articles.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4 font-bold text-slate-900 text-sm">{a.title}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-md bg-blue-50 border border-blue-200 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                        {a.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-emerald-700 font-bold">{a.views} reads</td>
                    <td className="px-5 py-4 text-slate-500">{a.lastUpdated}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => {
                          setArticles(articles.filter((item) => item.id !== a.id));
                          setNotification("Guide deleted.");
                          setTimeout(() => setNotification(""), 4000);
                        }}
                        className="rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer shadow-2xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs text-xs">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900">Create Knowledge Base Guide</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">✕</button>
              </div>

              <form onSubmit={handleAdd} className="space-y-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Guide Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. How to Verify SMART Health on NVMe Drives"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                  >
                    <option>Data Recovery</option>
                    <option>Cybersecurity</option>
                    <option>Cloud Solutions</option>
                    <option>Packaging &amp; Transit</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Guide Instructions / Body</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Step-by-step instructions for customers..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 cursor-pointer font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-500 shadow-md shadow-blue-600/20 cursor-pointer"
                  >
                    Publish to Knowledge Base
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayoutShell>
  );
}
