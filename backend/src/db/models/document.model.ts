import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  smallint,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type { DocumentContent } from "../content.js";
import { users } from "./user.model.js";

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 120 }).notNull(),
    content: jsonb("content").$type<DocumentContent>().notNull(),
    contentSchemaVersion: smallint("content_schema_version")
      .default(1)
      .notNull(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    updatedBy: uuid("updated_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    version: integer("version").default(1).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("documents_owner_updated_idx").on(table.ownerId, table.updatedAt),
    check("documents_version_positive", sql`${table.version} > 0`),
    check(
      "documents_content_schema_version_positive",
      sql`${table.contentSchemaVersion} > 0`,
    ),
    check(
      "documents_content_is_doc",
      sql`jsonb_typeof(${table.content}) = 'object'
        AND ${table.content} ? 'type'
        AND ${table.content}->>'type' = 'doc'`,
    ),
  ],
);

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
