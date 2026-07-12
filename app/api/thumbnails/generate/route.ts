import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  buildThumbnailPrompt,
  generateThumbnail,
  saveThumbnail,
  storeGeneratedImage,
  storeReferenceImage,
  THUMBNAIL_MODELS,
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
  const session = await auth.api.getSession({ headers: await headers() });
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
  const referenceImageFiles = formData
    .getAll("referenceImages")
    .filter((value): value is File => value instanceof File)
    .slice(0, MAX_REFERENCE_IMAGES);

  const prompt = await buildThumbnailPrompt({
    gameLink: typeof gameLink === "string" && gameLink ? gameLink : null,
    gameConcept:
      typeof gameConcept === "string" && gameConcept ? gameConcept : null,
    idea: typeof idea === "string" && idea ? idea : null,
  });

  try {
    const [referenceImages, referenceImagePaths] = await Promise.all([
      Promise.all(referenceImageFiles.map(fileToDataUri)),
      Promise.all(
        referenceImageFiles.map((file) =>
          storeReferenceImage(file, session.user.id)
        )
      ),
    ]);
    const replicateUrl = await generateThumbnail({
      prompt,
      referenceImages,
      model,
    });
    const imagePath = await storeGeneratedImage(replicateUrl, session.user.id);
    await saveThumbnail({
      imagePath,
      model,
      prompt,
      referenceImagePaths,
      userId: session.user.id,
    });
    return Response.json({ imageUrl: toImageProxyUrl(imagePath) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate thumbnail";
    return Response.json({ error: message }, { status: 500 });
  }
}
