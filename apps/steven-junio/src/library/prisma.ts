import { PrismaClient } from "@/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

function createPrismaClient() {
  const accelerateUrl = process.env.ACCELERATE_DATABASE_URL;

  if (!accelerateUrl) {
    throw new Error("ACCELERATE_DATABASE_URL is required for blog data access.");
  }

  return new PrismaClient({ accelerateUrl }).$extends(withAccelerate());
}

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export function getPrisma() {
  globalForPrisma.prisma ??= createPrismaClient();
  return globalForPrisma.prisma;
}
