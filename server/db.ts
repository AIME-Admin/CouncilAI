import { drizzle } from "drizzle-orm/node-postgres";
import { queries, users, userPreferences } from "@shared/schema";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

export { queries, users, userPreferences };
