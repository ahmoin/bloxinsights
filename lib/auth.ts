import { dash } from "@better-auth/infra";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { siteConfig } from "@/lib/config";
import { db } from "@/lib/db";
// biome-ignore lint/performance/noNamespaceImport: schema object is required for type inference and relational queries
import * as schema from "@/lib/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  plugins: [dash()],
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins: ["http://localhost:3000", siteConfig.url],
  socialProviders: {
    roblox: {
      clientId: process.env.ROBLOX_CLIENT_ID as string,
      clientSecret: process.env.ROBLOX_CLIENT_SECRET as string,
    },
  },
});

type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

/**
 * Wraps auth.api.getSession so a database outage falls back to a guest
 * (logged-out) session instead of throwing and crashing the page/route.
 */
export async function getSessionSafe(
  headers: Headers
): Promise<Session | null> {
  try {
    return await auth.api.getSession({ headers });
  } catch (error) {
    console.error("Failed to get session, falling back to guest mode", error);
    return null;
  }
}
