import type { ThumbnailModelId } from "@/lib/thumbnails";

export interface CreditPackage {
  credits: number;
  id: string;
  priceUsd: number;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: "starter", credits: 100, priceUsd: 20 },
  { id: "pro", credits: 250, priceUsd: 44.99 },
  { id: "studio", credits: 500, priceUsd: 74.99 },
];

export const THUMBNAIL_CREDIT_COSTS: Record<ThumbnailModelId, number> = {
  fast: 5,
  quality: 10,
};

export function getCreditPackage(packageId: string): CreditPackage | null {
  return CREDIT_PACKAGES.find((pkg) => pkg.id === packageId) ?? null;
}
