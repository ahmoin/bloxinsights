import { headers } from "next/headers";
import { getSessionSafe } from "@/lib/auth";
import { getCreditBalance } from "@/lib/credits";

export async function GET() {
  const session = await getSessionSafe(await headers());
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const balance = await getCreditBalance(session.user.id);
  return Response.json({ balance });
}
