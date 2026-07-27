import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { contactMessage } from "@/lib/schema";

export interface SaveContactMessageInput {
  email: string;
  message: string;
  name: string;
}

export async function saveContactMessage(
  input: SaveContactMessageInput
): Promise<void> {
  await db.insert(contactMessage).values({ id: randomUUID(), ...input });
}
