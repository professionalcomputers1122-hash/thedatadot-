"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export interface CookiePreferences {
  necessary: true; // Always true
  analytics: boolean; // Default false
  marketing: boolean; // Default false
  timestamp: string;
}

const STORAGE_KEY = "tdd_cookie_consent";

export default function CookieConsentBanner() {
  const [hasMounted, setHasMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Preference state: Necessary is ALWAYS true, Analytics & Marketing default to false
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: CookiePreferences = JSON.parse(saved);
        setAnalyticsConsent(Boolean(parsed.analytics));
        setMarketingConsent(Boolean(parsed.marketing));
        setIsVisible(false);
      } else {
        // Show banner if no consent has been logged
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }

    // Listen for custom event to re-open preferences (e.g. from footer)
    const handleOpenPreferences = () => {
      setShowModal(true);
    };

    window.addEventListener("open_cookie_preferences", handleOpenPreferences);
    return () => {
      window.removeEventListener("open_cookie_preferences", handleOpenPreferences);
    };
  }, []);

  const saveConsent = (analytics: boolean, marketing: boolean) => {
    const preferences: CookiePreferences = {
      necessary: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      // Dispatch event for analytics listeners
      window.dispatchEvent(
        new CustomEvent("tdd_cookie_consent_updated", { detail: preferences })
      );
    } catch (e) {
      console.warn("Unable to save cookie consent:", e);
    }

    setAnalyticsConsent(analytics);
    setMarketingConsent(marketing);
    setIsVisible(false);
    setShowModal(false);
  };

  const handleAcceptAll = () => {
    saveConsent(true, true);
  };

  const handleRejectNonEssential = () => {
    // Only Necessary ON, Analytics OFF, Marketing OFF
    saveConsent(false, false);
  };

  const handleSaveCustom = () => {
    saveConsent(analyticsConsent, marketingConsent);
  };

  if (!hasMounted) return null;

  return (
    <>
      {/* ================= FLOATING COOKIE CONSENT BANNER ================= */}
      {isVisible && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent banner"
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-5xl rounded-2xl border border-slate-700/80 bg-slate-900/95 p-5 sm:p-6 shadow-2xl shadow-blue-950/50 backdrop-blur-xl transition-all"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            
            {/* TEXT DESCRIPTION */}
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400">
                  Cookie &amp; Privacy Choices
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                We use strictly necessary cookies to ensure secure portal logins and core service functionality (Always <strong>ON</strong>). 
                With your consent, we also use optional cookies for performance telemetry and service relevance (Default <strong>OFF</strong>). 
                Learn more in our{" "}
                <Link href="/policies" className="text-blue-400 underline hover:text-blue-300">
                  Cookie Policy
                </Link>.
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center gap-2.5 sm:shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:border-slate-500 hover:text-white transition active:scale-[0.98]"
              >
                Customize
              </button>

              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:border-slate-500 hover:text-white transition active:scale-[0.98]"
              >
                Reject Non-Essential
              </button>

              <button
                type="button"
                onClick={handleAcceptAll}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition active:scale-[0.98]"
              >
                Accept All
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= CUSTOMIZE PREFERENCES MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-xl rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-8 text-white shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Privacy &amp; Cookie Preferences</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure which categories of cookies you permit on this device.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Cookie Categories */}
            <div className="mt-6 space-y-4 text-xs">
              
              {/* 1. NECESSARY: ALWAYS ON */}
              <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-sm">Strictly Necessary</span>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400 border border-emerald-500/30">
                      ALWAYS ON
                    </span>
                  </div>
                  {/* Disabled toggle indicating permanent locked ON state */}
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600 opacity-80 cursor-not-allowed">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </div>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Essential for secure client authentication, cross-site request forgery (CSRF) protection, load balancing, and session continuity. These cannot be switched off.
                </p>
              </div>

              {/* 2. ANALYTICS: DEFAULT OFF -> CONSENT */}
              <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-sm">Performance &amp; Analytics</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold border ${
                      analyticsConsent
                        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        : "bg-slate-700/50 text-slate-400 border-slate-700"
                    }`}>
                      {analyticsConsent ? "CONSENTED" : "OFF"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAnalyticsConsent(!analyticsConsent)}
                    aria-pressed={analyticsConsent}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      analyticsConsent ? "bg-blue-600" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        analyticsConsent ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Collects aggregated, anonymous telemetry regarding page performance, latency, and navigation flow to help our engineers optimize workstation load times.
                </p>
              </div>

              {/* 3. MARKETING: DEFAULT OFF -> CONSENT */}
              <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-sm">Targeting &amp; Marketing</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold border ${
                      marketingConsent
                        ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                        : "bg-slate-700/50 text-slate-400 border-slate-700"
                    }`}>
                      {marketingConsent ? "CONSENTED" : "OFF"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMarketingConsent(!marketingConsent)}
                    aria-pressed={marketingConsent}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      marketingConsent ? "bg-indigo-600" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        marketingConsent ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Enables campaign referral attribution and ensures enterprise service announcements presented are relevant to your organization&apos;s industry vertical.
                </p>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="text-xs text-slate-400 hover:text-white transition"
              >
                Reject All Non-Essential
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition active:scale-[0.98]"
                >
                  Save My Preferences
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
