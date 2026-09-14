"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AboutPage() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8fbff] text-[#071426]">
      {/* HEADER */}
      <Header />

      {/* ================= HERO SECTION (MATCHING PANEL 2 OF REFERENCE) ================= */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/80">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-blue-100/60 blur-[140px]" />
        <div className="pointer-events-none absolute -left-40 top-1/2 h-[450px] w-[450px] rounded-full bg-sky-50 blur-[130px]" />

        <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* LEFT COLUMN: HERO TEXT */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span>People. Solutions. A More Secure Tomorrow.</span>
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[42px] text-[#071426] leading-tight">
                About The Data Dot
              </h1>

              <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg">
                We are a dedicated IT support and cybersecurity company helping
                businesses stay secure, productive, and future-ready with reliable
                technology solutions.
              </p>

              <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base">
                From fast 24/7 help desk support to cloud management and proactive
                threat defense, our team takes the stress out of IT so you can focus
                on growing your business.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 hover:shadow-xl"
                >
                  <span>Schedule an IT Consultation</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                  >
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>

                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-blue-600"
                >
                  <span>Explore Our Services</span>
                </Link>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: HERO TEAM IMAGE */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-slate-200/90 bg-slate-900 shadow-2xl shadow-blue-900/10">
                <Image
                  src="/images/about/team-consulting.jpg"
                  alt="The Data Dot team collaborating in modern IT office"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-transparent" />
              </div>

              {/* FLOATING TRUST STAT BADGE */}
              <div className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xl backdrop-blur-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Uptime Reliability
                  </p>
                  <p className="text-base font-bold text-[#071426]">
                    99.9% Monitored 24/7
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= THREE PILLARS (MISSION, VISION, VALUES) ================= */}
      <section className="relative py-20 px-6 bg-slate-50/60 border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            {/* PILLAR 1: OUR MISSION */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="flex flex-col items-center text-center rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/10"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100 shadow-inner">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3 className="mt-5 text-xl font-bold text-[#071426]">
                Our Mission
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                To deliver reliable, secure, and innovative IT solutions that keep
                businesses running without interruptions.
              </p>
            </motion.div>

            {/* PILLAR 2: OUR VISION */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="flex flex-col items-center text-center rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/10"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100 shadow-inner">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
              </div>
              <h3 className="mt-5 text-xl font-bold text-[#071426]">
                Our Vision
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                To be a trusted global IT partner, empowering businesses with
                frictionless technology and modern cloud infrastructure.
              </p>
            </motion.div>

            {/* PILLAR 3: OUR VALUES */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="flex flex-col items-center text-center rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/10"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100 shadow-inner">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <h3 className="mt-5 text-xl font-bold text-[#071426]">
                Our Values
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Integrity. Security. Customer Success. We measure our achievements
                by how reliably your business operates.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= LOWER SECTION: OUR STORY & VIDEO PREVIEW (MATCHING PANEL 2) ================= */}
      <section className="py-20 px-6 bg-white border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* LEFT: STORY TEXT & CTA */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span>Our Heritage & Purpose</span>
              </div>

              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl text-[#071426]">
                Our Story
              </h2>

              <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600">
                <p>
                  The Data Dot was founded with a simple goal — to make technology
                  work for people, not against them. With years of experience in IT
                  support and infrastructure, we now support businesses across
                  multiple industries and locations.
                </p>
                <p>
                  We recognized that most business owners and office managers were tired
                  of slow help desks, unexpected downtime, and complicated technical
                  jargon. We built a partner-first model focused on clear communication,
                  fast 15-minute response times, and bulletproof security.
                </p>
                <p>
                  Today, we proactively manage systems so that problems are solved
                  before they ever impact your daily work.
                </p>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 hover:shadow-xl"
                >
                  <span>Learn More About Us</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                  >
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            </motion.div>

            {/* RIGHT: VIDEO PREVIEW CARD WITH PLAY OVERLAY */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div
                onClick={() => setIsVideoModalOpen(true)}
                className="group relative aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-3xl border border-slate-200/90 bg-slate-900 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-blue-400"
              >
                {/* PHOTO */}
                <Image
                  src="/images/about/story-preview.jpg"
                  alt="Watch Our Story Preview"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent transition duration-300 group-hover:from-slate-950/90" />

                {/* CENTRAL PLAY BUTTON WITH GLOW */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white text-blue-600 shadow-2xl transition duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">
                    <div className="absolute inset-0 rounded-full bg-white/40 animate-ping opacity-75" />
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="relative ml-1"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </div>

                {/* BOTTOM CAPTION */}
                <div className="absolute bottom-5 left-6 right-6 text-center">
                  <span className="text-sm font-bold text-white drop-shadow-md transition group-hover:text-blue-200">
                    Watch Our Story (2 Min Overview)
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= VIDEO MODAL ================= */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setIsVideoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-[#071426] p-8 text-white shadow-2xl border border-blue-500/30"
            >
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-slate-300 transition hover:bg-white/20 hover:text-white"
                aria-label="Close modal"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  The Data Dot Overview
                </span>
              </div>

              <h3 className="mt-3 text-2xl font-bold">Making Technology Work For People</h3>
              <p className="mt-2 text-sm text-slate-300">
                A brief look into our mission, responsive help desk, and proactive cybersecurity architecture.
              </p>

              <div className="mt-6 aspect-video w-full rounded-2xl bg-slate-900 flex flex-col items-center justify-center border border-slate-800 p-6 text-center">
                <div className="h-16 w-16 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center mb-3">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white">Full Video Presentation Ready</h4>
                <p className="text-xs text-slate-400 max-w-md mt-1">
                  Connect with our technical director for a customized walkthrough and demonstration for your organization.
                </p>
                <Link
                  href="/contact"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="mt-5 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-blue-500"
                >
                  Schedule Live Walkthrough
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= READY TO GET STARTED GLOBAL BANNER ================= */}
      <section className="bg-white py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071426] via-[#092244] to-[#071426] p-8 sm:p-12 lg:p-16 text-white shadow-2xl">
            <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-600/20 blur-[100px]" />

            <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl text-white">
                    Ready to Get Started?
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                    Let&apos;s build a more secure and productive future together.
                    Speak with an IT specialist today.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 hover:shadow-xl"
                >
                  <span>Get a Free Consultation</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                  >
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </main>
  );
}