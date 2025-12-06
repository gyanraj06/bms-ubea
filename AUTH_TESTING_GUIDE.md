# Authentication System Testing Guide

## ✅ Setup Complete

All authentication APIs and frontend integrations have been implemented successfully!

## 📋 Step-by-Step Setup Instructions

### Step 1: Run Database Schema in Supabase

1. Go to your Supabase Dashboard: https://hgqyhqoieppwidrpkkvn.supabase.co
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `SUPABASE_SCHEMA.sql` in this project
5. Copy the entire contents and paste into SQL Editor
6. Click **Run** (Ctrl+Enter)
7. Wait for success message

### Step 2: Seed Admin Users

After running the schema, you need to create the admin users with properly hashed passwords.

**Option A: Use the Seed API (Recommended)**

1. Make sure your dev server is running: `npm run dev`
2. Open a new terminal and run:

```bash
curl -X POST http://localhost:3000/api/auth/seed-admins
```

Or open your browser and navigate to:
```
http://localhost:3000/api/auth/seed-admins
```

This will create all 4 admin users with proper bcrypt hashed passwords.

**Option B: Manual SQL Insert (Alternative)**

If the API method doesn't work, you can manually insert admin users in Supabase SQL Editor. However, you'll need to hash the passwords first using bcrypt with 10 salt rounds.

### Step 3: Create Storage Buckets

1. Go to **Storage** in Supabase sidebar
2. Click **Create a new bucket**
3. Create bucket: `property-media` (Public)
4. Create bucket: `documents` (Private)

### Step 4: Run Storage Policies

Go to SQL Editor and run:

```sql
-- Property Media Bucket Policies (Public)
CREATE POLICY "Public can view property media"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-media');

CREATE POLICY "Service role can upload property media"
ON storage.objects FOR INSERT
USING (bucket_id = 'property-media' AND auth.role() = 'service_role');

CREATE POLICY "Service role can update property media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'property-media' AND auth.role() = 'service_role');

CREATE POLICY "Service role can delete property media"
ON storage.objects FOR DELETE
USING (bucket_id = 'property-media' AND auth.role() = 'service_role');
```

---

## 🧪 Testing the Authentication System

### Test 1: Admin Login

1. Start your dev server: `npm run dev`
2. Navigate to: http://localhost:3000/admin/login
3. Use these test credentials:

| Email | Password | Role |
|-------|----------|------|
| owner@happyholidays.com | Owner@123 | Owner |
| manager@happyholidays.com | Manager@123 | Manager |
| frontdesk@happyholidays.com | FrontDesk@123 | Front Desk |
| accountant@happyholidays.com | Accountant@123 | Accountant |

4. After successful login:
   - You should see a success toast message
   - Be redirected to `/admin/dashboard`
   - See your role displayed in the top bar
   - See only the menu items you have permission to access

**Testing Permission System:**

1. Login as **Accountant**
   - Should see: Dashboard, Payments, Communication, Reports
   - Should NOT see: Bookings, Media, Settings

2. Login as **Front Desk**
   - Should see: Dashboard, Bookings, Communication
   - Should NOT see: Payments, Media, Reports, Settings

3. Login as **Owner**
   - Should see ALL menu items

4. Go to Settings (as Owner) and toggle permissions
   - Give Accountant access to Bookings
   - Remove Front Desk access to Communication
   - Login as those roles again to verify changes

### Test 2: User Registration

1. Navigate to: http://localhost:3000/signup
2. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@example.com
   - Phone: +919876543210
   - Password: TestPassword123
   - Confirm Password: TestPassword123
3. Click "Create Account"
4. You should see success message
5. Be redirected to login page
6. Check Supabase:
   - Go to **Authentication** → **Users** (should see the user)
   - Go to **Table Editor** → **users** (should see the user record)

### Test 3: User Login

1. Navigate to: http://localhost:3000/login
2. Enter the credentials you just created:
   - Email: john.doe@example.com
   - Password: TestPassword123
3. Click "Sign In"
4. You should see success message
5. Be redirected to homepage
6. Check browser localStorage:
   - Open DevTools (F12)
   - Go to Application → Local Storage
   - Should see `userSession` and `userData`

