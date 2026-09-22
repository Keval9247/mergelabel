import {
  PDFDocument,
  PDFFont,
  PDFImage,
  PDFPage,
  StandardFonts,
  rgb,
  type RGB,
} from "pdf-lib";
import QRCode from "qrcode";
import {
  hexToPdfRgb,
  mergeCtaDesign,
  type CtaDesign,
} from "@/lib/cta-design";
import type { CtaOptions } from "./types";

export type { CtaOptions } from "./types";

/** Fixed spacing; sizes/colors come from CtaDesign */
const LAYOUT = {
  /** Gap from page bottom edge (pt) */
  bottomPad: 14,
  /** Minimum side margin from page edges (pt) */
  sidePad: 36,
  borderWidth: 1,
  innerPadX: 14,
  iconSize: 28,
  dividerInsetY: 12,
  gapIconBrand: 10,
  gapBrandDivider: 14,
  gapDividerQr: 12,
  gapQrText: 10,
} as const;

function toRgb(hex: string): RGB {
  const { r, g, b } = hexToPdfRgb(hex);
  return rgb(r, g, b);
}

/**
 * Stamp a bottom CTA bar onto every page of each PDF, then merge into one PDF.
 * Designed for client-side use (browser-compatible APIs).
 */
export async function stampAndMergePdfs(
  files: ArrayBuffer[],
  options: CtaOptions
): Promise<Uint8Array> {
  if (!files.length) {
    throw new Error("No PDF files provided");
  }
  if (!options.ctaUrl?.trim()) {
    throw new Error("ctaUrl is required");
  }

  const brandName = options.brandName.trim().toUpperCase();
  const ctaText =
    (options.ctaText ?? "Follow our page").trim() || "Follow our page";
  const design = mergeCtaDesign(options.design);
  const qrPngBytes = await qrDataUrlToPngBytes(options.ctaUrl.trim());

  const merged = await PDFDocument.create();

  for (const file of files) {
    const src = await PDFDocument.load(file, { ignoreEncryption: true });
    const font = await src.embedFont(StandardFonts.Helvetica);
    const fontBold = await src.embedFont(StandardFonts.HelveticaBold);
    const qrImage = await src.embedPng(qrPngBytes);

    for (const page of src.getPages()) {
      drawCtaBar(page, {
        brandName,
        ctaText,
        font,
        fontBold,
        qrImage,
        design,
      });
    }

    const indices = src.getPageIndices();
    const copied = await merged.copyPages(src, indices);
    for (const page of copied) {
      merged.addPage(page);
    }
  }

  return merged.save();
}

