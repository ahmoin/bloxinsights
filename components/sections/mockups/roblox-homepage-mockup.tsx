import { BellIcon, HomeIcon, SearchIcon } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export interface MockupGame {
  name: string;
  thumbnailUrl: string | null;
  universeId: number;
}

const FRIEND_COUNT = 8;
const SAMPLE_CARD_INDEX = 2;

function friendInitial(index: number): string {
  return String.fromCharCode(65 + (index % 26));
}

function GameCardImage({ entry }: { entry: MockupGame }) {
  if (entry.thumbnailUrl) {
    return (
      <Image
        alt={entry.name}
        className="object-cover"
        fill
        src={entry.thumbnailUrl}
        unoptimized
      />
    );
  }
  return <div className="size-full bg-white/10" />;
}

export function RobloxHomepageMockup({
  games,
  selectedImageUrl,
}: {
  games: MockupGame[];
  selectedImageUrl: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-[#181818] text-white">
      <div className="flex items-center gap-4 border-white/10 border-b px-4 py-3">
        <span className="font-extrabold text-lg text-red-500">Roblox</span>
        <div className="relative max-w-sm flex-1">
          <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-white/50" />
          <Input
            className="border-white/10 bg-white/5 pl-8 text-white placeholder:text-white/40"
            placeholder="Search"
            readOnly
            value=""
          />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <HomeIcon className="size-5 text-white/70" />
          <BellIcon className="size-5 text-white/70" />
          <Avatar className="size-7">
            <AvatarFallback>Y</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-4">
        <div>
          <h3 className="mb-3 font-bold text-base">Friends ({FRIEND_COUNT})</h3>
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: FRIEND_COUNT }, (_, index) => (
              <div
                className="flex flex-col items-center gap-1"
                key={`friend-${friendInitial(index)}`}
              >
                <Avatar className="size-10">
                  <AvatarFallback>{friendInitial(index)}</AvatarFallback>
                </Avatar>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-bold text-base">Recommended For You</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {games.map((entry, index) => {
              const isSampleCard = index === SAMPLE_CARD_INDEX;
              return (
                <div className="flex flex-col gap-2" key={entry.universeId}>
                  <div className="relative aspect-video overflow-hidden rounded-md">
                    {isSampleCard ? (
                      <>
                        <Image
                          alt="Your thumbnail"
                          className="object-cover"
                          fill
                          src={selectedImageUrl}
                          unoptimized
                        />
                        <Badge
                          className="absolute top-2 left-2"
                          variant="secondary"
                        >
                          Your thumbnail
                        </Badge>
                      </>
                    ) : (
                      <GameCardImage entry={entry} />
                    )}
                  </div>
                  <div className="truncate font-medium text-sm">
                    {isSampleCard ? "My Awesome Game" : entry.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
