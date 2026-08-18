import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { markNotificationRead } from "@/lib/notifications";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await markNotificationRead(session.user.id, id);

  return Response.json({ success: true });
}
