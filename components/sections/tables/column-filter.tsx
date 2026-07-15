"use client";

import { FilterIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function ColumnFilter({
  max,
  min,
  onApply,
  onClear,
}: {
  max?: number;
  min?: number;
  onApply: (min?: number, max?: number) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftMin, setDraftMin] = useState(min?.toString() ?? "");
  const [draftMax, setDraftMax] = useState(max?.toString() ?? "");

  useEffect(() => {
    if (open) {
      setDraftMin(min?.toString() ?? "");
      setDraftMax(max?.toString() ?? "");
    }
  }, [open, min, max]);

  const isActive = min !== undefined || max !== undefined;

  const handleApply = () => {
    const parsedMin = draftMin.trim() === "" ? undefined : Number(draftMin);
    const parsedMax = draftMax.trim() === "" ? undefined : Number(draftMax);
    onApply(
      parsedMin !== undefined && Number.isFinite(parsedMin)
        ? parsedMin
        : undefined,
      parsedMax !== undefined && Number.isFinite(parsedMax)
        ? parsedMax
        : undefined
    );
    setOpen(false);
  };

  const handleClear = () => {
    setDraftMin("");
    setDraftMax("");
    onClear();
    setOpen(false);
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-label="Filter column"
          className={cn("size-6", isActive && "text-primary")}
          onClick={(event) => event.stopPropagation()}
          size="icon-xs"
          variant={isActive ? "secondary" : "ghost"}
        >
          <FilterIcon className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <div className="flex items-center gap-2">
          <Input
            aria-label="Minimum value"
            inputMode="numeric"
            onChange={(event) => setDraftMin(event.target.value)}
            placeholder="Min"
            value={draftMin}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            aria-label="Maximum value"
            inputMode="numeric"
            onChange={(event) => setDraftMax(event.target.value)}
            placeholder="Max"
            value={draftMax}
          />
        </div>
        <div className="flex justify-between gap-2">
          <Button onClick={handleClear} size="sm" variant="outline">
            Clear
          </Button>
          <Button onClick={handleApply} size="sm">
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
