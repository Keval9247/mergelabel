import { NextResponse } from "next/server";
import { mergeCtaDesign, type CtaDesign } from "@/lib/cta-design";
import dbConnect from "@/lib/db";
import { PLATFORMS, type StorePlatform } from "@/lib/store-constants";
import Store from "@/models/Store";

type StoreBody = {
  name?: string;
  brandName?: string;
  ctaUrl?: string;
  ctaText?: string;
  platform?: StorePlatform | "";
  isDefault?: boolean;
  design?: Partial<CtaDesign> | null;
};

export async function GET() {
  try {
    await dbConnect();
    const stores = await Store.find().sort({ isDefault: -1, name: 1 }).lean();
    return NextResponse.json(
      stores.map((s) => ({
        ...s,
        _id: String(s._id),
        design: mergeCtaDesign(s.design as Partial<CtaDesign> | null | undefined),
      })),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch stores";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = (await request.json()) as StoreBody;

    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const platform =
      body.platform && PLATFORMS.includes(body.platform as StorePlatform)
        ? (body.platform as StorePlatform)
        : undefined;

    const count = await Store.countDocuments();
    const isDefault = Boolean(body.isDefault) || count === 0;

    if (isDefault) {
      await Store.updateMany({ isDefault: true }, { $set: { isDefault: false } });
    }

    const design = mergeCtaDesign(body.design);

    const store = await Store.create({
      name,
      brandName: body.brandName?.trim() || "GREEN BHARAT ENTERPRISE",
      ctaUrl:
        body.ctaUrl?.trim() || "https://www.meesho.com/GREENBHARATENTERPRISE",
      ctaText: body.ctaText?.trim() || "Follow our page",
      ...(platform ? { platform } : {}),
      isDefault,
      design,
    });

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create store";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
