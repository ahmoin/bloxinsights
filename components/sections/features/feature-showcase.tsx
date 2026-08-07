"use client";

import {
  ChartCandlestickIcon,
  DramaIcon,
  LayoutDashboardIcon,
  LibraryBigIcon,
  ListIcon,
  PaintBucketIcon,
  PaletteIcon,
  SparklesIcon,
  TrendingUpIcon,
  WrenchIcon,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { FeatureShowcaseData } from "@/lib/ccu";
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
    title: "RBXL to Rojo",
    description:
      "Convert a .rbxl, .rbxlx, .rbxm, or .rbxmx file into a Rojo project, entirely in your browser. No sign in required.",
    icon: <WrenchIcon />,
  },
];

const FALLBACK_GAMES: FeatureShowcaseData["games"] = [
  {
    name: "Brookhaven RP",
    playerCount: 412_904,
    changePercent: 2.1,
    iconUrl: null,
  },
  {
    name: "Blox Fruits",
    playerCount: 298_117,
    changePercent: 5.8,
    iconUrl: null,
  },
  {
    name: "Pet Simulator 99",
    playerCount: 187_442,
    changePercent: -1.2,
    iconUrl: null,
  },
];

const FALLBACK_CHART_POINTS = [40, 65, 35, 80, 55, 95, 70];
const MIN_BAR_HEIGHT_PERCENT = 8;
const MAX_BAR_HEIGHT_PERCENT = 100;

interface ChartBar {
  height: number;
  id: string;
}

function chartHeights(points: number[]): ChartBar[] {
  const values = points.length === 0 ? FALLBACK_CHART_POINTS : points;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  return values.map((value, index) => ({
    id: `bar-${index}`,
    height:
      range <= 0
        ? MAX_BAR_HEIGHT_PERCENT
        : MIN_BAR_HEIGHT_PERCENT +
          ((value - min) / range) *
            (MAX_BAR_HEIGHT_PERCENT - MIN_BAR_HEIGHT_PERCENT),
  }));
}

