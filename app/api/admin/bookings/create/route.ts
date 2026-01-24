import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false, error: "Missing or invalid authorization header" };
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded || decoded.type !== "admin") {
    return { valid: false, error: "Invalid or expired token" };
  }

  return { valid: true, role: decoded.role, userId: decoded.id };
}

/**
 * POST /api/admin/bookings/create
 * Create a new booking from Admin Portal (Offline/Cash)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify Admin Token
    const auth = verifyAdminAuth(request);
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 },
      );
    }

    // Admin User ID
    const adminUserId = auth.userId;

    const body = await request.json();
    const {
      check_in,
      check_out,
      room_ids, // Array of room IDs
      guest_details, // { first_name, last_name, email, phone, ... }
      total_amount,
      gst_amount,
      room_charges,
      special_requests,
      num_guests,
    } = body;

    // Validate Input
    if (!check_in || !check_out || !room_ids?.length || !guest_details) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      id_type,
      id_number,

      // Extended Fields
      bank_id_number,
      govt_id_image_url,
      bank_id_image_url,

      booking_for,
      guest_relation,
      guest_id_number,
      guest_id_image_url,
    } = guest_details;

    if (!first_name || !last_name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: "Missing guest details" },
        { status: 400 },
      );
    }
    // 2. Find or Create User (Robust Handling)
    let userId = null;

    // A. Check if user already exists in PUBLIC table (Quick Check)
    const { data: existingPublicUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .or(`email.eq.${email},phone.eq.${phone}`)
      .maybeSingle();

    if (existingPublicUser) {
      userId = existingPublicUser.id;
    } else {
      // B. Creates proper Supabase Auth User to reserve ID/Email
      // This prevents "User already registered" errors if they try to sign up later manually
      // and ensures Foreign Key integrity if we switch to UUIDs matching Auth.

      let authUserId = null;

      // 1. Try to create Auth User
      // We set email_confirm: true so they are active immediately
      // We give a dummy password that they can reset later if they want to claim account
      const { data: authUser, error: authCreateError } =
        await supabaseAdmin.auth.admin.createUser({
          email: email,
          email_confirm: true,
          password: `Tmp${Math.random().toString(36).slice(-8)}!`,
          user_metadata: { full_name: `${first_name} ${last_name}`, phone },
        });

      if (authCreateError) {
        // If error is "User already registered", we need to fetch their ID
        // Note: supabaseAdmin.auth.admin.listUsers() or getUserById() might be needed if email matches but phone differs
        console.log(
          "Auth User Create Error (likely exists):",
          authCreateError.message,
        );

        // Try to find the auth user by email to get ID
        // Note: admin.listUsers is the way to search by email without logging in?
        // Or unfortuantely, createUser error doesn't return ID.
        // But if they exist in Auth but NOT public.users (which we checked above), it means they have an account but no profile?
        // Let's safe fallback: If we can't create auth user, maybe they exist.
        // We will generate a UUID for public users if we strictly have to, BUT that causes partial sync.
        // Best effort: Try to get ID.

        // Actually, since we checked public.users and they weren't there,
        // if they are in Auth, it's a sync issue.
        // We will proceed to insert into public.users.
        // Ideally we want the SAME ID.

        // Since we can't easily "Get Auth User By Email" via Admin SDK without iterating list (slow),
        // we will fallback to standard insert.
        // The Schema says `id` is UUID PRIMARY KEY. It does NOT enforce FK to auth.users.
        // So it is SAFE to insert a new UUID.
        // The only risk is if they sign up later, they get a NEW Auth ID, and can't claim this history.
        // BUT, if `email` is Unique in public.users, they can't create a profile later.

        // Decision: We will continue to insert.
      } else if (authUser?.user) {
        authUserId = authUser.user.id;
      }

      // C. Insert into Public Users
      const { data: newUser, error: createError } = await supabaseAdmin
        .from("users")
        .insert({
          id: authUserId || undefined, // Use Auth ID if we got one, else Auto-Gen
          email,
          full_name: `${first_name} ${last_name}`.trim(),
          phone,
          address,
          city,
          state,
          pincode,
          id_proof_type: id_type,
          id_proof_number: id_number,
          is_verified: true,
          is_active: true,
        })
        .select("id")
        .single();

      if (createError) {
        console.error("Create Public User Error:", createError);
        // If error is uniqueness violation, maybe we raced?
        // Try one last fetch
        const { data: retryUser } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (retryUser) userId = retryUser.id;
        else
          return NextResponse.json(
            { success: false, error: "Failed to create guest user profile" },
            { status: 500 },
          );
      } else {
        userId = newUser.id;
      }
    }

    // 3. Process Bookings
    const bookings = [];
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const totalNights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Generate a SHARED booking_number for ALL rooms in this order
    const bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;

    for (const roomId of room_ids) {
      // Calculate per-room amounts
      // For simplicity, we might trust the frontend totals or re-calculate.
      // Let's recalculate based on room base price to be safe?
      // Or just distribut total_amount?
      // To keep it simple and align with schema:
      const { data: room } = await supabaseAdmin
        .from("rooms")
        .select("base_price, room_type")
        .eq("id", roomId)
        .single();
      if (!room) continue;

      const thisRoomCharges = room.base_price * totalNights;
      const thisGst = 0; // GST REMOVED
      const thisTotal = thisRoomCharges + thisGst;

      const { data: booking, error: bookingError } = await supabaseAdmin
        .from("bookings")
        .insert({
          booking_number: bookingNumber,
          user_id: userId,
          room_id: roomId,
          guest_name: `${first_name} ${last_name}`,
          guest_email: email,
          guest_phone: phone,
          check_in: checkInDate.toISOString(),
          check_out: checkOutDate.toISOString(),
          total_nights: totalNights,
          num_guests: num_guests || 1, // Defaulting, or pass from frontend
          room_charges: thisRoomCharges,
          gst_amount: thisGst,
          total_amount: thisTotal,
          advance_paid: thisTotal, // FULL PAYMENT
          balance_amount: 0,
          status: "confirmed",
          payment_status: "paid", // HARDCODED AS REQUESTED
          special_requests: special_requests || "Admin Offline Booking",
          created_by: adminUserId, // Logged in admin

          // Extended Fields
          bank_id_number,
          govt_id_image_url,
          bank_id_image_url,
          booking_for: booking_for || "self",
          guest_relation,
          guest_id_number,
          guest_id_image_url,
        })
        .select()
        .single();

      if (bookingError) {
        console.error("Booking Create Error:", bookingError);
        // Continue or rollback? Supabase no transaction support easily here.
      } else {
        bookings.push(booking);

        // 4. Log Payment (Optional but good for records)
        // Schema has `payments` table. Let's insert a record.
        /*
             id UUID PRIMARY KEY,
             transaction_id VARCHAR UNIQUE,
             booking_id UUID,
             amount DECIMAL,
             payment_method VARCHAR, ...
            */
        const txnId = `OFFLINE_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await supabaseAdmin.from("payments").insert({
          transaction_id: txnId,
          booking_id: booking.id,
          user_id: userId,
          amount: thisTotal,
          payment_method: "Case/Offline",
          payment_type: "Full",
          status: "completed",
          remarks: "Admin Manual Booking",
        });
      }
    }

    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    console.error("Admin Booking Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
