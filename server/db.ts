import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema.js";

neonConfig.webSocketConstructor = ws;

// Initialize database connection
let db: ReturnType<typeof drizzle>;
let pool: Pool | undefined;

if (process.env.DATABASE_URL) {
  console.log("Using PostgreSQL database");
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  // For development without a database, we'll create a PostgreSQL database
  console.log("No DATABASE_URL found - database will be created");
  throw new Error("DATABASE_URL is required. Please set up a PostgreSQL database.");
}

export { db, pool };