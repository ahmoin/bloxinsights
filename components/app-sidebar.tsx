"use client";

import {
  ChartCandlestickIcon,
  CircleHelpIcon,
  DramaIcon,
  LayoutDashboardIcon,
  LibraryBigIcon,
  ListIcon,
  PaintBucketIcon,
  PaletteIcon,
  SearchIcon,
  Settings2Icon,
  TrendingUpIcon,
} from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";
import { Icons } from "@/components/icons";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavThumbnails } from "@/components/nav-thumbnails";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { siteConfig } from "@/lib/config";

const data = {
  user: {
    name: "John Doe",
    email: "john@example.com",
    avatar: "/avatars/john.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Top",
      url: "/top",
      icon: <ListIcon />,
    },
    {
      title: "Trending",
      url: "/trending",
      icon: <TrendingUpIcon />,
    },
    {
      title: "Analyze",
      url: "/analyze",
      icon: <ChartCandlestickIcon />,
    },
    {
      title: "Genres",
      url: "/genres",
      icon: <PaletteIcon />,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: <Settings2Icon />,
    },
    {
      title: "Get Help",
      url: "/help",
      icon: <CircleHelpIcon />,
    },
    {
      title: "Search",
      url: "/search",
      icon: <SearchIcon />,
    },
  ],
  thumbnails: [
    {
      name: "Generate",
      url: "/generate",
      icon: <PaintBucketIcon />,
    },
    {
      name: "Library",
      url: "/library",
      icon: <LibraryBigIcon />,
    },
    {
      name: "Mockups",
      url: "/mockups",
      icon: <DramaIcon />,
    },
  ],
};

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <Icons.logo className="size-5!" />
                <span className="font-semibold text-base">
                  {siteConfig.name}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavThumbnails items={data.thumbnails} />
        <NavSecondary className="mt-auto" items={data.navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
