"use client";

import { ImageUpIcon, Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LibraryAsset } from "@/lib/assets-shared";
import { cn } from "@/lib/utils";

export function LibraryAssetPicker({
  disabledPaths = [],
  maxSelectable,
  onConfirm,
  onOpenChange,
  open,
}: {
  disabledPaths?: string[];
  maxSelectable: number;
  onConfirm: (assets: LibraryAsset[]) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const [assets, setAssets] = useState<LibraryAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<LibraryAsset[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setSelected([]);
    setIsLoading(true);
    fetch("/api/assets")
      .then((response) => response.json())
      .then((data: { assets: LibraryAsset[] }) => setAssets(data.assets))
      .catch(() => toast.error("Failed to load your library"))
      .finally(() => setIsLoading(false));
  }, [open]);

  const toggleAsset = (asset: LibraryAsset) => {
    setSelected((current) => {
      const isSelected = current.some((item) => item.id === asset.id);
      if (isSelected) {
        return current.filter((item) => item.id !== asset.id);
      }
      if (current.length >= maxSelectable) {
        toast.error(`You can only select up to ${maxSelectable} images`);
        return current;
      }
      return [...current, asset];
    });
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-10">
          <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
        </div>
      );
    }
    if (assets.length === 0) {
      return (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <ImageUpIcon className="size-6 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            You haven't uploaded any assets yet.
          </p>
        </div>
      );
    }
    return (
      <ScrollArea className="h-80">
        <div className="grid grid-cols-3 gap-2 pr-3">
          {assets.map((asset) => {
            const isDisabled = disabledPaths.includes(asset.path);
            const isSelected = selected.some((item) => item.id === asset.id);
            return (
              <button
                className={cn(
                  "relative overflow-hidden rounded-md border-2 disabled:cursor-not-allowed disabled:opacity-40",
                  isSelected ? "border-primary" : "border-transparent"
                )}
                disabled={isDisabled}
                key={asset.id}
                onClick={() => toggleAsset(asset)}
                type="button"
              >
                <Image
                  alt={asset.name}
                  className="aspect-video w-full object-cover"
                  height={90}
                  src={asset.imageUrl}
                  unoptimized
                  width={160}
                />
              </button>
            );
          })}
        </div>
      </ScrollArea>
    );
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Choose from your library</DialogTitle>
          <DialogDescription>
            Select up to {maxSelectable} assets to use as references.
          </DialogDescription>
        </DialogHeader>
        {renderBody()}
        <DialogFooter>
          <Button
            disabled={selected.length === 0}
            onClick={() => {
              onConfirm(selected);
              onOpenChange(false);
            }}
            type="button"
          >
            Add {selected.length > 0 ? selected.length : ""} selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
