CREATE TABLE `enquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`request_key` text NOT NULL,
	`request_hash` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`organisation` text DEFAULT '' NOT NULL,
	`intent` text NOT NULL,
	`material` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT "enquiries_status_check" CHECK("enquiries"."status" IN ('new','in_progress','resolved'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `enquiries_request_key_unique` ON `enquiries` (`request_key`);--> statement-breakpoint
CREATE INDEX `enquiries_created_idx` ON `enquiries` (`created_at`,`id`);--> statement-breakpoint
CREATE INDEX `enquiries_status_created_idx` ON `enquiries` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`bucket` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `rate_limits_expiry_idx` ON `rate_limits` (`expires_at`);