function AnalyticsVisual({
  showcaseData,
}: {
  showcaseData: FeatureShowcaseData;
}) {
  const games =
    showcaseData.games.length > 0 ? showcaseData.games : FALLBACK_GAMES;
  const totalPlayers =
    showcaseData.totalPlayers > 0
      ? showcaseData.totalPlayers
      : FALLBACK_GAMES.reduce((sum, item) => sum + item.playerCount, 0);
  const barHeights = chartHeights(showcaseData.chartPoints);

  return (
    <div className="relative flex aspect-4/3 w-full items-center justify-center overflow-hidden rounded-xl border bg-muted/40 p-8">
      <div className="flex h-full w-full flex-col gap-4 rounded-lg border bg-background p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">Concurrent players</span>
          <span className="font-mono text-emerald-600 text-xs dark:text-emerald-400">
            {totalPlayers.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-1 items-end gap-2">
          {barHeights.map((bar, index) => (
            <motion.div
              animate={{ height: `${bar.height}%` }}
              className="flex-1 rounded-t-sm bg-emerald-500/70"
              initial={{ height: 0 }}
              key={bar.id}
              transition={{
                delay: index * 0.08,
                duration: 0.6,
                ease: "easeOut",
              }}
              viewport={{ once: true }}
              whileInView={{ height: `${bar.height}%` }}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {games.map((game) => (
            <div
              className="flex items-center justify-between gap-3 text-xs"
              key={game.name}
            >
              <div className="flex min-w-0 items-center gap-2">
                {game.iconUrl ? (
                  <Image
                    alt=""
                    className="size-5 shrink-0 rounded-full object-cover"
                    height={20}
                    src={game.iconUrl}
                    width={20}
                  />
                ) : (
                  <div className="size-5 shrink-0 rounded-full bg-muted-foreground/20" />
                )}
                <span className="truncate font-medium">{game.name}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2 font-mono">
                <span className="text-muted-foreground">
                  {game.playerCount.toLocaleString()}
                </span>
                {game.changePercent !== null && (
                  <span
                    className={cn(
                      game.changePercent < 0
                        ? "text-red-500"
                        : "text-emerald-600 dark:text-emerald-400"
                    )}
                  >
                    {game.changePercent >= 0 ? "+" : ""}
                    {game.changePercent.toFixed(1)}%
                  </span>
                )}
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

const GENERATING_SLOT_INDEX = 1;

interface ThumbnailSlot {
  generating: boolean;
  id: string;
  imageUrl: string | null;
}

function buildThumbnailSlots(thumbnails: string[]): ThumbnailSlot[] {
  const realThumbnails = [...thumbnails];
  const slots: ThumbnailSlot[] = [];

  for (let index = 0; index < 6; index++) {
    if (index === GENERATING_SLOT_INDEX) {
      slots.push({ id: "generating", imageUrl: null, generating: true });
      continue;
    }
    const imageUrl = realThumbnails.shift() ?? null;
    slots.push({ id: `slot-${index}`, imageUrl, generating: false });
  }

  return slots;
}

function GeneratingTile() {
  return (
    <div className="absolute inset-0 bg-neutral-950">
      <motion.div
        animate={{ rotate: 360 }}
        className="absolute -inset-1/2"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0%, oklch(0.5602 0.2416 266.29 / 0.9) 15%, transparent 30%, oklch(0.5602 0.2416 266.29 / 0.5) 55%, transparent 70%)",
        }}
        transition={{
          duration: 3,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
        }}
      />
      <div className="absolute inset-[1.5px] rounded-[calc(var(--radius-lg)-1.5px)] bg-neutral-950" />
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.05, 0.9] }}
        className="absolute inset-0 flex items-center justify-center"
        transition={{
          duration: 1.8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <SparklesIcon className="size-6 text-primary" />
      </motion.div>
      <motion.div
        animate={{ left: ["-30%", "130%"] }}
        className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent"
        transition={{
          duration: 1.6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

function ThumbnailsVisual({
  topGameThumbnails,
}: {
  topGameThumbnails: string[];
}) {
  const slots = buildThumbnailSlots(topGameThumbnails);

  return (
    <div className="relative flex w-full flex-col gap-3 overflow-hidden rounded-xl border bg-muted/40 p-4">
      <motion.div
        animate={{ y: [0, -6, 0] }}
        className="flex w-fit items-center gap-1.5 self-start rounded-full border bg-background px-3 py-1.5 text-primary text-xs shadow-sm"
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
      >
        <PaintBucketIcon className="size-3.5" />
        Generating
      </motion.div>
      <div className="grid w-full grid-cols-3 gap-2">
        {slots.map((slot, index) => (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-video overflow-hidden rounded-lg border shadow-sm"
            initial={{ opacity: 0, scale: 0.85 }}
            key={slot.id}
            transition={{ delay: index * 0.08, duration: 0.4 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileInView={{ opacity: 1, scale: 1 }}
          >
            {slot.generating && <GeneratingTile />}
            {slot.imageUrl && (
              <Image
                alt=""
                className="object-cover"
                fill
                sizes="200px"
                src={slot.imageUrl}
              />
            )}
          </motion.div>
        ))}
      </div>
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

function buildSections(
  showcaseData: FeatureShowcaseData,
  topGameThumbnails: string[]
): Section[] {
  return [
    {
      eyebrow: "Analytics",
      title: "See what's actually happening on Roblox",
      description:
        "Track player counts and momentum across every game on the platform, then zoom into the one you care about.",
      highlights: analyticsHighlights,
      visual: <AnalyticsVisual showcaseData={showcaseData} />,
    },
    {
      eyebrow: "Thumbnails",
      title: "Design thumbnails without leaving your dashboard",
      description:
        "Generate, organize, and preview thumbnails in the same place you track your game's numbers.",
      highlights: thumbnailHighlights,
      visual: <ThumbnailsVisual topGameThumbnails={topGameThumbnails} />,
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
}

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

export function FeatureShowcase({
  showcaseData,
  topGameThumbnails,
}: {
  showcaseData: FeatureShowcaseData;
  topGameThumbnails: string[];
}) {
  const sections = buildSections(showcaseData, topGameThumbnails);

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
