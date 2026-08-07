import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { deleteThumbnail, renameThumbnail } from "@/lib/thumbnails";

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { id?: string; name?: string };
  const name = body.name?.trim();
  if (!(body.id && name)) {
    return Response.json(
      { error: "Missing thumbnail id or name" },
      { status: 400 }
    );
  }

  await renameThumbnail(session.user.id, body.id, name);
  return Response.json({ success: true });
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return Response.json({ error: "Missing thumbnail id" }, { status: 400 });
  }

  await deleteThumbnail(session.user.id, id);
  return Response.json({ success: true });
}
