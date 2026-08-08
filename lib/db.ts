import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
// biome-ignore lint/performance/noNamespaceImport: schema object is required for type inference and relational queries
import * as schema from "@/lib/schema";

// biome-ignore lint/style/noVar: required for the globalThis dev singleton pattern
declare global {
  var _libsqlClient: ReturnType<typeof createClient> | undefined;
}

const client =
  globalThis._libsqlClient ??
  createClient({
    url: process.env.TURSO_DATABASE_URL as string,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis._libsqlClient = client;
}

export const db = drizzle({ client, schema });
