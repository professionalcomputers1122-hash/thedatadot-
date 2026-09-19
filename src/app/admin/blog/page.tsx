"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import AdminLayoutShell from "@/components/AdminLayoutShell";
import ModernDeleteModal from "@/components/ModernDeleteModal";
import {
  fetchBlogPostsFromSupabase,
  createOrUpdateBlogPostInSupabase,
  deleteBlogPostFromSupabase,
  getDeletedBlogIds,
} from "@/lib/portalData";

interface BlogPost {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  status: "Published" | "Draft";
  excerpt: string;
  coverImage?: string;
  content?: string;
}

const DEFAULT_ARTICLES: BlogPost[] = [
  {
    id: "cybersecurity-tips",
    title: "10 Cybersecurity Tips for Small Businesses",
    category: "Cybersecurity",
    date: "Sep 10, 2026",
    readTime: "5 min read",
    status: "Published",
    coverImage: "/images/blog/cybersecurity-tips.jpg",
    excerpt: "Practical defense tactics to protect workstations, credentials, and customer data.",
    content: "Small businesses are currently the prime target for automated ransomware attacks. Implementing multi-factor authentication (MFA) and DNS filtering alone reduces threat vulnerability by over 80%. In this comprehensive guide, our cybersecurity engineers walk through the top 10 defense protocols.",
  },
  {
    id: "cloud-solutions-benefits",
    title: "The Benefits of Cloud Solutions for Growing Companies",
    category: "Cloud Solutions",
    date: "Sep 05, 2026",
    readTime: "4 min read",
    status: "Published",
    coverImage: "/images/blog/cloud-solutions.jpg",
    excerpt: "How modern cloud infrastructure and Microsoft 365 eliminate server headaches.",
    content: "Migrating from on-premise legacy towers to hybrid cloud infrastructure reduces operational maintenance overhead by 45%. Learn how Microsoft Azure and 365 deliver scalable uptime.",
  },
  {
    id: "choose-it-partner",
    title: "How to Choose the Right IT Support Partner",
    category: "Managed IT",
    date: "Aug 28, 2026",
    readTime: "6 min read",
    status: "Published",
    coverImage: "/images/blog/it-partner.jpg",
    excerpt: "The critical criteria to evaluate: response SLAs and flat-rate billing.",
    content: "When evaluating managed service providers (MSPs), always scrutinize contractual response time guarantees. An IT partner should offer transparent flat-rate agreements with zero surprise hourly overages.",
  },
  {
    id: "cleanroom-recovery-guide",
    title: "Inside an ISO Class-5 Cleanroom: Platter Swaps & PC-3000 Telemetry",
    category: "Data Recovery",
    date: "Draft",
    readTime: "7 min read",
    status: "Draft",
    coverImage: "/images/blog/cybersecurity-tips.jpg",
    excerpt: "A deep dive into donor head calibration and PC-3000 mirror imaging.",
    content: "Exposing sensitive hard drive platters to open air causes catastrophic head crashes. Learn how laminar airflow filtration eliminates airborne dust particles down to 0.5 microns.",
  },
];

