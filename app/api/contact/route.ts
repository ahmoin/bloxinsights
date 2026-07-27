import { saveContactMessage } from "@/lib/contact";
import { contactSchema } from "@/lib/contact-shared";

export async function POST(request: Request) {
  const body = await request.json();
  const result = contactSchema.safeParse(body);
  if (!result.success) {
    return Response.json({ error: "Invalid submission" }, { status: 400 });
  }

  await saveContactMessage(result.data);
  return Response.json({ success: true });
}
