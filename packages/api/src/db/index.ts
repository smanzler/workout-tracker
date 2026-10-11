import { drizzle } from "drizzle-orm/node-postgres";
import { authRelations } from "./auth-schema";
import { relations } from "./relations";
import { env } from "../env";

const db = drizzle(env.DATABASE_URL, {
  relations: { ...relations, ...authRelations },
});

export default db;

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
