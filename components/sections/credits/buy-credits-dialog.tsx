"use client";

import { CoinsIcon, Loader2Icon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { useCredits } from "@/components/sections/credits/credits-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CREDIT_PACKAGES } from "@/lib/credits-shared";
import { cn } from "@/lib/utils";

function formatPrice(priceUsd: number): string {
  return `$${priceUsd.toFixed(2)}`;
}

export function BuyCreditsDialog({
  children,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const { setBalance } = useCredits();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const handlePurchase = async (packageId: string) => {
    setPurchasingId(packageId);
    try {
      const response = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = (await response.json()) as {
        balance?: number;
        error?: string;
      };
      if (!(response.ok && data.balance !== undefined)) {
        throw new Error(data.error ?? "Failed to purchase credits");
      }
      setBalance(data.balance);
      toast.success("Credits added to your account");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to purchase credits"
      );
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy credits</DialogTitle>
          <DialogDescription>
            Credits are used to generate thumbnails. Fast generations cost 5
            credits, high quality generations cost 10 credits.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {CREDIT_PACKAGES.map((creditPackage) => (
            <button
              className={cn(
                "flex items-center justify-between rounded-lg border p-4 text-left transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
              )}
              disabled={purchasingId !== null}
              key={creditPackage.id}
              onClick={() => handlePurchase(creditPackage.id)}
              type="button"
            >
              <div className="flex items-center gap-3">
                <CoinsIcon className="size-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium text-sm">
                    {creditPackage.credits} credits
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {formatPrice(creditPackage.priceUsd)}
                  </span>
                </div>
              </div>
              {purchasingId === creditPackage.id ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <Button asChild size="sm" tabIndex={-1} variant="outline">
                  <span>Buy</span>
                </Button>
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
