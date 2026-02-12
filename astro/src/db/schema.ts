import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

// TODO: This is the example table to make sure everything was hooked up correctly
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});
