export type CtaLayout = "brand-left" | "qr-left";

export type PreviewPageSize = "a4-invoice" | "thermal-4x6";

/** Full-page preview mocks (true PDF pt proportions). */
export const LABEL_SIZE_PRESETS = {
  "a4-invoice": {
    id: "a4-invoice" as const,
    label: "A4 tax invoice (Meesho/Flipkart)",
    caption: "Test order · A4 210×297 mm",
    widthPt: 595,
    heightPt: 842,
    compact: false,
  },
  a5: {
    id: "a5" as const,
    label: "A5",
    caption: "Test page · A5 148×210 mm",
    widthPt: 420,
    heightPt: 595,
    compact: true,
  },
  "label-4x6": {
    id: "label-4x6" as const,
    label: "4×6 in shipping label",
    caption: "Test label · 4×6 in",
    widthPt: 288,
    heightPt: 432,
    compact: true,
  },
} as const;

export type LabelSizeId = keyof typeof LABEL_SIZE_PRESETS;

/** Stored design field — maps onto LABEL_SIZE_PRESETS for the live preview. */
export const PREVIEW_PAGE_SIZES = {
  "a4-invoice": {
    id: "a4-invoice" as const,
    label: "A4 tax invoice",
    widthPt: 595,
    heightPt: 842,
  },
  "thermal-4x6": {
    id: "thermal-4x6" as const,
    label: "4×6 in thermal label",
    widthPt: 288,
    heightPt: 432,
  },
} as const;

export type CtaDesign = {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  showIcon: boolean;
  showDivider: boolean;
  barHeight: number;
  qrSize: number;
  cornerRadius: number;
  widthPercent: number;
  brandFontSize: number;
  ctaFontSize: number;
  layout: CtaLayout;
  showBrand: boolean;
  showCtaText: boolean;
  iconSize: number;
  borderWidth: number;
  innerPadX: number;
  bottomPad: number;
  sidePad: number;
  gapIconBrand: number;
  gapAfterBrand: number;
  gapAfterDivider: number;
  gapQrText: number;
  brandUppercase: boolean;
  brandBold: boolean;
  dividerInset: number;
  iconColor: string;
  qrDarkColor: string;
  qrLightColor: string;
  previewPageSize: PreviewPageSize;
};

