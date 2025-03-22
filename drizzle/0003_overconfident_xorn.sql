CREATE TABLE `playlist_videos` (
	`id` text PRIMARY KEY NOT NULL,
	`playlist_id` text NOT NULL,
	`video_id` text NOT NULL,
	`order` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`author_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
