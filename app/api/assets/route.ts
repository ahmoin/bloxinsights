import { headers } from "next/headers";
import {
  deleteAsset,
  listAssets,
  renameAsset,
  saveAsset,
  storeAsset,
  toAssetImageProxyUrl,
} from "@/lib/assets";
import { auth } from "@/lib/auth";

const MAX_UPLOAD_FILES = 20;

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limitParam = new URL(request.url).searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;
  const assets = await listAssets(session.user.id, limit);

  return Response.json({
    assets: assets.map((item) => ({
      createdAt: item.createdAt,
      id: item.id,
      imageUrl: toAssetImageProxyUrl(item.path),
      name: item.name,
      path: item.path,
    })),
  });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File)
    .slice(0, MAX_UPLOAD_FILES);

  const assets = await Promise.all(
    files.map(async (file) => {
      const path = await storeAsset(file, session.user.id);
      const id = await saveAsset({
        name: file.name,
        path,
        userId: session.user.id,
      });
      return {
        id,
        imageUrl: toAssetImageProxyUrl(path),
        name: file.name,
        path,
      };
    })
  );

  return Response.json({ assets });
}

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
      { error: "Missing asset id or name" },
      {
        status: 400,
      }
    );
  }

  await renameAsset(session.user.id, body.id, name);
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
    return Response.json({ error: "Missing asset id" }, { status: 400 });
  }

  await deleteAsset(session.user.id, id);
  return Response.json({ success: true });
}
