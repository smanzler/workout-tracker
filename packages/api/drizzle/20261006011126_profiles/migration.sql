CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY,
	"username" text NOT NULL,
	"avatar_key" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_username_lower_idx" ON "profiles" (lower("username"));--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE;