CREATE TABLE `activity_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`activity_id` text NOT NULL,
	`student_user_id` text NOT NULL,
	`status` text DEFAULT 'sin_empezar' NOT NULL,
	`evidence_source` text,
	`evidence_detail` text,
	`score` real,
	`feedback` text,
	`graded_by` text,
	`graded_at` text,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`student_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`graded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `activity_progress_unique` ON `activity_progress` (`activity_id`,`student_user_id`);