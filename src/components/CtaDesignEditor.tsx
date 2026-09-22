"use client";

import { useState } from "react";
import {
  DEFAULT_CTA_DESIGN,
  mergeCtaDesign,
  type CtaDesign,
  type CtaLayout,
  type LabelSizeId,
} from "@/lib/cta-design";
import { notify } from "@/lib/toast";
import CtaPreview from "@/components/CtaPreview";

type CtaDesignEditorProps = {
  brandName: string;
  ctaText: string;
  ctaUrl: string;
  initialDesign?: Partial<CtaDesign> | null;
  onSave: (design: CtaDesign) => void | Promise<void>;
  onCancel: () => void;
  busy?: boolean;
};

const labelClass = "flex flex-col gap-1.5 text-sm";
const labelTextClass = "font-medium text-[var(--foreground)]";
const inputClass =
  "h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)] disabled:opacity-60";
const sectionHeadingClass =
  "text-xs font-semibold uppercase tracking-wide text-[var(--muted)]";

const PREVIEW_SIZE_OPTIONS: { id: LabelSizeId; label: string }[] = [
  { id: "a4-invoice", label: "Test order · A4" },
  { id: "label-4x6", label: "Test label · 4×6" },
];

function maxQrForBar(barHeight: number) {
  return Math.max(28, barHeight - 8);
}

