import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

/**
 * Verify auth (admin or customer)
 */
function verifyAuth(request: NextRequest): { valid: boolean; userId?: string; role?: string; type?: string; error?: string } {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return { valid: false, error: 'Invalid or expired token' };
  }

  return { valid: true, userId: decoded.id, role: decoded.role, type: decoded.type };
}

/**
 * GET /api/invoices/[id]
 * Generate and return invoice data (JSON format - PDF can be generated client-side)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = verifyAuth(request);
    if (!auth.valid) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const invoiceId = params.id;

    // Fetch invoice with booking details
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select(`
        *,
        bookings (
          *,
          booking_items (
            *,
            rooms (
              room_number,
              room_type,
              images
            )
          ),
          users (
            email,
            full_name,
            phone
          )
        )
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error('Error fetching invoice:', invoiceError);
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Verify authorization - customer can only access their own invoices
    if (auth.type === 'customer' && invoice.bookings.user_id !== auth.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access to this invoice' },
        { status: 403 }
      );
    }

    // Fetch property settings for invoice header
    const { data: settings } = await supabaseAdmin
      .from('property_settings')
      .select('*')
      .limit(1)
      .single();

    return NextResponse.json({
      success: true,
      invoice: {
        ...invoice,
        property: settings || {
          property_name: 'Happy Holidays Guest House',
          address: '94, Hanuman Nagar, Narmadapuram Road, near Shani Mandir and SMH Hospital, behind UcoBank, Bhopal',
          phone: '+91 9926770259',
          email: 'info@happyholidays.com',
          gst_number: '',
        },
      },
    });
  } catch (error: any) {
    console.error('GET invoice error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
