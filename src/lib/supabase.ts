import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// This client is for client-side usage. For Server Components/Actions, we need a specialized client (e.g. from @supabase/ssr, but for simplicity we will use standard where possible or build server equivalents).
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
