"use client";

import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useState,
} from "react";

export interface Notification {
  body: string | null;
  createdAt: string;
  id: string;
  read: boolean;
  title: string;
  type: "system" | "product_update" | "billing" | "ccu_alert";
  url: string | null;
}

interface NotificationsContextValue {
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  notifications: Notification[];
  refresh: () => Promise<void>;
  unreadCount: number;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null
);

export function NotificationsProvider({
  children,
  initialNotifications,
  initialUnreadCount,
}: {
  children: ReactNode;
  initialNotifications: Notification[];
  initialUnreadCount: number;
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/notifications");
    if (!response.ok) {
      return;
    }
    const data = (await response.json()) as {
      notifications: Notification[];
      unreadCount: number;
    };
    setNotifications(data.notifications);
    setUnreadCount(data.unreadCount);
  }, []);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
    await fetch("/api/notifications/read-all", { method: "POST" });
  }, []);

  return (
    <NotificationsContext
      value={{ notifications, unreadCount, refresh, markRead, markAllRead }}
    >
      {children}
    </NotificationsContext>
  );
}

export function useNotifications(): NotificationsContextValue {
  const context = use(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
}