export const DEFAULT_CTA_DESIGN: CtaDesign = {
  backgroundColor: "#ffffff",
  borderColor: "#000000",
  textColor: "#000000",
  showIcon: true,
  showDivider: true,
  barHeight: 62,
  qrSize: 42,
  cornerRadius: 8,
  widthPercent: 65,
  brandFontSize: 11,
  ctaFontSize: 10,
  layout: "brand-left",
  showBrand: true,
  showCtaText: true,
  iconSize: 28,
  borderWidth: 1,
  innerPadX: 14,
  bottomPad: 14,
  sidePad: 36,
  gapIconBrand: 10,
  gapAfterBrand: 14,
  gapAfterDivider: 12,
  gapQrText: 10,
  brandUppercase: true,
  brandBold: true,
  dividerInset: 12,
  iconColor: "#000000",
  qrDarkColor: "#000000",
  qrLightColor: "#ffffff",
  previewPageSize: "a4-invoice",
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function asNum(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asHex(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const v = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    const r = v[1];
    const g = v[2];
    const b = v[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return fallback;
}

function asBool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asPreviewPageSize(value: unknown): PreviewPageSize {
  if (value === "a4-invoice" || value === "thermal-4x6") return value;
  // Legacy label-size ids from earlier drafts
  if (value === "label-4x6" || value === "a5") return "thermal-4x6";
  return DEFAULT_CTA_DESIGN.previewPageSize;
}

/** Accept legacy `gapSections` / `previewLabelSize` keys from older saved designs. */
type LegacyPartial = Partial<CtaDesign> & {
  gapSections?: number;
  previewLabelSize?: string;
};

export function mergeCtaDesign(partial?: Partial<CtaDesign> | null): CtaDesign {
  const p = (partial ?? {}) as LegacyPartial;
  const textColor = asHex(p.textColor, DEFAULT_CTA_DESIGN.textColor);
  const barHeight = clamp(
    asNum(p.barHeight, DEFAULT_CTA_DESIGN.barHeight),
    48,
    120,
  );
  const qrSizeRaw = clamp(
    asNum(p.qrSize, DEFAULT_CTA_DESIGN.qrSize),
    28,
    96,
  );
  const qrSize = Math.min(qrSizeRaw, barHeight - 8);

  const gapAfterBrand = clamp(
    asNum(
      p.gapAfterBrand ?? p.gapSections,
      DEFAULT_CTA_DESIGN.gapAfterBrand,
    ),
    0,
    40,
  );
  const gapAfterDivider = clamp(
    asNum(
      p.gapAfterDivider ?? p.gapSections,
      DEFAULT_CTA_DESIGN.gapAfterDivider,
    ),
    0,
    40,
  );

  return {
    backgroundColor: asHex(p.backgroundColor, DEFAULT_CTA_DESIGN.backgroundColor),
    borderColor: asHex(p.borderColor, DEFAULT_CTA_DESIGN.borderColor),
    textColor,
    showIcon: asBool(p.showIcon, DEFAULT_CTA_DESIGN.showIcon),
    showDivider: asBool(p.showDivider, DEFAULT_CTA_DESIGN.showDivider),
    barHeight,
    qrSize,
    cornerRadius: clamp(
      asNum(p.cornerRadius, DEFAULT_CTA_DESIGN.cornerRadius),
      0,
      20,
    ),
    widthPercent: clamp(
      asNum(p.widthPercent, DEFAULT_CTA_DESIGN.widthPercent),
      45,
      95,
    ),
    brandFontSize: clamp(
      asNum(p.brandFontSize, DEFAULT_CTA_DESIGN.brandFontSize),
      8,
      18,
    ),
    ctaFontSize: clamp(
      asNum(p.ctaFontSize, DEFAULT_CTA_DESIGN.ctaFontSize),
      8,
      16,
    ),
    layout: p.layout === "qr-left" ? "qr-left" : "brand-left",
    showBrand: asBool(p.showBrand, DEFAULT_CTA_DESIGN.showBrand),
    showCtaText: asBool(p.showCtaText, DEFAULT_CTA_DESIGN.showCtaText),
    iconSize: clamp(asNum(p.iconSize, DEFAULT_CTA_DESIGN.iconSize), 16, 48),
    borderWidth: clamp(
      asNum(p.borderWidth, DEFAULT_CTA_DESIGN.borderWidth),
      0.5,
      4,
    ),
    innerPadX: clamp(asNum(p.innerPadX, DEFAULT_CTA_DESIGN.innerPadX), 4, 32),
    bottomPad: clamp(asNum(p.bottomPad, DEFAULT_CTA_DESIGN.bottomPad), 4, 40),
    sidePad: clamp(asNum(p.sidePad, DEFAULT_CTA_DESIGN.sidePad), 8, 72),
    gapIconBrand: clamp(
      asNum(p.gapIconBrand, DEFAULT_CTA_DESIGN.gapIconBrand),
      0,
      32,
    ),
    gapAfterBrand,
    gapAfterDivider,
    gapQrText: clamp(asNum(p.gapQrText, DEFAULT_CTA_DESIGN.gapQrText), 0, 32),
    brandUppercase: asBool(p.brandUppercase, DEFAULT_CTA_DESIGN.brandUppercase),
    brandBold: asBool(p.brandBold, DEFAULT_CTA_DESIGN.brandBold),
    dividerInset: clamp(
      asNum(p.dividerInset, DEFAULT_CTA_DESIGN.dividerInset),
      0,
      32,
    ),
    iconColor: asHex(p.iconColor, textColor),
    qrDarkColor: asHex(p.qrDarkColor, DEFAULT_CTA_DESIGN.qrDarkColor),
    qrLightColor: asHex(p.qrLightColor, DEFAULT_CTA_DESIGN.qrLightColor),
    previewPageSize: asPreviewPageSize(
      p.previewPageSize ?? p.previewLabelSize,
    ),
  };
}

export function hexToPdfRgb(hex: string): { r: number; g: number; b: number } {
  const h = asHex(hex, "#000000").slice(1);
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
}