function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  onChange: (n: number) => void;
}) {
  return (
    <label className={labelClass}>
      <span className="flex items-center justify-between gap-2">
        <span className={labelTextClass}>{label}</span>
        <span className="tabular-nums text-xs text-[var(--muted)]">
          {value}
          {unit ?? ""}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer accent-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}

function ColorRow({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (hex: string) => void;
}) {
  return (
    <label className={labelClass}>
      <span className={labelTextClass}>{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-[var(--border)] bg-[var(--surface)] p-1 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <input
          type="text"
          value={value}
          disabled={disabled}
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} font-mono uppercase`}
          maxLength={7}
        />
      </div>
    </label>
  );
}

function ToggleRow({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-[var(--accent)]"
      />
      {label}
    </label>
  );
}

export default function CtaDesignEditor({
  brandName,
  ctaText,
  ctaUrl,
  initialDesign,
  onSave,
  onCancel,
  busy = false,
}: CtaDesignEditorProps) {
  const [design, setDesign] = useState<CtaDesign>(() =>
    mergeCtaDesign(initialDesign),
  );

  function patch(partial: Partial<CtaDesign>) {
    setDesign((prev) => {
      const next = { ...prev, ...partial };
      const limit = maxQrForBar(next.barHeight);
      if (next.qrSize > limit) {
        if (partial.qrSize !== undefined && partial.qrSize > limit) {
          notify.info(`QR size capped at ${limit} pt (bar height − 8)`);
        }
        next.qrSize = limit;
      }
      return next;
    });
  }

  function handleReset() {
    setDesign({ ...DEFAULT_CTA_DESIGN });
    notify.info("Reset to default design");
  }

  async function handleSave() {
    const next = mergeCtaDesign(design);
    const hexOk = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);
    if (!hexOk(design.backgroundColor)) {
      notify.error("Background color must be a valid hex (#rrggbb)");
      return;
    }
    if (!hexOk(design.borderColor)) {
      notify.error("Border color must be a valid hex (#rrggbb)");
      return;
    }
    if (!hexOk(design.textColor)) {
      notify.error("Text color must be a valid hex (#rrggbb)");
      return;
    }
    setDesign(next);
    await onSave(next);
  }

  const previewSizeValue: LabelSizeId =
    design.previewPageSize === "thermal-4x6" ? "label-4x6" : "a4-invoice";

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <h2 className="text-base font-semibold text-[var(--foreground)]">
          CTA design
        </h2>
        <p className="mt-0.5 text-sm text-[var(--muted)]">
          Customize the bottom CTA box. Preview updates live on the side.
        </p>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] lg:items-start">
        {/* Mobile: preview on top */}
        <div className="order-1 lg:order-2 lg:sticky lg:top-6">
          <CtaPreview
            brandName={brandName}
            ctaText={ctaText}
            ctaUrl={ctaUrl}
            design={design}
          />
        </div>

        {/* Controls ~40% */}
        <div className="order-2 flex flex-col gap-6 lg:order-1">
          <section className="flex flex-col gap-3">
            <h3 className={sectionHeadingClass}>Colors</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <ColorRow
                label="Background"
                value={design.backgroundColor}
                disabled={busy}
                onChange={(backgroundColor) => patch({ backgroundColor })}
              />
              <ColorRow
                label="Border"
                value={design.borderColor}
                disabled={busy}
                onChange={(borderColor) => patch({ borderColor })}
              />
              <ColorRow
                label="Text"
                value={design.textColor}
                disabled={busy}
                onChange={(textColor) => patch({ textColor })}
              />
              <ColorRow
                label="Icon"
                value={design.iconColor}
                disabled={busy}
                onChange={(iconColor) => patch({ iconColor })}
              />
              <ColorRow
                label="QR dark"
                value={design.qrDarkColor}
                disabled={busy}
                onChange={(qrDarkColor) => patch({ qrDarkColor })}
              />
              <ColorRow
                label="QR light"
                value={design.qrLightColor}
                disabled={busy}
                onChange={(qrLightColor) => patch({ qrLightColor })}
              />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className={sectionHeadingClass}>Content</h3>
            <div className="flex flex-wrap gap-x-5 gap-y-3">
              <ToggleRow
                label="Show icon"
                checked={design.showIcon}
                disabled={busy}
                onChange={(showIcon) => patch({ showIcon })}
              />
              <ToggleRow
                label="Show brand"
                checked={design.showBrand}
                disabled={busy}
                onChange={(showBrand) => patch({ showBrand })}
              />
              <ToggleRow
                label="Show divider"
                checked={design.showDivider}
                disabled={busy}
                onChange={(showDivider) => patch({ showDivider })}
              />
              <ToggleRow
                label="Show CTA text"
                checked={design.showCtaText}
                disabled={busy}
                onChange={(showCtaText) => patch({ showCtaText })}
              />
              <ToggleRow
                label="Brand uppercase"
                checked={design.brandUppercase}
                disabled={busy}
                onChange={(brandUppercase) => patch({ brandUppercase })}
              />
              <ToggleRow
                label="Brand bold"
                checked={design.brandBold}
                disabled={busy}
                onChange={(brandBold) => patch({ brandBold })}
              />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className={sectionHeadingClass}>Layout</h3>
            <label className={labelClass}>
              <span className={labelTextClass}>Bar layout</span>
              <select
                value={design.layout}
                disabled={busy}
                onChange={(e) =>
                  patch({ layout: e.target.value as CtaLayout })
                }
                className={inputClass}
              >
                <option value="brand-left">Brand left · QR right</option>
                <option value="qr-left">QR left · Brand right</option>
              </select>
            </label>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className={sectionHeadingClass}>Size</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <SliderRow
                label="Bar height"
                value={design.barHeight}
                min={48}
                max={96}
                unit=" pt"
                disabled={busy}
                onChange={(barHeight) => patch({ barHeight })}
              />
              <SliderRow
                label="Width"
                value={design.widthPercent}
                min={45}
                max={95}
                unit="%"
                disabled={busy}
                onChange={(widthPercent) => patch({ widthPercent })}
              />
              <SliderRow
                label="Corner radius"
                value={design.cornerRadius}
                min={0}
                max={20}
                unit=" pt"
                disabled={busy}
                onChange={(cornerRadius) => patch({ cornerRadius })}
              />
              <SliderRow
                label="Border width"
                value={design.borderWidth}
                min={0}
                max={4}
                unit=" pt"
                disabled={busy}
                onChange={(borderWidth) => patch({ borderWidth })}
              />
              <SliderRow
                label="QR size"
                value={design.qrSize}
                min={28}
                max={72}
                unit=" pt"
                disabled={busy}
                onChange={(qrSize) => patch({ qrSize })}
              />
              <SliderRow
                label="Icon size"
                value={design.iconSize}
                min={12}
                max={48}
                unit=" pt"
                disabled={busy}
                onChange={(iconSize) => patch({ iconSize })}
              />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className={sectionHeadingClass}>Type</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <SliderRow
                label="Brand font"
                value={design.brandFontSize}
                min={8}
                max={18}
                unit=" pt"
                disabled={busy}
                onChange={(brandFontSize) => patch({ brandFontSize })}
              />
              <SliderRow
                label="CTA font"
                value={design.ctaFontSize}
                min={8}
                max={16}
                unit=" pt"
                disabled={busy}
                onChange={(ctaFontSize) => patch({ ctaFontSize })}
              />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className={sectionHeadingClass}>Spacing</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <SliderRow
                label="Inner pad X"
                value={design.innerPadX}
                min={4}
                max={40}
                unit=" pt"
                disabled={busy}
                onChange={(innerPadX) => patch({ innerPadX })}
              />
              <SliderRow
                label="Bottom pad"
                value={design.bottomPad}
                min={0}
                max={48}
                unit=" pt"
                disabled={busy}
                onChange={(bottomPad) => patch({ bottomPad })}
              />
              <SliderRow
                label="Side pad"
                value={design.sidePad}
                min={8}
                max={72}
                unit=" pt"
                disabled={busy}
                onChange={(sidePad) => patch({ sidePad })}
              />
              <SliderRow
                label="Gap icon · brand"
                value={design.gapIconBrand}
                min={0}
                max={32}
                unit=" pt"
                disabled={busy}
                onChange={(gapIconBrand) => patch({ gapIconBrand })}
              />
              <SliderRow
                label="Gap after brand"
                value={design.gapAfterBrand}
                min={0}
                max={40}
                unit=" pt"
                disabled={busy}
                onChange={(gapAfterBrand) => patch({ gapAfterBrand })}
              />
              <SliderRow
                label="Gap after divider"
                value={design.gapAfterDivider}
                min={0}
                max={40}
                unit=" pt"
                disabled={busy}
                onChange={(gapAfterDivider) => patch({ gapAfterDivider })}
              />
              <SliderRow
                label="Gap QR · text"
                value={design.gapQrText}
                min={0}
                max={32}
                unit=" pt"
                disabled={busy}
                onChange={(gapQrText) => patch({ gapQrText })}
              />
              <SliderRow
                label="Divider inset"
                value={design.dividerInset}
                min={0}
                max={32}
                unit=" pt"
                disabled={busy}
                onChange={(dividerInset) => patch({ dividerInset })}
              />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className={sectionHeadingClass}>Preview size</h3>
            <label className={labelClass}>
              <span className={labelTextClass}>Page mock</span>
              <select
                value={previewSizeValue}
                disabled={busy}
                onChange={(e) => {
                  const id = e.target.value as LabelSizeId;
                  patch({
                    previewPageSize:
                      id === "a4-invoice" ? "a4-invoice" : "thermal-4x6",
                  });
                }}
                className={inputClass}
              >
                {PREVIEW_SIZE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <div className="flex flex-col-reverse gap-2 border-t border-[var(--border)] pt-4 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleSave()}
              className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--accent)] px-4 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save design"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onCancel}
              className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleReset}
              className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60 sm:ml-auto"
            >
              Reset to default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
