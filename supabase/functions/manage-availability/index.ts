
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Not authorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract JWT token
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token and get user data
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the caller's role
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return new Response(
        JSON.stringify({ error: "Error fetching user profile" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, availabilities, professionalId, dayOfWeek } = await req.json();

    // Determine if user can modify this professional's availability
    const canModify = userProfile.role === "admin" || (userProfile.role === "professional" && user.id === professionalId);

    if (!canModify) {
      return new Response(
        JSON.stringify({ error: "You don't have permission to modify this availability" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let responseData;

    switch (action) {
      case "get":
        // Get all availabilities for a professional
        const { data: availabilityData, error: getError } = await supabase
          .from("availability")
          .select("*")
          .eq("professional_id", professionalId)
          .order("day_of_week")
          .order("start_time");

        if (getError) {
          throw getError;
        }

        responseData = { success: true, availabilities: availabilityData };
        break;

      case "update":
        // First, delete all existing availabilities for this day
        if (dayOfWeek !== undefined) {
          await supabase
            .from("availability")
            .delete()
            .eq("professional_id", professionalId)
            .eq("day_of_week", dayOfWeek);
        }

        // Then, insert the new availabilities
        if (availabilities && availabilities.length > 0) {
          const { error: updateError } = await supabase
            .from("availability")
            .insert(availabilities.map((slot: any) => ({
              professional_id: professionalId,
              day_of_week: slot.day_of_week,
              start_time: slot.start_time,
              end_time: slot.end_time
            })));

          if (updateError) {
            throw updateError;
          }
        }

        responseData = { success: true };
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
