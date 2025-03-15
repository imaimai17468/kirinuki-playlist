CREATE TABLE `authors` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`icon_url` text NOT NULL,
	`bio` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
