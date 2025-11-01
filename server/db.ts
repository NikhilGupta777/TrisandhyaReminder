import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.warn("⚠️  DATABASE_URL not set - database features will be disabled");
  console.warn("   Configure DATABASE_URL in AWS Amplify Console → Environment variables");
}

export const pool = process.env.DATABASE_URL ? new Pool({ 
  connectionString: process.env.DATABASE_URL,
}) : null;

export const db = pool ? drizzle({ client: pool, schema }) : null;
