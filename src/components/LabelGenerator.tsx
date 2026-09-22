"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CtaDesign } from "@/lib/cta-design";
import { notify } from "@/lib/toast";
import FileDropzone from "./FileDropzone";

export type Store = {
  _id: string;
  name: string;
  brandName: string;
  ctaUrl: string;
  ctaText: string;
  isDefault: boolean;
  platform: string;
  design?: Partial<CtaDesign>;
};

type LoadState = "idle" | "loading" | "ready" | "error";
type GenerateState = "idle" | "working" | "done" | "error";

const DEFAULT_CTA_URL = "https://www.meesho.com/GREENBHARATENTERPRISE";

function downloadPdf(bytes: Uint8Array, filename: string) {
  const copy = new Uint8Array(bytes);
  const blob = new Blob([copy], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function StepHeading({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]"
        >
          {step}
        </span>
        <h2 className="text-sm font-semibold text-[var(--foreground)]">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

export default function LabelGenerator() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string>("");
  const [brandOverride, setBrandOverride] = useState("");
  const [ctaUrlOverride, setCtaUrlOverride] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [generateState, setGenerateState] = useState<GenerateState>("idle");
  const [generateError, setGenerateError] = useState<string | null>(null);

  const selectedStore = useMemo(
    () => stores.find((s) => s._id === selectedId) ?? null,
    [stores, selectedId],
  );

  const applyStoreDefaults = useCallback((store: Store | null) => {
    if (!store) {
      setBrandOverride("");
      setCtaUrlOverride(DEFAULT_CTA_URL);
      return;
    }
    setBrandOverride(store.brandName);
    setCtaUrlOverride(store.ctaUrl || DEFAULT_CTA_URL);
  }, []);

  const fetchStores = useCallback(async () => {
    setLoadState("loading");
    setLoadError(null);
    try {
      const res = await fetch("/api/stores");
      const data = (await res.json()) as
        | Store[]
        | { stores?: Store[]; error?: string };
      if (!res.ok) {
        const detail =
          !Array.isArray(data) && data.error
            ? data.error
            : `Could not load stores (${res.status})`;
        throw new Error(detail);
      }
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.stores)
          ? data.stores
          : [];
      setStores(list);

      const preferred = list.find((s) => s.isDefault) ?? list[0] ?? null;
      setSelectedId(preferred?._id ?? "");
      applyStoreDefaults(preferred);
      setLoadState("ready");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load stores";
      setLoadState("error");
      setLoadError(message);
      notify.error("Could not load stores", message);
    }
  }, [applyStoreDefaults]);

  useEffect(() => {
    void fetchStores();
  }, [fetchStores]);

  const onStoreChange = (id: string) => {
    setSelectedId(id);
    const store = stores.find((s) => s._id === id) ?? null;
    applyStoreDefaults(store);
    setGenerateState("idle");
    setGenerateError(null);
  };

  const canGenerate =
    !!selectedStore &&
    files.length > 0 &&
    brandOverride.trim().length > 0 &&
    ctaUrlOverride.trim().length > 0 &&
    generateState !== "working";

  const handleGenerate = async () => {
    if (!selectedStore || !canGenerate) return;

    setGenerateState("working");
    setGenerateError(null);
    const loadingId = notify.loading("Generating merged PDF…");

    try {
      // Load heavy pdf-lib / qrcode only when generating (keeps first paint small).
      const [{ stampAndMergePdfs }, buffers] = await Promise.all([
        import("@/lib/pdf/ctaStamp"),
        Promise.all(files.map((f) => f.arrayBuffer())),
      ]);
      const merged = await stampAndMergePdfs(buffers, {
        brandName: brandOverride.trim(),
        ctaUrl: ctaUrlOverride.trim(),
        ctaText: selectedStore.ctaText,
        design: selectedStore.design,
      });

      downloadPdf(merged, "merged-labels-cta.pdf");
      notify.dismiss(loadingId);
      notify.success("Merged PDF downloaded");
      setGenerateState("done");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate merged PDF";
      notify.dismiss(loadingId);
      notify.error("Generate failed", message);
      setGenerateState("error");
      setGenerateError(message);
    }
  };

  if (loadState === "loading") {
    return (
      <div className="border-t border-[var(--border)] py-10 text-center">
        <p className="text-sm text-[var(--muted)]">Loading stores…</p>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="rounded-md border border-[var(--danger-border)] bg-[var(--danger-soft)] px-5 py-8 text-center">
        <p className="font-medium text-[var(--danger)]">Could not load stores</p>
        <p className="mt-1 text-sm text-[var(--muted)]">{loadError}</p>
        <button
          type="button"
          onClick={() => void fetchStores()}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-[var(--accent)] px-4 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          Retry
        </button>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-5 py-12 text-center">
        <p className="text-base font-semibold text-[var(--foreground)]">
          No stores yet
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
          Add a store with brand name and CTA link before merging shipping
          labels.
        </p>
        <Link
          href="/settings"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-[var(--accent)] px-5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          Go to Settings
        </Link>
      </div>
    );
  }

  const working = generateState === "working";

  return (
    <div className="space-y-0">
      {/* Step 1 — Store */}
      <section className="border-t border-[var(--border)] py-6">
        <StepHeading step={1} title="Store">
          <Link
            href="/settings"
            className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Manage stores
          </Link>
        </StepHeading>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="store-select"
              className="block text-sm font-medium text-[var(--foreground)]"
            >
              Select store
            </label>
            <select
              id="store-select"
              value={selectedId}
              onChange={(e) => onStoreChange(e.target.value)}
              disabled={working}
              className="h-11 w-full max-w-md rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)] disabled:opacity-60"
            >
              {stores.map((store) => (
                <option key={store._id} value={store._id}>
                  {store.name}
                  {store.platform ? ` · ${store.platform}` : ""}
                  {store.isDefault ? " (default)" : ""}
                </option>
              ))}
            </select>
          </div>

          {selectedStore && (
            <>
              <div className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  CTA preview
                </p>
                <p className="mt-1 text-sm text-[var(--foreground)]">
                  {selectedStore.ctaText?.trim()
                    ? selectedStore.ctaText
                    : "No CTA text set for this store"}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="brand-override"
                    className="block text-sm font-medium text-[var(--foreground)]"
                  >
                    Brand name
                    <span className="ml-1 font-normal text-[var(--muted)]">
                      (this run only)
                    </span>
                  </label>
                  <input
                    id="brand-override"
                    type="text"
                    value={brandOverride}
                    onChange={(e) => setBrandOverride(e.target.value)}
                    placeholder={selectedStore.brandName}
                    disabled={working}
                    className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)] disabled:opacity-60"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="cta-url-override"
                    className="block text-sm font-medium text-[var(--foreground)]"
                  >
                    CTA URL
                    <span className="ml-1 font-normal text-[var(--muted)]">
                      (this run only)
                    </span>
                  </label>
                  <input
                    id="cta-url-override"
                    type="url"
                    value={ctaUrlOverride}
                    onChange={(e) => setCtaUrlOverride(e.target.value)}
                    placeholder={DEFAULT_CTA_URL}
                    disabled={working}
                    className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)] disabled:opacity-60"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Step 2 — Uploads */}
      <section className="border-t border-[var(--border)] py-6">
        <StepHeading step={2} title="Uploads" />
        <FileDropzone
          files={files}
          onFilesChange={(next) => {
            setFiles(next);
            setGenerateState("idle");
            setGenerateError(null);
          }}
          onFilesAdded={(count) => {
            notify.info(
              `${count} PDF${count === 1 ? "" : "s"} added`,
            );
          }}
          disabled={working}
        />
      </section>

      {/* Step 3 — Generate */}
      <section className="border-t border-[var(--border)] py-6">
        <StepHeading step={3} title="Generate" />

        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={!canGenerate}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:min-w-[220px]"
        >
          {working ? (
            <>
              <span
                aria-hidden
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
              Generating…
            </>
          ) : (
            "Generate merged PDF"
          )}
        </button>

        {generateError && (
          <p className="mt-3 text-sm text-[var(--danger)]" role="alert">
            {generateError}
          </p>
        )}

        {!canGenerate && !working && (
          <p className="mt-3 text-sm text-[var(--muted)]">
            {!selectedStore
              ? "Select a store to continue."
              : files.length === 0
                ? "Add at least one label PDF."
                : !brandOverride.trim() || !ctaUrlOverride.trim()
                  ? "Brand name and CTA URL are required for this run."
                  : null}
          </p>
        )}
      </section>
    </div>
  );
}
