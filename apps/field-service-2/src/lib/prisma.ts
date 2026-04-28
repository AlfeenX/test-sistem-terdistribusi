import { config } from "dotenv";
import path from "node:path";
import pg from "pg";
import { PrismaClient } from "../generated/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

// Try local .env, then root .env
config();
config({ path: path.resolve(process.cwd(), "../../.env") });

const connectionString =
  process.env.DATABASE_URL_FIELD || process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
  log:
    process.env["NODE_ENV"] === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});
