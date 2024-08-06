import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
//import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

SUPABASE_URL="https://zaqqkwecwflyviqgmzzj.supabase.co"; 
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphcXFrd2Vjd2ZseXZpcWdtenpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEzMTc5NTAsImV4cCI6MjAzNjg5Mzk1MH0.Q00hZUEpDQMlGtrx7ltUdJUQWcNGfYQmvozgZ12Y9nM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})