"use client";

import { CoinsIcon } from "lucide-react";
import { BuyCreditsDialog } from "@/components/sections/credits/buy-credits-dialog";
import { useCredits } from "@/components/sections/credits/credits-provider";
import { Button } from "@/components/ui/button";

export function CreditBalanceBadge() {
  const { balance } = useCredits();

  return (
    <BuyCreditsDialog>
      <Button size="sm" variant="outline">
        <CoinsIcon className="text-muted-foreground" />
        {balance} credits
      </Button>
    </BuyCreditsDialog>
  );
}
