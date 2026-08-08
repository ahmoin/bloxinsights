import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  saveThumbnail,
  storeUploadedThumbnail,
  toImageProxyUrl,
} from "@/lib/thumbnails";

const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("thumbnail");
  if (!(file instanceof File) || file.size === 0) {
    return Response.json(
      { error: "Choose an image to upload" },
      {
        status: 400,
      }
    );
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return Response.json(
      { error: "Only PNG, JPEG, or WebP images are supported" },
      { status: 400 }
    );
  }

  const imagePath = await storeUploadedThumbnail(file, session.user.id);
  await saveThumbnail({
    imagePath,
    kind: "thumbnail",
    model: "upload",
    prompt: "Uploaded thumbnail",
    referenceImagePaths: [],
    userId: session.user.id,
  });

  return Response.json({ imageUrl: toImageProxyUrl(imagePath) });
}
