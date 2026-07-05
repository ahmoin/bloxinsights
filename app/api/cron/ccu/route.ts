import { captureCcuSnapshot } from "@/lib/ccu";

export const maxDuration = 300;

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await captureCcuSnapshot();
    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to capture snapshot";
    return Response.json({ error: message }, { status: 500 });
  }
}
