import type { CtaDesign } from "@/lib/cta-design";

export type CtaOptions = {
  brandName: string;
  ctaUrl: string;
  /** Defaults to "Follow our page" */
  ctaText?: string;
  design?: Partial<CtaDesign> | null;
};
