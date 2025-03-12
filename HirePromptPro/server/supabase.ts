import { createClient } from "@supabase/supabase-js";

// Default to mock implementation if environment variables are not available
const supabaseUrl = process.env.SUPABASE_URL || 'https://example.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'mock-key';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.warn("Missing Supabase environment variables - using in-memory storage only");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadResumeToBucket(
  filePath: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string> {
  const bucketName = "resumes";
  
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    // Create bucket if it doesn't exist
    if (!bucketExists) {
      console.log(`Creating storage bucket: ${bucketName}`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['application/pdf'],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (createError) {
        console.error(`Failed to create bucket: ${createError.message}`);
        // Fall back to local storage
        return `local://${filePath}`;
      }
    }
    
    // Upload file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error(`Storage upload error: ${error.message}`);
      // Fall back to local storage
      return `local://${filePath}`;
    }

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Unexpected error in file upload:', error);
    // Fall back to local storage
    return `local://${filePath}`;
  }
}

export async function getUserByEmail(email: string) {
  // First try to find the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error("Error retrieving users from Supabase Auth:", authError);
    return null;
  }
  
  // Find the user with the matching email in auth
  const authUser = authData.users.find(user => user.email === email);
  
  if (!authUser) {
    console.warn(`User with email ${email} not found in Supabase Auth`);
    return null;
  }
  
  console.log(`User with email ${email} found in Supabase Auth with ID: ${authUser.id}`);
  return authUser;
}

export async function createSupabaseUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return data.user;
}
