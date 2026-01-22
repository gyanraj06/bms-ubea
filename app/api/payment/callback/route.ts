import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Verify hash from Easebuzz response
function verifyHash(params: Record<string, string>, salt: string): boolean {
  const {
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    status,
    hash,
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = "",
    udf6 = "",
    udf7 = "",
    udf8 = "",
    udf9 = "",
    udf10 = "",
  } = params;

  const key = process.env.EASEBUZZ_KEY || "";

  // Reverse hash sequence: salt|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
  const hashString = `${salt}|${status}|${udf10}|${udf9}|${udf8}|${udf7}|${udf6}|${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;

  const calculatedHash = crypto
    .createHash("sha512")
    .update(hashString)
    .digest("hex");

  console.log("[Callback] Hash verification:");
  console.log("  Received hash:", hash?.substring(0, 20) + "...");
  console.log("  Calculated hash:", calculatedHash.substring(0, 20) + "...");
  console.log("  Match:", calculatedHash === hash);

  return calculatedHash === hash;
}

export async function POST(request: NextRequest) {
  try {
    // Use baseUrl from env - fixes TypeError: Invalid URL
    const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";

    // Parse form data from Easebuzz callback
    const formData = await request.formData();
    const params: Record<string, string> = {};

    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    console.log("=".repeat(60));
    console.log("[Easebuzz Callback] RECEIVED:");
    console.log(JSON.stringify(params, null, 2));
    console.log("=".repeat(60));

    const { txnid, status, amount, easepayid, error_Message, email } = params;
    const salt = process.env.EASEBUZZ_SALT || "";

    // Verify hash
    const isValidHash = verifyHash(params, salt);

    if (!isValidHash) {
      console.error("[Callback] Hash verification failed!");
      console.error("[Callback] Hash Mismatch - Potential Hack");
      // Security Fail Path: Do NOT update DB
      // Log only to server logs (already done above with console.error)

      return Response.redirect(
        `${baseUrl}/booking/failure?reason=hash_mismatch`,
        302,
      );
    }

    // Update payment log with callback data
    // Update payment log with callback data
    // Update payment log with callback data
    const updateData: any = {
      status:
        status === "success"
          ? "PAID"
          : status === "dropped" || status === "pending"
            ? status
            : "FAILED",
      data: params, // Keeping original data column just in case
      response_payload: params, // Full JSON response
      event_type: "CALLBACK",
      updated_at: new Date().toISOString(),
    };

    if (status === "success") {
      if (easepayid) {
        updateData.easepay_id = easepayid;
      }
    } else {
      // Failure Path: existing logic correctly sets status='FAILED' and response_payload
    }

    const { error: updateError, data: updatedLog } = await supabase
      .from("payment_logs")
      .update(updateData)
      .eq("transaction_id", txnid)
      .select("booking_id")
      .single();

    if (updateError) {
      console.error("[Callback] Failed to update payment_log:", updateError);
    }

    const bookingId = updatedLog?.booking_id;
    console.log("[Callback] Payment status:", status);
    console.log("[Callback] Easepay ID:", easepayid);
    console.log("[Callback] Associated Booking ID:", bookingId);

    // CRITICAL: Update Booking Status
    if (status === "success" && bookingId) {
      console.log(`[Callback] Updating booking ${bookingId} to CONFIRMED...`);

      // 1. Update Booking
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .update({
          status: "confirmed",
          payment_status: "paid",
          advance_paid: parseFloat(amount) || 0,
        })
        .eq("id", bookingId)
        .select()
        .single();

      if (bookingError) {
        console.error(
          "[Callback] Failed to update Booking status:",
          bookingError,
        );
      } else if (bookingData) {
        console.log("[Callback] Booking status updated successfully");

        // 2. Send Emails (Booking Confirmation + Admin Notification + Payment Verified)
        try {
          // Dynamic import
          const {
            sendBookingConfirmationEmail,
            sendPaymentVerifiedEmail,
            sendAdminNewBookingNotification,
          } = await import("@/lib/email-service");

          const emailData = {
            user_name: bookingData.guest_name || "Guest",
            user_email: bookingData.guest_email || email,
            booking_reference: bookingData.booking_number,
            check_in_date: new Date(bookingData.check_in).toLocaleDateString(
              "en-US",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              },
            ),
            check_out_date: new Date(bookingData.check_out).toLocaleDateString(
              "en-US",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              },
            ),
            room_count: 1,
            total_amount: bookingData.total_amount,
            payment_date: new Date().toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            amount_paid: parseFloat(amount),
            website_url: baseUrl,
          };

          // A. Booking Confirmation - SKIPPED (User requested only one mail)
          /* 
          sendBookingConfirmationEmail(emailData)
            .then((res) => {
              console.log("[Callback] Booking confirmation email sent:", res);
            })
            .catch((err) => {
              console.error(
                "[Callback] Failed to send confirmation email:",
                err,
              );
            });
           */

          // B. Payment Verified (Primary Confirmation)
          sendPaymentVerifiedEmail(emailData)
            .then((res) => {
              console.log("[Callback] Payment verified email sent:", res);
            })
            .catch((err) => {
              console.error(
                "[Callback] Failed to send payment verified email:",
                err,
              );
            });

          // C. Admin Notification
          sendAdminNewBookingNotification({
            user_name: emailData.user_name,
            booking_reference: emailData.booking_reference,
            check_in_date: emailData.check_in_date,
            check_out_date: emailData.check_out_date,
            total_amount: emailData.total_amount,
          }).then((res) =>
            console.log("[Callback] Admin notification sent:", res),
          );
        } catch (emailErr) {
          console.error("[Callback] Error preparing/sending emails:", emailErr);
        }
      }
    }

    // Redirect based on status
    if (status === "success") {
      return Response.redirect(
        `${baseUrl}/booking/success?txnid=${txnid}&easepayid=${easepayid}&bookingId=${bookingId || ""}`,
        302,
      );
    } else {
      console.log("[Callback] Payment FAILED - redirecting...");

      // Send Failure Email if bookingId is available
      if (bookingId) {
        try {
          const { data: bookingData } = await supabase
            .from("bookings")
            .select("*")
            .eq("id", bookingId)
            .single();

          if (bookingData) {
            // CRITICAL: Ensure booking is marked as FAILED in DB
            const { error: failError } = await supabase
              .from("bookings")
              .update({
                status: "failed",
                payment_status: "failed",
              })
              .eq("id", bookingId);

            if (failError) {
              console.error(
                "[Callback] Failed to persist FAILED status:",
                failError,
              );
            } else {
              console.log(`[Callback] Booking ${bookingId} marked as FAILED.`);
            }

            const { sendPaymentRejectedEmail } =
              await import("@/lib/email-service");
            const emailData = {
              user_name: bookingData.guest_name || "Guest",
              user_email: bookingData.guest_email || email,
              booking_reference: bookingData.booking_number,
              check_in_date: new Date(bookingData.check_in).toLocaleDateString(
                "en-US",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                },
              ),
              check_out_date: new Date(
                bookingData.check_out,
              ).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
              room_count: 1,
              total_amount: bookingData.total_amount,
              website_url: baseUrl,
              // dummy values for interface satisfaction if unused by template
              payment_date: "",
              amount_paid: 0,
            };

            sendPaymentRejectedEmail(emailData).then((res) => {
              console.log("[Callback] Booking Failed email sent:", res);
            });
          }
        } catch (mailErr) {
          console.error("[Callback] Failed to send failure email:", mailErr);
        }
      }

      const errorMsg = encodeURIComponent(error_Message || "Payment failed");
      return Response.redirect(
        `${baseUrl}/booking/failure?txnid=${txnid}&error=${errorMsg}&bookingId=${bookingId || ""}`,
        302,
      );
    }
  } catch (error) {
    console.error("[Easebuzz Callback] Error:", error);
    const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";
    return Response.redirect(
      `${baseUrl}/booking/failure?reason=server_error`,
      302,
    );
  }
}

// Also handle GET for testing
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";
  return Response.redirect(
    `${baseUrl}/booking/failure?reason=invalid_method`,
    302,
  );
}
