import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, userId, role, email, password, name } = await req.json();

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Not authorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user: caller }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !caller) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: callerProfile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", caller.id)
      .single();

    if (profileError || callerProfile.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Only admins can perform this action" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let responseData;

    switch (action) {
      case "create_professional":
        console.log("Creating new professional:", { email, name });
        
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { name, role: "professional" }
        });

        if (createError) {
          console.error("Error creating user:", createError);
          throw createError;
        }

        if (newUser.user) {
          console.log("Created user:", newUser.user.id);
          
          const { error: profileUpdateError } = await supabase
            .from("profiles")
            .upsert({ 
              id: newUser.user.id,
              name,
              role: "professional"
            });
            
          if (profileUpdateError) {
            console.error("Error updating profile:", profileUpdateError);
          }

          const { error: professionalError } = await supabase
            .from("professionals")
            .insert({
              id: newUser.user.id,
              bio: "Profissional experiente em diversos serviços de beleza.",
              active: true
            });
            
          if (professionalError) {
            console.error("Error creating professional:", professionalError);
          }
          
          const { data: allServices } = await supabase
            .from("services")
            .select("id");
          
          const professionalServices = allServices.map(service => ({
            professional_id: newUser.user.id,
            service_id: service.id
          }));
          
          const { error: servicesError } = await supabase
            .from("professional_services")
            .insert(professionalServices);
            
          if (servicesError) {
            console.error("Error associating services:", servicesError);
          }
          
          const defaultAvailability = [
            { day_of_week: 1, start_time: "09:00", end_time: "18:00", professional_id: newUser.user.id },
            { day_of_week: 2, start_time: "09:00", end_time: "18:00", professional_id: newUser.user.id },
            { day_of_week: 3, start_time: "09:00", end_time: "18:00", professional_id: newUser.user.id },
            { day_of_week: 4, start_time: "09:00", end_time: "18:00", professional_id: newUser.user.id },
            { day_of_week: 5, start_time: "09:00", end_time: "18:00", professional_id: newUser.user.id }
          ];
          
          const { error: availabilityError } = await supabase
            .from("availability")
            .insert(defaultAvailability);
            
          if (availabilityError) {
            console.error("Error adding availability:", availabilityError);
          }
        }

        responseData = { success: true, user: newUser.user };
        break;

      case "update_role":
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ role })
          .eq("id", userId);

        if (updateError) {
          throw updateError;
        }

        if (role === "professional") {
          const { data: existingPro } = await supabase
            .from("professionals")
            .select("id")
            .eq("id", userId)
            .single();

          if (!existingPro) {
            await supabase.from("professionals").insert({
              id: userId,
              bio: "Profissional experiente em diversos serviços de beleza.",
              active: true
            });
            
            const { data: allServices } = await supabase
              .from("services")
              .select("id");
            
            const professionalServices = allServices.map(service => ({
              professional_id: userId,
              service_id: service.id
            }));
              
            await supabase.from("professional_services").insert(professionalServices);
            
            const defaultAvailability = [
              { day_of_week: 1, start_time: "09:00", end_time: "18:00", professional_id: userId },
              { day_of_week: 2, start_time: "09:00", end_time: "18:00", professional_id: userId },
              { day_of_week: 3, start_time: "09:00", end_time: "18:00", professional_id: userId },
              { day_of_week: 4, start_time: "09:00", end_time: "18:00", professional_id: userId },
              { day_of_week: 5, start_time: "09:00", end_time: "18:00", professional_id: userId }
            ];
            
            await supabase.from("availability").insert(defaultAvailability);
          }
        }

        responseData = { success: true };
        break;

      case "make_admin":
        const { error: adminUpdateError } = await supabase
          .from("profiles")
          .update({ role: "admin" })
          .eq("id", userId);

        if (adminUpdateError) {
          throw adminUpdateError;
        }

        responseData = { success: true, message: "User has been promoted to admin" };
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
    console.error("Error in manage-users function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
