import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xxarxbmmedbmpptjgtxe.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4YXJ4Ym1tZWRibXBwdGpndHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2ODY1NTYsImV4cCI6MjA2NTI2MjU1Nn0.Gn3SU4hK27MNtZvyL4V2gSCGy0ahqeMiIyg9bNW7Tmc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
