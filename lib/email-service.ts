import { createClient } from '@supabase/supabase-js';

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
    const regex = new RegExp(`{{${key}}}`, 'g');
    filledTemplate = filledTemplate.replace(regex, data[key]);
  }
  return filledTemplate;
};

// Function to fetch property settings
const getPropertySettings = async (): Promise<PropertySettings> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('property_settings')
      .select('property_name, phone, check_in_time, check_out_time')
      .single();

    if (error) throw error;

    return {
      property_name: data.property_name || 'Union Awas Happy Holiday',
      phone: data.phone || '+91 9926770259',
      check_in_time: formatTime(data.check_in_time || '14:00'),
      check_out_time: formatTime(data.check_out_time || '11:00'),
    };
  } catch (error) {
    console.error('Error fetching property settings:', error);
    // Fallback values
    return {
      property_name: 'Union Awas Happy Holiday',
      phone: '+91 9926770259',
      check_in_time: '02:00 PM',
      check_out_time: '11:00 AM',
    };
  }
};

const formatTime = (time: string) => {
    try {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return time;
    }
  };


// Main function to send booking confirmation email
export async function sendBookingConfirmationEmail(bookingData: BookingEmailData) {
  try {
    const zeptoUrl = process.env.ZEPTO_MAIL_URL;
    const zeptoToken = process.env.ZEPTO_MAIL_TOKEN;
    const senderEmail = process.env.ZEPTO_MAIL_SENDER_EMAIL;
    const senderName = process.env.ZEPTO_MAIL_SENDER_NAME || 'Union Awas Happy Holiday';

    if (!zeptoUrl || !zeptoToken || !senderEmail) {
      console.error('Zepto Mail credentials missing');
      return { success: false, error: 'Email configuration missing' };
    }

    // Get property settings for dynamic values
    const settings = await getPropertySettings();

    // Load the HTML template (embedded here for simplicity, or read from file if preferred/possible in edge)
    // Using the template artifact we created. 
    // Ideally this should be imported or read, but for a serverless function, inline or imported string is best.
    // I will include the template string here to ensure it works without file system access issues in production.
    
    const emailTemplate = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Booking Confirmation</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        background-color: #f2ede8;
        color: #32373c;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      }
      .header {
        background-color: #32373c;
        padding: 40px 20px;
        text-align: center;
        color: #ffffff;
      }
      .logo {
        max-height: 80px;
        margin-bottom: 20px;
      }
      .content {
        padding: 40px;
      }
      .h1 {
        font-size: 28px;
        font-weight: 300;
        margin: 0 0 10px 0;
        letter-spacing: 1px;
      }
      .h2 {
        font-size: 20px;
        font-weight: 600;
        margin: 30px 0 15px 0;
        color: #32373c;
      }
      .p {
        line-height: 1.6;
        color: #555555;
        margin-bottom: 20px;
      }
      .booking-card {
        background-color: #f9f9f9;
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 25px;
        margin: 30px 0;
        border-left: 5px solid #ddc9b5;
      }
      .detail-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        border-bottom: 1px dashed #e0e0e0;
        padding-bottom: 10px;
      }
      .detail-row:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }
      .label {
        font-size: 13px;
        text-transform: uppercase;
        color: #888;
        letter-spacing: 0.5px;
      }
      .value {
        font-size: 16px;
        font-weight: 600;
        color: #32373c;
      }
      .btn {
        display: inline-block;
        background-color: #32373c;
        color: #ffffff;
        text-decoration: none;
        padding: 12px 30px;
        border-radius: 6px;
        font-weight: bold;
        margin-top: 20px;
      }
      .footer {
        background-color: #32373c;
        color: #adb5bd;
        padding: 20px;
        text-align: center;
        font-size: 12px;
      }
      .footer a {
        color: #ddc9b5;
        text-decoration: none;
      }
      .contact-box {
        background-color: #fff8f0;
        border: 1px solid #ddc9b5;
        border-radius: 8px;
        padding: 15px;
        text-align: center;
        margin-top: 30px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Header -->
      <div class="header">
        <!-- Replace with actual logo URL for production -->
        <img
          src="https://bms-clientside.vercel.app/logo.png"
          alt="Union Awas Happy Holiday"
          class="logo"
          style="display: block; margin: 0 auto 20px auto; max-width: 150px"
        />
        <h1 class="h1">Booking Confirmed</h1>
        <p style="opacity: 0.9; margin: 0">We can't wait to host you!</p>
      </div>

      <!-- Content -->
      <div class="content">
        <p class="p">Hi <strong>{{user_name}}</strong>,</p>
        <p class="p">
          Thank you for choosing Union Awas Happy Holiday! Your booking has been
          successfully created. We have received your request and the rooms have
          been reserved for you.
        </p>

        <!-- Booking Details Card -->
        <div class="booking-card">
          <div class="detail-row">
            <span class="label">Booking Reference</span>
            <span class="value" style="color: #ddc9b5"
              >{{booking_reference}}</span
            >
          </div>
          <div class="detail-row">
            <span class="label">Check-in</span>
            <span class="value"
              >{{check_in_date}}
              <span style="font-size: 12px; font-weight: normal; color: #666"
                >({{check_in_time}})</span
              ></span
            >
          </div>
          <div class="detail-row">
            <span class="label">Check-out</span>
            <span class="value"
              >{{check_out_date}}
              <span style="font-size: 12px; font-weight: normal; color: #666"
                >({{check_out_time}})</span
              ></span
            >
          </div>
          <div class="detail-row">
            <span class="label">Rooms</span>
            <span class="value">{{room_count}}</span>
          </div>
          <div class="detail-row">
            <span class="label">Total Amount</span>
            <span class="value">₹{{total_amount}}</span>
          </div>
        </div>

        <p class="p">
          <strong>Next Steps:</strong> You will receive a formal confirmation
          once your payment is verified (usually within 24-48 hours).
        </p>

        <div class="contact-box">
          <p style="margin: 0; color: #5a4a3a">
            Need assistance? Contact us on WhatsApp
          </p>
          <p
            style="
              margin: 5px 0 0 0;
              font-size: 18px;
              font-weight: bold;
              color: #32373c;
            "
          >
            {{support_whatsapp}}
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>&copy; Union Awas Happy Holiday. All rights reserved.</p>
        <p>{{property_address}}</p>
        <p><a href="{{website_url}}">Visit our website</a></p>
      </div>
    </div>
  </body>
</html>`;

    // Prepare data with dynamic settings
    const emailData = {
      ...bookingData,
      support_whatsapp: settings.phone,
      check_in_time: settings.check_in_time,
      check_out_time: settings.check_out_time,
      property_address: '94, Hanuman Nagar, Narmadapuram Road, Bhopal' // Could also be fetched
    };

    const htmlBody = fillTemplate(emailTemplate, emailData);

    const payload = {
      from: {
        address: senderEmail,
        name: senderName
      },
      to: [
        {
          email_address: {
            address: bookingData.user_email,
            name: bookingData.user_name
          }
        }
      ],
      subject: `Booking Confirmation - ${bookingData.booking_reference}`,
      htmlbody: htmlBody
    };

    console.log('Sending email with Zepto Mail...', { to: bookingData.user_email });

    const response = await fetch(zeptoUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': zeptoToken
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Zepto Mail API Error:', result);
      return { success: false, error: result.message || 'Failed to send email' };
    }

    return { success: true, data: result };

  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return { success: false, error: 'Internal server error while sending email' };
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
    const senderName = process.env.ZEPTO_MAIL_SENDER_NAME || 'Union Awas Happy Holiday';

    if (!zeptoUrl || !zeptoToken || !senderEmail) {
      console.error('Zepto Mail credentials missing');
      return { success: false, error: 'Email configuration missing' };
    }

    // Adjust URL for template sending implementation
    if (!zeptoUrl.includes('/template')) {
        zeptoUrl = zeptoUrl.endsWith('/') ? `${zeptoUrl}template` : `${zeptoUrl}/template`;
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
      property_address: '94, Hanuman Nagar, Narmadapuram Road, Bhopal'
    };

    const payload = {
      template_key: "2518b.623682b2828bdc79.k1.452c5e90-d460-11f0-9873-ae9c7e0b6a9f.19aff2272f9",
      from: {
        address: senderEmail,
        name: senderName
      },
      to: [
        {
          email_address: {
            address: data.user_email,
            name: data.user_name
          }
        }
      ],
      merge_info: mergeInfo
    };

    console.log('Sending payment verification email (Template)...', { to: data.user_email });

    const response = await fetch(zeptoUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': zeptoToken
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Zepto Mail API Error (Payment Verified):', result);
      return { success: false, error: result.message || 'Failed to send email' };
    }

    console.log('Payment verified email sent successfully:', result);
    return { success: true, data: result };

  } catch (error) {
    console.error('Error sending payment verified email:', error);
    return { success: false, error: 'Internal server error while sending email' };
  }
}


// End of sendBookingConfirmationEmail

interface PaymentRejectedEmailData extends BookingEmailData {
    // No extra fields needed specifically, but interface keeps it structured
}

export async function sendPaymentRejectedEmail(data: PaymentRejectedEmailData) {
  try {
    let zeptoUrl = process.env.ZEPTO_MAIL_URL;
    const zeptoToken = process.env.ZEPTO_MAIL_TOKEN;
    const senderEmail = process.env.ZEPTO_MAIL_SENDER_EMAIL;
    const senderName = process.env.ZEPTO_MAIL_SENDER_NAME || 'Union Awas Happy Holiday';

    if (!zeptoUrl || !zeptoToken || !senderEmail) {
      console.error('Zepto Mail credentials missing');
      return { success: false, error: 'Email configuration missing' };
    }

    // Adjust URL for template sending implementation
    // Standard URL ends in /email, template URL ends in /email/template
    if (!zeptoUrl.includes('/template')) {
        zeptoUrl = zeptoUrl.endsWith('/') ? `${zeptoUrl}template` : `${zeptoUrl}/template`;
    }

    const settings = await getPropertySettings();

    // Prepare merge info (must match placeholders in Zepto template)
    const mergeInfo = {
      user_name: data.user_name,
      booking_reference: data.booking_reference,
      check_in_date: data.check_in_date,
      total_amount: data.total_amount,
      support_whatsapp: settings.phone,
      support_whatsapp_number: settings.phone.replace(/[^0-9]/g, ''),
    };

    const payload = {
      template_key: "2518b.623682b2828bdc79.k1.ccc6a7a0-d462-11f0-9873-ae9c7e0b6a9f.19aff33071a",
      from: {
        address: senderEmail,
        name: senderName
      },
      to: [
        {
          email_address: {
            address: data.user_email,
            name: data.user_name
          }
        }
      ],
      merge_info: mergeInfo
    };

    console.log('Sending payment rejection email (Template)...', { to: data.user_email });

    const response = await fetch(zeptoUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': zeptoToken
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
        console.error('Zepto Mail API Error (Payment Rejected):', result);
        return { success: false, error: result.message || 'Failed to send email' };
    }

    console.log('Payment rejection email sent successfully:', result);
    return { success: true, data: result };

  } catch (error) {
    console.error('Error sending payment rejection email:', error);
    return { success: false, error: 'Internal server error while sending email' };
  }
}


