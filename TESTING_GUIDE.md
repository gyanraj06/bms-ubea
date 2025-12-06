# Testing Guide - BMS Client Side

## Overview
This document provides a comprehensive testing checklist for all flows in the booking management system.

---

## 1. CUSTOMER BOOKING FLOW

### 1.1 Homepage to Booking
**URL**: http://localhost:3000

- [ ] Click "Book Now" button on homepage
- [ ] Should navigate to `/booking` page
- [ ] Check-in/check-out date pickers should work
- [ ] Guest and room counters should work (min: 1, max: 10 guests, max: 4 rooms)
- [ ] "Search" button should work
- [ ] Verify rooms are loaded from `/api/rooms`
- [ ] Check Network tab: Should see `GET /api/rooms` with success response

### 1.2 Rooms Page to Booking
**URL**: http://localhost:3000/rooms

- [ ] Filters should work (price, capacity, category, amenities)
- [ ] Each room card should show:
  - Room image
  - Price badge
  - Category badge
  - Guest capacity
  - Room size
  - Amenities (first 3)
- [ ] Click "Book Now" button → should navigate to `/booking`
- [ ] Click "View Details" button → should navigate to `/rooms/{id}`
- [ ] "Clear All" filters button should reset filters
- [ ] Search functionality should filter rooms

### 1.3 Booking Page - Room Selection
**URL**: http://localhost:3000/booking

- [ ] Page should load rooms from database (not mock data)
- [ ] Each room should show:
  - Room image (if available)
  - Room type and number
  - Description
  - Max guests
  - Bed type
  - Size (sq ft)
  - Amenities with icons
  - Base price
  - "Book Now" button (disabled if unavailable)
- [ ] If no rooms in database, should show "No Rooms Available" message
- [ ] Click "Book Now" → navigate to `/booking/{roomId}?checkIn=...&checkOut=...`

### 1.4 Booking Details Page
**URL**: http://localhost:3000/booking/[roomId]

- [ ] Pre-fills dates from URL params
- [ ] Shows selected room details
- [ ] Guest information form should have:
  - Full name (required)
  - Email (required, validated)
  - Phone (required, 10 digits)
- [ ] Shows pricing breakdown:
  - Room charges (nights × base price)
  - GST (12%)
  - Total amount
- [ ] Advance payment options (25%, 50%, 100%)
- [ ] Submit booking → calls `POST /api/bookings`
- [ ] On success → navigate to `/booking/success?bookingId=...`
- [ ] On error → show toast error message

### 1.5 Booking Success Page
**URL**: http://localhost:3000/booking/success

- [ ] Shows booking confirmation
- [ ] Displays booking number
- [ ] Shows check-in/check-out dates
- [ ] Shows payment status
- [ ] "Back to Home" button works

---

## 2. ADMIN AUTHENTICATION FLOW

### 2.1 Admin Login
**URL**: http://localhost:3000/admin/login

- [ ] Email and password fields present
- [ ] Form validation works
- [ ] Submit with empty fields → shows error
- [ ] Submit with valid credentials:
  - Calls `POST /api/auth/admin-login`
  - Stores `adminToken` and `adminUser` in localStorage
  - Navigates to `/admin/dashboard`
- [ ] Submit with invalid credentials → shows error toast
- [ ] Check Network tab:
  - Request should have correct email/password
  - Response should have token and user object

**Test Credentials** (if seeded):
```
Email: admin@happyholidays.com
Password: [check your seed script]
```

---

## 3. ADMIN DASHBOARD FLOWS

### 3.1 Dashboard Overview
**URL**: http://localhost:3000/admin/dashboard

- [ ] Shows sidebar navigation
- [ ] Shows header with admin name
- [ ] Displays dashboard stats:
  - Total bookings
  - Active bookings
  - Revenue
  - Occupancy rate
- [ ] Sidebar links work:
  - Dashboard
  - Bookings
  - Rooms
  - Users (if exists)
  - Settings
  - Logout

### 3.2 Admin Bookings Management
**URL**: http://localhost:3000/admin/dashboard/bookings

**Initial Load:**
- [ ] Fetches bookings from `GET /api/admin/bookings` with Bearer token
- [ ] Shows loading spinner while fetching
- [ ] If empty database → shows "No bookings found"
- [ ] If has bookings → displays all booking cards

**With Bookings:**
- [ ] Each booking card shows:
  - Booking number
  - Guest name, email, phone
  - Room type and number
  - Check-in/check-out dates
  - Total nights
  - Number of guests
  - Payment breakdown (room charges, GST, total, advance, balance)
  - Booking status badge
  - Payment status badge
  - Edit button
