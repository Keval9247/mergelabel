import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { mergeCtaDesign, type CtaDesign } from "@/lib/cta-design";
import dbConnect from "@/lib/db";
import { PLATFORMS, type StorePlatform } from "@/lib/store-constants";
import Store from "@/models/Store";

type RouteCtx = { params: Promise<{ id: string }> };

type StoreBody = {
  name?: string;
  brandName?: string;
  ctaUrl?: string;
  ctaText?: string;
  platform?: StorePlatform | "" | null;
  isDefault?: boolean;
  design?: Partial<CtaDesign> | null;
};

function isValidId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(_request: Request, context: RouteCtx) {
  try {
    const { id } = await context.params;
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid store id" }, { status: 400 });
    }

    await dbConnect();
    const store = await Store.findById(id).lean();
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...store,
      design: mergeCtaDesign(store.design as Partial<CtaDesign> | null | undefined),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch store";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteCtx) {
  try {
    const { id } = await context.params;
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid store id" }, { status: 400 });
    }

    await dbConnect();
    const body = (await request.json()) as StoreBody;

    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const platform =
      body.platform === "" || body.platform === null
        ? null
        : body.platform && PLATFORMS.includes(body.platform as StorePlatform)
          ? (body.platform as StorePlatform)
          : undefined;

    const update: Record<string, unknown> = {
      name,
      brandName: body.brandName?.trim() || "GREEN BHARAT ENTERPRISE",
      ctaUrl:
        body.ctaUrl?.trim() || "https://www.meesho.com/GREENBHARATENTERPRISE",
      ctaText: body.ctaText?.trim() || "Follow our page",
    };

    if (typeof body.isDefault === "boolean") {
      update.isDefault = body.isDefault;
    }

    if (platform !== undefined && platform !== null) {
      update.platform = platform;
    }

    if (body.design !== undefined) {
      update.design = mergeCtaDesign(body.design);
    }

    if (update.isDefault === true) {
      await Store.updateMany(
        { _id: { $ne: id }, isDefault: true },
        { $set: { isDefault: false } },
      );
    }

    const store =
      platform === null
        ? await Store.findByIdAndUpdate(
            id,
            { $set: update, $unset: { platform: "" } },
            { new: true, runValidators: true },
          )
        : await Store.findByIdAndUpdate(id, { $set: update }, {
            new: true,
            runValidators: true,
          });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json(store);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update store";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteCtx) {
  try {
    const { id } = await context.params;
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid store id" }, { status: 400 });
    }

    await dbConnect();
    const store = await Store.findByIdAndDelete(id);
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    if (store.isDefault) {
      const next = await Store.findOne().sort({ createdAt: 1 });
      if (next) {
        next.isDefault = true;
        await next.save();
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete store";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
