import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to initialize the database client");
}

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });
export { PrismaClient } from "../generated/prisma/client";
export * from "../generated/prisma/models";
