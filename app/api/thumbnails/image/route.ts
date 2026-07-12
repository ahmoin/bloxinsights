import { get } from "@vercel/blob";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = new URL(request.url).searchParams.get("path");
  if (!path?.startsWith(`thumbnails/${session.user.id}/`)) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const blob = await get(path, { access: "private" });
  if (blob?.statusCode !== 200) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return new Response(blob.stream, {
    headers: {
      "Content-Type": blob.blob.contentType,
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
