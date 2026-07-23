CREATE TABLE "equipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"internal_tag" text NOT NULL,
	"description" text,
	"image_url" text,
	"equipment_condition" "equipment_condition" DEFAULT 'excellent' NOT NULL,
	"equipment_status" "equipment_status" DEFAULT 'active' NOT NULL,
	"require_approval" boolean DEFAULT true NOT NULL,
	"max_checkout_days" integer DEFAULT 3 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
