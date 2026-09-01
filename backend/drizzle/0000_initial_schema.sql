CREATE TABLE "document_shares" (
	"document_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(20) DEFAULT 'editor' NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "document_shares_document_id_user_id_pk" PRIMARY KEY("document_id","user_id"),
	CONSTRAINT "document_shares_role_valid" CHECK ("document_shares"."role" = 'editor')
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(120) NOT NULL,
	"content" jsonb NOT NULL,
	"content_schema_version" smallint DEFAULT 1 NOT NULL,
	"owner_id" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "documents_version_positive" CHECK ("documents"."version" > 0),
	CONSTRAINT "documents_content_schema_version_positive" CHECK ("documents"."content_schema_version" > 0),
	CONSTRAINT "documents_content_is_doc" CHECK (jsonb_typeof("documents"."content") = 'object'
        AND "documents"."content" ? 'type'
        AND "documents"."content"->>'type' = 'doc')
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(80) NOT NULL,
	"email" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "document_shares" ADD CONSTRAINT "document_shares_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_shares" ADD CONSTRAINT "document_shares_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "document_shares_user_idx" ON "document_shares" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "documents_owner_updated_idx" ON "documents" USING btree ("owner_id","updated_at");