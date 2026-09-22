"use client";

import { useState, type FormEvent } from "react";
import { PLATFORMS, type StorePlatform } from "@/lib/store-constants";
import { notify } from "@/lib/toast";

export type StoreFormValues = {
  name: string;
  brandName: string;
  ctaUrl: string;
  ctaText: string;
  platform: StorePlatform | "";
  isDefault: boolean;
};

const DEFAULTS: StoreFormValues = {
  name: "",
  brandName: "GREEN BHARAT ENTERPRISE",
  ctaUrl: "https://www.meesho.com/GREENBHARATENTERPRISE",
  ctaText: "Follow our page",
  platform: "",
  isDefault: false,
};

const inputClass =
  "h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)] disabled:opacity-60";

const labelClass = "flex flex-col gap-1.5 text-sm";
const labelTextClass = "font-medium text-[var(--foreground)]";

type StoreFormProps = {
  initial?: Partial<StoreFormValues>;
  submitLabel: string;
  busy?: boolean;
  onSubmit: (values: StoreFormValues) => void | Promise<void>;
  onCancel?: () => void;
};

export function emptyStoreForm(): StoreFormValues {
  return { ...DEFAULTS };
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function StoreForm({
  initial,
  submitLabel,
  busy = false,
  onSubmit,
  onCancel,
}: StoreFormProps) {
  const values: StoreFormValues = { ...DEFAULTS, ...initial };
  const [urlError, setUrlError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next: StoreFormValues = {
      name: String(fd.get("name") ?? "").trim(),
      brandName: String(fd.get("brandName") ?? "").trim(),
      ctaUrl: String(fd.get("ctaUrl") ?? "").trim(),
      ctaText: String(fd.get("ctaText") ?? "").trim(),
      platform: (String(fd.get("platform") ?? "") || "") as StorePlatform | "",
      isDefault: fd.get("isDefault") === "on",
    };

    if (!isHttpUrl(next.ctaUrl)) {
      const message = "CTA URL must start with http:// or https://";
      setUrlError(message);
      notify.error(message);
      return;
    }
    setUrlError(null);
    await onSubmit(next);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className={labelClass}>
        <span className={labelTextClass}>Store name</span>
        <input
          name="name"
          required
          disabled={busy}
          defaultValue={values.name}
          placeholder="Green Bharat Enterprise"
          className={inputClass}
        />
      </label>

      <label className={labelClass}>
        <span className={labelTextClass}>Brand name (CTA)</span>
        <input
          name="brandName"
          required
          disabled={busy}
          defaultValue={values.brandName}
          className={`${inputClass} uppercase tracking-wide`}
        />
      </label>

      <label className={labelClass}>
        <span className={labelTextClass}>CTA URL (QR target)</span>
        <input
          name="ctaUrl"
          type="url"
          required
          disabled={busy}
          defaultValue={values.ctaUrl}
          placeholder="https://"
          pattern="https?://.*"
          title="Must start with http:// or https://"
          aria-invalid={urlError ? true : undefined}
          onChange={() => setUrlError(null)}
          className={inputClass}
        />
        {urlError ? (
          <span className="text-xs text-[var(--danger)]">{urlError}</span>
        ) : (
          <span className="text-xs text-[var(--muted)]">
            Must be a full http:// or https:// link
          </span>
        )}
      </label>

      <label className={labelClass}>
        <span className={labelTextClass}>CTA text</span>
        <input
          name="ctaText"
          required
          disabled={busy}
          defaultValue={values.ctaText}
          className={inputClass}
        />
      </label>

      <label className={labelClass}>
        <span className={labelTextClass}>Platform (optional)</span>
        <select
          name="platform"
          disabled={busy}
          defaultValue={values.platform}
          className={inputClass}
        >
          <option value="">—</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
        <input
          name="isDefault"
          type="checkbox"
          disabled={busy}
          defaultChecked={values.isDefault}
          className="size-4 accent-[var(--accent)]"
        />
        Mark as default store
      </label>

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:flex-wrap">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--accent)] px-4 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Saving…" : submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
