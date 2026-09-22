"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { CtaDesign } from "@/lib/cta-design";

const PT = 1.1;

type CtaPreviewProps = {
  brandName: string;
  ctaText: string;
  ctaUrl: string;
  design: CtaDesign;
};

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

export default function CtaPreview({
  brandName,
  ctaText,
  ctaUrl,
  design,
}: CtaPreviewProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

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
      color: { dark: "#000000", light: "#FFFFFF" },
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
  }, [ctaUrl]);

  const barH = design.barHeight * PT;
  const qrSize = design.qrSize * PT;
  const iconSize = Math.min(28 * PT, barH * 0.55);
  const brandFs = design.brandFontSize * PT;
  const ctaFs = design.ctaFontSize * PT;
  const radius = design.cornerRadius * PT;
  const pageW = 280;
  const barW = (pageW * design.widthPercent) / 100;
  const brand = brandName.trim().toUpperCase() || "BRAND";
  const [line1, line2] = splitCtaText(ctaText.trim() || "Follow our page");

  const brandBlock = (
    <div className="flex min-w-0 items-center gap-[7px]">
      {design.showIcon ? (
        <StorefrontIcon size={iconSize} color={design.textColor} />
      ) : null}
      <span
        className="truncate font-bold uppercase tracking-wide"
        style={{ fontSize: brandFs, color: design.textColor, lineHeight: 1.1 }}
      >
        {brand}
      </span>
    </div>
  );

  const qrBlock = (
    <div className="flex min-w-0 items-center gap-[7px]">
      {qrDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={qrDataUrl}
          alt=""
          width={qrSize}
          height={qrSize}
          className="shrink-0 rounded-[2px]"
        />
      ) : (
        <div
          className="shrink-0 rounded-[2px] border border-dashed"
          style={{
            width: qrSize,
            height: qrSize,
            borderColor: design.borderColor,
            background: "color-mix(in srgb, #000 6%, transparent)",
          }}
          aria-hidden
        />
      )}
      <div
        className="min-w-0 leading-tight"
        style={{ fontSize: ctaFs, color: design.textColor }}
      >
        <div className="truncate">{line1}</div>
        {line2 ? <div className="truncate">{line2}</div> : null}
      </div>
    </div>
  );

  const divider = design.showDivider ? (
    <div
      className="mx-1.5 w-px shrink-0 self-stretch"
      style={{
        backgroundColor: design.borderColor,
        minHeight: barH * 0.55,
        marginTop: barH * 0.12,
        marginBottom: barH * 0.12,
      }}
    />
  ) : (
    <div className="w-2 shrink-0" />
  );

  return (
    <div className="w-full">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        Live preview
      </p>
      <div
        className="mx-auto overflow-hidden rounded-md border border-[var(--border)] bg-[#f0f0f0] shadow-sm"
        style={{ width: pageW, maxWidth: "100%" }}
      >
        {/* Miniature invoice mock */}
        <div className="space-y-2 bg-white px-4 pb-3 pt-4">
          <div className="h-2 w-2/5 rounded-sm bg-[#d8d8d8]" />
          <div className="h-1.5 w-3/4 rounded-sm bg-[#e4e4e4]" />
          <div className="h-1.5 w-1/2 rounded-sm bg-[#e4e4e4]" />
          <div className="mt-3 space-y-1.5 border-t border-[#eee] pt-3">
            <div className="h-1.5 w-full rounded-sm bg-[#ececec]" />
            <div className="h-1.5 w-[90%] rounded-sm bg-[#ececec]" />
            <div className="h-1.5 w-[70%] rounded-sm bg-[#ececec]" />
            <div className="h-1.5 w-full rounded-sm bg-[#ececec]" />
            <div className="h-1.5 w-[55%] rounded-sm bg-[#ececec]" />
          </div>
          <div className="mt-2 space-y-1.5">
            <div className="h-1.5 w-[80%] rounded-sm bg-[#ececec]" />
            <div className="h-1.5 w-[65%] rounded-sm bg-[#ececec]" />
          </div>
        </div>

        {/* CTA bar area */}
        <div className="flex justify-center bg-white px-3 pb-4 pt-2">
          <div
            className="flex items-center overflow-hidden border px-2.5"
            style={{
              width: barW,
              maxWidth: "100%",
              height: barH,
              borderRadius: radius,
              backgroundColor: design.backgroundColor,
              borderColor: design.borderColor,
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
  );
}
