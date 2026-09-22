"use client";

import { useCallback, useEffect, useState } from "react";
import CtaDesignEditor from "@/components/CtaDesignEditor";
import StoreForm, {
  emptyStoreForm,
  type StoreFormValues,
} from "@/components/StoreForm";
import type { CtaDesign } from "@/lib/cta-design";
import type { StorePlatform } from "@/lib/store-constants";
import { notify } from "@/lib/toast";

type Store = {
  _id: string;
  name: string;
  brandName: string;
  ctaUrl: string;
  ctaText: string;
  platform?: StorePlatform;
  isDefault: boolean;
  design?: Partial<CtaDesign> | null;
};

function truncateUrl(url: string, max = 48): string {
  if (url.length <= max) return url;
  return `${url.slice(0, max - 1)}…`;
}

function StoreIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M8 18h32l-2.5 22H10.5L8 18Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M6 18 10 8h28l4 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 26v8M30 26v8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy aria-label="Loading stores">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1 space-y-2.5">
              <div className="flex gap-2">
                <div className="h-4 w-32 rounded bg-[var(--surface-muted)]" />
                <div className="h-4 w-14 rounded bg-[var(--surface-muted)]" />
              </div>
              <div className="h-3 w-40 rounded bg-[var(--surface-muted)]" />
              <div className="h-3 w-56 max-w-full rounded bg-[var(--surface-muted)]" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-16 rounded-md bg-[var(--surface-muted)]" />
              <div className="h-9 w-20 rounded-md bg-[var(--surface-muted)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const actionBtn =
  "inline-flex h-9 flex-1 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none";

