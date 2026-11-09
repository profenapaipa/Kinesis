CREATE TABLE `follow_up_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`student_user_id` text NOT NULL,
	`author_user_id` text NOT NULL,
	`author_role` text NOT NULL,
	`kind` text NOT NULL,
	`body` text NOT NULL,
	`shared_with_guardian` integer DEFAULT false NOT NULL,
	`review_date` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`student_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
