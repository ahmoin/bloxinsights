"use client";

import { useState } from "react";
import {
  type MockupGame,
  RobloxHomepageMockup,
} from "@/components/sections/mockups/roblox-homepage-mockup";
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
      <div className="flex items-center gap-2">
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
      </div>
      <RobloxHomepageMockup
        games={games}
        selectedImageUrl={selected.imageUrl}
      />
    </div>
  );
}
