import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialize Supabase Admin client for fetching property settings
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

interface PropertySettings {
  property_name: string;
  phone: string;
  check_in_time: string;
  check_out_time: string;
}

interface BookingEmailData {
  user_name: string;
  user_email: string;
  booking_reference: string;
  check_in_date: string;
  check_out_date: string;
  room_count: number;
  total_amount: number;
  website_url: string;
}

// Function to replace placeholders in the HTML template
const fillTemplate = (template: string, data: Record<string, any>) => {
  let filledTemplate = template;
  for (const key in data) {
    const regex = new RegExp(`{{${key}}}`, "g");
    filledTemplate = filledTemplate.replace(regex, data[key]);
  }
  return filledTemplate;
};

// Function to fetch property settings
const getPropertySettings = async (): Promise<PropertySettings> => {
  try {
    const { data, error } = await supabaseAdmin
      .from("property_settings")
      .select("property_name, phone, check_in_time, check_out_time")
      .single();

    if (error) throw error;

    return {
      property_name: data.property_name || "Union Awas Happy Holiday",
      phone: data.phone || "+91 9926770259",
      check_in_time: formatTime(data.check_in_time || "14:00"),
      check_out_time: formatTime(data.check_out_time || "11:00"),
    };
  } catch (error) {
    console.error("Error fetching property settings:", error);
    // Fallback values
    return {
      property_name: "Union Awas Happy Holiday",
      phone: "+91 9926770259",
      check_in_time: "02:00 PM",
      check_out_time: "11:00 AM",
    };
  }
};

const formatTime = (time: string) => {
  try {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return time;
  }
};

