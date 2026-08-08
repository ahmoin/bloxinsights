import { randomUUID } from "node:crypto";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { del, put } from "@vercel/blob";
import { generateImage, generateObject } from "ai";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { thumbnail } from "@/lib/schema";

const PROMPT_WRITER_MODEL = "google/gemini-2.5-flash";

export const THUMBNAIL_MODELS = {
  fast: "google/gemini-3.1-flash-lite-image",
  quality: "openai/gpt-image-2",
} as const;

export type ThumbnailModelId = keyof typeof THUMBNAIL_MODELS;

export type ThumbnailKind = "icon" | "thumbnail";

const THUMBNAIL_ASPECT_RATIOS = {
  icon: "1:1",
  thumbnail: "16:9",
} as const satisfies Record<ThumbnailKind, `${number}:${number}`>;

const thumbnailPromptSchema = z.object({
  prompt: z.string(),
});

export interface ThumbnailPromptInput {
  gameConcept: string | null;
  gameLink: string | null;
  idea: string | null;
  kind: ThumbnailKind;
}

function buildSystemPrompt(input: ThumbnailPromptInput): string {
  const provided = [
    input.gameLink && "a game link",
    input.gameConcept && "a game concept",
    input.idea && `a ${input.kind} idea`,
  ].filter(Boolean);

  const providedLine =
    provided.length > 0
      ? `You will be given ${provided.join(" and ")}. Weave those details into the prompt.`
      : "You will not be given any details about the game — invent something fitting for a generic Roblox game.";

  if (input.kind === "icon") {
    return `You write the final image-generation prompt for a Roblox game icon generator. Follow these rules exactly:

- Always start the prompt with "A high-quality Roblox game icon."
- ${providedLine}
- The icon is square and viewed at small sizes, so describe a single bold, centered subject with a simple, uncluttered background. Avoid busy scenes with multiple characters or fine detail that would be lost when scaled down.
- Unless the user's concept or idea already specifies a character, avatar, or player appearance, default to describing "a classic blocky 'Bacon Hair' character with 'Epic Face'" as the centered subject.
- Always end the prompt with instructions for the visual style: high saturation, plastic textures, strong silhouette, no text.
- Never include any instruction to render text, letters, words, or writing in the image, even if the user explicitly asked for text in their idea or concept — silently drop any such request instead of including it.
- Output only the final prompt, written as flowing descriptive sentences a text-to-image model should follow.`;
  }

  return `You write the final image-generation prompt for a Roblox GFX thumbnail generator. Follow these rules exactly:

- Always start the prompt with "A high-quality Roblox GFX thumbnail."
- ${providedLine}
- Unless the user's concept or idea already specifies a character, avatar, or player appearance, default to describing "a classic blocky 'Bacon Hair' character with 'Epic Face'".
- Always end the prompt with instructions for the visual style: high saturation, plastic textures, no text.
- Never include any instruction to render text, letters, words, or writing in the image, even if the user explicitly asked for text in their idea or concept — silently drop any such request instead of including it.
- Output only the final prompt, written as flowing descriptive sentences a text-to-image model should follow.`;
}

export async function buildThumbnailPrompt(
  input: ThumbnailPromptInput
): Promise<string> {
  const details = [
    input.gameLink && `Game link: ${input.gameLink}`,
    input.gameConcept && `Game concept: ${input.gameConcept}`,
    input.idea &&
      `${input.kind === "icon" ? "Icon" : "Thumbnail"} idea: ${input.idea}`,
  ].filter(Boolean);

  const { object } = await generateObject({
    model: openrouter(PROMPT_WRITER_MODEL),
    schema: thumbnailPromptSchema,
    system: buildSystemPrompt(input),
    prompt: details.length > 0 ? details.join("\n") : "No details provided.",
  });
  return object.prompt;
}

export interface GenerateThumbnailInput {
  kind: ThumbnailKind;
  model?: ThumbnailModelId;
  prompt: string;
  referenceImages?: string[];
}

export async function generateThumbnail(
  input: GenerateThumbnailInput
): Promise<string> {
  const modelId = THUMBNAIL_MODELS[input.model ?? "fast"];
  const hasReferenceImages =
    input.referenceImages && input.referenceImages.length > 0;

  const { image } = await generateImage({
    aspectRatio: THUMBNAIL_ASPECT_RATIOS[input.kind],
    model: openrouter.imageModel(modelId),
    prompt: hasReferenceImages
      ? { images: input.referenceImages ?? [], text: input.prompt }
      : input.prompt,
  });

  return `data:${image.mediaType};base64,${image.base64}`;
}

export function toImageProxyUrl(path: string): string {
  return `/api/thumbnails/image?path=${encodeURIComponent(path)}`;
}

export async function storeGeneratedImage(
  imageDataUri: string,
  userId: string
): Promise<string> {
  const response = await fetch(imageDataUri);
  const imageBlob = await response.blob();
  const result = await put(
    `thumbnails/${userId}/${randomUUID()}.png`,
    imageBlob,
    { access: "private" }
  );
  return result.pathname;
}

export async function storeReferenceImage(
  file: File,
  userId: string
): Promise<string> {
  const result = await put(
    `thumbnails/${userId}/references/${randomUUID()}-${file.name}`,
    file,
    { access: "private" }
  );
  return result.pathname;
}

export async function storeUploadedThumbnail(
  file: File,
  userId: string
): Promise<string> {
  const result = await put(
    `thumbnails/${userId}/${randomUUID()}-${file.name}`,
    file,
    { access: "private" }
  );
  return result.pathname;
}

export interface SaveThumbnailInput {
  imagePath: string;
  kind: ThumbnailKind;
  model: ThumbnailModelId | "upload";
  prompt: string;
  referenceImagePaths: string[];
  userId: string;
}

export async function saveThumbnail(input: SaveThumbnailInput): Promise<void> {
  await db.insert(thumbnail).values({ id: randomUUID(), ...input });
}

export async function listThumbnails(userId: string) {
  return await db.query.thumbnail.findMany({
    orderBy: (row, { desc }) => desc(row.createdAt),
    where: (row, { eq: whereEq }) => whereEq(row.userId, userId),
  });
}

export async function renameThumbnail(
  userId: string,
  id: string,
  name: string
): Promise<void> {
  await db
    .update(thumbnail)
    .set({ prompt: name })
    .where(and(eq(thumbnail.id, id), eq(thumbnail.userId, userId)));
}

export async function deleteThumbnail(
  userId: string,
  id: string
): Promise<void> {
  const existing = await db.query.thumbnail.findFirst({
    where: (row, { and: whereAnd, eq: whereEq }) =>
      whereAnd(whereEq(row.id, id), whereEq(row.userId, userId)),
  });
  if (!existing) {
    return;
  }
  await del(existing.imagePath);
  await db.delete(thumbnail).where(eq(thumbnail.id, id));
}
