CREATE SCHEMA IF NOT EXISTS "annavedah";
--> statement-breakpoint
CREATE TABLE "annavedah"."abandoned_carts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"phone" text,
	"cart_items" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"reminded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "annavedah"."instagram_reels" (
	"id" serial PRIMARY KEY NOT NULL,
	"permalink" text NOT NULL,
	"caption" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "annavedah"."orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"payment_id" text,
	"user_id" integer,
	"customer_email" text NOT NULL,
	"total" integer NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"items" text NOT NULL,
	"shipping_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "annavedah"."otps" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"otp" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "annavedah"."annavedah_pos_batches" (
	"batch_id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"product_name" text NOT NULL,
	"product_slug" text,
	"mfd_date" date NOT NULL,
	"expiry_date" date NOT NULL,
	"barcode" text NOT NULL,
	"initial_stock" integer NOT NULL,
	"current_stock" integer NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"cost_price" numeric(12, 2),
	"location" text,
	"supplier" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "annavedah_pos_batches_barcode_unique" UNIQUE("barcode")
);
--> statement-breakpoint
CREATE TABLE "annavedah"."annavedah_pos_orders" (
	"invoice_no" text PRIMARY KEY NOT NULL,
	"customer_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"gst_amount" numeric(12, 2) NOT NULL,
	"discount_amount" numeric(12, 2) NOT NULL,
	"total" numeric(12, 2) NOT NULL,
	"payment_method" varchar(10) NOT NULL,
	"items" jsonb NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "annavedah"."product_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_slug" text NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"rating" integer NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"helpful" integer DEFAULT 0 NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "annavedah"."products" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"name_hindi" text NOT NULL,
	"local_name" text NOT NULL,
	"category" varchar(50) NOT NULL,
	"price" integer DEFAULT 0 NOT NULL,
	"original_price" integer DEFAULT 0 NOT NULL,
	"cost_price" integer DEFAULT 0 NOT NULL,
	"image" text NOT NULL,
	"description" text NOT NULL,
	"benefits" text NOT NULL,
	"usage" text NOT NULL,
	"highlights" text NOT NULL,
	"pack_prices" text NOT NULL,
	"badge" text,
	"stock" integer DEFAULT 50 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "annavedah"."rate_limits" (
	"key" text NOT NULL,
	"window_start" timestamp NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "rate_limits_key_window_start_pk" PRIMARY KEY("key","window_start")
);
--> statement-breakpoint
CREATE TABLE "annavedah"."refund_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"order_id" text NOT NULL,
	"reason" text NOT NULL,
	"image_url" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"razorpay_refund_id" text,
	"inventory_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "refund_requests_inventory_token_unique" UNIQUE("inventory_token")
);
--> statement-breakpoint
CREATE TABLE "annavedah"."review_helpful_votes" (
	"review_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "review_helpful_votes_review_id_user_id_pk" PRIMARY KEY("review_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "annavedah"."testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"location" text NOT NULL,
	"text" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "annavedah"."users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"password" text NOT NULL,
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"avatar_url" text,
	"cart_data" text,
	"password_changed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "annavedah"."orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "annavedah"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annavedah"."product_reviews" ADD CONSTRAINT "product_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "annavedah"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annavedah"."refund_requests" ADD CONSTRAINT "refund_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "annavedah"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "annavedah_pos_batches_product_idx" ON "annavedah"."annavedah_pos_batches" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "annavedah_pos_batches_expiry_idx" ON "annavedah"."annavedah_pos_batches" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "annavedah_pos_orders_created_idx" ON "annavedah"."annavedah_pos_orders" USING btree ("created_at");
--> statement-breakpoint
DO $$
DECLARE
  v_table_name text;
  common_columns text;
BEGIN
  FOR v_table_name IN
    SELECT t.table_name
    FROM information_schema.tables t
    WHERE t.table_schema = 'annavedah' AND t.table_type = 'BASE TABLE'
  LOOP
    IF to_regclass(format('public.%I', v_table_name)) IS NULL THEN
      CONTINUE;
    END IF;

    SELECT string_agg(format('%I', destination.column_name), ', ' ORDER BY destination.ordinal_position)
      INTO common_columns
    FROM information_schema.columns destination
    JOIN information_schema.columns source
      ON source.table_schema = 'public'
     AND source.table_name = destination.table_name
     AND source.column_name = destination.column_name
    WHERE destination.table_schema = 'annavedah'
      AND destination.table_name = v_table_name;

    IF common_columns IS NOT NULL THEN
      EXECUTE format(
        'INSERT INTO annavedah.%I (%s) SELECT %s FROM public.%I ON CONFLICT DO NOTHING',
        v_table_name, common_columns, common_columns, v_table_name
      );
    END IF;
  END LOOP;
END $$;
