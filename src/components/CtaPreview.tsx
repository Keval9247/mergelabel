"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { DEFAULT_CTA_DESIGN, type CtaDesign, type CtaLayout } from "@/lib/cta-design";
import {
  PREVIEW_DISPLAY_WIDTH_PX,
  resolveLabelPageSize,
  type PreviewPageSizeId,
} from "@/lib/label-sizes";

/**
 * Scale: design & page sizes are PDF points (1pt = 1/72 in).
 * Display maps A4 595pt → ~480–520 CSS px so a 65% bar and 42pt QR
 * stay in true proportion to the page (same as PDF stamp).
 */
const DISPLAY_PX_PER_PT = PREVIEW_DISPLAY_WIDTH_PX / 595;

type CtaPreviewProps = {
  brandName: string;
  ctaText: string;
  ctaUrl: string;
  design: CtaDesign;
  /** Overrides design.previewPageSize / previewLabelSize when set */
  pageSizeOverride?: PreviewPageSizeId | string;
};

type DesignLoose = Partial<CtaDesign> & {
  previewPageSize?: unknown;
  previewLabelSize?: unknown;
  pageSize?: unknown;
};

function pickPageSizeId(
  design: CtaDesign,
  pageSizeOverride?: string,
): unknown {
  if (pageSizeOverride) return pageSizeOverride;
  const d = design as DesignLoose;
  return d.previewPageSize ?? d.previewLabelSize ?? d.pageSize;
}

