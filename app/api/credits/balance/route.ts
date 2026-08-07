import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getCreditBalance } from "@/lib/credits";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const balance = await getCreditBalance(session.user.id);
  return Response.json({ balance });
}
