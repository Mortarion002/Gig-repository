// backend/src/db.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

// Set up the pg pool
const pool = new Pool({ connectionString });

// Instantiate the Prisma adapter and client
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });