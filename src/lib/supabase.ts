import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// These values should be replaced with your actual Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
    return (
        supabaseUrl !== 'https://your-project.supabase.co' &&
        supabaseAnonKey !== 'your-anon-key'
    );
};
