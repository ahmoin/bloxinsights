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
