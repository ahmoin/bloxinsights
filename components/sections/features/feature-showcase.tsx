"use client";

import {
  ChartCandlestickIcon,
  DramaIcon,
  LayoutDashboardIcon,
  LibraryBigIcon,
  ListIcon,
  PaintBucketIcon,
  PaletteIcon,
  TrendingUpIcon,
  WrenchIcon,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Highlight {
  description: string;
  icon: ReactNode;
  title: string;
}

interface Section {
  description: string;
  eyebrow: string;
  highlights: Highlight[];
  title: string;
  visual: ReactNode;
}

const analyticsHighlights: Highlight[] = [
  {
    title: "Dashboard",
    description: "Live player counts and momentum across the platform.",
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Top games",
    description: "See who's pulling the most concurrent players right now.",
    icon: <ListIcon />,
  },
  {
    title: "Trending",
    description: "Spot games gaining players fast before the front page.",
    icon: <TrendingUpIcon />,
  },
  {
    title: "Analyze",
    description: "A single game's CCU history, growth, and standing.",
    icon: <ChartCandlestickIcon />,
  },
  {
    title: "Genres",
    description: "Player activity broken down by genre.",
    icon: <PaletteIcon />,
  },
];

const thumbnailHighlights: Highlight[] = [
  {
    title: "Generate",
    description: "AI thumbnails and icons tuned for click-through.",
    icon: <PaintBucketIcon />,
  },
  {
    title: "Library",
    description: "Reference images and generated assets, organized.",
    icon: <LibraryBigIcon />,
  },
  {
    title: "Mockups",
    description: "Preview thumbnails in device and store mockups.",
    icon: <DramaIcon />,
  },
];

const toolHighlights: Highlight[] = [
  {
    title: "RBXLX to Rojo",
    description:
      "Convert a .rbxlx, .rbxmx, .rbxl, or .rbxm file into a Rojo project, entirely in your browser. No sign in required.",
    icon: <WrenchIcon />,
  },
];

const TOP_GAMES = [
  { name: "Brookhaven RP", players: "412,904", change: "+2.1%" },
  { name: "Blox Fruits", players: "298,117", change: "+5.8%" },
  { name: "Pet Simulator 99", players: "187,442", change: "-1.2%" },
];

function AnalyticsVisual() {
  return (
    <div className="relative flex aspect-4/3 w-full items-center justify-center overflow-hidden rounded-xl border bg-muted/40 p-8">
      <div className="flex h-full w-full flex-col gap-4 rounded-lg border bg-background p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">Concurrent players</span>
          <span className="font-mono text-emerald-600 text-xs dark:text-emerald-400">
            1,204,883
          </span>
        </div>
        <div className="flex flex-1 items-end gap-2">
          {[40, 65, 35, 80, 55, 95, 70].map((height, index) => (
            <motion.div
              animate={{ height: `${height}%` }}
              className="flex-1 rounded-t-sm bg-emerald-500/70"
              initial={{ height: 0 }}
              key={height}
              transition={{
                delay: index * 0.08,
                duration: 0.6,
                ease: "easeOut",
              }}
              viewport={{ once: true }}
              whileInView={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {TOP_GAMES.map((game) => (
            <div
              className="flex items-center justify-between gap-3 text-xs"
              key={game.name}
            >
              <div className="flex min-w-0 items-center gap-2">
                <div className="size-5 shrink-0 rounded-full bg-muted-foreground/20" />
                <span className="truncate font-medium">{game.name}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2 font-mono">
                <span className="text-muted-foreground">{game.players}</span>
                <span
                  className={cn(
                    game.change.startsWith("-")
                      ? "text-red-500"
                      : "text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  {game.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <motion.div
        animate={{ y: [0, -6, 0] }}
        className="absolute top-6 right-6 flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-emerald-600 text-xs shadow-sm dark:text-emerald-400"
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
      >
        <TrendingUpIcon className="size-3.5" />
        Live
      </motion.div>
    </div>
  );
}

function ThumbnailsVisual() {
  return (
    <div className="relative flex aspect-4/3 w-full items-center justify-center overflow-hidden rounded-xl border bg-muted/40 p-8">
      <div className="grid w-full grid-cols-3 gap-3">
        {[
          "from-fuchsia-400/70 to-purple-500/70",
          "from-amber-400/70 to-orange-500/70",
          "from-sky-400/70 to-blue-500/70",
          "from-emerald-400/70 to-teal-500/70",
          "from-rose-400/70 to-pink-500/70",
          "from-violet-400/70 to-indigo-500/70",
        ].map((gradient, index) => (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "aspect-video rounded-lg border bg-gradient-to-br shadow-sm",
              gradient
            )}
            initial={{ opacity: 0, scale: 0.85 }}
            key={gradient}
            transition={{ delay: index * 0.08, duration: 0.4 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileInView={{ opacity: 1, scale: 1 }}
          />
        ))}
      </div>
      <motion.div
        animate={{ y: [0, -6, 0] }}
        className="absolute top-6 left-6 flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-fuchsia-600 text-xs shadow-sm dark:text-fuchsia-400"
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
      >
        <PaintBucketIcon className="size-3.5" />
        Generating
      </motion.div>
    </div>
  );
}

function ToolsVisual() {
  return (
    <div className="relative flex aspect-4/3 w-full items-center justify-center overflow-hidden rounded-xl border bg-muted/40 p-8">
      <div className="flex w-full items-center justify-center gap-4">
        <div className="flex flex-col items-start gap-1 rounded-lg border bg-background px-4 py-3 shadow-sm">
          <div className="rounded bg-orange-500/20 px-2 py-1 font-mono text-orange-600 text-xs dark:text-orange-400">
            .rbxlx
          </div>
          <span className="font-mono text-muted-foreground text-xs">
            MyPlace.rbxlx
          </span>
          <span className="font-mono text-muted-foreground text-xs">
            4.2 MB
          </span>
        </div>
        <motion.div
          animate={{ x: [0, 8, 0] }}
          className="text-muted-foreground"
          transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY }}
        >
          <svg
            aria-hidden="true"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <title>Converts to</title>
            <path
              d="M5 12h14m0 0-6-6m6 6-6 6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
        <div className="flex flex-col items-start gap-1 rounded-lg border bg-background px-4 py-3 shadow-sm">
          <div className="rounded bg-emerald-500/20 px-2 py-1 font-mono text-emerald-600 text-xs dark:text-emerald-400">
            rojo/
          </div>
          <span className="font-mono text-muted-foreground text-xs">
            src/init.lua
          </span>
          <span className="font-mono text-muted-foreground text-xs">
            default.project.json
          </span>
        </div>
      </div>
    </div>
  );
}

const sections: Section[] = [
  {
    eyebrow: "Analytics",
    title: "See what's actually happening on Roblox",
    description:
      "Track player counts and momentum across every game on the platform, then zoom into the one you care about.",
    highlights: analyticsHighlights,
    visual: <AnalyticsVisual />,
  },
  {
    eyebrow: "Thumbnails",
    title: "Design thumbnails without leaving your dashboard",
    description:
      "Generate, organize, and preview thumbnails in the same place you track your game's numbers.",
    highlights: thumbnailHighlights,
    visual: <ThumbnailsVisual />,
  },
  {
    eyebrow: "Tools",
    title: "Developer utilities that run in your browser",
    description:
      "No installs, no accounts required for the tools that just need to run once.",
    highlights: toolHighlights,
    visual: <ToolsVisual />,
  },
];

function FeatureRow({ section, index }: { section: Section; index: number }) {
  const reversed = index % 2 === 1;

  return (
    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <motion.div
        className={cn(reversed && "lg:order-2")}
        initial={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, margin: "-80px" }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        {section.visual}
      </motion.div>
      <motion.div
        className={cn("flex flex-col gap-6", reversed && "lg:order-1")}
        initial={{ opacity: 0, y: 24 }}
        transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, margin: "-80px" }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col gap-3">
          <span className="font-medium text-emerald-600 text-xs uppercase tracking-widest dark:text-emerald-400">
            {section.eyebrow}
          </span>
          <h2 className="font-semibold text-3xl tracking-tight">
            {section.title}
          </h2>
          <p className="text-muted-foreground">{section.description}</p>
        </div>
        <div className="flex flex-col gap-4">
          {section.highlights.map((highlight, highlightIndex) => (
            <motion.div
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -12 }}
              key={highlight.title}
              transition={{
                delay: 0.15 + highlightIndex * 0.06,
                duration: 0.4,
              }}
              viewport={{ once: true, margin: "-80px" }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted text-foreground [&_svg]:size-4">
                {highlight.icon}
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-sm">{highlight.title}</span>
                <span className="text-muted-foreground text-sm">
                  {highlight.description}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export function FeatureShowcase() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-24 px-4 py-16 lg:px-6 lg:py-24">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 text-center"
        initial={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="max-w-2xl font-semibold text-4xl tracking-tight lg:text-5xl">
          Everything you need to track and grow on Roblox
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Analytics on every game on the platform, AI thumbnail tools, and
          developer utilities, all in one dashboard.
        </p>
        <Button asChild size="lg">
          <Link href="/signup">Get started</Link>
        </Button>
      </motion.div>

      <div className="flex flex-col gap-24">
        {sections.map((section, index) => (
          <FeatureRow index={index} key={section.eyebrow} section={section} />
        ))}
      </div>
    </div>
  );
}
