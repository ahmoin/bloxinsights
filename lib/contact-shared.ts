import { z } from "zod";

export const contactSchema = z.object({
  email: z.string().min(1, "Enter your email").email("Enter a valid email"),
  message: z
    .string()
    .min(1, "Enter a message")
    .max(5000, "Message is too long"),
  name: z.string().min(1, "Enter your name").max(200, "Name is too long"),
});

export type ContactInput = z.infer<typeof contactSchema>;
