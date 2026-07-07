import { PlayCircleIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { CreateThumbnailDialog } from "@/components/create-thumbnail-dialog";
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
    <Empty className="flex-1">
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle className="text-lg">{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex items-center gap-2">
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
