import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between antialiased selection:bg-blue-600 selection:text-white">
      <Header />

      <main className="flex-1 flex items-center justify-center py-20 px-6">
        <div className="mx-auto max-w-xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
            <span>Error 404 &bull; Page Not Found</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950">
            Looking for something?
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-md mx-auto">
            The page you requested may have moved or been updated during our recent platform upgrade. Let&apos;s get you back on track.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-blue-700 transition"
            >
              Return to Homepage
            </Link>
            <Link
              href="/services"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition"
            >
              View IT Services
            </Link>
            <Link
              href="/data-recovery"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition"
            >
              Data Recovery Lab
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition"
            >
              Contact Support
            </Link>
          </div>

          <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs text-left max-w-md mx-auto">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Need Direct Assistance?
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              If you were looking for an active service case or emergency recovery ticket, call our 24/7 hotline directly at{" "}
              <a href="tel:+916380488373" className="font-bold text-blue-600 hover:underline">
                +91 6380488373
              </a>{" "}
              or email{" "}
              <a href="mailto:support@thedatadot.com" className="font-bold text-blue-600 hover:underline">
                support@thedatadot.com
              </a>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
