CREATE TABLE `academic_periods` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`is_active` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`teacher_user_id` text NOT NULL,
	`course_id` text NOT NULL,
	`subject_id` text NOT NULL,
	`topic` text NOT NULL,
	`objective` text NOT NULL,
	`instructions` text NOT NULL,
	`resources` text DEFAULT '[]' NOT NULL,
	`evidence_requested` text,
	`status` text DEFAULT 'preparada' NOT NULL,
	`scheduled_date` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`teacher_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `activity_adaptations` (
	`id` text PRIMARY KEY NOT NULL,
	`activity_id` text NOT NULL,
	`student_user_id` text NOT NULL,
	`status` text DEFAULT 'sugerida' NOT NULL,
	`representation_text` text,
	`representation_resources` text DEFAULT '[]',
	`action_expression_text` text,
	`action_expression_resources` text DEFAULT '[]',
	`participation_text` text,
	`participation_resources` text DEFAULT '[]',
	`rationale` text,
	`support_categories_applied` text DEFAULT '[]',
	`edited_text` text,
	`created_at` text NOT NULL,
	`decided_by` text,
	`decided_at` text,
	FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`student_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`decided_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_user_id` text,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text,
	`metadata` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `clinical_info` (
	`id` text PRIMARY KEY NOT NULL,
	`student_user_id` text NOT NULL,
	`diagnosis` text NOT NULL,
	`responsible_professional` text NOT NULL,
	`last_review_date` text NOT NULL,
	`notes` text,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`student_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clinical_info_student_user_id_unique` ON `clinical_info` (`student_user_id`);--> statement-breakpoint
CREATE TABLE `course_teachers` (
	`id` text PRIMARY KEY NOT NULL,
	`teacher_user_id` text NOT NULL,
	`course_id` text NOT NULL,
	`subject_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`teacher_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`grade` text NOT NULL,
	`group` text NOT NULL,
	`academic_period_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`academic_period_id`) REFERENCES `academic_periods`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `effective_supports` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`support_category_id` text,
	`description` text NOT NULL,
	`created_by` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `pedagogical_profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`support_category_id`) REFERENCES `support_categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` text PRIMARY KEY NOT NULL,
	`student_user_id` text NOT NULL,
	`course_id` text NOT NULL,
	`academic_period_id` text NOT NULL,
	`status` text DEFAULT 'activa' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`student_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`academic_period_id`) REFERENCES `academic_periods`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `guardian_students` (
	`id` text PRIMARY KEY NOT NULL,
	`guardian_user_id` text NOT NULL,
	`student_user_id` text NOT NULL,
	`relationship` text NOT NULL,
	`authorized_for_diagnosis` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`guardian_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`student_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `pedagogical_barriers` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`description` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_by` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `pedagogical_profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pedagogical_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`student_user_id` text NOT NULL,
	`learning_style` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`student_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pedagogical_profiles_student_user_id_unique` ON `pedagogical_profiles` (`student_user_id`);--> statement-breakpoint
CREATE TABLE `pedagogical_strengths` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`description` text NOT NULL,
	`created_by` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `pedagogical_profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `progress_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`student_user_id` text NOT NULL,
	`subject_id` text NOT NULL,
	`academic_period_id` text NOT NULL,
	`score` integer NOT NULL,
	`previous_score` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`student_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`academic_period_id`) REFERENCES `academic_periods`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_hash_unique` ON `sessions` (`token_hash`);--> statement-breakpoint
CREATE TABLE `student_learning_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`student_user_id` text NOT NULL,
	`option` text NOT NULL,
	`selected` integer DEFAULT false NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`student_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`short_name` text NOT NULL,
	`color` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `support_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`student_friendly_text` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_by` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tracking_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`activity_id` text NOT NULL,
	`student_user_id` text NOT NULL,
	`adaptation_id` text,
	`teacher_user_id` text NOT NULL,
	`participation` text NOT NULL,
	`comprehension` text NOT NULL,
	`strategy_used_support_category_id` text,
	`result` text NOT NULL,
	`observation` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`student_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`adaptation_id`) REFERENCES `activity_adaptations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`teacher_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`strategy_used_support_category_id`) REFERENCES `support_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`full_name` text NOT NULL,
	`role` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`must_change_password` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);