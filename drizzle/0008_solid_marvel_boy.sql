CREATE TABLE `playlist_bookmarks` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`playlist_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `authors`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `playlist_bookmark_author_playlist_idx` ON `playlist_bookmarks` (`author_id`,`playlist_id`);