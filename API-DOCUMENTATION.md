# Union Awas Happy Holiday BMS - API Documentation

## Overview

This document provides a complete overview of all available APIs in the Union Awas Happy Holiday Booking Management System.

**Base URL:** `http://localhost:3000`

---

## API Summary

### Total Serverless Functions: 14 endpoints

> **Note:** Actual count based on Next.js API routes, not HTTP methods. Each route file counts as one serverless function for deployment.

#### 1. Authentication (4 endpoints)

- `POST /api/auth/register` - User registration
- `POST /api/auth/user-login` - User login (email/password or Google SSO)
- `POST /api/auth/admin-login` - Admin login
- `GET|POST /api/auth/seed-admins` - Seed default admin users (setup only)

#### 2. Rooms - Public (2 endpoints)

- `GET /api/rooms` - Get all active rooms (supports optional date filtering)
  - **New:** `GET /api/rooms?check_in={date}&check_out={date}` - Filter by availability
- **`POST /api/rooms/check-availability`** - ✅ **NEW** Check room availability for date range

#### 3. Bookings - User (2 endpoints)

- `POST /api/bookings` - Create new booking (with availability validation)
- `GET /api/user/bookings` - Get user's bookings (requires user auth)

#### 4. Admin - Users (4 endpoints)

- `GET /api/admin/users` - List all admin users (Owner only)
- `POST /api/admin/users` - Create admin user (Owner only)
- `PUT /api/admin/users` - Update admin user (Owner only)
- `DELETE /api/admin/users?id={id}` - Delete admin user (Owner only)

#### 5. Admin - Rooms (5 endpoints)

- `GET /api/admin/rooms` - Get all rooms (admin)
- `GET /api/admin/rooms?is_active={true/false}` - Filter by status
- `POST /api/admin/rooms` - Create room
- `PUT /api/admin/rooms` - Update room
- `DELETE /api/admin/rooms?id={id}` - Delete room

#### 6. Admin - Bookings (3 endpoints)

- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/bookings?status={status}` - Filter by status
- `PUT /api/admin/bookings` - Update booking

#### 7. Admin - Media (5 endpoints)

- `GET /api/admin/media` - Get all media
- `GET /api/admin/media?category={category}` - Filter by category
- `GET /api/admin/media?room_id={id}` - Get room media
- `POST /api/admin/media` - Upload media (multipart/form-data)
- `DELETE /api/admin/media?id={id}` - Delete media

#### 8. Admin - Permissions (2 endpoints)

- `GET /api/admin/permissions` - Get all permissions (any admin)
- `PUT /api/admin/permissions` - Update permissions (Owner only)

#### 9. Admin - Audit Logs (3 endpoints)

- `GET /api/admin/audit-logs` - Get recent logs
- `GET /api/admin/audit-logs?user_id={id}&limit={n}` - Filter logs
- `POST /api/admin/audit-logs` - Create audit log entry

#### 10. Property Settings (1 endpoint)

- `GET|PUT /api/admin/property-settings` - Get/Update property settings

---

## Room Availability Feature (NEW) ✨

### Check Availability Endpoint

**Endpoint:** `POST /api/rooms/check-availability`

**Purpose:** Check which rooms are available for a given date range. Prevents double-booking by checking against existing confirmed/pending bookings.

**Request:**

```json
{
  "check_in": "2025-01-20",
  "check_out": "2025-01-22",
  "room_type": "Deluxe" // optional
}
```

**Response:**

```json
{
  "success": true,
  "available_rooms": [...], // Array of Room objects
  "total_available": 5,
  "booked_room_ids": ["uuid1", "uuid2"],
  "total_booked": 2,
  "search_criteria": {
    "check_in": "2025-01-20",
    "check_out": "2025-01-22",
    "nights": 2,
    "room_type": "Deluxe"
  },
  "message": "5 rooms available for 2 nights"
}
```

**Validation Rules:**

- Check-in must not be in the past
- Check-out must be after check-in
- Dates must be in ISO format (YYYY-MM-DD)

**Overlap Logic:**
Bookings are considered overlapping if:

- Existing `check_in` < Requested `check_out` AND
- Existing `check_out` > Requested `check_in`

---

## Authentication

### User Authentication

**Login Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+919876543210",
    "is_verified": true
  },
  "session": {
    "access_token": "supabase-jwt-token",
    "refresh_token": "...",
    "expires_in": 3600
  }
}
```

**Usage:** Send `Authorization: Bearer {access_token}` header

### Admin Authentication

**Login Response:**

```json
{
  "success": true,
  "token": "custom-jwt-token",
  "user": {
    "id": "uuid",
    "email": "owner@happyholidays.com",
    "full_name": "Union Awas Happy Holiday Owner",
    "role": "Owner",
    "phone": "+919876543210"
  }
}
```

**Usage:** Send `Authorization: Bearer {token}` header

**Default Admin Credentials:**

- **Owner:** owner@happyholidays.com / Owner@123
- **Manager:** manager@happyholidays.com / Manager@123
- **Front Desk:** frontdesk@happyholidays.com / FrontDesk@123
- **Accountant:** accountant@happyholidays.com / Accountant@123

---

## Key Data Models

### Room

```json
{
  "id": "uuid",
  "room_number": "101",
  "room_type": "Deluxe",
  "floor": 1,
  "max_guests": 2,
  "base_price": 2500,
  "description": "Spacious deluxe room",
  "amenities": ["WiFi", "TV", "AC"],
  "size_sqft": 300,
  "bed_type": "King",
  "view_type": "City View",
  "is_available": true,
  "is_active": true,
  "images": ["url1", "url2"]
}
```

### Booking