- [ ] Search box should filter bookings by:
  - Booking number
  - Guest name
  - Guest email
- [ ] Status filter dropdown should work:
  - All
  - Confirmed
  - Pending
  - Cancelled
  - Completed

**Edit Booking:**
- [ ] Click "Edit" → opens modal
- [ ] Modal shows:
  - Booking number
  - Current booking status dropdown
  - Current payment status dropdown
  - Notes textarea
  - Cancel button
  - Save button
- [ ] Change status → click Save → calls `PUT /api/admin/bookings`
- [ ] Check Network tab:
  - Request has Authorization header with Bearer token
  - Request body has id, booking_status, payment_status, notes
- [ ] On success:
  - Shows success toast
  - Updates booking card immediately
  - Closes modal
- [ ] On error:
  - Shows error toast
  - Modal stays open

**Token Authentication:**
- [ ] All API calls should have `Authorization: Bearer {token}` header
- [ ] Token should be read from `localStorage.getItem('adminToken')`
- [ ] If token invalid → returns 401 error

### 3.3 Admin Rooms Management
**URL**: http://localhost:3000/admin/dashboard/rooms

(Test if this page exists, or note it needs to be created)

- [ ] Shows all rooms from database
- [ ] Can add new room
- [ ] Can edit room details
- [ ] Can delete room
- [ ] Can toggle room availability

---

## 4. API ENDPOINTS TESTING

### 4.1 Public APIs (No Auth Required)

**GET /api/rooms**
```bash
curl http://localhost:3000/api/rooms
```
- [ ] Returns `{"success": true, "rooms": [...]}`
- [ ] Rooms have all required fields (id, room_number, room_type, base_price, etc.)

**POST /api/bookings**
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": "uuid-here",
    "guest_name": "Test User",
    "guest_email": "test@example.com",
    "guest_phone": "9876543210",
    "check_in": "2025-12-01",
    "check_out": "2025-12-05",
    "num_guests": 2,
    "total_amount": 10000,
    "advance_paid": 5000
  }'
```
- [ ] Creates booking successfully
- [ ] Returns booking object with booking_number
- [ ] Stores in database correctly

### 4.2 Admin APIs (Auth Required)

**POST /api/auth/admin-login**
```bash
curl -X POST http://localhost:3000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@happyholidays.com",
    "password": "your-password"
  }'
```
- [ ] Returns `{"success": true, "token": "...", "user": {...}}`
- [ ] Token is valid JWT
- [ ] User object has id, email, role

**GET /api/admin/bookings**
```bash
# Get the token from login response
curl http://localhost:3000/api/admin/bookings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
- [ ] Returns `{"success": true, "bookings": [...]}`
- [ ] Each booking has room and user details (foreign key joins)
- [ ] Without token → returns 401
- [ ] With invalid token → returns 401

**GET /api/admin/bookings?status=confirmed**
```bash
curl http://localhost:3000/api/admin/bookings?status=confirmed \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
- [ ] Returns only bookings with status "confirmed"
- [ ] Status filter works correctly

**PUT /api/admin/bookings**
```bash
curl -X PUT http://localhost:3000/api/admin/bookings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "booking-uuid-here",
    "booking_status": "confirmed",
    "payment_status": "paid",
    "notes": "Updated via API"
  }'
