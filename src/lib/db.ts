import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as {
  layerUpPrisma?: PrismaClient;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not configured. Add it to your local environment before saving signups.",
    );
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({ adapter });
}

export function getPrismaClient() {
  if (!globalForPrisma.layerUpPrisma) {
    globalForPrisma.layerUpPrisma = createPrismaClient();
  }

  return globalForPrisma.layerUpPrisma;
}
