import "dotenv/config";
import { defineConfig } from "prisma/config";

const directDatabaseUrl = process.env.DIRECT_DATABASE_URL;

if (!directDatabaseUrl) {
  throw new Error(
    "DIRECT_DATABASE_URL is required for Prisma schema and migration commands.",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: directDatabaseUrl,
  },
});