function num(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function str(v: unknown, fallback: string): string {
  return typeof v === "string" && v.length > 0 ? v : fallback;
}

function bool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

/** Safe reads for every CtaDesign field (partial/legacy designs OK). */
function resolveDesign(design: CtaDesign) {
  const d = design as DesignLoose;
  const def = DEFAULT_CTA_DESIGN;
  const textColor = str(d.textColor, def.textColor);
  return {
    backgroundColor: str(d.backgroundColor, def.backgroundColor),
    borderColor: str(d.borderColor, def.borderColor),
    textColor,
    showIcon: bool(d.showIcon, def.showIcon),
    showDivider: bool(d.showDivider, def.showDivider),
    barHeight: num(d.barHeight, def.barHeight),
    qrSize: num(d.qrSize, def.qrSize),
    cornerRadius: num(d.cornerRadius, def.cornerRadius),
    widthPercent: num(d.widthPercent, def.widthPercent),
    brandFontSize: num(d.brandFontSize, def.brandFontSize),
    ctaFontSize: num(d.ctaFontSize, def.ctaFontSize),
    layout: (d.layout === "qr-left" ? "qr-left" : "brand-left") as CtaLayout,
    showBrand: bool(d.showBrand, def.showBrand),
    showCtaText: bool(d.showCtaText, def.showCtaText),
    iconSize: num(d.iconSize, def.iconSize),
    borderWidth: num(d.borderWidth, def.borderWidth),
    innerPadX: num(d.innerPadX, def.innerPadX),
    bottomPad: num(d.bottomPad, def.bottomPad),
    sidePad: num(d.sidePad, def.sidePad),
    gapIconBrand: num(d.gapIconBrand, def.gapIconBrand),
    gapSections: num(d.gapSections, def.gapSections),
    gapQrText: num(d.gapQrText, def.gapQrText),
    brandUppercase: bool(d.brandUppercase, def.brandUppercase),
    brandBold: bool(d.brandBold, def.brandBold),
    dividerInset: num(d.dividerInset, def.dividerInset),
    iconColor: str(d.iconColor, textColor),
    qrDarkColor: str(d.qrDarkColor, def.qrDarkColor),
    qrLightColor: str(d.qrLightColor, def.qrLightColor),
  };
}

function pt(n: number) {
  return n * DISPLAY_PX_PER_PT;
}

function splitCtaText(text: string): [string, string] {
  if (text.includes("\n")) {
    const [first, ...rest] = text.split(/\n/);
    return [first.trim(), rest.join(" ").trim()];
  }
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [text, ""];
  return [words[0], words.slice(1).join(" ")];
}

function StorefrontIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path
        d="M4 12h20l-1.5 13H5.5L4 12Z"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M3 12 5.5 5h17L25 12"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 16v5M18 16v5"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InvoiceBody({ soldBy }: { soldBy: string }) {
  const line = "#222";
  const muted = "#555";
  return (
    <div className="space-y-2 font-sans text-[#1a1a1a]" style={{ fontSize: pt(8) }}>
      {/* Product details header strip */}
      <div
        className="grid grid-cols-5 border"
        style={{ borderColor: line, fontSize: pt(7) }}
      >
        {(
          [
            ["SKU", "AC Cover - 1.0 ton"],
            ["Size", "Free Size"],
            ["Qty", "1"],
            ["Color", "Multicolor"],
            ["Order No.", "333633330543727296_1"],
          ] as const
        ).map(([h, v]) => (
          <div
            key={h}
            className="border-r px-1.5 py-1 last:border-r-0"
            style={{ borderColor: line }}
          >
            <div className="font-bold">{h}</div>
            <div style={{ color: muted }}>{v}</div>
          </div>
        ))}
      </div>

      <div className="relative py-0.5 text-center">
        <div className="font-bold tracking-wide" style={{ fontSize: pt(12) }}>
          TAX INVOICE
        </div>
        <div
          className="absolute right-0 top-1"
          style={{ fontSize: pt(6.5), color: muted }}
        >
          Original For Recipient
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2" style={{ fontSize: pt(7.5) }}>
        <div className="border p-2" style={{ borderColor: line }}>
          <div className="mb-1 font-bold">BILL TO / SHIP TO</div>
          <div className="font-semibold">Priya Sharma</div>
          <div style={{ color: muted }}>
            B-204, Shree Ram Residency, Near Science City Road, Sola,
            Ahmedabad, Gujarat – 380060
          </div>
          <div className="mt-1" style={{ color: muted }}>
            Phone: 98XXXXXX12
          </div>
        </div>
        <div className="border p-2" style={{ borderColor: line }}>
          <div className="mb-1 font-bold">Sold by</div>
          <div className="font-semibold uppercase">{soldBy}</div>
          <div style={{ color: muted }}>
            GREEN BHARAT ENTERPRISE
            <br />
            Plot 12, Ring Road, Surat, Gujarat – 395002
          </div>
          <div className="mt-1" style={{ color: muted }}>
            GSTIN: 24XXXXX1234X1Z5
            <br />
            Invoice Date: 18-09-2026 · Order Date: 17-09-2026
          </div>
        </div>
      </div>

      <table
        className="w-full border-collapse"
        style={{ fontSize: pt(6.5), borderColor: line }}
      >
        <thead>
          <tr className="bg-[#f3f3f3]">
            {[
              "Description",
              "HSN",
              "Qty",
              "Gross",
              "Disc.",
              "Taxable",
              "Taxes",
              "Total",
            ].map((h) => (
              <th
                key={h}
                className="border px-1 py-1 text-left font-bold"
                style={{ borderColor: line }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-1 py-1" style={{ borderColor: line }}>
              Green Bharat Enterprise 1 Ton Split AC Cover Waterproof…
            </td>
            <td className="border px-1 py-1" style={{ borderColor: line }}>
              6304
            </td>
            <td className="border px-1 py-1" style={{ borderColor: line }}>
              1
            </td>
            <td className="border px-1 py-1" style={{ borderColor: line }}>
              499.00
            </td>
            <td className="border px-1 py-1" style={{ borderColor: line }}>
              50.00
            </td>
            <td className="border px-1 py-1" style={{ borderColor: line }}>
              427.62
            </td>
            <td className="border px-1 py-1" style={{ borderColor: line }}>
              SGST @2.5%
              <br />
              CGST @2.5%
            </td>
            <td className="border px-1 py-1" style={{ borderColor: line }}>
              449.00
            </td>
          </tr>
          <tr>
            <td className="border px-1 py-1" style={{ borderColor: line }}>
              Other Charges
            </td>
            <td className="border px-1 py-1" style={{ borderColor: line }} />
            <td className="border px-1 py-1" style={{ borderColor: line }} />
            <td className="border px-1 py-1" style={{ borderColor: line }}>
              0.00
            </td>
            <td className="border px-1 py-1" style={{ borderColor: line }}>
              0.00
            </td>
            <td className="border px-1 py-1" style={{ borderColor: line }}>
              0.00
            </td>
            <td className="border px-1 py-1" style={{ borderColor: line }}>
              —
            </td>
            <td className="border px-1 py-1" style={{ borderColor: line }}>
              0.00
            </td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-end gap-6 font-bold" style={{ fontSize: pt(8) }}>
        <span>Total Qty: 1</span>
        <span>Grand Total: ₹449.00</span>
      </div>

      <p style={{ fontSize: pt(6), color: muted }}>
        Tax is not payable on reverse charge basis. This is a computer generated
        invoice and does not require a signature. Sample test order for CTA
        placement only.
      </p>
    </div>
  );
}

function ThermalBody({ soldBy }: { soldBy: string }) {
  const line = "#222";
  return (
    <div className="space-y-2 font-sans text-[#1a1a1a]" style={{ fontSize: pt(9) }}>
      <div
        className="flex items-start justify-between border-b pb-1.5"
        style={{ borderColor: line }}
      >
        <div>
          <div className="font-bold" style={{ fontSize: pt(11) }}>
            SHIPPING LABEL
          </div>
          <div style={{ fontSize: pt(7), color: "#555" }}>
            Test 4×6 in · Delhivery
          </div>
        </div>
        <div className="font-mono font-bold">PREPAID</div>
      </div>

      <div className="border p-2" style={{ borderColor: line }}>
        <div className="mb-0.5 font-bold uppercase" style={{ fontSize: pt(7) }}>
          Ship To
        </div>
        <div className="font-semibold">Priya Sharma</div>
        <div style={{ fontSize: pt(8), color: "#444" }}>
          B-204, Shree Ram Residency, Sola, Ahmedabad, GJ 380060
        </div>
        <div className="mt-0.5 font-mono" style={{ fontSize: pt(8) }}>
          Ph: 98XXXXXX12
        </div>
      </div>

      <div
        className="flex h-12 items-center justify-center border border-dashed font-mono tracking-widest"
        style={{ borderColor: line, fontSize: pt(12) }}
      >
        ||||| |||| ||||| |||| |||||
      </div>
      <div className="text-center font-mono" style={{ fontSize: pt(8) }}>
        7X9K2M4P8Q1R
      </div>

      <div className="grid grid-cols-2 gap-1.5" style={{ fontSize: pt(7.5) }}>
        <div className="border p-1.5" style={{ borderColor: line }}>
          <div className="font-bold">From / Sold by</div>
          <div className="uppercase">{soldBy}</div>
          <div style={{ color: "#555" }}>Surat, GJ</div>
        </div>
        <div className="border p-1.5" style={{ borderColor: line }}>
          <div className="font-bold">Order</div>
          <div>333633330543727296_1</div>
          <div style={{ color: "#555" }}>Qty 1 · AC Cover</div>
        </div>
      </div>
    </div>
  );
}

export default function CtaPreview({
  brandName,
  ctaText,
  ctaUrl,
  design,
  pageSizeOverride,
}: CtaPreviewProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const d = resolveDesign(design);

  const page = useMemo(
    () => resolveLabelPageSize(pickPageSizeId(design, pageSizeOverride)),
    [design, pageSizeOverride],
  );

  const pageW = pt(page.widthPt);
  const pageH = pt(page.heightPt);
  const isThermal = page.kind === "thermal";

  useEffect(() => {
    let cancelled = false;
    const url = ctaUrl.trim();
    if (!url) {
      setQrDataUrl(null);
      return;
    }

    void QRCode.toDataURL(url, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 256,
      color: { dark: d.qrDarkColor, light: d.qrLightColor },
    })
      .then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [ctaUrl, d.qrDarkColor, d.qrLightColor]);

  const dims = useMemo(() => {
    const barH = pt(d.barHeight);
    const qrSize = pt(Math.min(d.qrSize, d.barHeight - 8));
    const sidePad = pt(d.sidePad);
    const maxBarW = pageW - sidePad * 2;
    const barW = Math.min(maxBarW, (pageW * d.widthPercent) / 100);
    const borderW = d.borderWidth > 0 ? Math.max(pt(d.borderWidth), 0.75) : 0;
    return {
      barH,
      qrSize,
      iconSize: pt(d.iconSize),
      brandFs: pt(d.brandFontSize),
      ctaFs: pt(d.ctaFontSize),
      radius: pt(d.cornerRadius),
      borderW,
      innerPadX: pt(d.innerPadX),
      bottomPad: pt(d.bottomPad),
      sidePad,
      barW,
      gapIconBrand: pt(d.gapIconBrand),
      gapSections: pt(d.gapSections),
      gapQrText: pt(d.gapQrText),
      dividerInset: pt(d.dividerInset),
    };
  }, [d, pageW]);

  const brandRaw = brandName.trim() || "GREEN BHARAT ENTERPRISE";
  const brand = d.brandUppercase ? brandRaw.toUpperCase() : brandRaw;
  const [line1, line2] = splitCtaText(ctaText.trim() || "Follow our page");

  const brandBlock =
    d.showBrand || d.showIcon ? (
      <div
        className="flex min-w-0 flex-1 items-center"
        style={{ gap: dims.gapIconBrand }}
      >
        {d.showIcon ? (
          <StorefrontIcon size={dims.iconSize} color={d.iconColor} />
        ) : null}
        {d.showBrand ? (
          <span
            style={{
              fontSize: dims.brandFs,
              color: d.textColor,
              lineHeight: 1.15,
              fontWeight: d.brandBold ? 700 : 500,
              letterSpacing: d.brandUppercase ? "0.02em" : undefined,
              // Full brand when width allows — wrap / slight shrink, never truncate.
              whiteSpace: "normal",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {brand}
          </span>
        ) : null}
      </div>
    ) : null;

  const qrBlock = (
    <div className="flex shrink-0 items-center" style={{ gap: dims.gapQrText }}>
      {qrDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={qrDataUrl}
          alt=""
          width={dims.qrSize}
          height={dims.qrSize}
          className="shrink-0"
        />
      ) : (
        <div
          className="shrink-0 border border-dashed"
          style={{
            width: dims.qrSize,
            height: dims.qrSize,
            borderColor: d.borderColor,
          }}
          aria-hidden
        />
      )}
      {d.showCtaText ? (
        <div
          className="leading-tight"
          style={{ fontSize: dims.ctaFs, color: d.textColor }}
        >
          <div>{line1}</div>
          {line2 ? <div>{line2}</div> : null}
        </div>
      ) : null}
    </div>
  );

  const divider = d.showDivider ? (
    <div
      className="shrink-0 self-stretch"
      style={{
        width: Math.max(dims.borderW, 1),
        backgroundColor: d.borderColor,
        marginTop: dims.dividerInset,
        marginBottom: dims.dividerInset,
        marginLeft: dims.gapSections / 2,
        marginRight: dims.gapSections / 2,
      }}
    />
  ) : (
    <div className="shrink-0" style={{ width: dims.gapSections }} />
  );

  const sizeCaption = `${page.caption} · ${page.dimLabel}`;

  return (
    <div className="w-full">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
          Live preview
        </p>
        <p className="text-xs text-[var(--muted)]">{sizeCaption}</p>
      </div>

      <div className="max-h-[min(78vh,820px)] overflow-auto rounded-md border border-[var(--border)] bg-[#e8e8e8] p-3 shadow-sm">
        <div
          className="relative mx-auto flex flex-col bg-white shadow-md"
          style={{
            width: pageW,
            height: pageH,
            minHeight: pageH,
          }}
        >
          <div
            className="min-h-0 flex-1 overflow-hidden"
            style={{
              paddingTop: pt(isThermal ? 12 : 16),
              paddingLeft: dims.sidePad,
              paddingRight: dims.sidePad,
              paddingBottom: pt(6),
            }}
          >
            {isThermal ? (
              <ThermalBody soldBy={brand} />
            ) : (
              <InvoiceBody soldBy={brand} />
            )}
          </div>

          <div
            className="flex shrink-0 justify-center"
            style={{
              paddingBottom: dims.bottomPad,
              paddingLeft: dims.sidePad,
              paddingRight: dims.sidePad,
            }}
          >
            <div
              className="flex items-center"
              style={{
                width: dims.barW,
                height: dims.barH,
                borderRadius: dims.radius,
                backgroundColor: d.backgroundColor,
                borderColor: d.borderColor,
                borderWidth: dims.borderW,
                borderStyle: d.borderWidth > 0 ? "solid" : "none",
                paddingLeft: dims.innerPadX,
                paddingRight: dims.innerPadX,
                boxSizing: "border-box",
              }}
            >
              {d.layout === "qr-left" ? (
                <>
                  {qrBlock}
                  {divider}
                  {brandBlock}
                </>
              ) : (
                <>
                  {brandBlock}
                  {divider}
                  {qrBlock}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