export default function AdminBlogPage() {
  const [articles, setArticles] = useState<BlogPost[]>([]);

  const [filter, setFilter] = useState<"All" | "Published" | "Draft">("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notification, setNotification] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Editor form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Cybersecurity");
  const [readTime, setReadTime] = useState("5 min read");
  const [status, setStatus] = useState<"Published" | "Draft">("Published");
  const [coverImage, setCoverImage] = useState("/images/blog/cybersecurity-tips.jpg");
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("upload");
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");

  const loadLivePosts = async () => {
    const deletedIds = getDeletedBlogIds();
    try {
      const livePosts = await fetchBlogPostsFromSupabase();
      const liveMapped: BlogPost[] = (livePosts || []).map((p) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        date: p.created_at
          ? new Date(p.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Live",
        readTime: p.read_time || "5 min read",
        status: p.status,
        coverImage: p.cover_image || "/images/blog/cybersecurity-tips.jpg",
        excerpt: p.excerpt,
        content: p.content,
      }));

      const liveIds = new Set(liveMapped.map((l) => l.id));
      const fallbackArticles = DEFAULT_ARTICLES.filter(
        (d) => !liveIds.has(d.id) && !deletedIds.has(d.id)
      );

      const combined = [
        ...liveMapped.filter((p) => !deletedIds.has(p.id)),
        ...fallbackArticles,
      ];
      setArticles(combined);
    } catch (err) {
      console.error("Failed to load blog posts from Supabase:", err);
      setArticles(DEFAULT_ARTICLES.filter((a) => !deletedIds.has(a.id)));
    }
  };

  // Sync live blog posts from Supabase on mount & listen to window updates
  useEffect(() => {
    loadLivePosts();

    const handleUpdate = () => loadLivePosts();
    window.addEventListener("blog-updated", handleUpdate);
    return () => window.removeEventListener("blog-updated", handleUpdate);
  }, []);

  const filtered = articles.filter((a) => {
    const matchesFilter = filter === "All" || a.status === filter;
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setErrorMessage("");
    setTitle("");
    setCategory("Cybersecurity");
    setReadTime("5 min read");
    setStatus("Published");
    setCoverImage("/images/blog/cybersecurity-tips.jpg");
    setCustomImageUrl("");
    setExcerpt("");
    setContent("");
    setShowModal(true);
  };

  const handleOpenEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setErrorMessage("");
    setTitle(post.title);
    setCategory(post.category);
    setReadTime(post.readTime);
    setStatus(post.status);
    setCoverImage(post.coverImage || "/images/blog/cybersecurity-tips.jpg");
    setCustomImageUrl(post.coverImage || "");
    setExcerpt(post.excerpt);
    setContent(post.content || "");
    setShowModal(true);
  };

  // Canvas-optimized file upload handler (Compresses large photos to ~100KB, preventing 413 payload errors)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Strict Extension & MIME Validation
    const fileName = file.name.toLowerCase();
    const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp"];
    const hasValidExtension = allowedExtensions.some((ext) => fileName.endsWith(ext));
    const allowedMimeTypes = ["image/png", "image/jpeg", "image/webp"];

    if (!hasValidExtension || !allowedMimeTypes.includes(file.type)) {
      alert("Please upload a standard raster image (.PNG, .JPG, or .WebP).");
      e.target.value = "";
      return;
    }

    // 2. High-performance canvas downscaling (max 1280px dimension)
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const srcUrl = loadEvt.target?.result;
      if (typeof srcUrl !== "string") return;

      const img = document.createElement("img");
      img.onload = () => {
        const MAX_DIM = 1280;
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;

        if (w > MAX_DIM || h > MAX_DIM) {
          if (w > h) {
            h = Math.round((h * MAX_DIM) / w);
            w = MAX_DIM;
          } else {
            w = Math.round((w * MAX_DIM) / h);
            h = MAX_DIM;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL("image/jpeg", 0.85);
          setCoverImage(compressed);
          setNotification(`✓ Image "${file.name}" optimized & loaded.`);
          setTimeout(() => setNotification(""), 3500);
        } else {
          setCoverImage(srcUrl);
        }
      };
      img.src = srcUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!excerpt.trim()) {
      setErrorMessage("Please provide a short excerpt (SEO summary).");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    const rawId =
      editingId ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const payload = {
      id: rawId,
      title: title.trim(),
      category,
      read_time: readTime,
      status,
      cover_image: coverImage,
      excerpt: excerpt.trim(),
      content: (content || excerpt).trim(),
    };

    const result = await createOrUpdateBlogPostInSupabase(payload as any);

    if (result.success) {
      // Un-delete from local deleted blacklist
      const currentDeleted = getDeletedBlogIds();
      if (currentDeleted.has(rawId)) {
        currentDeleted.delete(rawId);
        localStorage.setItem("tdd_deleted_blog_ids", JSON.stringify(Array.from(currentDeleted)));
      }

      setArticles((prev) => {
        const exists = prev.some((a) => a.id === rawId);
        if (exists) {
          return prev.map((a) =>
            a.id === rawId
              ? {
                  ...a,
                  title: payload.title,
                  category: payload.category,
                  readTime: payload.read_time,
                  status: payload.status as any,
                  coverImage: payload.cover_image,
                  excerpt: payload.excerpt,
                  content: payload.content,
                  date: a.date === "Draft" && payload.status === "Published" ? "Today" : a.date,
                }
              : a
          );
        } else {
          const newPost: BlogPost = {
            id: rawId,
            title: payload.title,
            category: payload.category,
            date: payload.status === "Published" ? "Just now" : "Draft",
            readTime: payload.read_time,
            status: payload.status as any,
            coverImage: payload.cover_image,
            excerpt: payload.excerpt,
            content: payload.content,
          };
          return [newPost, ...prev];
        }
      });

      setNotification(`✓ Article "${payload.title}" published & saved live to website!`);
      setShowModal(false);
      setTimeout(() => setNotification(""), 5000);
    } else {
      setErrorMessage(result.error || "Failed to save article to database.");
    }
    setIsSaving(false);
  };

  const [deleteModalPost, setDeleteModalPost] = useState<BlogPost | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  const handleConfirmDeletePost = async () => {
    if (!deleteModalPost) return;
    const { id, title: postTitle } = deleteModalPost;
    setIsDeletingPost(true);

    try {
      setArticles((prev) => prev.filter((a) => a.id !== id));
      await deleteBlogPostFromSupabase(id, postTitle);
      setNotification(`✓ Deleted article "${postTitle}" from CMS & live site.`);
      setDeleteModalPost(null);
      setTimeout(() => setNotification(""), 5000);
    } catch (err) {
      console.error("Delete article error:", err);
    } finally {
      setIsDeletingPost(false);
    }
  };

  const insertFormatting = (syntax: string) => {
    setContent((prev) => `${prev} ${syntax} `);
  };

  const insertImageTag = () => {
    const url = prompt("Enter the image URL to insert into the article body:", "https://");
    if (url && url.trim() !== "https://") {
      const alt = prompt("Enter a short description (Alt text) for this image:", "Article diagram") || "Diagram";
      setContent((prev) => `${prev}\n\n![${alt}](${url})\n\n`);
    }
  };

  return (
    <AdminLayoutShell
      title="Blog Publishing &amp; Content CMS"
      subtitle="Draft, schedule, and publish educational articles directly to your public website (/blog)"
      actions={
        <div className="flex items-center gap-3">
          <Link
            href="/blog"
            target="_blank"
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-2xs"
          >
            <span>Live Blog</span>
            <span>↗</span>
          </Link>
          <button
            onClick={handleOpenCreate}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            <span>+ Write New Article</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6 text-xs">
        
        {/* TOAST ALERT */}
        {notification && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-bold text-emerald-800 flex items-center justify-between shadow-2xs">
            <span>✓ {notification}</span>
            <button onClick={() => setNotification("")} className="text-emerald-600 hover:text-emerald-900">✕</button>
          </div>
        )}

        {/* METRICS & QUICK STATS */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Published</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {articles.filter((a) => a.status === "Published").length}
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold">Live Articles</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Drafts in Progress</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600">
                {articles.filter((a) => a.status === "Draft").length}
              </span>
              <span className="text-[11px] text-slate-500">Pending Review</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Top Category</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-600">Cybersecurity</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SEO Organic Reach</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700">14.8k</span>
              <span className="text-[11px] text-slate-500">Monthly Views</span>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <input
            type="text"
            placeholder="Search articles by title, topic, or summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-96 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-900 outline-none focus:bg-white focus:border-blue-500 text-xs transition"
          />

          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200">
            {(["All", "Published", "Draft"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`rounded-lg px-3 py-1.5 font-bold transition text-xs cursor-pointer ${
                  filter === tab
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 font-medium"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ARTICLES MASTER TABLE */}
        <div className="rounded-3xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Article Headline</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Read Time</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {art.coverImage && (
                          <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={art.coverImage}
                              alt={art.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <p
                            className="font-bold text-slate-900 text-sm hover:text-blue-600 transition cursor-pointer"
                            onClick={() => handleOpenEdit(art)}
                          >
                            {art.title}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate max-w-lg mt-0.5">{art.excerpt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-md bg-blue-50 border border-blue-200 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                        {art.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{art.readTime}</td>
                    <td className="px-5 py-4 text-slate-500">{art.date}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          art.status === "Published"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {art.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(art)}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-white hover:border-blue-300 shadow-2xs transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <Link
                          href="/blog"
                          target="_blank"
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-white shadow-2xs transition"
                        >
                          View Live ↗
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteModalPost(art)}
                          className="rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer shadow-2xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FULL PROFESSIONAL ARTICLE & IMAGE EDITOR MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs text-xs overflow-y-auto">
            <div className="w-full max-w-3xl my-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl text-slate-900">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingId ? "Edit Blog Article" : "Write & Publish New Article"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Syncs directly with The Data Dot public website at <code className="text-blue-600 font-semibold">/blog</code>
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveArticle} className="space-y-4">
                {errorMessage && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 font-semibold text-rose-800 flex items-center justify-between">
                    <span>⚠ {errorMessage}</span>
                    <button type="button" onClick={() => setErrorMessage("")} className="text-rose-600">✕</button>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Article Headline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 Warning Signs of Hard Drive Spindle & Head Degradation"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 outline-none focus:bg-white focus:border-blue-500 text-sm font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                    >
                      <option>Cybersecurity</option>
                      <option>Data Recovery</option>
                      <option>Cloud Solutions</option>
                      <option>Managed IT</option>
                      <option>Backup &amp; Recovery</option>
                      <option>Network Architecture</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Reading Time</label>
                    <input
                      type="text"
                      value={readTime}
                      onChange={(e) => setReadTime(e.target.value)}
                      placeholder="e.g. 5 min read"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Publication Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as "Published" | "Draft")}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                    >
                      <option value="Published">Published Live</option>
                      <option value="Draft">Save as Draft</option>
                    </select>
                  </div>
                </div>

                {/* ================= COMPLETE IMAGE UPLOADER & PREVIEW SECTION ================= */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-800">
                      Featured Cover Image
                    </label>
                    
                    {/* Switcher: Upload vs URL */}
                    <div className="flex items-center gap-1 rounded-lg bg-slate-200/70 p-1 border border-slate-300/60">
                      <button
                        type="button"
                        onClick={() => setImageInputMode("upload")}
                        className={`rounded px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                          imageInputMode === "upload"
                            ? "bg-white text-slate-900 shadow-2xs font-bold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Upload From Computer
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMode("url")}
                        className={`rounded px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                          imageInputMode === "url"
                            ? "bg-white text-slate-900 shadow-2xs font-bold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Enter Image URL / Preset
                      </button>
                    </div>
                  </div>

                  {/* Mode 1: Real File Upload from Computer */}
                  {imageInputMode === "upload" && (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center transition hover:border-blue-500">
                      <input
                        type="file"
                        id="blog-image-upload"
                        accept="image/png, image/jpeg, image/webp, image/svg+xml"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="blog-image-upload"
                        className="cursor-pointer inline-flex flex-col items-center justify-center gap-2"
                      >
                        <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-slate-900 hover:text-blue-600 transition">
                          Click to Browse &amp; Upload Image from Your Device
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Supports PNG, JPG, WebP, SVG up to 10MB (automatically formatted for blog cards)
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Mode 2: Custom URL or Library Preset */}
                  {imageInputMode === "url" && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Paste image web URL: https://example.com/banner.jpg"
                        value={customImageUrl}
                        onChange={(e) => {
                          setCustomImageUrl(e.target.value);
                          if (e.target.value.trim()) {
                            setCoverImage(e.target.value.trim());
                          }
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-blue-500 text-xs"
                      />
                      
                      <div className="flex flex-wrap items-center gap-2 text-[10px]">
                        <span className="text-slate-500">Or pick stock library preset:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCoverImage("/images/blog/cybersecurity-tips.jpg");
                            setCustomImageUrl("/images/blog/cybersecurity-tips.jpg");
                          }}
                          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-700 hover:text-blue-600 shadow-2xs cursor-pointer"
                        >
                          Cybersecurity Shield
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCoverImage("/images/blog/cloud-solutions.jpg");
                            setCustomImageUrl("/images/blog/cloud-solutions.jpg");
                          }}
                          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-700 hover:text-blue-600 shadow-2xs cursor-pointer"
                        >
                          Cloud Data Center
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCoverImage("/images/blog/it-partner.jpg");
                            setCustomImageUrl("/images/blog/it-partner.jpg");
                          }}
                          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-700 hover:text-blue-600 shadow-2xs cursor-pointer"
                        >
                          Team IT Consultation
                        </button>
                      </div>
                    </div>
                  )}

                  {/* LIVE COVER IMAGE PREVIEW */}
                  {coverImage && (
                    <div className="mt-3 flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
                      <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={coverImage}
                          alt="Cover preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                          ✓ Active Cover Image Preview
                        </span>
                        <p className="text-[11px] text-slate-700 truncate max-w-sm font-medium">
                          {coverImage.startsWith("data:") ? "Custom Image Uploaded (Base64)" : coverImage}
                        </p>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Displays in 16:9 ratio across /blog cards and social sharing previews.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Article Excerpt (SEO Summary)</label>
                  <input
                    type="text"
                    required
                    placeholder="Short 1-2 sentence hook displayed on social media previews and search cards..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>

                {/* RICH FORMATTING TOOLBAR WITH IMAGE INSERTION */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Full Article Content</label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => insertFormatting("**bold text**")}
                        className="rounded px-2 py-0.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 font-bold cursor-pointer"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("*italic text*")}
                        className="rounded px-2 py-0.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 italic cursor-pointer"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("## Section Header")}
                        className="rounded px-2 py-0.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 font-mono text-[10px] cursor-pointer"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("- Key takeaway item")}
                        className="rounded px-2 py-0.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer"
                      >
                        List
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("> Important cleanroom advisory notice")}
                        className="rounded px-2 py-0.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer"
                      >
                        Quote
                      </button>
                      <button
                        type="button"
                        onClick={insertImageTag}
                        className="rounded px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-semibold cursor-pointer shadow-2xs"
                      >
                        + Add In-Article Image
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={8}
                    placeholder="Compose your article markdown or paragraphs here... You can insert images anywhere using the button above."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-slate-900 outline-none focus:bg-white focus:border-blue-500 leading-relaxed font-mono text-xs"
                  />
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Markdown formatting supported.</span>
                    <span>{content.length} characters</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => setShowModal(false)}
                    className="rounded-xl px-4 py-2.5 text-slate-600 hover:text-slate-900 transition disabled:opacity-50 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white hover:bg-blue-500 transition shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {isSaving && (
                      <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    )}
                    <span>
                      {isSaving
                        ? "Publishing to Website..."
                        : editingId
                        ? "Save Article Changes →"
                        : "Publish Live to Website →"}
                    </span>
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* MODERN DELETE MODAL */}
        <ModernDeleteModal
          isOpen={!!deleteModalPost}
          onClose={() => setDeleteModalPost(null)}
          onConfirm={handleConfirmDeletePost}
          title="Delete Blog Article"
          itemType="Article"
          itemName={deleteModalPost ? deleteModalPost.title : ""}
          description={
            deleteModalPost
              ? `Are you sure you want to permanently delete the article "${deleteModalPost.title}"? This will remove it from the CMS and the live public website immediately.`
              : ""
          }
          confirmButtonText="Permanently Delete Article"
          isDeleting={isDeletingPost}
        />
      </div>
    </AdminLayoutShell>
  );
}
