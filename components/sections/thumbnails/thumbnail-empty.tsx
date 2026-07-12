import { PlayCircleIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { CreateThumbnailDialog } from "@/components/sections/thumbnails/create-thumbnail-dialog";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

const TUTORIAL_URL =
  "https://www.youtube.com/results?search_query=roblox+thumbnail+tutorial";

export function ThumbnailEmpty({
  description,
  icon,
  showTutorial = false,
  title,
}: {
  description: string;
  icon: ReactNode;
  showTutorial?: boolean;
  title: string;
}) {
  return (
    <Empty className="flex-1 gap-8 p-10">
      <EmptyHeader className="max-w-lg gap-4">
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle className="font-semibold text-3xl tracking-tight">
          {title}
        </EmptyTitle>
        <EmptyDescription className="text-base">{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex items-center gap-3">
          <CreateThumbnailDialog />
          {showTutorial && (
            <Button asChild variant="outline">
              <Link href={TUTORIAL_URL} rel="noopener" target="_blank">
                <PlayCircleIcon />
                Watch Tutorial
              </Link>
            </Button>
          )}
        </div>
      </EmptyContent>
    </Empty>
  );
}