```
- [ ] Updates booking successfully
- [ ] Returns updated booking object
- [ ] Creates audit log entry
- [ ] Without token → returns 401

---

## 5. DATABASE VERIFICATION

### 5.1 Check Tables Exist
Connect to Supabase and verify:

- [ ] `rooms` table exists with data
- [ ] `bookings` table exists
- [ ] `admin_users` table exists with at least 1 admin
- [ ] `users` table exists
- [ ] `audit_logs` table exists

### 5.2 Check Foreign Keys
- [ ] `bookings.room_id` references `rooms.id`
- [ ] `bookings.user_id` references `users.id`
- [ ] `audit_logs.user_id` references `admin_users.id`

### 5.3 Check Sample Data
- [ ] At least 3-5 rooms with:
  - Different room_types
  - Different base_price
  - Images array populated
  - Amenities array populated
  - is_available = true

---

## 6. EDGE CASES & ERROR HANDLING

### 6.1 Booking Flow Errors
- [ ] Try to book without selecting dates → shows error
- [ ] Try to book unavailable room → button is disabled
- [ ] Try to book with invalid email → shows validation error
- [ ] Try to book with invalid phone (not 10 digits) → shows error
- [ ] Submit booking when API is down → shows error toast

### 6.2 Admin Flow Errors
- [ ] Access admin dashboard without login → redirects to login
- [ ] Login with wrong password → shows error
- [ ] Login with non-existent email → shows error
- [ ] Token expires → shows 401 error
- [ ] Edit booking with invalid data → shows error

### 6.3 API Rate Limiting
- [ ] Multiple rapid requests should work
- [ ] No rate limiting errors (unless implemented)

---

## 7. RESPONSIVE DESIGN TESTING

### 7.1 Mobile (375px width)
- [ ] Homepage displays correctly
- [ ] Rooms page shows mobile filter button
- [ ] Booking page date pickers work
- [ ] Admin dashboard sidebar becomes hamburger menu
- [ ] All buttons are tappable
- [ ] Forms are usable

### 7.2 Tablet (768px width)
- [ ] Layout adjusts properly
- [ ] Room cards display in grid
- [ ] Admin dashboard shows properly

### 7.3 Desktop (1920px width)
- [ ] Full layout with sidebars
- [ ] Images display in full quality
- [ ] Multi-column layouts work

---

## 8. BROWSER COMPATIBILITY

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## 9. PERFORMANCE TESTING

### 9.1 Page Load Times
- [ ] Homepage loads < 2s
- [ ] Booking page loads < 3s
- [ ] Admin dashboard loads < 2s

### 9.2 Image Loading
- [ ] Room images load progressively
- [ ] No broken image links
- [ ] Images are optimized (using Next.js Image component)

### 9.3 API Response Times
- [ ] GET /api/rooms < 500ms
- [ ] POST /api/bookings < 1s
- [ ] GET /api/admin/bookings < 500ms

---

## 10. SECURITY TESTING

### 10.1 Authentication
- [ ] JWT tokens expire correctly (7 days)
- [ ] Passwords are hashed (bcrypt)
- [ ] Admin routes require valid token
- [ ] Cannot access admin APIs without token

### 10.2 Input Validation
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] Email validation works
- [ ] Phone number validation works

### 10.3 CORS
- [ ] API allows requests from localhost:3000
- [ ] Blocks requests from unknown origins (in production)

---

## 11. DATA INTEGRITY

### 11.1 Booking Creation
- [ ] Booking number is unique and auto-generated
- [ ] Check-in date cannot be in the past
- [ ] Check-out date must be after check-in
- [ ] Total nights calculated correctly
- [ ] GST calculated correctly (12%)
- [ ] Balance amount = total - advance paid

### 11.2 Room Availability
- [ ] Cannot book room marked as unavailable
- [ ] Room status updates correctly

### 11.3 Audit Logs
- [ ] Admin login creates audit log
- [ ] Booking update creates audit log
- [ ] Logs contain user_id, action, table_name, record_id

---

## TESTING PRIORITY

### P0 - Critical (Must Work)
1. Customer can browse rooms
2. Customer can make a booking
3. Admin can login
4. Admin can view bookings
5. All API endpoints return correct data

### P1 - High (Should Work)
1. Admin can update booking status
2. Search and filters work
3. Form validations work
4. Error messages display correctly

### P2 - Medium (Nice to Have)
1. Mobile responsive design
2. Loading states
3. Animations and transitions

### P3 - Low (Future)
1. Multi-room cart system
2. Email notifications
3. Payment gateway integration

---

## KNOWN ISSUES / TO-DO

- [ ] `/rooms` page still shows mock data (not connected to API)
- [ ] Individual room detail page `/rooms/[id]` may not exist
- [ ] Multi-room booking not fully implemented
- [ ] No payment gateway integration
- [ ] No email notifications
- [ ] Admin rooms management page may not exist

---

## HOW TO TEST

### Quick Test (5 minutes)
1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. Click "Book Now" → select dates → verify rooms load from API
4. Go to http://localhost:3000/admin/login
5. Login with admin credentials
6. Check bookings page loads with "No bookings found"

### Full Test (30 minutes)
1. Go through each section systematically
2. Check boxes as you complete each test
3. Note any failures in a separate document
4. Test with different data inputs

### API Test with cURL (10 minutes)
1. Test all API endpoints listed in Section 4
2. Verify response formats
3. Check authentication works

---

## SUCCESS CRITERIA

All tests pass when:
- ✅ Customer booking flow works end-to-end (can create booking)
- ✅ Admin login works
- ✅ Admin can view and update bookings
- ✅ All API endpoints return correct responses
- ✅ No console errors
- ✅ Database contains correct data after operations
