import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const invitations = sqliteTable("invitations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  normalizedEmail: text("normalized_email").notNull(),
  ipHash: text("ip_hash").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [
  uniqueIndex("invitations_normalized_email_unique").on(table.normalizedEmail),
]);
