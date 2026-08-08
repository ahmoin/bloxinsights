"use client";

import { Loader2Icon, PencilIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { type KeyboardEvent, useState } from "react";
import { toast } from "sonner";
import { CreateThumbnailDialog } from "@/components/sections/thumbnails/create-thumbnail-dialog";
import { UploadThumbnailDialog } from "@/components/sections/thumbnails/upload-thumbnail-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface LibraryThumbnail {
  id: string;
  imageUrl: string;
  kind: string;
  prompt: string;
}

export function ThumbnailGrid({
  initialThumbnails,
}: {
  initialThumbnails: LibraryThumbnail[];
}) {
  const [thumbnails, setThumbnails] = useState(initialThumbnails);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const startRenaming = (item: LibraryThumbnail) => {
    setRenamingId(item.id);
    setRenameValue(item.prompt);
  };

  const cancelRenaming = () => {
    setRenamingId(null);
    setRenameValue("");
  };

  const commitRename = async () => {
    const id = renamingId;
    const name = renameValue.trim();
    if (!id) {
      return;
    }
    const original = thumbnails.find((item) => item.id === id)?.prompt;
    cancelRenaming();
    if (!name || name === original) {
      return;
    }
    setThumbnails((current) =>
      current.map((item) => (item.id === id ? { ...item, prompt: name } : item))
    );
    try {
      const response = await fetch("/api/thumbnails", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name }),
      });
      if (!response.ok) {
        throw new Error("Failed to rename thumbnail");
      }
    } catch {
      toast.error("Failed to rename thumbnail");
      setThumbnails((current) =>
        current.map((item) =>
          item.id === id && original ? { ...item, prompt: original } : item
        )
      );
    }
  };

  const handleRenameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    } else if (event.key === "Escape") {
      cancelRenaming();
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(
        `/api/thumbnails?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        throw new Error("Failed to delete thumbnail");
      }
      setThumbnails((current) => current.filter((item) => item.id !== id));
    } catch {
      toast.error("Failed to delete thumbnail");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <div className="flex items-center gap-3">
        <CreateThumbnailDialog />
        <UploadThumbnailDialog />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {thumbnails.map((item) => (
          <div
            className="group relative flex flex-col gap-2 overflow-hidden rounded-lg border"
            key={item.id}
          >
            <a
              className="block"
              href={item.imageUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Image
                alt={item.prompt}
                className={
                  item.kind === "icon"
                    ? "aspect-square w-full object-cover"
                    : "aspect-video w-full object-cover"
                }
                height={item.kind === "icon" ? 384 : 216}
                src={item.imageUrl}
                unoptimized
                width={384}
              />
            </a>
            {renamingId === item.id ? (
              <Input
                autoFocus
                className="mx-3 mb-3 h-7"
                onBlur={commitRename}
                onChange={(event) => setRenameValue(event.target.value)}
                onKeyDown={handleRenameKeyDown}
                value={renameValue}
              />
            ) : (
              <p className="truncate px-3 pb-3 text-muted-foreground text-sm">
                {item.prompt}
              </p>
            )}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                aria-label={`Rename ${item.prompt}`}
                onClick={() => startRenaming(item)}
                size="icon-sm"
                type="button"
                variant="outline"
              >
                <PencilIcon />
              </Button>
              <Button
                aria-label={`Delete ${item.prompt}`}
                disabled={deletingId === item.id}
                onClick={() => handleDelete(item.id)}
                size="icon-sm"
                type="button"
                variant="destructive"
              >
                {deletingId === item.id ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <TrashIcon />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
