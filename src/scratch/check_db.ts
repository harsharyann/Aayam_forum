import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://naczgmppvycbutbhtrlp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hY3pnbXBwdnljYnV0Ymh0cmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzIxODEsImV4cCI6MjA5MjAwODE4MX0.nI-yRm3nnAdq0RVRpIyQ0IGtNDmHKdDDPN7z00hFCVM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  console.log("Listing tables...");
  const { data, error } = await supabase.rpc('get_tables'); // This might not exist, alternative:
  
  // Try to query a common table or just see what's available
  // Supabase doesn't have a direct "list tables" RPC by default usually, 
  // but we can try to query information_schema if we had service role key.
  // With anon key, we can only see what's accessible.
  
  // Let's try to query 'settings' as seen in the code
  console.log("Checking settings table...");
  const { data: settingsData, error: settingsError } = await supabase.from('settings').select('*').limit(1);
  if (settingsError) {
    console.error("Settings table error:", settingsError);
  } else {
    console.log("Settings table exists.");
  }

  // Let's try to search for any other potential names like 'members'
  console.log("Checking members table...");
  const { data: membersData, error: membersError } = await supabase.from('members').select('*').limit(1);
  if (membersError) {
    console.error("Members table error:", membersError);
  } else {
    console.log("Members table exists.");
  }
}

checkSchema();
