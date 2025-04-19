CREATE TABLE `video_bookmarks` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`video_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `authors`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `video_bookmark_author_video_idx` ON `video_bookmarks` (`author_id`,`video_id`);