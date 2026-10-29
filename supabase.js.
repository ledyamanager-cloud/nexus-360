import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://tldpgghlxwzaysujhrqs.supabase.co";

const supabasePublishableKey = "sb_publishable_s7LVRMehzxOt3nOmCCjJ3g_YYZ1dZa8";

export const supabase = createClient(
supabaseUrl,
supabasePublishableKey,
{
auth: {
persistSession: true,
autoRefreshToken: true,
detectSessionInUrl: true
}
}
);

console.log("NEXUS 360 : Supabase est initialisé.");
