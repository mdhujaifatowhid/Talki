import { createClient } from "@supabase/supabase-js";

// ⚠️ এখানে তোমার Supabase URL এবং anon key বসাও
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
