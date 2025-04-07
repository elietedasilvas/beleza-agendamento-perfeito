
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

    // Get the user's role
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

    const { action, appointmentId, appointmentData, date, professionalId } = await req.json();

    let responseData;

    switch (action) {
      case "create":
        // Check if the service duration and professional are valid
        const { data: serviceData, error: serviceError } = await supabase
          .from("services")
          .select("duration")
          .eq("id", appointmentData.service_id)
          .single();

        if (serviceError) {
          return new Response(
            JSON.stringify({ error: "Invalid service" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Calculate end time based on service duration
        const startTime = new Date(`2000-01-01T${appointmentData.start_time}`);
        const endTime = new Date(startTime.getTime() + serviceData.duration * 60000);
        const endTimeStr = endTime.toTimeString().substring(0, 8);

        // Check for appointment conflicts
        const { data: conflicts, error: conflictError } = await supabase
          .from("appointments")
          .select("*")
          .eq("professional_id", appointmentData.professional_id)
          .eq("date", appointmentData.date)
          .or(`start_time.lt.${endTimeStr},end_time.gt.${appointmentData.start_time}`);

        if (conflictError) {
          throw conflictError;
        }

        if (conflicts && conflicts.length > 0) {
          return new Response(
            JSON.stringify({ error: "Horário já está agendado" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create the appointment
        const { data: newAppointment, error: createError } = await supabase
          .from("appointments")
          .insert({
            client_id: userProfile.role === "client" ? user.id : appointmentData.client_id,
            professional_id: appointmentData.professional_id,
            service_id: appointmentData.service_id,
            date: appointmentData.date,
            start_time: appointmentData.start_time,
            end_time: endTimeStr,
            notes: appointmentData.notes || null
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        // Enable real-time updates for the appointments table
        await supabase.rpc('notify_all_changes', { table_name: 'appointments' });

        responseData = { success: true, appointment: newAppointment };
        break;

      case "update":
        // Check if user can update this appointment
        if (userProfile.role === "client" && appointmentData.client_id !== user.id) {
          return new Response(
            JSON.stringify({ error: "You can only update your own appointments" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (userProfile.role === "professional" && appointmentData.professional_id !== user.id) {
          return new Response(
            JSON.stringify({ error: "You can only update appointments assigned to you" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update the appointment
        const { data: updatedAppointment, error: updateError } = await supabase
          .from("appointments")
          .update({
            status: appointmentData.status,
            notes: appointmentData.notes
          })
          .eq("id", appointmentId)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        // Enable real-time updates for the appointments table
        await supabase.rpc('notify_all_changes', { table_name: 'appointments' });

        responseData = { success: true, appointment: updatedAppointment };
        break;

      case "cancel":
        // Check if user can cancel this appointment
        const { data: appointment, error: fetchError } = await supabase
          .from("appointments")
          .select("*")
          .eq("id", appointmentId)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (userProfile.role === "client" && appointment.client_id !== user.id) {
          return new Response(
            JSON.stringify({ error: "You can only cancel your own appointments" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (userProfile.role === "professional" && appointment.professional_id !== user.id) {
          return new Response(
            JSON.stringify({ error: "You can only cancel appointments assigned to you" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Cancel the appointment
        const { data: canceledAppointment, error: cancelError } = await supabase
          .from("appointments")
          .update({ status: "canceled" })
          .eq("id", appointmentId)
          .select()
          .single();

        if (cancelError) {
          throw cancelError;
        }

        // Enable real-time updates for the appointments table
        await supabase.rpc('notify_all_changes', { table_name: 'appointments' });

        responseData = { success: true, appointment: canceledAppointment };
        break;

      case "get_available_slots":
        // Get professional's availability for this day of week
        const requestDate = new Date(date);
        const dayOfWeek = requestDate.getDay(); // 0 is Sunday, 6 is Saturday

        const { data: availability, error: availabilityError } = await supabase
          .from("availability")
          .select("*")
          .eq("professional_id", professionalId)
          .eq("day_of_week", dayOfWeek);

        if (availabilityError) {
          throw availabilityError;
        }

        // Get service duration
        const { data: service, error: getServiceError } = await supabase
          .from("services")
          .select("duration")
          .eq("id", appointmentData.service_id)
          .single();

        if (getServiceError) {
          throw getServiceError;
        }

        // Get existing appointments for this date and professional
        const { data: existingAppointments, error: appointmentsError } = await supabase
          .from("appointments")
          .select("*")
          .eq("professional_id", professionalId)
          .eq("date", date)
          .neq("status", "canceled");

        if (appointmentsError) {
          throw appointmentsError;
        }

        // Calculate available time slots
        const availableSlots = [];
        const serviceDuration = service.duration;

        // Process each availability time range
        availability.forEach(slot => {
          let currentTime = new Date(`2000-01-01T${slot.start_time}`);
          const endTime = new Date(`2000-01-01T${slot.end_time}`);

          // Generate time slots in service.duration increments
          while (new Date(currentTime.getTime() + serviceDuration * 60000) <= endTime) {
            const slotStartTime = currentTime.toTimeString().substring(0, 8);
            const slotEndTime = new Date(currentTime.getTime() + serviceDuration * 60000).toTimeString().substring(0, 8);
            
            // Check if this slot overlaps with any existing appointment
            const isOverlapping = existingAppointments.some(app => {
              const appStart = new Date(`2000-01-01T${app.start_time}`);
              const appEnd = new Date(`2000-01-01T${app.end_time}`);
              const slotStart = new Date(`2000-01-01T${slotStartTime}`);
              const slotEnd = new Date(`2000-01-01T${slotEndTime}`);
              
              return (slotStart < appEnd && slotEnd > appStart);
            });
            
            if (!isOverlapping) {
              availableSlots.push({
                start_time: slotStartTime,
                end_time: slotEndTime
              });
            }
            
            // Move to next slot
            currentTime = new Date(currentTime.getTime() + serviceDuration * 60000);
          }
        });

        responseData = { success: true, availableSlots };
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
