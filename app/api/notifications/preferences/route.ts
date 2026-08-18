import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/notifications";

const preferencesSchema = z.object({
  productUpdates: z.boolean().optional(),
  ccuAlerts: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
});

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const preferences = await getNotificationPreferences(session.user.id);
  return Response.json({ preferences });
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = preferencesSchema.safeParse(await request.json());
  if (!body.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const preferences = await updateNotificationPreferences(
    session.user.id,
    body.data
  );
  return Response.json({ preferences });
}
