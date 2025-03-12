import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key-for-development" });

/**
 * Generate interview questions based on resume content and job specification
 */
export async function generateInterviewQuestions(
  resumeContent: string,
  jobTitle: string,
  jobDescription: string,
  requiredSkills: string[],
  responsibilities: string[]
): Promise<{ general: string[]; technical: string[]; behavioral: string[] }> {
  try {
    const prompt = `
      As an expert interviewer, create personalized interview questions for the following candidate and job:

      RESUME:
      ${resumeContent}

      JOB DETAILS:
      - Title: ${jobTitle}
      - Description: ${jobDescription}
      - Required Skills: ${requiredSkills.join(', ')}
      - Responsibilities: ${responsibilities.join(', ')}

      Generate a comprehensive set of interview questions tailored to the candidate's experience and the job requirements.
      Organize questions into three categories:
      1. General questions about their experience and background
      2. Technical questions to assess their skills relevant to the job
      3. Behavioral questions to evaluate soft skills and cultural fit
      
      Format the response as a JSON object with the following structure:
      {
        "general": [array of general questions],
        "technical": [array of technical questions],
        "behavioral": [array of behavioral questions]
      }
      
      Each category should contain 5-7 questions. The questions should be specific to the candidate's experience and the job requirements.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      general: result.general || [],
      technical: result.technical || [],
      behavioral: result.behavioral || []
    };
  } catch (error) {
    console.error("Error generating interview questions:", error);
    throw new Error("Failed to generate interview questions. Please try again later.");
  }
}

/**
 * Extract content from a resume text
 */
export async function parseResumeContent(resumeText: string): Promise<string> {
  try {
    const prompt = `
      Extract and organize the key information from the following resume text.
      Format it in a clean, structured way that highlights:
      
      1. Contact information
      2. Summary/Professional profile
      3. Skills
      4. Work experience
      5. Education
      6. Any additional relevant sections
      
      Resume text:
      ${resumeText}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error parsing resume content:", error);
    throw new Error("Failed to parse resume content. Please try again later.");
  }
}

export default {
  generateInterviewQuestions,
  parseResumeContent
};
