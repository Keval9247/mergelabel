"use client";

import dynamic from "next/dynamic";

const LabelGenerator = dynamic(() => import("@/components/LabelGenerator"), {
  ssr: false,
  loading: () => (
    <div className="border-t border-[var(--border)] py-10 text-center">
      <p className="text-sm text-[var(--muted)]">Loading generator…</p>
    </div>
  ),
});

export default function Home() {
  return (
    <div className="relative min-h-full bg-[var(--page-bg)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,_var(--hero-wash)_0%,_transparent_70%)]"
      />
      <div className="relative mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-8 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Generate labels
          </h1>
          <p className="text-sm text-[var(--muted)]">
            1 Select store · 2 Upload PDFs · 3 Download
          </p>
        </header>

        <LabelGenerator />
      </div>
    </div>
  );
}
