import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { markAllNotificationsRead } from "@/lib/notifications";

export async function POST() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await markAllNotificationsRead(session.user.id);

  return Response.json({ success: true });
}