export default function SettingsPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [designingId, setDesigningId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch("/api/stores");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load stores");
      }
      setStores(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load stores";
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const designingStore = designingId
    ? stores.find((s) => s._id === designingId)
    : undefined;

  async function createStore(values: StoreFormValues) {
    setBusy(true);
    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create store");
      }
      setShowAdd(false);
      notify.success("Store created", values.name);
      await load();
    } catch (err) {
      notify.error(
        err instanceof Error ? err.message : "Failed to create store",
      );
    } finally {
      setBusy(false);
    }
  }

  async function updateStore(id: string, values: StoreFormValues) {
    setBusy(true);
    try {
      const existing = stores.find((s) => s._id === id);
      const res = await fetch(`/api/stores/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          ...(existing?.design ? { design: existing.design } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update store");
      }
      setEditingId(null);
      notify.success("Store updated", values.name);
      await load();
    } catch (err) {
      notify.error(
        err instanceof Error ? err.message : "Failed to update store",
      );
    } finally {
      setBusy(false);
    }
  }

  async function saveDesign(id: string, design: CtaDesign) {
    const store = stores.find((s) => s._id === id);
    if (!store) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/stores/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: store.name,
          brandName: store.brandName,
          ctaUrl: store.ctaUrl,
          ctaText: store.ctaText,
          platform: store.platform ?? "",
          isDefault: store.isDefault,
          design,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save design");
      }
      setDesigningId(null);
      notify.success("Design saved", store.name);
      await load();
    } catch (err) {
      notify.error(
        err instanceof Error ? err.message : "Failed to save design",
      );
    } finally {
      setBusy(false);
    }
  }

  async function deleteStore(id: string, name: string) {
    if (!window.confirm(`Delete store “${name}”? This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/stores/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete store");
      }
      if (editingId === id) setEditingId(null);
      if (designingId === id) setDesigningId(null);
      notify.success("Store deleted", name);
      await load();
    } catch (err) {
      notify.error(
        err instanceof Error ? err.message : "Failed to delete store",
      );
    } finally {
      setBusy(false);
    }
  }

  async function setDefault(id: string) {
    const store = stores.find((s) => s._id === id);
    if (!store || store.isDefault) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/stores/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: store.name,
          brandName: store.brandName,
          ctaUrl: store.ctaUrl,
          ctaText: store.ctaText,
          platform: store.platform ?? "",
          isDefault: true,
          ...(store.design ? { design: store.design } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to set default store");
      }
      notify.success("Default store updated", store.name);
      await load();
    } catch (err) {
      notify.error(
        err instanceof Error ? err.message : "Failed to set default store",
      );
    } finally {
      setBusy(false);
    }
  }

  function openAdd() {
    setShowAdd(true);
    setEditingId(null);
    setDesigningId(null);
  }

  function openDesign(id: string) {
    setDesigningId(id);
    setEditingId(null);
    setShowAdd(false);
  }

  const designPanelOpen = Boolean(designingStore);

  return (
    <div className="min-h-full flex-1 bg-[var(--page-bg)]">
      <div
        className={`mx-auto w-full px-4 py-8 sm:px-6 sm:py-10 ${
          designPanelOpen ? "max-w-6xl" : "max-w-3xl"
        }`}
      >
        <header className="mb-8 flex flex-col gap-4 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">
              Step 1 · Configure stores
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              Stores
            </h1>
            <p className="max-w-md text-sm text-[var(--muted)]">
              Manage brand names, CTA links, and the default store used when
              generating labels.
            </p>
          </div>
          {!showAdd && !designPanelOpen && !loading ? (
            <button
              type="button"
              disabled={busy}
              onClick={openAdd}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-[var(--accent)] px-4 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add store
            </button>
          ) : null}
        </header>

        {loadError ? (
          <div
            role="alert"
            className="mb-6 rounded-md border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
          >
            {loadError}
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                void load();
              }}
              className="ml-3 font-medium underline-offset-2 hover:underline"
            >
              Retry
            </button>
          </div>
        ) : null}

        {designingStore ? (
          <CtaDesignEditor
            key={designingStore._id}
            brandName={designingStore.brandName}
            ctaText={designingStore.ctaText}
            ctaUrl={designingStore.ctaUrl}
            initialDesign={designingStore.design}
            busy={busy}
            onSave={(design) => saveDesign(designingStore._id, design)}
            onCancel={() => setDesigningId(null)}
          />
        ) : (
          <>
            {showAdd ? (
              <section className="mb-8 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                <h2 className="mb-1 text-base font-semibold text-[var(--foreground)]">
                  New store
                </h2>
                <p className="mb-4 text-sm text-[var(--muted)]">
                  Add a store brand and QR CTA used on stamped labels.
                </p>
                <StoreForm
                  key="new"
                  initial={emptyStoreForm()}
                  submitLabel="Create store"
                  busy={busy}
                  onSubmit={createStore}
                  onCancel={() => setShowAdd(false)}
                />
              </section>
            ) : null}

            {loading ? (
              <LoadingSkeleton />
            ) : stores.length === 0 && !showAdd ? (
              <div className="flex flex-col items-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center">
                <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                  <StoreIcon className="size-7" />
                </div>
                <h2 className="text-base font-semibold text-[var(--foreground)]">
                  No stores yet
                </h2>
                <p className="mt-1 max-w-sm text-sm text-[var(--muted)]">
                  Add a store with your brand name and CTA link to start
                  generating labels.
                </p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={openAdd}
                  className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-[var(--accent)] px-5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-60"
                >
                  Add store
                </button>
              </div>
            ) : stores.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {stores.map((store) => (
                  <li
                    key={store._id}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm"
                  >
                    {editingId === store._id ? (
                      <div className="p-5">
                        <h2 className="mb-1 text-base font-semibold text-[var(--foreground)]">
                          Edit store
                        </h2>
                        <p className="mb-4 text-sm text-[var(--muted)]">
                          Update brand details or CTA for this store.
                        </p>
                        <StoreForm
                          key={store._id}
                          initial={{
                            name: store.name,
                            brandName: store.brandName,
                            ctaUrl: store.ctaUrl,
                            ctaText: store.ctaText,
                            platform: store.platform ?? "",
                            isDefault: store.isDefault,
                          }}
                          submitLabel="Save changes"
                          busy={busy}
                          onSubmit={(values) => updateStore(store._id, values)}
                          onCancel={() => setEditingId(null)}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5">
                        <div className="min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-base font-semibold text-[var(--foreground)]">
                              {store.name}
                            </h2>
                            {store.platform ? (
                              <span className="rounded border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                                {store.platform}
                              </span>
                            ) : null}
                            {store.isDefault ? (
                              <span className="rounded bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)]">
                                Default
                              </span>
                            ) : null}
                          </div>
                          <p className="truncate text-sm uppercase tracking-wide text-[var(--foreground)]">
                            {store.brandName}
                          </p>
                          <a
                            href={store.ctaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={store.ctaUrl}
                            className="block truncate text-sm text-[var(--accent)] underline-offset-2 hover:underline"
                          >
                            {truncateUrl(store.ctaUrl)}
                          </a>
                        </div>
                        <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              setEditingId(store._id);
                              setShowAdd(false);
                              setDesigningId(null);
                            }}
                            className={actionBtn}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => openDesign(store._id)}
                            className={actionBtn}
                          >
                            Design
                          </button>
                          {!store.isDefault ? (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void setDefault(store._id)}
                              className={actionBtn}
                            >
                              Set default
                            </button>
                          ) : null}
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              void deleteStore(store._id, store.name)
                            }
                            className="inline-flex h-9 flex-1 items-center justify-center rounded-md border border-[var(--danger-border)] bg-[var(--surface)] px-3 text-sm text-[var(--danger)] transition-colors hover:bg-[var(--danger-soft)] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
