"use client";

import { useState } from "react";
import {
  type MockupGame,
  RobloxHomepageMockup,
} from "@/components/sections/mockups/roblox-homepage-mockup";
import { CreateThumbnailDialog } from "@/components/sections/thumbnails/create-thumbnail-dialog";
import { UploadThumbnailDialog } from "@/components/sections/thumbnails/upload-thumbnail-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface MockupThumbnail {
  id: string;
  imageUrl: string;
  prompt: string;
}

export function MockupsView({
  games,
  thumbnails,
}: {
  games: MockupGame[];
  thumbnails: MockupThumbnail[];
}) {
  const [selectedId, setSelectedId] = useState(thumbnails[0].id);
  const selected =
    thumbnails.find((item) => item.id === selectedId) ?? thumbnails[0];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-sm">Thumbnail</span>
        <Select onValueChange={setSelectedId} value={selectedId}>
          <SelectTrigger className="w-full sm:w-80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {thumbnails.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.prompt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2">
          <CreateThumbnailDialog />
          <UploadThumbnailDialog />
        </div>
      </div>
      <RobloxHomepageMockup
        games={games}
        selectedImageUrl={selected.imageUrl}
      />
    </div>
  );
}
