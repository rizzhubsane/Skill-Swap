import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import BetterSqlite3 from 'better-sqlite3';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use SQLite for development if no DATABASE_URL is provided
if (!process.env.DATABASE_URL) {
  console.log("No DATABASE_URL found, using SQLite for development");
  const sqlite = new BetterSqlite3('skillswap.db');
  export const db = drizzleSQLite(sqlite, { schema });
} else {
  export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  export const db = drizzle({ client: pool, schema });
}