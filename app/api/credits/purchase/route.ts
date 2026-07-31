import { headers } from "next/headers";
import { getSessionSafe } from "@/lib/auth";
import { addPurchasedCredits } from "@/lib/credits";
import { getCreditPackage } from "@/lib/credits-shared";

// TODO: replace this mock grant with real payment handling (Stripe checkout,
// webhook-confirmed fulfillment) once billing is wired up.
export async function POST(request: Request) {
  const session = await getSessionSafe(await headers());
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { packageId?: string };
  const creditPackage = getCreditPackage(body.packageId ?? "");
  if (!creditPackage) {
    return Response.json({ error: "Invalid package" }, { status: 400 });
  }

  const balance = await addPurchasedCredits(
    session.user.id,
    creditPackage.credits,
    `Purchased ${creditPackage.credits} credits ($${creditPackage.priceUsd})`
  );

  return Response.json({ balance });
}
