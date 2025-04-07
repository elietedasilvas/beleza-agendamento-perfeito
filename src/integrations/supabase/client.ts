
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://cylfiidhpinlegikcbrj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5bGZpaWRocGlubGVnaWtjYnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMzQ4MTUsImV4cCI6MjA1OTYxMDgxNX0.r6pc_2abu7Mg2znZsVI8euYPycoOYybU8u1S5863-4k";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
