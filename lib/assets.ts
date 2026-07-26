import { randomUUID } from "node:crypto";
import { del, get, put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { asset } from "@/lib/schema";

export function toAssetImageProxyUrl(path: string): string {
  return `/api/assets/image?path=${encodeURIComponent(path)}`;
}

export function isOwnedAssetPath(path: string, userId: string): boolean {
  return path.startsWith(`assets/${userId}/`);
}

export async function storeAsset(file: File, userId: string): Promise<string> {
  const result = await put(
    `assets/${userId}/${randomUUID()}-${file.name}`,
    file,
    { access: "private" }
  );
  return result.pathname;
}

export interface SaveAssetInput {
  name: string;
  path: string;
  userId: string;
}

export async function saveAsset(input: SaveAssetInput): Promise<string> {
  const id = randomUUID();
  await db.insert(asset).values({ id, ...input });
  return id;
}

export async function listAssets(userId: string, limit?: number) {
  return await db.query.asset.findMany({
    limit,
    orderBy: (row, { desc }) => desc(row.createdAt),
    where: (row, { eq: whereEq }) => whereEq(row.userId, userId),
  });
}

export async function deleteAsset(userId: string, id: string): Promise<void> {
  const existing = await db.query.asset.findFirst({
    where: (row, { and, eq: whereEq }) =>
      and(whereEq(row.id, id), whereEq(row.userId, userId)),
  });
  if (!existing) {
    return;
  }
  await del(existing.path);
  await db.delete(asset).where(eq(asset.id, id));
}

export async function assetToDataUri(path: string): Promise<string> {
  const blob = await get(path, { access: "private" });
  if (blob?.statusCode !== 200) {
    throw new Error("Asset not found");
  }
  const buffer = Buffer.from(await new Response(blob.stream).arrayBuffer());
  return `data:${blob.blob.contentType};base64,${buffer.toString("base64")}`;
}
