import "dotenv/config";
import path from "node:path";
import { config } from "dotenv";

config({ path: path.resolve(process.cwd(), ".env") });
config({ path: path.resolve(process.cwd(), "../../.env") });

const { defineConfig, env } = await import("prisma/config");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL_NOTIFICATION"),
  },
});