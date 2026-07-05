"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";

export const description = "An interactive area chart";

export interface CcuPoint {
  ccu: number;
  timestamp: string;
}

const getTimezoneName = () => {
  const date = new Date();
  return (
    new Intl.DateTimeFormat("en-US", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timeZoneName: "short",
    })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value || "UTC"
  );
};

const tzName = getTimezoneName();

const chartConfig = {
  ccu: {
    label: "CCU",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive({ data }: { data: CcuPoint[] }) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = useState("14d");

  useEffect(() => {
    if (isMobile) {
      setTimeRange("48h");
    }
  }, [isMobile]);

  const latestTime = data.length
    ? Math.max(...data.map((point) => new Date(point.timestamp).getTime()))
    : 0;

  let hoursToSubtract = 14 * 24;
  if (timeRange === "7d") {
    hoursToSubtract = 7 * 24;
  } else if (timeRange === "48h") {
    hoursToSubtract = 48;
  }
  const startDate = new Date(latestTime);
  startDate.setHours(startDate.getHours() - hoursToSubtract);

  const filteredData = data.filter(
    (point) => new Date(point.timestamp) >= startDate
  );

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Total Concurrent Users (CCU)</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">
            Total for the last 14 days ({tzName})
          </span>
          <span className="@[540px]/card:hidden">Last 14 days ({tzName})</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            className="@[767px]/card:flex hidden *:data-[slot=toggle-group-item]:px-4!"
            onValueChange={setTimeRange}
            type="single"
            value={timeRange}
            variant="outline"
          >
            <ToggleGroupItem value="14d">Last 14 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
            <ToggleGroupItem value="48h">Last 48 hours</ToggleGroupItem>
          </ToggleGroup>
          <Select onValueChange={setTimeRange} value={timeRange}>
            <SelectTrigger
              aria-label="Select a value"
              className="flex @[767px]/card:hidden w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
              size="sm"
            >
              <SelectValue placeholder="Last 14 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem className="rounded-lg" value="14d">
                Last 14 days
              </SelectItem>
              <SelectItem className="rounded-lg" value="7d">
                Last 7 days
              </SelectItem>
              <SelectItem className="rounded-lg" value="48h">
                Last 48 hours
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          className="aspect-auto h-62.5 w-full"
          config={chartConfig}
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillCcu" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-ccu)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-ccu)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="timestamp"
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              axisLine={false}
              tickFormatter={(value) => {
                if (value >= 1_000_000) {
                  return `${(value / 1_000_000).toFixed(1)}M`;
                }
                if (value >= 1000) {
                  return `${(value / 1000).toFixed(0)}K`;
                }
                return value.toString();
              }}
              tickLine={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })} ${tzName}`;
                  }}
                />
              }
              cursor={false}
            />
            <Area
              dataKey="ccu"
              fill="url(#fillCcu)"
              stroke="var(--color-ccu)"
              type="natural"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
