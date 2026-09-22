import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { DEFAULT_CTA_DESIGN } from "@/lib/cta-design";
import { PLATFORMS } from "@/lib/store-constants";

const CtaDesignSchema = new Schema(
  {
    backgroundColor: {
      type: String,
      default: DEFAULT_CTA_DESIGN.backgroundColor,
    },
    borderColor: {
      type: String,
      default: DEFAULT_CTA_DESIGN.borderColor,
    },
    textColor: {
      type: String,
      default: DEFAULT_CTA_DESIGN.textColor,
    },
    showIcon: {
      type: Boolean,
      default: DEFAULT_CTA_DESIGN.showIcon,
    },
    showDivider: {
      type: Boolean,
      default: DEFAULT_CTA_DESIGN.showDivider,
    },
    barHeight: {
      type: Number,
      default: DEFAULT_CTA_DESIGN.barHeight,
    },
    qrSize: {
      type: Number,
      default: DEFAULT_CTA_DESIGN.qrSize,
    },
    cornerRadius: {
      type: Number,
      default: DEFAULT_CTA_DESIGN.cornerRadius,
    },
    widthPercent: {
      type: Number,
      default: DEFAULT_CTA_DESIGN.widthPercent,
    },
    brandFontSize: {
      type: Number,
      default: DEFAULT_CTA_DESIGN.brandFontSize,
    },
    ctaFontSize: {
      type: Number,
      default: DEFAULT_CTA_DESIGN.ctaFontSize,
    },
    layout: {
      type: String,
      enum: ["brand-left", "qr-left"],
      default: DEFAULT_CTA_DESIGN.layout,
    },
    showBrand: {
      type: Boolean,
      default: DEFAULT_CTA_DESIGN.showBrand,
    },
    showCtaText: {
      type: Boolean,
      default: DEFAULT_CTA_DESIGN.showCtaText,
    },
    iconSize: {
      type: Number,
      default: DEFAULT_CTA_DESIGN.iconSize,
    },
    borderWidth: {
      type: Number,
      default: DEFAULT_CTA_DESIGN.borderWidth,
    },
    innerPadX: {
      type: Number,
      default: DEFAULT_CTA_DESIGN.innerPadX,
    },
    bottomPad: {
      type: Number,
      default: DEFAULT_CTA_DESIGN.bottomPad,
    },
    sidePad: {
      type: Number,
      default: DEFAULT_CTA_DESIGN.sidePad,
    },
    gapIconBrand: {
      type: Number,
      default: DEFAULT_CTA_DESIGN.gapIconBrand,
    },
    gapAfterBrand: {
      type: Number,
      default: DEFAULT_CTA_DESIGN.gapAfterBrand,
    },
    gapAfterDivider: {
      type: Number,
      default: DEFAULT_CTA_DESIGN.gapAfterDivider,
    },
    gapQrText: {
      type: Number,
      default: DEFAULT_CTA_DESIGN.gapQrText,
    },
    brandUppercase: {
      type: Boolean,
      default: DEFAULT_CTA_DESIGN.brandUppercase,
    },
    brandBold: {
      type: Boolean,
      default: DEFAULT_CTA_DESIGN.brandBold,
    },
    dividerInset: {
      type: Number,
      default: DEFAULT_CTA_DESIGN.dividerInset,
    },
    iconColor: {
      type: String,
      default: DEFAULT_CTA_DESIGN.iconColor,
    },
    qrDarkColor: {
      type: String,
      default: DEFAULT_CTA_DESIGN.qrDarkColor,
    },
    qrLightColor: {
      type: String,
      default: DEFAULT_CTA_DESIGN.qrLightColor,
    },
    previewPageSize: {
      type: String,
      enum: ["a4-invoice", "thermal-4x6"],
      default: DEFAULT_CTA_DESIGN.previewPageSize,
    },
  },
  { _id: false },
);

const StoreSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brandName: {
      type: String,
      required: true,
      trim: true,
      default: "GREEN BHARAT ENTERPRISE",
    },
    ctaUrl: {
      type: String,
      required: true,
      trim: true,
      default: "https://www.meesho.com/GREENBHARATENTERPRISE",
    },
    ctaText: {
      type: String,
      required: true,
      trim: true,
      default: "Follow our page",
    },
    platform: {
      type: String,
      enum: PLATFORMS,
      required: false,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    design: {
      type: CtaDesignSchema,
      required: false,
      default: () => ({ ...DEFAULT_CTA_DESIGN }),
    },
  },
  { timestamps: true },
);

StoreSchema.index({ isDefault: -1, name: 1 });

export type StoreDocument = InferSchemaType<typeof StoreSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Store: Model<StoreDocument> =
  mongoose.models.Store ?? mongoose.model<StoreDocument>("Store", StoreSchema);

export default Store;
export { PLATFORMS };
export type { StorePlatform } from "@/lib/store-constants";
