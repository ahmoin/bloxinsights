"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ThemeToggleGroup() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ToggleGroup
      disabled={!mounted}
      onValueChange={(value) => {
        if (value) {
          setTheme(value);
        }
      }}
      type="single"
      value={mounted ? theme : undefined}
      variant="outline"
    >
      <ToggleGroupItem aria-label="Light theme" value="light">
        <SunIcon />
        Light
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Dark theme" value="dark">
        <MoonIcon />
        Dark
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="System theme" value="system">
        <MonitorIcon />
        System
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
