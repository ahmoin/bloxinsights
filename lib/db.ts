import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
// biome-ignore lint/performance/noNamespaceImport: schema object is required for type inference and relational queries
import * as schema from "@/lib/schema";

const client = postgres(process.env.DATABASE_URL as string);

export const db = drizzle({ client, schema });
