import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { documents } from "./document.model.js";
import { users } from "./user.model.js";

export const documentShares = pgTable(
  "document_shares",
  {
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 20 }).default("editor").notNull(),
    grantedAt: timestamp("granted_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.documentId, table.userId] }),
    index("document_shares_user_idx").on(table.userId),
    check("document_shares_role_valid", sql`${table.role} = 'editor'`),
  ],
);

export type DocumentShare = typeof documentShares.$inferSelect;
export type NewDocumentShare = typeof documentShares.$inferInsert;