```json
{
  "id": "uuid",
  "booking_number": "BK-20250116-001",
  "user_id": "uuid",
  "room_id": "uuid",
  "guest_name": "John Doe",
  "guest_email": "user@example.com",
  "guest_phone": "+919876543210",
  "check_in": "2025-01-20",
  "check_out": "2025-01-22",
  "total_nights": 2,
  "num_guests": 2,
  "num_adults": 2,
  "num_children": 0,
  "room_charges": 5000,
  "gst_amount": 600,
  "total_amount": 5600,
  "advance_paid": 1400,
  "balance_amount": 4200,
  "status": "Confirmed",
  "payment_status": "Partial",
  "special_requests": "Late check-in"
}
```

### Media

```json
{
  "id": "uuid",
  "file_name": "room_1234567890.jpg",
  "file_path": "property-media/room/room_1234567890.jpg",
  "file_url": "https://...",
  "file_size": 1024000,
  "file_type": "image/jpeg",
  "category": "Room",
  "room_id": "uuid",
  "title": "Room Image",
  "description": "Beautiful room view",
  "alt_text": "Room interior",
  "is_featured": true,
  "display_order": 0
}
```

---

## Admin Roles & Permissions

### Roles

1. **Owner** - Full access to everything
2. **Manager** - Manage bookings, rooms, view reports
3. **Front Desk** - Handle bookings, check-ins/check-outs
4. **Accountant** - Manage payments, view financial reports

### Role-Based Access

- **User Management:** Owner only
- **Permission Management:** Owner only
- **Property Settings:** Owner only
- **Rooms:** All admin roles
- **Bookings:** All admin roles
- **Media:** All admin roles
- **Audit Logs:** All admin roles (read only)

---

## Common Status Values

### Booking Status

- `Pending` - Awaiting confirmation
- `Confirmed` - Booking confirmed
- `Cancelled` - Booking cancelled
- `Completed` - Stay completed

### Payment Status

- `Pending` - No payment received
- `Partial` - Advance paid
- `Paid` - Full payment received

### Payment Methods

- `Cash`
- `UPI`
- `Card`
- `Bank Transfer`

### Media Categories

- `Room` - Room images
- `Gallery` - Property gallery
- `Amenity` - Amenity images
- `Other` - Other media

### Audit Actions

- `CREATE` - Record created
- `UPDATE` - Record updated
- `DELETE` - Record deleted
- `LOGIN` - User/Admin logged in

---

## Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `MISSING_CREDENTIALS` - Email/password not provided
- `INVALID_CREDENTIALS` - Wrong email/password
- `MISSING_FIELDS` - Required fields missing
- `INVALID_EMAIL` - Email format invalid
- `WEAK_PASSWORD` - Password too short (min 8 chars)
- `EMAIL_EXISTS` - Email already registered
- `USER_NOT_FOUND` - User not found
- `AUTH_ERROR` - Authentication failed
- `SERVER_ERROR` - Internal server error

---

## Rate Limits & Constraints

### File Upload

- **Max Size:** 5MB per file
- **Allowed Types:** JPEG, PNG, WebP
- **Storage:** Supabase Storage bucket `property-media`

### Password Requirements

- Minimum 8 characters
- Should include uppercase, lowercase, number, special character (recommended)

### Booking Constraints

- Check-in date must be in the future (or today)
- Check-out must be after check-in (minimum 1 night)
- Advance payment: 25%, 50%, or 100% of total
- **NEW:** Availability checked before booking (prevents double-booking)
- **NEW:** Overlapping bookings return 409 Conflict error

### GST

- Fixed at 12% on room charges

### Availability Rules

- Only Confirmed and Pending bookings block availability
- Cancelled bookings do not affect availability
- Same-day check-in/checkout considered as overlap

---

## Testing with Postman

1. **Import Collection:**

   - Open Postman
   - Import `Happy-Holidays-BMS-API.postman_collection.json`

2. **Set Base URL:**

   - Collection variables → `base_url` → `http://localhost:3000`

3. **Authentication Flow:**

   - Run "Seed Admin Users" (once)
   - Run "Admin Login" (auto-saves token)
   - Run "User Register"
   - Run "User Login" (auto-saves token)

4. **Auto Token Management:**
   - Admin and User login requests automatically save tokens
   - Tokens are used in subsequent requests via `{{admin_token}}` and `{{user_token}}`

---

## Database Schema

### Tables

1. `users` - Customer accounts
2. `admin_users` - Admin accounts
3. `rooms` - Room inventory
4. `bookings` - Booking records
5. `media` - Media files
6. `permissions` - Role permissions
7. `audit_logs` - Activity logs
8. `property_settings` - Property configuration
9. `invoices` - Invoice records

### Key Relationships

- `bookings.user_id` → `users.id`
- `bookings.room_id` → `rooms.id`
- `media.room_id` → `rooms.id` (optional)
- `audit_logs.user_id` → `admin_users.id`

---

## Security Notes

1. **CORS:** Configured for Next.js deployment
2. **JWT Tokens:**
   - Admin tokens: Custom JWT (24h expiry)
   - User tokens: Supabase JWT (managed by Supabase)
3. **Password Hashing:** bcrypt with 10 rounds
4. **File Validation:** Type and size checked before upload
5. **SQL Injection:** Protected via Supabase RLS and parameterized queries
6. **XSS:** Sanitized on frontend, JSON responses only

---

## Development Setup

### Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

### First Time Setup

1. Run migrations to create database tables
2. Call `POST /api/auth/seed-admins` to create default admin users
3. Login as Owner and configure property settings
4. Add rooms and media

---

## Support & Contacts

For API issues or questions:

- Check logs in browser console (client-side)
- Check terminal logs (server-side)
- Review Supabase logs for database errors

---

**Generated:** 2025-01-16
**Version:** 1.0.0
**Framework:** Next.js 14 with App Router
