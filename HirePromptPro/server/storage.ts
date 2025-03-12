import {
  users, type User, type InsertUser,
  resumes, type Resume, type InsertResume,
  jobSpecs, type JobSpec, type InsertJobSpec,
  interviewQuestions, type InterviewQuestions, type InsertInterviewQuestions,
  subscriptions, type Subscription, type InsertSubscription
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserBySupabaseId(supabaseId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  updateUserStripeInfo(id: number, info: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User>;
  
  // Resume operations
  createResume(resume: InsertResume): Promise<Resume>;
  getResumesByUserId(userId: number): Promise<Resume[]>;
  getResume(id: number): Promise<Resume | undefined>;
  updateResumeParsedContent(id: number, parsedContent: string): Promise<Resume>;
  
  // Job Spec operations
  createJobSpec(jobSpec: InsertJobSpec): Promise<JobSpec>;
  getJobSpecsByUserId(userId: number): Promise<JobSpec[]>;
  getJobSpec(id: number): Promise<JobSpec | undefined>;
  
  // Interview Questions operations
  createInterviewQuestions(questions: InsertInterviewQuestions): Promise<InterviewQuestions>;
  getInterviewQuestionsByUserId(userId: number): Promise<InterviewQuestions[]>;
  getInterviewQuestions(id: number): Promise<InterviewQuestions | undefined>;
  
  // Subscription operations
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getSubscriptionByUserId(userId: number): Promise<Subscription | undefined>;
  updateSubscription(userId: number, updates: Partial<Subscription>): Promise<Subscription>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private resumes: Map<number, Resume>;
  private jobSpecs: Map<number, JobSpec>;
  private interviewQuestions: Map<number, InterviewQuestions>;
  private subscriptions: Map<number, Subscription>;
  private currentId: { 
    users: number, 
    resumes: number, 
    jobSpecs: number, 
    interviewQuestions: number, 
    subscriptions: number 
  };

  constructor() {
    this.users = new Map();
    this.resumes = new Map();
    this.jobSpecs = new Map();
    this.interviewQuestions = new Map();
    this.subscriptions = new Map();
    this.currentId = {
      users: 1,
      resumes: 1,
      jobSpecs: 1,
      interviewQuestions: 1,
      subscriptions: 1
    };
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserBySupabaseId(supabaseId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.supabaseId === supabaseId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt, 
      plan: 'free',
      stripeCustomerId: undefined,
      stripeSubscriptionId: undefined,
      supabaseId: undefined
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserStripeInfo(id: number, info: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    const updatedUser = { 
      ...user, 
      stripeCustomerId: info.stripeCustomerId, 
      stripeSubscriptionId: info.stripeSubscriptionId 
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Resume methods
  async createResume(insertResume: InsertResume): Promise<Resume> {
    const id = this.currentId.resumes++;
    const createdAt = new Date();
    const resume: Resume = { 
      ...insertResume, 
      id, 
      createdAt, 
      parsed: false,
      parsedContent: undefined
    };
    this.resumes.set(id, resume);
    return resume;
  }

  async getResumesByUserId(userId: number): Promise<Resume[]> {
    return Array.from(this.resumes.values()).filter(
      (resume) => resume.userId === userId,
    );
  }

  async getResume(id: number): Promise<Resume | undefined> {
    return this.resumes.get(id);
  }

  async updateResumeParsedContent(id: number, parsedContent: string): Promise<Resume> {
    const resume = await this.getResume(id);
    if (!resume) {
      throw new Error(`Resume with id ${id} not found`);
    }
    const updatedResume = { ...resume, parsed: true, parsedContent };
    this.resumes.set(id, updatedResume);
    return updatedResume;
  }

  // Job Spec methods
  async createJobSpec(insertJobSpec: InsertJobSpec): Promise<JobSpec> {
    const id = this.currentId.jobSpecs++;
    const createdAt = new Date();
    const jobSpec: JobSpec = { ...insertJobSpec, id, createdAt };
    this.jobSpecs.set(id, jobSpec);
    return jobSpec;
  }

  async getJobSpecsByUserId(userId: number): Promise<JobSpec[]> {
    return Array.from(this.jobSpecs.values()).filter(
      (jobSpec) => jobSpec.userId === userId,
    );
  }

  async getJobSpec(id: number): Promise<JobSpec | undefined> {
    return this.jobSpecs.get(id);
  }

  // Interview Questions methods
  async createInterviewQuestions(insertQuestions: InsertInterviewQuestions): Promise<InterviewQuestions> {
    const id = this.currentId.interviewQuestions++;
    const createdAt = new Date();
    const questions: InterviewQuestions = { ...insertQuestions, id, createdAt };
    this.interviewQuestions.set(id, questions);
    return questions;
  }

  async getInterviewQuestionsByUserId(userId: number): Promise<InterviewQuestions[]> {
    return Array.from(this.interviewQuestions.values()).filter(
      (questions) => questions.userId === userId,
    );
  }

  async getInterviewQuestions(id: number): Promise<InterviewQuestions | undefined> {
    return this.interviewQuestions.get(id);
  }

  // Subscription methods
  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = this.currentId.subscriptions++;
    const createdAt = new Date();
    const subscription: Subscription = { ...insertSubscription, id, createdAt };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async getSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(
      (subscription) => subscription.userId === userId,
    );
  }

  async updateSubscription(userId: number, updates: Partial<Subscription>): Promise<Subscription> {
    const subscription = await this.getSubscriptionByUserId(userId);
    if (!subscription) {
      throw new Error(`Subscription for user ${userId} not found`);
    }
    const updatedSubscription = { ...subscription, ...updates };
    this.subscriptions.set(subscription.id, updatedSubscription);
    return updatedSubscription;
  }
}

export const storage = new MemStorage();
