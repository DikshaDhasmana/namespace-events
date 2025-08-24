import { createClient } from '@supabase/supabase-js';

// Supabase configuration - replace with your actual credentials
const SUPABASE_URL = "https://gvwkdvpdmjagdbincqmu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2d2tkdnBkbWphZ2RiaW5jcW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1OTI1MDAsImV4cCI6MjA3MTE2ODUwMH0.h-TgIiRzJWksdSmXPWZ1eGklLYe5yjJFaDda83VC_cs";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

/**
 * Script to remove all existing event registrations
 * This should be run once to enforce the new profile completion requirement
 */
async function removeExistingRegistrations() {
  console.log('Starting to remove existing registrations...');
  
  try {
    // Delete all registrations from the registrations table
    const { error, count } = await supabase
      .from('registrations')
      .delete()
      .not('id', 'is', null); // Delete all records

    if (error) {
      console.error('Error removing registrations:', error);
      return;
    }

    console.log(`Successfully removed ${count} registrations`);
    
    // Reset profile_completed flag for all users to false
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ profile_completed: false })
      .not('id', 'is', null);

    if (profileError) {
      console.error('Error resetting profile completion status:', profileError);
      return;
    }

    console.log('Successfully reset profile completion status for all users');
    console.log('All existing registrations have been removed and profile completion reset');
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the script if this file is executed directly
if (import.meta.main) {
  removeExistingRegistrations();
}

export { removeExistingRegistrations };
