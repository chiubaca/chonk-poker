PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_usersToRooms` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`room_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`room_id`) REFERENCES `room`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_usersToRooms`("id", "user_id", "room_id") SELECT "id", "user_id", "room_id" FROM `usersToRooms`;--> statement-breakpoint
DROP TABLE `usersToRooms`;--> statement-breakpoint
ALTER TABLE `__new_usersToRooms` RENAME TO `usersToRooms`;--> statement-breakpoint
PRAGMA foreign_keys=ON;