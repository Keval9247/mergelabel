export type CtaLayout = "brand-left" | "qr-left";

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
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
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

export function mergeCtaDesign(partial?: Partial<CtaDesign> | null): CtaDesign {
  const p = partial ?? {};
  return {
    backgroundColor: asHex(p.backgroundColor, DEFAULT_CTA_DESIGN.backgroundColor),
    borderColor: asHex(p.borderColor, DEFAULT_CTA_DESIGN.borderColor),
    textColor: asHex(p.textColor, DEFAULT_CTA_DESIGN.textColor),
    showIcon: typeof p.showIcon === "boolean" ? p.showIcon : DEFAULT_CTA_DESIGN.showIcon,
    showDivider:
      typeof p.showDivider === "boolean" ? p.showDivider : DEFAULT_CTA_DESIGN.showDivider,
    barHeight: clamp(Number(p.barHeight) || DEFAULT_CTA_DESIGN.barHeight, 48, 96),
    qrSize: clamp(Number(p.qrSize) || DEFAULT_CTA_DESIGN.qrSize, 28, 72),
    cornerRadius: clamp(
      Number(p.cornerRadius) || DEFAULT_CTA_DESIGN.cornerRadius,
      0,
      20,
    ),
    widthPercent: clamp(
      Number(p.widthPercent) || DEFAULT_CTA_DESIGN.widthPercent,
      45,
      95,
    ),
    brandFontSize: clamp(
      Number(p.brandFontSize) || DEFAULT_CTA_DESIGN.brandFontSize,
      8,
      18,
    ),
    ctaFontSize: clamp(
      Number(p.ctaFontSize) || DEFAULT_CTA_DESIGN.ctaFontSize,
      8,
      16,
    ),
    layout: p.layout === "qr-left" ? "qr-left" : "brand-left",
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
