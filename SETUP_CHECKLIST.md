# Setup Checklist - Happy Holidays Authentication System

## ✅ Quick Start Guide

Follow these steps in order to get the authentication system running:

### Step 1: Supabase Database Setup

- [ ] Open Supabase Dashboard: https://hgqyhqoieppwidrpkkvn.supabase.co
- [ ] Go to SQL Editor → New Query
- [ ] Copy contents of `SUPABASE_SCHEMA.sql`
- [ ] Paste and click **Run**
- [ ] Wait for success message

**Expected Result:** 9 tables created, 7 permissions inserted, 5 sample rooms inserted

---

### Step 2: Create Storage Buckets

- [ ] Go to **Storage** in Supabase sidebar
- [ ] Click **Create a new bucket**
- [ ] Create bucket: `property-media`
  - [ ] Make it **Public** ✓
- [ ] Create bucket: `documents`
  - [ ] Keep it **Private**

---

### Step 3: Run Storage Policies

- [ ] Go back to SQL Editor
- [ ] Run the storage policies SQL (found in `SUPABASE_SETUP_GUIDE.md`)
- [ ] Verify no errors

---

### Step 4: Seed Admin Users

**Option A: Using the API (Recommended)**

- [ ] Make sure dev server is running: `npm run dev`
- [ ] Open browser and navigate to:
  ```
  http://localhost:3000/api/auth/seed-admins
  ```
- [ ] Verify you see success message with 4 users created

**Option B: Using curl**

```bash
curl -X POST http://localhost:3000/api/auth/seed-admins
```

**Expected Result:** 4 admin users created in `admin_users` table

---

### Step 5: Verify Database Setup

- [ ] Go to **Table Editor** in Supabase
- [ ] Check `admin_users` table → Should have 4 users
- [ ] Check `permissions` table → Should have 7 permissions
- [ ] Check `rooms` table → Should have 5 rooms
- [ ] Go to **Storage** → Should see 2 buckets

---

### Step 6: Test Admin Login

- [ ] Open: http://localhost:3000/admin/login
- [ ] Try login with:
  - Email: `owner@happyholidays.com`
  - Password: `Owner@123`
- [ ] Should redirect to `/admin/dashboard`
- [ ] Should see "Welcome back, Owner!" toast
- [ ] Should see your role in top bar
- [ ] Should see all menu items (Owner has full access)

---

### Step 7: Test Permission System

- [ ] Login as **Owner**
- [ ] Go to **Settings** → **Permissions** tab
- [ ] Toggle some permissions (e.g., remove "Bookings" from "Accountant")
- [ ] Logout and login as **Accountant**
- [ ] Verify "Bookings" menu item is hidden

---

### Step 8: Test User Registration

- [ ] Open: http://localhost:3000/signup
- [ ] Fill the form:
  - First Name: Test
  - Last Name: User
  - Email: test@example.com
  - Phone: +919876543210
  - Password: TestPassword123
  - Confirm Password: TestPassword123
- [ ] Click "Create Account"
- [ ] Should see success message
- [ ] Should redirect to login page
- [ ] Check Supabase **Authentication** → **Users** → Should see new user

---

### Step 9: Test User Login

- [ ] Open: http://localhost:3000/login
- [ ] Login with the credentials you just created:
  - Email: test@example.com
  - Password: TestPassword123
- [ ] Should see "Login successful!" toast
- [ ] Should redirect to homepage
- [ ] Open DevTools (F12) → Application → Local Storage
- [ ] Should see `userSession` and `userData` keys

---

### Step 10: Verify Everything Works

- [ ] Admin login works ✓
- [ ] User registration works ✓
- [ ] User login works ✓
- [ ] Permission system works ✓
- [ ] Data stored in Supabase ✓
- [ ] No console errors ✓

---

## 🐛 Troubleshooting

### Issue: "Error: ECONNREFUSED localhost:3000"
**Solution:** Make sure dev server is running: `npm run dev`

### Issue: "Module not found: '@/lib/supabase'"
**Solution:**
```bash
npm install @supabase/supabase-js bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

### Issue: Admin login returns 500 error
**Solution:**
1. Check if you ran the seed-admins API
2. Verify `.env.local` has correct Supabase credentials
3. Check Supabase Dashboard → Logs for errors

### Issue: User registration fails with "User creation failed"
**Solution:**
1. Verify database schema was run successfully
2. Check if `users` table exists in Supabase
3. Make sure Supabase Auth is enabled (should be by default)

### Issue: Multiple dev servers causing issues
**Solution:**
```bash
# Kill all Node processes
powershell -Command "Get-Process node | Stop-Process -Force"

# Clear cache
Remove-Item -Recurse -Force .next

# Restart dev server
npm run dev
```

---

## 📋 Admin Test Credentials

After seeding, you can use these credentials:

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| owner@happyholidays.com | Owner@123 | Owner | Full access to all features |
| manager@happyholidays.com | Manager@123 | Manager | Most features except Settings |
| frontdesk@happyholidays.com | FrontDesk@123 | Front Desk | Bookings and Communication |
| accountant@happyholidays.com | Accountant@123 | Accountant | Payments and Reports |

---

## ✅ Success Criteria

Authentication system is working if:

1. ✅ All 4 admin users can login
2. ✅ Each role sees different menu items
3. ✅ Permission toggles work in Settings
4. ✅ New users can register
5. ✅ Registered users can login
6. ✅ Data appears in Supabase tables
7. ✅ No console errors
8. ✅ Tokens stored in localStorage

---

## 🚀 Next Steps

Once authentication is verified working, you can implement:

1. **Bookings System** - Create and manage bookings
2. **Payments** - Process payments and invoices
3. **Rooms** - Room availability and management
4. **Communication** - Email/SMS to guests
5. **Media** - Upload property photos

**Tell me which feature to implement next!**

---

## 📝 Quick Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Seed admin users
curl -X POST http://localhost:3000/api/auth/seed-admins

# Kill all Node processes (if needed)
powershell -Command "Get-Process node | Stop-Process -Force"

# Clear Next.js cache (if needed)
Remove-Item -Recurse -Force .next
```

---

## 📚 Important Files

- `SUPABASE_SCHEMA.sql` - Run this in Supabase SQL Editor
- `AUTH_TESTING_GUIDE.md` - Detailed testing instructions
- `AUTH_IMPLEMENTATION_SUMMARY.md` - Complete implementation details
- `.env.local` - Supabase credentials (DO NOT COMMIT)
- `ADMIN_CREDENTIALS.md` - Admin test credentials reference

---

**Current Status:** ✅ Authentication System Complete - Ready to Test!
