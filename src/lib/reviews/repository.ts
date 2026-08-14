import "server-only";
import { randomUUID } from "crypto";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/client";
import { REVIEWS_SEED } from "@/data/reviews-seed";
import type { Review, ReviewInput } from "@/lib/reviews/types";

export interface ReviewsRepository {
  listByProduct(productId: string): Promise<Review[]>;
  create(input: ReviewInput): Promise<Review>;
}

// --- Supabase-backed implementation -----------------------------------------

interface ReviewRow {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  sillage: number;
  longevity: number;
  body: string;
  created_at: string;
}

function fromRow(row: ReviewRow): Review {
  return {
    id: row.id,
    productId: row.product_id,
    authorName: row.author_name,
    rating: row.rating,
    sillage: row.sillage,
    longevity: row.longevity,
    body: row.body,
    createdAt: row.created_at,
  };
}

class SupabaseReviewsRepository implements ReviewsRepository {
  async listByProduct(productId: string): Promise<Review[]> {
    const client = getSupabaseAdminClient();
    if (!client) return [];
    const { data } = await client
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    return (data ?? []).map((row) => fromRow(row as ReviewRow));
  }

  async create(input: ReviewInput): Promise<Review> {
    const review: Review = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
    const client = getSupabaseAdminClient();
    if (client) {
      await client.from("reviews").insert({
        id: review.id,
        product_id: review.productId,
        author_name: review.authorName,
        rating: review.rating,
        sillage: review.sillage,
        longevity: review.longevity,
        body: review.body,
        created_at: review.createdAt,
      });
    }
    return review;
  }
}

// --- In-memory fallback (no Supabase configured) ----------------------------
// Same rationale as the orders fallback: process-lifetime only, seeded with
// realistic reviews so every product page reads as a lived-in demo.

const globalForReviews = globalThis as unknown as {
  __lynuxReviews?: Map<string, Review[]>;
};

function getStore(): Map<string, Review[]> {
  if (!globalForReviews.__lynuxReviews) {
    const store = new Map<string, Review[]>();
    for (const review of REVIEWS_SEED) {
      const bucket = store.get(review.productId) ?? [];
      bucket.push(review);
      store.set(review.productId, bucket);
    }
    globalForReviews.__lynuxReviews = store;
  }
  return globalForReviews.__lynuxReviews;
}

class InMemoryReviewsRepository implements ReviewsRepository {
  async listByProduct(productId: string): Promise<Review[]> {
    const bucket = getStore().get(productId) ?? [];
    return [...bucket].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async create(input: ReviewInput): Promise<Review> {
    const review: Review = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
    const store = getStore();
    const bucket = store.get(input.productId) ?? [];
    bucket.push(review);
    store.set(input.productId, bucket);
    return review;
  }
}

let repository: ReviewsRepository | null = null;

export function getReviewsRepository(): ReviewsRepository {
  if (!repository) {
    repository = isSupabaseConfigured ? new SupabaseReviewsRepository() : new InMemoryReviewsRepository();
  }
  return repository;
}
