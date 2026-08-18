import { randomUUID } from "node:crypto";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { notification, notificationPreference } from "@/lib/schema";

const NOTIFICATION_LIST_LIMIT = 20;

type NotificationType = "system" | "product_update" | "billing" | "ccu_alert";

export interface NotificationPreferences {
  ccuAlerts: boolean;
  emailNotifications: boolean;
  productUpdates: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  productUpdates: true,
  ccuAlerts: true,
  emailNotifications: true,
};

export async function listNotifications(userId: string) {
  return await db.query.notification.findMany({
    where: (row, { eq: whereEq }) => whereEq(row.userId, userId),
    orderBy: (row, { desc: orderDesc }) => orderDesc(row.createdAt),
    limit: NOTIFICATION_LIST_LIMIT,
  });
}

export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(notification)
    .where(and(eq(notification.userId, userId), eq(notification.read, false)));
  return row?.value ?? 0;
}

export async function createNotification(
  userId: string,
  data: { type: NotificationType; title: string; body?: string; url?: string }
) {
  await db.insert(notification).values({
    id: randomUUID(),
    userId,
    type: data.type,
    title: data.title,
    body: data.body,
    url: data.url,
  });
}

export async function markNotificationRead(userId: string, id: string) {
  await db
    .update(notification)
    .set({ read: true })
    .where(and(eq(notification.id, id), eq(notification.userId, userId)));
}

export async function markAllNotificationsRead(userId: string) {
  await db
    .update(notification)
    .set({ read: true })
    .where(and(eq(notification.userId, userId), eq(notification.read, false)));
}

export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  const row = await db.query.notificationPreference.findFirst({
    where: (table, { eq: whereEq }) => whereEq(table.userId, userId),
  });
  if (!row) {
    return DEFAULT_PREFERENCES;
  }
  return {
    productUpdates: row.productUpdates,
    ccuAlerts: row.ccuAlerts,
    emailNotifications: row.emailNotifications,
  };
}

export async function updateNotificationPreferences(
  userId: string,
  prefs: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const current = await getNotificationPreferences(userId);
  const next = { ...current, ...prefs };

  await db
    .insert(notificationPreference)
    .values({ userId, ...next })
    .onConflictDoUpdate({
      target: notificationPreference.userId,
      set: next,
    });

  return next;
}

export async function createWelcomeNotification(userId: string) {
  await createNotification(userId, {
    type: "system",
    title: "Welcome to Bloxinsights",
    body: "Your account is set up. Explore the dashboard to get started.",
    url: "/dashboard",
  });
}
