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

export type StoreDocument = InferSchemaType<typeof StoreSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Store: Model<StoreDocument> =
  mongoose.models.Store ?? mongoose.model<StoreDocument>("Store", StoreSchema);

export default Store;
export { PLATFORMS };
export type { StorePlatform } from "@/lib/store-constants";
