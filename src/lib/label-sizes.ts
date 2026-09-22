/** Page sizes for live CTA preview (PDF points: 1pt = 1/72 in). */

export type PreviewPageSizeId = "a4-invoice" | "thermal-4x6" | "a5" | "label-4x6";

export type LabelPageSize = {
  id: PreviewPageSizeId;
  /** Short label for the caption under the preview */
  caption: string;
  widthPt: number;
  heightPt: number;
  /** Human-readable dimensions for the caption */
  dimLabel: string;
  kind: "invoice" | "thermal";
};

/** Preferred on-screen width for the scaled page (px). */
export const PREVIEW_DISPLAY_WIDTH_PX = 480;

const A4: LabelPageSize = {
  id: "a4-invoice",
  caption: "Test order",
  widthPt: 595,
  heightPt: 842,
  dimLabel: "A4 210×297 mm",
  kind: "invoice",
};

const THERMAL_4X6: LabelPageSize = {
  id: "thermal-4x6",
  caption: "Test label",
  widthPt: 288,
  heightPt: 432,
  dimLabel: "4×6 in",
  kind: "thermal",
};

const A5: LabelPageSize = {
  id: "a5",
  caption: "Test order",
  widthPt: 420,
  heightPt: 595,
  dimLabel: "A5 148×210 mm",
  kind: "invoice",
};

const ALIASES: Record<string, LabelPageSize> = {
  "a4-invoice": A4,
  a4: A4,
  a5: A5,
  "thermal-4x6": THERMAL_4X6,
  "label-4x6": { ...THERMAL_4X6, id: "label-4x6" },
  "4x6": THERMAL_4X6,
};

export function resolveLabelPageSize(id: unknown): LabelPageSize {
  if (typeof id === "string" && id in ALIASES) {
    return ALIASES[id]!;
  }
  return A4;
}

/**
 * CSS px per PDF point for a given display width.
 * At displayWidth === pageWidthPt, 1pt maps to 1 CSS px.
 */
export function cssPxPerPt(pageWidthPt: number, displayWidthPx: number): number {
  return displayWidthPx / pageWidthPt;
}