/** Trigger a browser download of PDF bytes. */
export function downloadPdf(bytes: Uint8Array, filename: string): void {
  const copy = Uint8Array.from(bytes);
  const blob = new Blob([copy.buffer as ArrayBuffer], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

async function qrDataUrlToPngBytes(url: string): Promise<Uint8Array> {
  const dataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 256,
    color: { dark: "#000000", light: "#FFFFFF" },
  });
  const base64 = dataUrl.split(",")[1];
  if (!base64) {
    throw new Error("Failed to generate QR code");
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function drawCtaBar(
  page: PDFPage,
  ctx: {
    brandName: string;
    ctaText: string;
    font: PDFFont;
    fontBold: PDFFont;
    qrImage: PDFImage;
    design: CtaDesign;
  }
): void {
  const { width: pageWidth } = page.getSize();
  const L = LAYOUT;
  const d = ctx.design;

  const bg = toRgb(d.backgroundColor);
  const border = toRgb(d.borderColor);
  const text = toRgb(d.textColor);

  const brandWidth = ctx.fontBold.widthOfTextAtSize(
    ctx.brandName,
    d.brandFontSize
  );
  const [ctaLine1, ctaLine2] = splitCtaText(ctx.ctaText);
  const ctaTextWidth = Math.max(
    ctx.font.widthOfTextAtSize(ctaLine1, d.ctaFontSize),
    ctaLine2 ? ctx.font.widthOfTextAtSize(ctaLine2, d.ctaFontSize) : 0
  );
  const ctaLineHeight = d.ctaFontSize + 2;

  const brandBlockWidth =
    (d.showIcon ? L.iconSize + L.gapIconBrand : 0) + brandWidth;
  const qrBlockWidth = d.qrSize + L.gapQrText + ctaTextWidth;
  const dividerWidth = d.showDivider
    ? L.gapBrandDivider + L.borderWidth + L.gapDividerQr
    : L.gapBrandDivider + L.gapDividerQr;

  const contentWidth =
    L.innerPadX + brandBlockWidth + dividerWidth + qrBlockWidth + L.innerPadX;

  const targetWidth = pageWidth * (d.widthPercent / 100);
  const maxWidth = pageWidth - L.sidePad * 2;
  const boxWidth = Math.min(maxWidth, Math.max(targetWidth, contentWidth));
  const boxHeight = d.barHeight;
  const boxX = (pageWidth - boxWidth) / 2;
  const boxY = L.bottomPad;

  drawRoundedRect(
    page,
    boxX,
    boxY,
    boxWidth,
    boxHeight,
    d.cornerRadius,
    bg,
    border
  );

  const midY = boxY + boxHeight / 2;
  let cursorX = boxX + L.innerPadX;

  const drawBrandBlock = () => {
    if (d.showIcon) {
      const iconX = cursorX;
      const iconY = midY - L.iconSize / 2;
      drawStorefrontIcon(page, iconX, iconY, L.iconSize, border, bg);
      cursorX += L.iconSize + L.gapIconBrand;
    }

    const brandBaseline = midY - d.brandFontSize * 0.35;
    page.drawText(ctx.brandName, {
      x: cursorX,
      y: brandBaseline,
      size: d.brandFontSize,
      font: ctx.fontBold,
      color: text,
    });
    cursorX += brandWidth;
  };

  const drawDivider = () => {
    cursorX += L.gapBrandDivider;
    if (d.showDivider) {
      const dividerTop = boxY + boxHeight - L.dividerInsetY;
      const dividerBottom = boxY + L.dividerInsetY;
      page.drawLine({
        start: { x: cursorX, y: dividerBottom },
        end: { x: cursorX, y: dividerTop },
        thickness: L.borderWidth,
        color: border,
      });
      cursorX += L.borderWidth;
    }
    cursorX += L.gapDividerQr;
  };

  const drawQrBlock = () => {
    const qrY = midY - d.qrSize / 2;
    page.drawImage(ctx.qrImage, {
      x: cursorX,
      y: qrY,
      width: d.qrSize,
      height: d.qrSize,
    });
    cursorX += d.qrSize + L.gapQrText;

    const lines = ctaLine2 ? [ctaLine1, ctaLine2] : [ctaLine1];
    const blockHeight = lines.length * ctaLineHeight;
    let textY = midY + blockHeight / 2 - d.ctaFontSize;
    for (const line of lines) {
      page.drawText(line, {
        x: cursorX,
        y: textY,
        size: d.ctaFontSize,
        font: ctx.font,
        color: text,
      });
      textY -= ctaLineHeight;
    }
    cursorX += ctaTextWidth;
  };

  if (d.layout === "qr-left") {
    drawQrBlock();
    drawDivider();
    drawBrandBlock();
  } else {
    drawBrandBlock();
    drawDivider();
    drawQrBlock();
  }
}

/** Prefer first word on line 1, remainder on line 2 (e.g. "Follow" / "our page"). */
function splitCtaText(text: string): [string, string] {
  if (text.includes("\n")) {
    const [first, ...rest] = text.split(/\n/);
    return [first.trim(), rest.join(" ").trim()];
  }
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [text, ""];
  return [words[0], words.slice(1).join(" ")];
}

/**
 * Rounded rect via SVG path. pdf-lib flips Y so path uses SVG coords
 * (origin at top-left of the shape); `y` is the PDF top of the box.
 */
function drawRoundedRect(
  page: PDFPage,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: RGB,
  stroke: RGB
): void {
  const radius = Math.min(r, w / 2, h / 2);
  const path = [
    `M ${radius} 0`,
    `L ${w - radius} 0`,
    `Q ${w} 0 ${w} ${radius}`,
    `L ${w} ${h - radius}`,
    `Q ${w} ${h} ${w - radius} ${h}`,
    `L ${radius} ${h}`,
    `Q 0 ${h} 0 ${h - radius}`,
    `L 0 ${radius}`,
    `Q 0 0 ${radius} 0`,
    "Z",
  ].join(" ");

  page.drawSvgPath(path, {
    x,
    y: y + h,
    borderColor: stroke,
    borderWidth: LAYOUT.borderWidth,
    color: fill,
  });
}

/**
 * Simple line-art storefront (SVG local coords, y-down via pdf-lib flip):
 * scalloped awning (4 lobes) over a square shopfront with a window.
 */
function drawStorefrontIcon(
  page: PDFPage,
  x: number,
  y: number,
  size: number,
  strokeColor: RGB,
  fillColor: RGB
): void {
  const stroke = 1.2;
  const s = size;
  const awningBand = s * 0.16;
  const scallopY = s * 0.3;
  const bodyTop = scallopY;
  const lobes = 4;
  const lobeW = s / lobes;

  const awningParts = [`M 0 ${awningBand}`];
  for (let i = 0; i < lobes; i++) {
    const left = i * lobeW;
    const mid = left + lobeW / 2;
    const right = left + lobeW;
    awningParts.push(`Q ${mid} ${scallopY} ${right} ${awningBand}`);
  }
  awningParts.push(`L ${s} 0`, `L 0 0`, "Z");

  page.drawSvgPath(awningParts.join(" "), {
    x,
    y: y + size,
    borderColor: strokeColor,
    borderWidth: stroke,
    color: fillColor,
  });

  const winL = s * 0.32;
  const winR = s * 0.68;
  const winT = s * 0.48;
  const winB = s * 0.82;

  page.drawSvgPath(
    [
      `M 0 ${bodyTop}`,
      `L ${s} ${bodyTop}`,
      `L ${s} ${s}`,
      `L 0 ${s}`,
      "Z",
      `M ${winL} ${winT}`,
      `L ${winR} ${winT}`,
      `L ${winR} ${winB}`,
      `L ${winL} ${winB}`,
      "Z",
    ].join(" "),
    {
      x,
      y: y + size,
      borderColor: strokeColor,
      borderWidth: stroke,
      color: fillColor,
    }
  );
}
