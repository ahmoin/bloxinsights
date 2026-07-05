import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
// biome-ignore lint/performance/noNamespaceImport: schema object is required for type inference and relational queries
import * as schema from "@/lib/schema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle({ client, schema });
