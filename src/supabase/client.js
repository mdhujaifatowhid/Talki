import { createClient } from "@supabase/supabase-js";

// ⚠️ এখানে তোমার Supabase URL এবং anon key বসাও
const SUPABASE_URL = "https://mbtdkkiwdptagztcscvw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1idGRra2l3ZHB0YWd6dGNzY3Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MTM4ODksImV4cCI6MjA5NjQ4OTg4OX0.SwOfch_KMbc7Zxrf8U6816uynhRz38d6gdlIsvof9iY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
