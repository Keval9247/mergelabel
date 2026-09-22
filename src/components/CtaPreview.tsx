"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  LABEL_SIZE_PRESETS,
  type CtaDesign,
  type LabelSizeId,
} from "@/lib/cta-design";

/** CSS px per PDF point so A4 595pt ≈ 520px wide. */
const DISPLAY_PX_PER_PT = 520 / 595;

type CtaPreviewProps = {
  brandName: string;
  ctaText: string;
  ctaUrl: string;
  design: CtaDesign;
  pageSizeOverride?: LabelSizeId;
};

function pt(n: number) {
  return n * DISPLAY_PX_PER_PT;
}

function resolveSizeId(
  design: CtaDesign,
  pageSizeOverride?: LabelSizeId,
): LabelSizeId {
  if (pageSizeOverride && pageSizeOverride in LABEL_SIZE_PRESETS) {
    return pageSizeOverride;
  }

  const fromDesign =
    (design as CtaDesign & { previewLabelSize?: string }).previewLabelSize ??
    design.previewPageSize;

  if (fromDesign === "a4-invoice") return "a4-invoice";
  if (fromDesign === "a5") return "a5";
  if (fromDesign === "label-4x6" || fromDesign === "thermal-4x6") {
    return "label-4x6";
  }
  return "a4-invoice";
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

function TaxInvoiceBody() {
  return (
    <div className="space-y-3 text-[10px] leading-snug text-[#1a1a1a]">
      <div className="flex items-start justify-between gap-3 border-b border-black pb-2">
        <div>
          <div className="text-[13px] font-bold tracking-wide">TAX INVOICE</div>
          <div className="text-[#444]">
            Test order preview · not a real invoice
          </div>
        </div>
        <div className="text-right text-[9px] text-[#444]">
          <div>Order No: ORD-TEST-88421</div>
          <div>Invoice No: INV-TEST-1024</div>
          <div>Date: 22/09/2026</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded border border-[#ccc] p-2">
          <div className="mb-1 font-semibold">Sold by</div>
          <div>Green Bharat Enterprise</div>
          <div>GSTIN: 23XXXXX1234X1Z5</div>
          <div>State: Madhya Pradesh (23)</div>
        </div>
        <div className="rounded border border-[#ccc] p-2">
          <div className="mb-1 font-semibold">Bill to / Ship to</div>
          <div>Rahul Sharma</div>
          <div>12 MG Road, Near Palasia Square</div>
          <div>Indore, Madhya Pradesh 452001</div>
          <div>Phone: 98XXXXXX10</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded border border-[#ccc] p-2">
          <div className="mb-1 font-semibold">Product details</div>
          <div>SKU: AC Cover · Size: 1 Ton</div>
          <div>Color: Multicolor · Qty: 1</div>
          <div>HSN: 6304</div>
        </div>
        <div className="rounded border border-[#ccc] p-2">
          <div className="mb-1 font-semibold">Payment</div>
          <div>Mode: Prepaid (UPI)</div>
          <div>Subtotal: ₹109.00</div>
          <div>Tax: ₹20.00 · Total: ₹129.00</div>
        </div>
      </div>

      <table className="w-full border-collapse text-[9px]">
        <thead>
          <tr className="bg-[#f3f3f3]">
            {["Description", "Qty", "Taxable", "CGST", "SGST", "Total"].map(
              (h) => (
                <th
                  key={h}
                  className="border border-[#bbb] px-1.5 py-1 text-left font-semibold"
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-[#bbb] px-1.5 py-1">
              Green Bharat AC Cover — 1 Ton, Multicolor
            </td>
            <td className="border border-[#bbb] px-1.5 py-1">1</td>
            <td className="border border-[#bbb] px-1.5 py-1">₹109.00</td>
            <td className="border border-[#bbb] px-1.5 py-1">₹10.00</td>
            <td className="border border-[#bbb] px-1.5 py-1">₹10.00</td>
            <td className="border border-[#bbb] px-1.5 py-1">₹129.00</td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="min-w-[140px] space-y-0.5 text-[9px]">
          <div className="flex justify-between gap-6">
            <span>Taxable amount</span>
            <span>₹109.00</span>
          </div>
          <div className="flex justify-between gap-6">
            <span>Total tax</span>
            <span>₹20.00</span>
          </div>
          <div className="flex justify-between gap-6 border-t border-black pt-1 font-bold">
            <span>Grand total</span>
            <span>₹129.00</span>
          </div>
        </div>
      </div>

      <p className="text-[8px] text-[#666]">
        Tax is not payable on reverse charge basis. This is a sample test order
        layout for CTA placement only — not a valid tax document.
      </p>
    </div>
  );
}

function ShippingLabelBody() {
  return (
    <div className="space-y-2 text-[9px] leading-snug text-[#222]">
      <div className="flex items-center justify-between border-b-2 border-black pb-1.5">
        <span className="text-[11px] font-bold tracking-wide">
          SHIPPING LABEL
        </span>
        <span className="font-mono text-[8px]">TEST-4x6</span>
      </div>

      <div className="rounded border border-black p-1.5">
        <div className="text-[8px] font-semibold uppercase text-[#555]">
          Ship to
        </div>
        <div className="text-[11px] font-bold">Rahul Sharma</div>
        <div>12 MG Road, Near Palasia Square</div>
        <div>Indore, MP 452001</div>
        <div>Phone: 98XXXXXX10</div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <div className="border border-[#999] p-1.5">
          <div className="font-semibold">Order</div>
          <div>ORD-TEST-88421</div>
          <div>SKU: AC Cover</div>
          <div>Qty: 1</div>
        </div>
        <div className="border border-[#999] p-1.5">
          <div className="font-semibold">Payment</div>
          <div>COD: ₹129.00</div>
          <div>Weight: 0.4 kg</div>
        </div>
      </div>

      <div className="border-t border-dashed border-[#999] pt-1.5 font-semibold">
        Sold by: Green Bharat Enterprise
      </div>
      <div className="text-[8px] text-[#555]">
        Handle with care · Keep dry · Test label for CTA preview
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

  const sizeId = resolveSizeId(design, pageSizeOverride);
  const preset = LABEL_SIZE_PRESETS[sizeId];
  const pageW = pt(preset.widthPt);
  const pageH = pt(preset.heightPt);

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
      color: {
        dark: design.qrDarkColor || "#000000",
        light: design.qrLightColor || "#ffffff",
      },
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
  }, [ctaUrl, design.qrDarkColor, design.qrLightColor]);

  const dims = useMemo(() => {
    const barH = pt(design.barHeight);
    const qrSize = pt(Math.min(design.qrSize, design.barHeight - 8));
    const iconSize = pt(design.iconSize);
    const brandFs = pt(design.brandFontSize);
    const ctaFs = pt(design.ctaFontSize);
    const radius = pt(design.cornerRadius);
    const borderW = Math.max(
      pt(design.borderWidth),
      design.borderWidth > 0 ? 1 : 0,
    );
    const innerPadX = pt(design.innerPadX);
    const bottomPad = pt(design.bottomPad);
    const sidePad = pt(design.sidePad);
    const maxBarW = pageW - sidePad * 2;
    const barW = Math.min(maxBarW, (pageW * design.widthPercent) / 100);

    const gapAfterBrand = pt(design.gapAfterBrand);
    const gapAfterDivider = pt(design.gapAfterDivider);

    return {
      barH,
      qrSize,
      iconSize,
      brandFs,
      ctaFs,
      radius,
      borderW,
      innerPadX,
      bottomPad,
      sidePad,
      barW,
      gapIconBrand: pt(design.gapIconBrand),
      gapAfterBrand,
      gapAfterDivider,
      gapQrText: pt(design.gapQrText),
      dividerInset: pt(design.dividerInset),
    };
  }, [design, pageW]);

  const brandRaw = brandName.trim() || "BRAND";
  const brand = design.brandUppercase ? brandRaw.toUpperCase() : brandRaw;
  const [line1, line2] = splitCtaText(ctaText.trim() || "Follow our page");

  const brandBlock =
    design.showBrand || design.showIcon ? (
      <div
        className="flex min-w-0 items-center"
        style={{ gap: dims.gapIconBrand }}
      >
        {design.showIcon ? (
          <StorefrontIcon
            size={dims.iconSize}
            color={design.iconColor || design.textColor}
          />
        ) : null}
        {design.showBrand ? (
          <span
            style={{
              fontSize: dims.brandFs,
              color: design.textColor,
              lineHeight: 1.15,
              fontWeight: design.brandBold ? 700 : 500,
              letterSpacing: design.brandUppercase ? "0.02em" : undefined,
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
    <div className="flex min-w-0 items-center" style={{ gap: dims.gapQrText }}>
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
            borderColor: design.borderColor,
          }}
          aria-hidden
        />
      )}
      {design.showCtaText ? (
        <div
          className="min-w-0 leading-tight"
          style={{ fontSize: dims.ctaFs, color: design.textColor }}
        >
          <div>{line1}</div>
          {line2 ? <div>{line2}</div> : null}
        </div>
      ) : null}
    </div>
  );

  const divider = design.showDivider ? (
    <div
      className="shrink-0 self-stretch"
      style={{
        backgroundColor: design.borderColor,
        width: Math.max(dims.borderW, 1),
        marginTop: dims.dividerInset,
        marginBottom: dims.dividerInset,
        marginLeft: dims.gapAfterBrand,
        marginRight: dims.gapAfterDivider,
      }}
    />
  ) : (
    <div
      className="shrink-0"
      style={{ width: dims.gapAfterBrand + dims.gapAfterDivider }}
    />
  );

  return (
    <div className="w-full">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
          Live preview
        </p>
        <p className="text-xs text-[var(--muted)]">{preset.caption}</p>
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
              padding: `${pt(18)}px ${dims.sidePad}px ${pt(8)}px`,
            }}
          >
            {preset.compact ? <ShippingLabelBody /> : <TaxInvoiceBody />}
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
              className="flex items-center overflow-visible"
              style={{
                width: dims.barW,
                height: dims.barH,
                borderRadius: dims.radius,
                backgroundColor: design.backgroundColor,
                borderColor: design.borderColor,
                borderWidth: dims.borderW,
                borderStyle: design.borderWidth > 0 ? "solid" : "none",
                paddingLeft: dims.innerPadX,
                paddingRight: dims.innerPadX,
              }}
            >
              {design.layout === "qr-left" ? (
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
