import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getUnreadNotificationCount,
  listNotifications,
} from "@/lib/notifications";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [notifications, unreadCount] = await Promise.all([
    listNotifications(session.user.id),
    getUnreadNotificationCount(session.user.id),
  ]);

  return Response.json({ notifications, unreadCount });
}
