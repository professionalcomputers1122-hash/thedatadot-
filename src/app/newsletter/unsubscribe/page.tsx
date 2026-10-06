"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const [email, setEmail] = useState(emailParam);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(searchParams.get("status") === "success");
  const [error, setError] = useState("");

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
      } else {
        setError(data.error || "Unable to process request. Please try again.");
      }
    } catch {
      setError("Service temporarily unavailable. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm text-center">
      {done ? (
        <div className="space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
              <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            You Have Been Unsubscribed
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed">
            {email ? (
              <>
                <strong>{email}</strong> has been removed from The Data Dot Technical Advisory Digest. You will no longer receive periodic technical updates or newsletters.
              </>
            ) : (
              "Your email has been removed from our mailing list. You will no longer receive periodic technical updates."
            )}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition"
            >
              Return to Homepage
            </Link>
            <Link
              href="/blog"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-100 transition"
            >
              Read Articles
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUnsubscribe} className="space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Unsubscribe from Technical Digest
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Enter your email address to opt out of future technical advisories and updates.
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email address"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20"
              required
              disabled={loading}
            />

            {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Processing..." : "Confirm Unsubscribe"}
            </button>
          </div>

          <div className="pt-2">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-800 transition">
              ← Nevermind, keep my subscription active
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between antialiased">
      <Header />

      <section className="flex-1 flex items-center justify-center py-20 px-6">
        <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}>
          <UnsubscribeContent />
        </Suspense>
      </section>

      <Footer />
    </main>
  );
}
