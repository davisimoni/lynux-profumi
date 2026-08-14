import { NextResponse } from "next/server";
import { z } from "zod";
import { getReviewsRepository } from "@/lib/reviews/repository";
import { products } from "@/data/products";

export async function GET(request: Request) {
  const productId = new URL(request.url).searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "missing_product_id" }, { status: 400 });
  }

  const reviews = await getReviewsRepository().listByProduct(productId);
  return NextResponse.json({ reviews });
}

const reviewInputSchema = z.object({
  productId: z.string().min(1),
  authorName: z.string().trim().min(2).max(60),
  rating: z.number().int().min(1).max(5),
  sillage: z.number().int().min(1).max(5),
  longevity: z.number().int().min(1).max(5),
  body: z.string().trim().min(10).max(600),
});

export async function POST(request: Request) {
  const parsed = reviewInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  if (!products.some((product) => product.id === parsed.data.productId)) {
    return NextResponse.json({ error: "unknown_product" }, { status: 404 });
  }

  const review = await getReviewsRepository().create(parsed.data);
  return NextResponse.json({ review }, { status: 201 });
}
