# API Structure - Maximum 12 Serverless APIs

## API Endpoints Overview

All APIs will be created in the `app/api/` directory following Next.js 14 App Router conventions.

### 1. Authentication APIs (3 endpoints)

#### `/api/auth/admin-login` - POST
- Admin login with email/password
- Validates against admin_users table
- Returns JWT token with role
- Bcrypt password verification
- Updates last_login timestamp

**Request Body:**
```json
{
  "email": "owner@happyholidays.com",
  "password": "Owner@123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "owner@happyholidays.com",
    "full_name": "Admin Name",
    "role": "Owner"
  }
}
```

#### `/api/auth/user-login` - POST
- User login (email/password or Google SSO)
- Validates against users table
- Returns JWT token
- Creates audit log

**Request Body (Email/Password):**
```json
{
  "email": "guest@example.com",
  "password": "password123",
  "type": "email"
}
```

**Request Body (Google SSO):**
```json
{
  "google_id": "google-oauth-id",
  "email": "guest@example.com",
  "full_name": "Guest Name",
  "type": "google"
}
```

#### `/api/auth/register` - POST
- User registration
- Creates user in users table
- Sends welcome email
- Returns JWT token

**Request Body:**
```json
{
  "email": "guest@example.com",
  "password": "password123",
  "full_name": "Guest Name",
  "phone": "+919876543210"
}
```

---

### 2. Rooms APIs (2 endpoints)

#### `/api/rooms/list` - GET
- List all active rooms
- Filter by room_type, availability
- Includes pricing and amenities

**Query Params:**
```
?room_type=Deluxe&is_available=true
```

**Response:**
```json
{
  "success": true,
  "rooms": [
    {
      "id": "uuid",
      "room_number": "101",
      "room_type": "Deluxe Room",
      "base_price": 2500,
      "amenities": ["WiFi", "AC", "TV"],
      "is_available": true
    }
  ]
}
```

#### `/api/rooms/availability` - POST
- Check room availability for date range
- Returns available rooms with pricing

**Request Body:**
```json
{
  "check_in": "2025-01-20",
  "check_out": "2025-01-22",
  "num_guests": 2
}
```

---

### 3. Bookings APIs (3 endpoints)

#### `/api/bookings/create` - POST
- Create new booking
- Validates room availability
- Calculates GST (12%) and total amount
- Sends confirmation email
- Creates audit log

**Request Body:**
```json
{
  "user_id": "uuid",
  "room_id": "uuid",
  "guest_name": "John Doe",
  "guest_email": "john@example.com",
  "guest_phone": "+919876543210",
  "check_in": "2025-01-20",
  "check_out": "2025-01-22",
  "num_guests": 2,
  "num_adults": 2,
  "num_children": 0,
  "room_charges": 5000,
  "special_requests": "Early check-in"
}
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "id": "uuid",
    "booking_number": "BK2025011400001",
    "total_amount": 5600,
    "gst_amount": 600,
    "balance_amount": 5600
  }
}
```

#### `/api/bookings/list` - GET
- List bookings (admin or user-specific)
- Filter by status, dates
- Pagination support

**Query Params (Admin):**
```
?status=confirmed&check_in_from=2025-01-01&limit=20&offset=0
```

**Query Params (User):**
```
?user_id=uuid
```

#### `/api/bookings/update` - PATCH
- Update booking status
- Cancel booking
- Update check-in/check-out
- Admin only for most fields
- Creates audit log

**Request Body:**
```json
{
  "booking_id": "uuid",
  "status": "checked-in",
  "updated_by": "admin_uuid"
}
```

---

### 4. Payments APIs (2 endpoints)

#### `/api/payments/create` - POST
- Process payment
- Update booking payment status
- Create transaction record
- Send payment receipt email
- Creates audit log

**Request Body:**
```json
{
  "booking_id": "uuid",
  "amount": 2800,
  "payment_method": "UPI",
  "payment_type": "Advance",
  "gateway_transaction_id": "razorpay_xyz123"
}
```

#### `/api/payments/list` - GET
- List payment transactions
- Filter by booking, status, date range
- Admin: All payments
- User: Own payments only

**Query Params:**
```
?booking_id=uuid&status=completed
```

---

### 5. Communication APIs (1 endpoint - Multi-purpose)

#### `/api/communication/send` - POST
- Send email, SMS, or WhatsApp
- Log message in messages table
- Bulk send support (to multiple recipients)
- Template support

**Request Body (Single Message):**
```json
{
  "channel": "email",
  "recipient_email": "guest@example.com",
  "subject": "Booking Confirmation",
  "message": "Your booking is confirmed...",
  "booking_id": "uuid",
  "sent_by": "admin_uuid"
}
```

**Request Body (Bulk SMS):**
```json
{
  "channel": "sms",
  "recipients": [
    { "phone": "+919876543210", "name": "Guest 1" },
    { "phone": "+919876543211", "name": "Guest 2" }
  ],
  "message": "Reminder: Your check-in is tomorrow.",
  "sent_by": "admin_uuid"
}
```

---

### 6. Media APIs (1 endpoint - Multi-purpose)

#### `/api/media` - GET/POST/DELETE
- **GET**: List media by category
- **POST**: Upload media to Supabase storage
- **DELETE**: Remove media

**GET Query Params:**
```
?category=Rooms&room_id=uuid
```

**POST Request (Multipart form-data):**
```
file: <binary>
category: "Rooms"
room_id: "uuid"
title: "Deluxe Room View"
uploaded_by: "admin_uuid"
```

**DELETE Request Body:**
```json
{
  "media_id": "uuid",
  "deleted_by": "admin_uuid"
}
```

---

## API Count: 12 Total ✅

1. /api/auth/admin-login (POST)
2. /api/auth/user-login (POST)
3. /api/auth/register (POST)
4. /api/rooms/list (GET)
5. /api/rooms/availability (POST)
6. /api/bookings/create (POST)
7. /api/bookings/list (GET)
8. /api/bookings/update (PATCH)
9. /api/payments/create (POST)
10. /api/payments/list (GET)
11. /api/communication/send (POST)
12. /api/media (GET/POST/DELETE combined)

---

## Utility Functions to Create

### `lib/auth.ts`
- JWT token generation
- Token verification middleware
- Role-based authorization

### `lib/email.ts`
- Email sending utility (using Nodemailer or similar)
- Email templates

### `lib/sms.ts`
- SMS sending utility (using Twilio or similar)

### `lib/whatsapp.ts`
- WhatsApp integration (using Twilio or WATI)

### `lib/storage.ts`
- Supabase storage upload
- File deletion
- URL generation

### `lib/helpers.ts`
- Date calculations
- GST calculations
- Room availability checker
- Booking number generator

---

## Middleware for Authentication

### `middleware.ts` (Root level)
- Protect admin routes
- JWT token validation
- Role-based access control

---

## Error Handling

All APIs will return consistent error format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## Next Steps
**Tell me which API to implement first:**

1. **Authentication** - Start with login system
2. **Bookings** - Core booking functionality
3. **Rooms** - Room availability and listing
4. **Payments** - Payment processing
5. **Communication** - Email/SMS system
6. **Media** - Photo upload system

Or implement in recommended order:
1. Authentication (login must work first)
2. Rooms (need to show available rooms)
3. Bookings (core feature)
4. Payments (payment processing)
5. Communication (notifications)
6. Media (last priority)

**Just tell me which one to start with!**
