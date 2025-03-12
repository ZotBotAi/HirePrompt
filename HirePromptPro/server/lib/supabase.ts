import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase credentials not found. Some functionality may not work properly.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function uploadResume(fileBuffer: Buffer, fileName: string, userId: string): Promise<string> {
  try {
    const fileKey = `resumes/${userId}/${Date.now()}_${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('hirepromptuploads')
      .upload(fileKey, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false
      });
    
    if (error) {
      throw new Error(`Failed to upload resume: ${error.message}`);
    }
    
    return fileKey;
  } catch (error) {
    console.error('Error uploading resume to Supabase:', error);
    throw new Error('Failed to upload resume. Please try again later.');
  }
}

export async function getResumeUrl(fileKey: string): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from('hirepromptuploads')
      .createSignedUrl(fileKey, 60 * 60); // 1 hour expiry
    
    if (error || !data) {
      throw new Error(`Failed to generate resume URL: ${error?.message}`);
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error generating resume URL:', error);
    throw new Error('Failed to get resume URL. Please try again later.');
  }
}

export async function deleteResume(fileKey: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('hirepromptuploads')
      .remove([fileKey]);
    
    if (error) {
      throw new Error(`Failed to delete resume: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting resume from Supabase:', error);
    throw new Error('Failed to delete resume. Please try again later.');
  }
}

export default {
  supabase,
  uploadResume,
  getResumeUrl,
  deleteResume
};
