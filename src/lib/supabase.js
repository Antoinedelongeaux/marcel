import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

//const supabaseUrl = 'https://zaqqkwecwflyviqgmzzj.supabase.co'
//const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphcXFrd2Vjd2ZseXZpcWdtenpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDczNzg5NTYsImV4cCI6MjAyMjk1NDk1Nn0.R9AGSk_sS4oStZ3YSj1DjXUPja2Lb0vtF2jP0xQzq-4';
// const supabaseUrl = PUBLIC_SUPABASE_URL
// const supabaseAnonKey = PUBLIC_SUPABASE_ANON_KEY


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})