import { headers } from "next/headers";
import { assetToDataUri, isOwnedAssetPath } from "@/lib/assets";
import { auth } from "@/lib/auth";
import {
  deductCredits,
  InsufficientCreditsError,
  refundCredits,
} from "@/lib/credits";
import { THUMBNAIL_CREDIT_COSTS } from "@/lib/credits-shared";
import {
  buildThumbnailPrompt,
  generateThumbnail,
  saveThumbnail,
  storeGeneratedImage,
  storeReferenceImage,
  THUMBNAIL_MODELS,
  type ThumbnailKind,
  type ThumbnailModelId,
  toImageProxyUrl,
} from "@/lib/thumbnails";

export const maxDuration = 300;

const MAX_REFERENCE_IMAGES = 4;

async function fileToDataUri(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const gameLink = formData.get("gameLink");
  const gameConcept = formData.get("gameConcept");
  const idea = formData.get("idea");
  const modelInput = formData.get("model");
  const model: ThumbnailModelId =
    typeof modelInput === "string" && modelInput in THUMBNAIL_MODELS
      ? (modelInput as ThumbnailModelId)
      : "fast";
  const kindInput = formData.get("kind");
  const kind: ThumbnailKind = kindInput === "icon" ? "icon" : "thumbnail";
  const referenceImageFiles = formData
    .getAll("referenceImages")
    .filter((value): value is File => value instanceof File)
    .slice(0, MAX_REFERENCE_IMAGES);
  const referenceAssetPathsInput = formData.get("referenceAssetPaths");
  const requestedAssetPaths: string[] =
    typeof referenceAssetPathsInput === "string" && referenceAssetPathsInput
      ? (JSON.parse(referenceAssetPathsInput) as string[])
      : [];
  const remainingSlots = Math.max(
    0,
    MAX_REFERENCE_IMAGES - referenceImageFiles.length
  );
  const referenceAssetPaths = requestedAssetPaths
    .filter((path) => isOwnedAssetPath(path, session.user.id))
    .slice(0, remainingSlots);

  const creditCost = THUMBNAIL_CREDIT_COSTS[model];

  try {
    await deductCredits(
      session.user.id,
      creditCost,
      `${kind === "icon" ? "Icon" : "Thumbnail"} generation (${model})`
    );
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      return Response.json({ error: error.message }, { status: 402 });
    }
    throw error;
  }

  const prompt = await buildThumbnailPrompt({
    gameLink: typeof gameLink === "string" && gameLink ? gameLink : null,
    gameConcept:
      typeof gameConcept === "string" && gameConcept ? gameConcept : null,
    idea: typeof idea === "string" && idea ? idea : null,
    kind,
  });

  try {
    const [
      uploadedReferenceImages,
      uploadedReferenceImagePaths,
      assetReferenceImages,
    ] = await Promise.all([
      Promise.all(referenceImageFiles.map(fileToDataUri)),
      Promise.all(
        referenceImageFiles.map((file) =>
          storeReferenceImage(file, session.user.id)
        )
      ),
      Promise.all(referenceAssetPaths.map(assetToDataUri)),
    ]);
    const referenceImages = [
      ...uploadedReferenceImages,
      ...assetReferenceImages,
    ];
    const referenceImagePaths = [
      ...uploadedReferenceImagePaths,
      ...referenceAssetPaths,
    ];
    const generatedImage = await generateThumbnail({
      prompt,
      referenceImages,
      model,
      kind,
    });
    const imagePath = await storeGeneratedImage(
      generatedImage,
      session.user.id
    );
    await saveThumbnail({
      imagePath,
      kind,
      model,
      prompt,
      referenceImagePaths,
      userId: session.user.id,
    });
    return Response.json({ imageUrl: toImageProxyUrl(imagePath) });
  } catch (error) {
    await refundCredits(
      session.user.id,
      creditCost,
      `Refund for failed ${kind} generation (${model})`
    );
    const message =
      error instanceof Error ? error.message : "Failed to generate thumbnail";
    return Response.json({ error: message }, { status: 500 });
  }
}
