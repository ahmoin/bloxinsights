import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { creditTransaction, user } from "@/lib/schema";

export class InsufficientCreditsError extends Error {
  constructor() {
    super("Not enough credits");
    this.name = "InsufficientCreditsError";
  }
}

export async function getCreditBalance(userId: string): Promise<number> {
  const row = await db.query.user.findFirst({
    columns: { creditBalance: true },
    where: (table, { eq: whereEq }) => whereEq(table.id, userId),
  });
  return row?.creditBalance ?? 0;
}

async function recordTransaction(
  userId: string,
  amount: number,
  type: "purchase" | "thumbnail_generation" | "refund" | "grant",
  description: string
): Promise<number> {
  return await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(user)
      .set({ creditBalance: sql`${user.creditBalance} + ${amount}` })
      .where(eq(user.id, userId))
      .returning({ creditBalance: user.creditBalance });

    if (!updated) {
      throw new Error("User not found");
    }
    if (updated.creditBalance < 0) {
      throw new InsufficientCreditsError();
    }

    await tx.insert(creditTransaction).values({
      id: randomUUID(),
      userId,
      amount,
      balanceAfter: updated.creditBalance,
      type,
      description,
    });

    return updated.creditBalance;
  });
}

export async function deductCredits(
  userId: string,
  amount: number,
  description: string
): Promise<number> {
  return await recordTransaction(
    userId,
    -amount,
    "thumbnail_generation",
    description
  );
}

export async function refundCredits(
  userId: string,
  amount: number,
  description: string
): Promise<number> {
  return await recordTransaction(userId, amount, "refund", description);
}

export async function addPurchasedCredits(
  userId: string,
  amount: number,
  description: string
): Promise<number> {
  return await recordTransaction(userId, amount, "purchase", description);
}

export async function listCreditTransactions(userId: string) {
  return await db.query.creditTransaction.findMany({
    orderBy: (row, { desc }) => desc(row.createdAt),
    where: (row, { eq: whereEq }) => whereEq(row.userId, userId),
    limit: 20,
  });
}
