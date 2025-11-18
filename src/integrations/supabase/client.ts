import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bszxabcstjjcifrljfsf.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzenhhYmNzdGpqY2lmcmxqZnNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMTQ5MjksImV4cCI6MjA3ODg5MDkyOX0.0wkfoXcJUXT5LcFIzLNzelSnlYQfc3aJTORD2jGxsNs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
