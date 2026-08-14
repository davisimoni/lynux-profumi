export interface Review {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  sillage: number;
  longevity: number;
  body: string;
  createdAt: string;
}

export interface ReviewInput {
  productId: string;
  authorName: string;
  rating: number;
  sillage: number;
  longevity: number;
  body: string;
}

export const SILLAGE_LABELS = ["Intima", "Leggera", "Moderata", "Forte", "Enorme"];
export const LONGEVITY_LABELS = ["Debole", "Moderata", "Buona", "Lunga", "Eterna"];

export interface ReviewAggregate {
  count: number;
  averageRating: number;
  averageSillage: number;
  averageLongevity: number;
}

export function aggregateReviews(reviews: Review[]): ReviewAggregate {
  if (reviews.length === 0) {
    return { count: 0, averageRating: 0, averageSillage: 0, averageLongevity: 0 };
  }

  const sum = reviews.reduce(
    (acc, review) => ({
      rating: acc.rating + review.rating,
      sillage: acc.sillage + review.sillage,
      longevity: acc.longevity + review.longevity,
    }),
    { rating: 0, sillage: 0, longevity: 0 },
  );

  return {
    count: reviews.length,
    averageRating: sum.rating / reviews.length,
    averageSillage: sum.sillage / reviews.length,
    averageLongevity: sum.longevity / reviews.length,
  };
}
