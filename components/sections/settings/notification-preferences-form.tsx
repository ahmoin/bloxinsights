"use client";

import { useState, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { NotificationPreferences } from "@/lib/notifications";

const PREFERENCE_ITEMS: {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
}[] = [
  {
    key: "productUpdates",
    label: "Product updates",
    description: "New features and improvements to Bloxinsights.",
  },
  {
    key: "ccuAlerts",
    label: "CCU alerts",
    description: "Notable changes in concurrent player counts for your games.",
  },
  {
    key: "emailNotifications",
    label: "Email notifications",
    description: "Receive a copy of important notifications by email.",
  },
];

export function NotificationPreferencesForm({
  initialPreferences,
}: {
  initialPreferences: NotificationPreferences;
}) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [isPending, startTransition] = useTransition();

  const handleChange = (
    key: keyof NotificationPreferences,
    checked: boolean
  ) => {
    const next = { ...preferences, [key]: checked };
    setPreferences(next);
    startTransition(async () => {
      await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: checked }),
      });
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {PREFERENCE_ITEMS.map((item) => (
        <div className="flex items-start gap-3" key={item.key}>
          <Checkbox
            checked={preferences[item.key]}
            disabled={isPending}
            id={item.key}
            onCheckedChange={(checked) =>
              handleChange(item.key, checked === true)
            }
          />
          <div className="grid gap-1 leading-none">
            <Label htmlFor={item.key}>{item.label}</Label>
            <p className="text-muted-foreground text-sm">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
