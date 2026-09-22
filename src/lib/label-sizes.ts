/** Page metadata for live CTA preview (sizes match PDF points: 1pt = 1/72 in). */

import {
  PREVIEW_PAGE_SIZES,
  type PreviewPageSize,
} from "@/lib/cta-design";

export type PreviewPageSizeId = PreviewPageSize | "a5" | "label-4x6";

export type LabelPageSize = {
  id: PreviewPageSize;
  caption: string;
  widthPt: number;
  heightPt: number;
  dimLabel: string;
  kind: "invoice" | "thermal";
};

/** Preferred on-screen width for A4 (px). scale = this / 595pt. */
export const PREVIEW_DISPLAY_WIDTH_PX = 500;

const META: Record<PreviewPageSize, Omit<LabelPageSize, "id" | "widthPt" | "heightPt">> = {
  "a4-invoice": {
    caption: "Test order",
    dimLabel: "A4 210×297 mm",
    kind: "invoice",
  },
  "thermal-4x6": {
    caption: "Test label",
    dimLabel: "4×6 in",
    kind: "thermal",
  },
};

export function resolveLabelPageSize(id: unknown): LabelPageSize {
  let key: PreviewPageSize = "a4-invoice";
  if (id === "a4-invoice" || id === "thermal-4x6") {
    key = id;
  } else if (id === "label-4x6" || id === "a5" || id === "4x6") {
    key = "thermal-4x6";
  }
  const preset = PREVIEW_PAGE_SIZES[key];
  const meta = META[key];
  return {
    id: key,
    widthPt: preset.widthPt,
    heightPt: preset.heightPt,
    ...meta,
  };
}

/** CSS px per PDF point for a given display width. */
export function cssPxPerPt(pageWidthPt: number, displayWidthPx: number): number {
  return displayWidthPx / pageWidthPt;
}