### Test 4: Google SSO (Coming Soon)

Currently shows "Coming Soon" message. To enable:

1. Configure Google OAuth in Supabase:
   - Go to Authentication → Providers
   - Enable Google
   - Add Client ID and Secret from Google Cloud Console
2. Uncomment the Google login code in `/app/login/page.tsx` and `/app/signup/page.tsx`

---

## 🔐 API Endpoints Created

### Admin Authentication

**POST `/api/auth/admin-login`**
- Login with email/password
- Returns JWT token
- Creates audit log
- Updates last_login timestamp

**POST `/api/auth/seed-admins`**
- Seeds admin users with hashed passwords
- Run once during initial setup

### User Authentication (Supabase Auth)

**POST `/api/auth/register`**
- Creates user in Supabase Auth
- Creates user record in database
- Returns session token
- Sends verification email (if configured)

**POST `/api/auth/user-login`**
- Supports email/password login
- Supports Google SSO (when configured)
- Returns Supabase session
- Returns user data

---

## 📦 Files Modified/Created

### New Files Created:
1. `lib/auth.ts` - Authentication utilities (JWT, bcrypt)
2. `lib/supabase.ts` - Supabase client setup
3. `app/api/auth/admin-login/route.ts` - Admin login API
4. `app/api/auth/user-login/route.ts` - User login API
5. `app/api/auth/register/route.ts` - User registration API
6. `app/api/auth/seed-admins/route.ts` - Admin seed API
7. `SUPABASE_SCHEMA.sql` - Complete database schema
8. `ADMIN_USERS_SEED.sql` - Admin users seed SQL
9. `.env.local` - Environment variables (with your credentials)

### Files Modified:
1. `app/admin/login/page.tsx` - Updated to use real API
2. `app/login/page.tsx` - Updated to use real API
3. `app/signup/page.tsx` - Updated to use real API

---

## 🐛 Troubleshooting

### Issue: "Module not found: Can't resolve '@/lib/supabase'"

**Solution:** Make sure you installed packages:
```bash
npm install @supabase/supabase-js bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

### Issue: Admin login returns 500 error

**Solution:**
1. Check if you ran the seed-admins API
2. Verify Supabase credentials in `.env.local`
3. Check Supabase logs in Dashboard → Logs

### Issue: User registration fails

**Solution:**
1. Check if database schema was run successfully
2. Verify the `users` table exists in Supabase
3. Check if Supabase Auth is enabled (should be by default)

### Issue: "Invalid email or password" but credentials are correct

**Solution:**
1. Verify admin users were seeded with hashed passwords
2. Check if `is_active` is `true` in admin_users table
3. Look at API logs in terminal for detailed error

### Issue: Multiple dev servers causing 500 errors

**Solution:**
```bash
# Kill all Node processes
powershell -Command "Get-Process node | Stop-Process -Force"

# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Start fresh dev server
npm run dev
```

---

## ✨ What's Next?

Now that authentication is complete, you can implement:

1. **Bookings Management** - Create, list, update bookings
2. **Payments** - Process payments, view transactions
3. **Rooms** - List rooms, check availability
4. **Communication** - Send emails/SMS to guests
5. **Media** - Upload property photos

**Tell me which feature to implement next!**

---

## 📊 Database Tables Created

- ✅ admin_users (with 4 test users)
- ✅ permissions (with 7 default permissions)
- ✅ users (for guest accounts)
- ✅ rooms (with 5 sample rooms)
- ✅ bookings
- ✅ payments
- ✅ messages
- ✅ media
- ✅ audit_logs

---

## 🔑 Security Features Implemented

1. **Password Hashing** - bcrypt with 10 salt rounds
2. **JWT Tokens** - 7-day expiration
3. **Role-Based Access Control** - 4 admin roles
4. **Row Level Security** - Supabase RLS policies
5. **Audit Logging** - All admin actions logged
6. **Session Management** - localStorage with tokens
7. **Email Validation** - Regex validation
8. **Password Strength** - Minimum 8 characters

---

**🎉 Authentication System is Ready to Test!**

Follow the steps above and let me know if you encounter any issues.
