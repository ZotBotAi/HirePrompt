import OpenAI from "openai";

// Check if OpenAI API key is available
if (!process.env.OPENAI_API_KEY) {
  console.warn("Missing OpenAI API key - AI question generation will use mock responses");
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openaiApiKey = process.env.OPENAI_API_KEY || 'mock-key';
const openai = new OpenAI({ apiKey: openaiApiKey });

interface Question {
  type: string;
  question: string;
  rationale: string;
}

export interface InterviewQuestionResponse {
  questions: Question[];
}

// Helper function to generate mock interview questions if API key isn't available
function generateMockInterviewQuestions(
  jobTitle: string,
  requiredSkills: string[]
): InterviewQuestionResponse {
  const mockQuestions = [
    {
      type: "Technical",
      question: `Could you explain your experience with ${requiredSkills[0] || 'relevant technologies'}?`,
      rationale: `This question directly addresses the candidate's proficiency with a key skill required for the ${jobTitle} position.`
    },
    {
      type: "Behavioral",
      question: "Describe a challenging project you worked on and how you overcame obstacles.",
      rationale: "This reveals problem-solving abilities and resilience, which are important for any position."
    },
    {
      type: "Situational",
      question: `How would you handle a situation where project requirements for a ${jobTitle} role changed significantly mid-development?`,
      rationale: "Tests adaptability and change management skills, crucial for modern work environments."
    },
    {
      type: "Technical",
      question: `What methodologies do you use to ensure code quality as a ${jobTitle}?`,
      rationale: "Evaluates the candidate's commitment to quality and knowledge of best practices."
    },
    {
      type: "Behavioral",
      question: "Tell me about a time when you had to learn a new technology quickly.",
      rationale: "Assesses learning agility and self-motivation, important traits for growing in the role."
    }
  ];

  return { questions: mockQuestions };
}

export async function generateInterviewQuestions(
  resumeContent: string,
  jobTitle: string,
  jobDescription: string,
  requiredSkills: string[]
): Promise<InterviewQuestionResponse> {
  // If no API key, use mock data
  if (!process.env.OPENAI_API_KEY) {
    console.log("Using mock interview questions (no OpenAI API key provided)");
    return generateMockInterviewQuestions(jobTitle, requiredSkills);
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are an expert recruiter specializing in generating tailored interview questions. " +
            "Based on the resume content and job details provided, generate 5-10 relevant interview questions. " +
            "For each question, include the type (technical, behavioral, situational, etc.), the question itself, and a brief rationale " +
            "explaining why this question is important for this candidate and position. " +
            "Respond with JSON in this format: { \"questions\": [{ \"type\": string, \"question\": string, \"rationale\": string }] }"
        },
        {
          role: "user",
          content: `Generate interview questions based on this information:
            
            Resume Content:
            ${resumeContent}
            
            Job Title: ${jobTitle}
            
            Job Description:
            ${jobDescription}
            
            Required Skills:
            ${requiredSkills.join(', ')}
            
            Generate a mix of technical questions to assess skills, behavioral questions to evaluate past experiences, and situational questions to understand problem-solving approaches.`
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response into proper JSON
    const content = response.choices[0].message.content || '{"questions":[]}';
    const result = JSON.parse(content) as InterviewQuestionResponse;
    
    return result;
  } catch (error) {
    console.error("Error generating interview questions:", error);
    throw new Error(`Failed to generate interview questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function generateMockResumeParsingResult(resumeText: string): string {
  // Create a basic structured response based on the resumeText length
  let mockResult = "## Resume Parsing Results\n\n";
  
  // Extract what might be a name from the first few lines
  const possibleNameLine = resumeText.split('\n')[0];
  const possibleName = possibleNameLine?.substring(0, 30) || "Candidate Name";
  
  mockResult += `### Personal Information\n\n`;
  mockResult += `- Name: ${possibleName}\n`;
  mockResult += `- Contact: Email address and phone number found in resume\n\n`;
  
  mockResult += `### Skills\n\n`;
  mockResult += `- Technical Skills: Programming, Development, Data Analysis\n`;
  mockResult += `- Soft Skills: Communication, Teamwork, Problem-solving\n\n`;
  
  mockResult += `### Work Experience\n\n`;
  mockResult += `- Previous relevant positions identified\n`;
  mockResult += `- Projects and accomplishments noted\n\n`;
  
  mockResult += `### Education\n\n`;
  mockResult += `- Degree information extracted\n`;
  mockResult += `- Relevant coursework identified\n\n`;
  
  return mockResult;
}

export async function parseResume(resumeText: string): Promise<string> {
  // If no API key, use mock data
  if (!process.env.OPENAI_API_KEY) {
    console.log("Using mock resume parsing (no OpenAI API key provided)");
    return generateMockResumeParsingResult(resumeText);
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are an expert resume parser. Extract and organize the key information from the provided resume text. " +
            "Include personal information, skills, work experience, education, certifications, and any other relevant details. " +
            "Format the response in a structured way that's easy to read and analyze."
        },
        {
          role: "user",
          content: `Parse the following resume text and extract key information:\n\n${resumeText}`
        }
      ]
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw new Error(`Failed to parse resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