// Main function to send booking confirmation email
export async function sendBookingConfirmationEmail(
  bookingData: BookingEmailData,
) {
  try {
    let zeptoUrl = process.env.ZEPTO_MAIL_URL;
    const zeptoToken = process.env.ZEPTO_MAIL_TOKEN;
    const senderEmail = process.env.ZEPTO_MAIL_SENDER_EMAIL;
    const senderName =
      process.env.ZEPTO_MAIL_SENDER_NAME || "Union Awas Happy Holiday";

    if (!zeptoUrl || !zeptoToken || !senderEmail) {
      console.error("Zepto Mail credentials missing");
      return { success: false, error: "Email configuration missing" };
    }

    // Adjust URL for template sending implementation
    if (!zeptoUrl.includes("/template")) {
      zeptoUrl = zeptoUrl.endsWith("/")
        ? `${zeptoUrl}template`
        : `${zeptoUrl}/template`;
    }

    // Get property settings for dynamic values
    const settings = await getPropertySettings();

    // Prepare merge info
    const mergeInfo = {
      user_name: bookingData.user_name,
      booking_reference: bookingData.booking_reference,
      check_in_date: bookingData.check_in_date,
      check_out_date: bookingData.check_out_date,
      room_count: bookingData.room_count,
      total_amount: bookingData.total_amount,
      website_url: bookingData.website_url,
      support_whatsapp: settings.phone,
      check_in_time: settings.check_in_time,
      check_out_time: settings.check_out_time,
      property_address: "94, Hanuman Nagar, Narmadapuram Road, Bhopal",
    };

    const payload = {
      template_key:
        "2518b.623682b2828bdc79.k1.2ba98670-d45e-11f0-9873-ae9c7e0b6a9f.19aff14b057",
      from: {
        address: senderEmail,
        name: senderName,
      },
      to: [
        {
          email_address: {
            address: bookingData.user_email,
            name: bookingData.user_name,
          },
        },
      ],
      merge_info: mergeInfo,
    };

    console.log("Sending booking confirmation email (Template)...", {
      to: bookingData.user_email,
    });

    const response = await fetch(zeptoUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: zeptoToken,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Zepto Mail API Error (Booking Confirmed):", result);
      return {
        success: false,
        error: result.message || "Failed to send email",
      };
    }

    console.log("Booking confirmation email sent successfully:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
    return {
      success: false,
      error: "Internal server error while sending email",
    };
  }
}

interface PaymentVerifiedEmailData extends BookingEmailData {
  payment_date: string;
  amount_paid: number;
}

// ... existing helper functions

export async function sendPaymentVerifiedEmail(data: PaymentVerifiedEmailData) {
  try {
    let zeptoUrl = process.env.ZEPTO_MAIL_URL;
    const zeptoToken = process.env.ZEPTO_MAIL_TOKEN;
    const senderEmail = process.env.ZEPTO_MAIL_SENDER_EMAIL;
    const senderName =
      process.env.ZEPTO_MAIL_SENDER_NAME || "Union Awas Happy Holiday";

    if (!zeptoUrl || !zeptoToken || !senderEmail) {
      console.error("Zepto Mail credentials missing");
      return { success: false, error: "Email configuration missing" };
    }

    // Adjust URL for template sending implementation
    if (!zeptoUrl.includes("/template")) {
      zeptoUrl = zeptoUrl.endsWith("/")
        ? `${zeptoUrl}template`
        : `${zeptoUrl}/template`;
    }

    const settings = await getPropertySettings();

    // Prepare merge info
    const mergeInfo = {
      user_name: data.user_name,
      booking_reference: data.booking_reference,
      check_in_date: data.check_in_date,
      check_out_date: data.check_out_date,
      room_count: data.room_count,
      total_amount: data.total_amount,
      payment_date: data.payment_date,
      amount_paid: data.amount_paid,
      website_url: data.website_url,
      support_whatsapp: settings.phone,
      check_in_time: settings.check_in_time,
      check_out_time: settings.check_out_time,
      property_address: "94, Hanuman Nagar, Narmadapuram Road, Bhopal",
    };

    const payload = {
      template_key:
        "2518b.623682b2828bdc79.k1.452c5e90-d460-11f0-9873-ae9c7e0b6a9f.19aff2272f9",
      from: {
        address: senderEmail,
        name: senderName,
      },
      to: [
        {
          email_address: {
            address: data.user_email,
            name: data.user_name,
          },
        },
      ],
      merge_info: mergeInfo,
    };

    console.log("Sending payment verification email (Template)...", {
      to: data.user_email,
    });

    const response = await fetch(zeptoUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: zeptoToken,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Zepto Mail API Error (Payment Verified):", result);
      return {
        success: false,
        error: result.message || "Failed to send email",
      };
    }

    console.log("Payment verified email sent successfully:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error sending payment verified email:", error);
    return {
      success: false,
      error: "Internal server error while sending email",
    };
  }
}

// End of sendBookingConfirmationEmail

interface PaymentRejectedEmailData extends BookingEmailData {
  // No extra fields needed specifically, but interface keeps it structured
}

// Email for Payment Failed / Booking Failed
export async function sendPaymentRejectedEmail(data: PaymentRejectedEmailData) {
  try {
    let zeptoUrl = process.env.ZEPTO_MAIL_URL;
    const zeptoToken = process.env.ZEPTO_MAIL_TOKEN;
    const senderEmail = process.env.ZEPTO_MAIL_SENDER_EMAIL;
    const senderName =
      process.env.ZEPTO_MAIL_SENDER_NAME || "Union Awas Happy Holiday";

    if (!zeptoUrl || !zeptoToken || !senderEmail) {
      console.error("Zepto Mail credentials missing");
      return { success: false, error: "Email configuration missing" };
    }

    if (!zeptoUrl.includes("/template")) {
      zeptoUrl = zeptoUrl.endsWith("/")
        ? `${zeptoUrl}template`
        : `${zeptoUrl}/template`;
    }

    const settings = await getPropertySettings();

    // Prepare merge info matching standard structure
    const mergeInfo = {
      user_name: data.user_name,
      booking_reference: data.booking_reference,
      check_in_date: data.check_in_date,
      check_out_date: data.check_out_date,
      room_count: data.room_count,
      total_amount: data.total_amount,
      website_url: data.website_url,
      support_whatsapp: settings.phone,
      check_in_time: settings.check_in_time,
      check_out_time: settings.check_out_time,
      property_address: "94, Hanuman Nagar, Narmadapuram Road, Bhopal",
    };

    const payload = {
      template_key:
        "2518b.623682b2828bdc79.k1.3c6d6540-f7bc-11f0-89cb-cabf48e1bf81.19be6dd6994", // New Template Key
      from: {
        address: senderEmail,
        name: senderName,
      },
      to: [
        {
          email_address: {
            address: data.user_email,
            name: data.user_name,
          },
        },
      ],
      merge_info: mergeInfo,
    };

    console.log("Sending booking failed email (Template)...", {
      to: data.user_email,
    });

    const response = await fetch(zeptoUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: zeptoToken,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Zepto Mail API Error (Booking Failed):", result);
      return {
        success: false,
        error: result.message || "Failed to send email",
      };
    }

    console.log("Booking failed email sent successfully:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error sending booking failed email:", error);
    return {
      success: false,
      error: "Internal server error while sending email",
    };
  }
}

interface AdminNotificationData {
  user_name: string;
  booking_reference: string;
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
}

export async function sendAdminNewBookingNotification(
  data: AdminNotificationData,
) {
  try {
    let zeptoUrl = process.env.ZEPTO_MAIL_URL;
    const zeptoToken = process.env.ZEPTO_MAIL_TOKEN;
    const senderEmail = process.env.ZEPTO_MAIL_SENDER_EMAIL;
    const senderName =
      process.env.ZEPTO_MAIL_SENDER_NAME || "Union Awas Happy Holiday";

    // Placeholder for the new template key - User needs to fill this
    const templateKey =
      "2518b.623682b2828bdc79.k1.bc027d20-eb0c-11f0-a3cd-525400c92439.19b93ba95f2";

    if (!zeptoUrl || !zeptoToken || !senderEmail) {
      console.error("Zepto Mail credentials missing for admin notification");
      return { success: false, error: "Email configuration missing" };
    }

    if (!zeptoUrl.includes("/template")) {
      zeptoUrl = zeptoUrl.endsWith("/")
        ? `${zeptoUrl}template`
        : `${zeptoUrl}/template`;
    }

    const mergeInfo = {
      user_name: data.user_name,
      booking_reference: data.booking_reference,
      check_in_date: data.check_in_date,
      check_out_date: data.check_out_date,
      total_amount: data.total_amount,
    };

    const payload = {
      template_key: templateKey,
      from: {
        address: senderEmail,
        name: senderName,
      },
      to: [
        {
          email_address: {
            address: "ubeapg@gmail.com",
            name: "Admin",
          },
        },
      ],
      merge_info: mergeInfo,
    };

    console.log("Sending admin new booking notification...", {
      to: "ubeapg@gmail.com",
    });

    const response = await fetch(zeptoUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: zeptoToken,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Zepto Mail API Error (Admin Notification):", result);
      return {
        success: false,
        error: result.message || "Failed to send email",
      };
    }

    console.log("Admin notification email sent successfully:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error sending admin notification email:", error);
    return {
      success: false,
      error: "Internal server error while sending email",
    };
  }
}
