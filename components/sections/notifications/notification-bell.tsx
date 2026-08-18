"use client";

import { BellIcon } from "lucide-react";
import Link from "next/link";
import { useNotifications } from "@/components/sections/notifications/notifications-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

function formatRelativeTime(date: string) {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMinutes = Math.round(diffMs / 60_000);
  if (diffMinutes < 1) {
    return "just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } =
    useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="relative" size="icon" variant="outline">
          <BellIcon className="text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 text-[10px]"
              variant="destructive"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80" sideOffset={4}>
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              className="h-auto p-0 text-xs"
              onClick={() => markAllRead()}
              size="sm"
              variant="link"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-2 py-6 text-center text-muted-foreground text-sm">
            You're all caught up.
          </p>
        ) : (
          <ScrollArea className="h-80">
            {notifications.map((item) => {
              const content = (
                <div className="flex w-full flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    {!item.read && (
                      <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                    <span className="truncate font-medium text-sm">
                      {item.title}
                    </span>
                  </div>
                  {item.body && (
                    <p className="line-clamp-2 text-muted-foreground text-xs">
                      {item.body}
                    </p>
                  )}
                  <span className="text-muted-foreground text-xs">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>
              );

              return (
                <DropdownMenuItem
                  asChild={Boolean(item.url)}
                  className={cn(
                    "flex-col items-start gap-1 whitespace-normal",
                    !item.read && "bg-accent/50"
                  )}
                  key={item.id}
                  onSelect={() => {
                    if (!item.read) {
                      markRead(item.id);
                    }
                  }}
                >
                  {item.url ? <Link href={item.url}>{content}</Link> : content}
                </DropdownMenuItem>
              );
            })}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
