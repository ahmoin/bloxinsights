"use client";

import { ImageUpIcon, Loader2Icon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { type ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { LibraryAsset } from "@/lib/assets-shared";

export function AssetGrid({
  initialAssets,
}: {
  initialAssets: LibraryAsset[];
}) {
  const [assets, setAssets] = useState(initialAssets);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])];
    event.target.value = "";
    if (files.length === 0) {
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }
      const response = await fetch("/api/assets", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to upload assets");
      }
      const data = (await response.json()) as { assets: LibraryAsset[] };
      setAssets((current) => [...data.assets, ...current]);
    } catch {
      toast.error("Failed to upload assets");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/assets?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete asset");
      }
      setAssets((current) => current.filter((asset) => asset.id !== id));
    } catch {
      toast.error("Failed to delete asset");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Upload reference images to use when generating thumbnails.
        </p>
        <input
          accept="image/*"
          className="hidden"
          multiple
          onChange={handleUpload}
          ref={fileInputRef}
          type="file"
        />
        <Button
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          size="sm"
        >
          {isUploading ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <ImageUpIcon />
          )}
          Upload
        </Button>
      </div>
      {assets.length === 0 ? (
        <Empty className="flex-1 gap-8 p-10">
          <EmptyHeader className="max-w-lg gap-4">
            <EmptyMedia variant="icon">
              <ImageUpIcon />
            </EmptyMedia>
            <EmptyTitle className="font-semibold text-3xl tracking-tight">
              No assets yet
            </EmptyTitle>
            <EmptyDescription className="text-base">
              Upload images to reuse them as references when generating
              thumbnails.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => fileInputRef.current?.click()}>
              <ImageUpIcon />
              Upload images
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {assets.map((asset) => (
            <div
              className="group relative flex flex-col gap-2 overflow-hidden rounded-lg border"
              key={asset.id}
            >
              <Image
                alt={asset.name}
                className="aspect-video w-full object-cover"
                height={216}
                src={asset.imageUrl}
                unoptimized
                width={384}
              />
              <p className="truncate px-3 pb-3 text-muted-foreground text-sm">
                {asset.name}
              </p>
              <Button
                aria-label={`Delete ${asset.name}`}
                className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                disabled={deletingId === asset.id}
                onClick={() => handleDelete(asset.id)}
                size="icon-sm"
                type="button"
                variant="destructive"
              >
                {deletingId === asset.id ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <TrashIcon />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
