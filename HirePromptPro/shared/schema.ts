import { pgTable, text, serial, integer, boolean, timestamp, uniqueIndex, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  plan: text("plan").default("free").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  supabaseId: text("supabase_id").unique(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  parsed: boolean("parsed").default(false),
  parsedContent: text("parsed_content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertResumeSchema = createInsertSchema(resumes).pick({
  userId: true,
  fileName: true,
  fileUrl: true,
});

export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumes.$inferSelect;

export const jobSpecs = pgTable("job_specs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requiredSkills: text("required_skills").array().notNull(),
  additionalNotes: text("additional_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertJobSpecSchema = createInsertSchema(jobSpecs).pick({
  userId: true,
  title: true,
  description: true,
  requiredSkills: true,
  additionalNotes: true,
});

export type InsertJobSpec = z.infer<typeof insertJobSpecSchema>;
export type JobSpec = typeof jobSpecs.$inferSelect;

export const interviewQuestions = pgTable("interview_questions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  resumeId: integer("resume_id").references(() => resumes.id),
  jobSpecId: integer("job_spec_id").references(() => jobSpecs.id),
  questions: json("questions").notNull().$type<{
    type: string;
    question: string;
    rationale: string;
  }[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInterviewQuestionsSchema = createInsertSchema(interviewQuestions).pick({
  userId: true,
  resumeId: true,
  jobSpecId: true,
  questions: true,
});

export type InsertInterviewQuestions = z.infer<typeof insertInterviewQuestionsSchema>;
export type InterviewQuestions = typeof interviewQuestions.$inferSelect;

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  plan: text("plan").notNull(),
  status: text("status").notNull(),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  userId: true,
  plan: true,
  status: true,
  currentPeriodStart: true,
  currentPeriodEnd: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
