import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertResumeSchema,
  insertJobSpecSchema, 
  insertInterviewQuestionsSchema 
} from "@shared/schema";
import { supabase, uploadResumeToBucket } from "./supabase";
import { generateInterviewQuestions, parseResume } from "./openai";
import { PDFExtract } from "pdf.js-extract";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

// Define request with file type
interface RequestWithFile extends Request {
  file?: any; // Multer file object
}

// Set up multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const pdfExtract = new PDFExtract();

export async function registerRoutes(app: Express): Promise<Server> {
  // Plan update route will be defined below
  // User auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Create user in Supabase
      const supabaseUser = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (supabaseUser.error) {
        return res.status(400).json({ message: supabaseUser.error.message });
      }

      // Create user in our storage
      const user = await storage.createUser(validatedData);
      
      // Update with Supabase ID
      await storage.updateUser(user.id, {
        supabaseId: supabaseUser.data.user?.id
      });

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error in signup:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error during signup" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({ message: "Invalid login credentials" });
      }

      console.log(`Supabase authentication successful for user: ${email}`);

      // Get user from our storage
      let user = await storage.getUserByEmail(email);
      
      // If user doesn't exist in our storage but exists in Supabase,
      // create a record in our storage
      if (!user && data.user) {
        console.log(`User not found in local storage, creating from Supabase data: ${email}`);
        
        const newUser = {
          username: email.split('@')[0], // Generate username from email
          email: email,
          password: 'supabase-managed', // Password is managed by Supabase, this is a placeholder
          fullName: data.user.user_metadata?.full_name || '',
          plan: 'free',
        };
        
        user = await storage.createUser(newUser);
        
        // Update with Supabase ID
        await storage.updateUser(user.id, {
          supabaseId: data.user.id
        });
        
        console.log(`Created local user record for ${email} with ID: ${user.id}`);
      }
      
      if (!user) {
        console.error(`Failed to retrieve or create user for ${email}`);
        return res.status(404).json({ message: "User not found" });
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json({ 
        user: userWithoutPassword,
        session: data.session
      });
    } catch (error) {
      console.error("Error in login:", error);
      return res.status(500).json({ message: "Server error during login" });
    }
  });

  app.get("/api/auth/user", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.split(' ')[1];
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      // Get user from our storage
      let user = await storage.getUserBySupabaseId(data.user.id);
      
      // If the user exists in Supabase but not in our storage, create a record
      if (!user && data.user) {
        const email = data.user.email;
        console.log(`User not found in local storage, creating from Supabase data: ${email}`);
        
        if (!email) {
          return res.status(400).json({ message: "User email not available" });
        }
        
        const newUser = {
          username: email.split('@')[0], // Generate username from email
          email: email,
          password: 'supabase-managed', // Password is managed by Supabase, this is a placeholder
          fullName: data.user.user_metadata?.full_name || '',
          plan: 'free',
        };
        
        user = await storage.createUser(newUser);
        
        // Update with Supabase ID
        await storage.updateUser(user.id, {
          supabaseId: data.user.id
        });
        
        console.log(`Created local user record for ${email} with ID: ${user.id}`);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Error getting user:", error);
      return res.status(500).json({ message: "Server error getting user" });
    }
  });

  // Resume routes
  app.post("/api/resumes", upload.single('resume'), async (req: RequestWithFile, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Validate user
      const userId = parseInt(req.body.userId);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check file type
      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ message: "Only PDF files are supported" });
      }

      // Create a unique filename
      const timestamp = Date.now();
      const hash = crypto.createHash('md5').update(`${userId}-${timestamp}`).digest('hex');
      const fileName = `${hash}-${req.file.originalname}`;
      const filePath = `${userId}/${fileName}`;

      // Upload to Supabase storage
      const fileUrl = await uploadResumeToBucket(
        filePath,
        req.file.buffer,
        req.file.mimetype
      );

      // Save resume metadata to our database
      const resumeData = {
        userId,
        fileName: req.file.originalname,
        fileUrl
      };

      const resume = await storage.createResume(resumeData);

      // Save file temporarily to parse with PDF.js
      const tempFilePath = path.join(__dirname, `temp-${hash}.pdf`);
      fs.writeFileSync(tempFilePath, req.file.buffer);

      try {
        // Extract text from PDF
        const extractResult = await pdfExtract.extract(tempFilePath);
        const extractedText = extractResult.pages
          .map(page => page.content.map(item => item.str).join(' '))
          .join('\n');

        // Parse resume with OpenAI
        const parsedContent = await parseResume(extractedText);
        
        // Update resume with parsed content
        await storage.updateResumeParsedContent(resume.id, parsedContent);
        
        resume.parsed = true;
        resume.parsedContent = parsedContent;
      } catch (parseError) {
        console.error("Error parsing PDF:", parseError);
        // Continue without parsed content - we still want to save the resume
      } finally {
        // Clean up temp file
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }

      return res.status(201).json(resume);
    } catch (error) {
      console.error("Error uploading resume:", error);
      return res.status(500).json({ message: "Server error uploading resume" });
    }
  });

  app.get("/api/resumes/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const resumes = await storage.getResumesByUserId(userId);
      return res.status(200).json(resumes);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      return res.status(500).json({ message: "Server error fetching resumes" });
    }
  });

  app.get("/api/resumes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const resume = await storage.getResume(id);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      return res.status(200).json(resume);
    } catch (error) {
      console.error("Error fetching resume:", error);
      return res.status(500).json({ message: "Server error fetching resume" });
    }
  });

  // Job Spec routes
  app.post("/api/job-specs", async (req, res) => {
    try {
      const validatedData = insertJobSpecSchema.parse(req.body);
      const jobSpec = await storage.createJobSpec(validatedData);
      return res.status(201).json(jobSpec);
    } catch (error) {
      console.error("Error creating job spec:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error creating job spec" });
    }
  });

  app.get("/api/job-specs/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const jobSpecs = await storage.getJobSpecsByUserId(userId);
      return res.status(200).json(jobSpecs);
    } catch (error) {
      console.error("Error fetching job specs:", error);
      return res.status(500).json({ message: "Server error fetching job specs" });
    }
  });

  app.get("/api/job-specs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const jobSpec = await storage.getJobSpec(id);
      if (!jobSpec) {
        return res.status(404).json({ message: "Job spec not found" });
      }
      return res.status(200).json(jobSpec);
    } catch (error) {
      console.error("Error fetching job spec:", error);
      return res.status(500).json({ message: "Server error fetching job spec" });
    }
  });

  // Interview Questions routes
  app.post("/api/generate-questions", async (req, res) => {
    try {
      const { userId, resumeId, jobSpecId } = req.body;
      
      // Validate user and check subscription plan
      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get resume and job spec
      const resume = await storage.getResume(parseInt(resumeId));
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }

      const jobSpec = await storage.getJobSpec(parseInt(jobSpecId));
      if (!jobSpec) {
        return res.status(404).json({ message: "Job spec not found" });
      }

      // Check if resume has parsed content
      if (!resume.parsed || !resume.parsedContent) {
        return res.status(400).json({ message: "Resume has not been properly parsed" });
      }

      // Generate questions using OpenAI
      const questionsResponse = await generateInterviewQuestions(
        resume.parsedContent,
        jobSpec.title,
        jobSpec.description,
        jobSpec.requiredSkills
      );

      // Save generated questions
      const interviewQuestions = await storage.createInterviewQuestions({
        userId: parseInt(userId),
        resumeId: parseInt(resumeId),
        jobSpecId: parseInt(jobSpecId),
        questions: questionsResponse.questions
      });

      return res.status(201).json(interviewQuestions);
    } catch (error) {
      console.error("Error generating questions:", error);
      return res.status(500).json({ message: "Server error generating questions" });
    }
  });

  app.get("/api/interview-questions/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const questions = await storage.getInterviewQuestionsByUserId(userId);
      return res.status(200).json(questions);
    } catch (error) {
      console.error("Error fetching interview questions:", error);
      return res.status(500).json({ message: "Server error fetching interview questions" });
    }
  });

  app.get("/api/interview-questions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const questions = await storage.getInterviewQuestions(id);
      if (!questions) {
        return res.status(404).json({ message: "Interview questions not found" });
      }
      return res.status(200).json(questions);
    } catch (error) {
      console.error("Error fetching interview questions:", error);
      return res.status(500).json({ message: "Server error fetching interview questions" });
    }
  });

  // Simple plan update route
  app.post("/api/update-plan", async (req, res) => {
    try {
      const { userId, plan } = req.body;

      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update user's plan
      await storage.updateUser(user.id, { plan });
      
      // Create/update subscription record for tracking
      const existingSubscription = await storage.getSubscriptionByUserId(user.id);
      
      if (existingSubscription) {
        await storage.updateSubscription(user.id, {
          plan,
          status: 'active'
        });
      } else {
        // Create a new subscription record
        await storage.createSubscription({
          userId: user.id,
          plan,
          status: 'active',
          currentPeriodStart: new Date(),
          // Free tier never expires, or set to 1 year in the future
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        });
      }

      return res.status(200).json({ success: true, plan });
    } catch (error) {
      console.error("Error updating plan:", error);
      return res.status(500).json({ message: "Server error updating plan" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
