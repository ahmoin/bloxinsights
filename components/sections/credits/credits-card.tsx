"use client";

import { BuyCreditsDialog } from "@/components/sections/credits/buy-credits-dialog";
import { useCredits } from "@/components/sections/credits/credits-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface CreditTransactionItem {
  amount: number;
  balanceAfter: number;
  createdAt: string;
  description: string;
  id: string;
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function CreditsCard({
  transactions,
}: {
  transactions: CreditTransactionItem[];
}) {
  const { balance } = useCredits();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credits</CardTitle>
        <CardDescription>
          Credits are used to generate thumbnails.
        </CardDescription>
        <CardAction>
          <BuyCreditsDialog>
            <Button size="sm">Buy credits</Button>
          </BuyCreditsDialog>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-baseline gap-1">
          <span className="font-semibold text-2xl">{balance}</span>
          <span className="text-muted-foreground text-sm">credits</span>
        </div>
        {transactions.length > 0 && (
          <div className="flex flex-col divide-y rounded-md border">
            {transactions.map((transaction) => (
              <div
                className="flex items-center justify-between gap-4 p-3 text-sm"
                key={transaction.id}
              >
                <div className="flex flex-col">
                  <span>{transaction.description}</span>
                  <span className="text-muted-foreground text-xs">
                    {formatDate(transaction.createdAt)}
                  </span>
                </div>
                <span
                  className={
                    transaction.amount >= 0
                      ? "text-green-600 dark:text-green-500"
                      : "text-muted-foreground"
                  }
                >
                  {transaction.amount >= 0 ? "+" : ""}
                  {transaction.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
