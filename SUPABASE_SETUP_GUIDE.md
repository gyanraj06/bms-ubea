# Supabase Setup Guide for Happy Holidays Guest House

## Step 1: Run Database Schema

1. Go to your Supabase Dashboard: https://hgqyhqoieppwidrpkkvn.supabase.co
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `SUPABASE_SCHEMA.sql` in this project
5. Copy the entire contents and paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for the success message: "Success. No rows returned"

This will create:
- 9 database tables (admin_users, permissions, users, rooms, bookings, payments, messages, media, audit_logs)
- All necessary indexes for performance
- Triggers for auto-updating timestamps and calculating amounts
- Default permissions data
- Sample rooms data
- Row Level Security policies

## Step 2: Create Storage Buckets

### Bucket 1: property-media (Public)
1. Go to **Storage** in the left sidebar
2. Click **Create a new bucket**
3. Bucket name: `property-media`
4. Make it **Public** (toggle on)
5. Click **Create bucket**

### Bucket 2: documents (Private)
1. Click **Create a new bucket** again
2. Bucket name: `documents`
3. Keep it **Private** (toggle off)
4. Click **Create bucket**

## Step 3: Set Storage Policies

Go back to **SQL Editor** and run these policies:

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

-- Documents Bucket Policies (Private)
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR auth.role() = 'service_role')
);

CREATE POLICY "Service role can manage documents"
ON storage.objects FOR ALL
USING (bucket_id = 'documents' AND auth.role() = 'service_role');
```

## Step 4: Verify Setup

Run this query in SQL Editor to verify everything is set up:

```sql
-- Check tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check permissions data
SELECT * FROM permissions;

-- Check rooms data
SELECT * FROM rooms;

-- Check storage buckets (go to Storage tab to verify)
```

You should see:
- 9 tables created
- 7 permission records
- 5 room records

## Step 5: Ready for API Integration

Everything is now ready! The backend APIs will:
1. Create admin users with hashed passwords (Owner@123, Manager@123, etc.)
2. Handle user registration and login
3. Manage bookings, payments, communication
4. Upload media to storage buckets

## What's Next?

Tell me which feature you want to implement first:

### Option 1: Authentication System
- Admin login API (with bcrypt password hashing)
- User login/signup API
- Google SSO integration
- JWT token generation

### Option 2: Bookings Management
- Create booking API
- List bookings API
- Update booking status API
- Search and filter bookings

### Option 3: Rooms Management
- List available rooms API
- Room availability checker
- Update room details API

### Option 4: Payments
- Payment processing API
- Payment history API
- GST calculation and invoicing

### Option 5: Communication
- Send email API
- Send SMS API
- WhatsApp integration
- Message history API

### Option 6: Media Management
- Upload photos API
- List media by category API
- Delete media API

**Just tell me which one to implement first, and I'll create the complete API with frontend integration!**

## Notes

- All APIs will use the Service Role Key for admin operations
- RLS policies are in place for security
- Auto-generated booking numbers (format: BK20250114XXXXX)
- GST automatically calculated at 12%
- All timestamps in IST (Asia/Kolkata)
- Audit logging for all admin actions

## Credentials Configured

✅ Supabase URL: https://hgqyhqoieppwidrpkkvn.supabase.co
✅ Anon Key: Configured in .env.local
✅ Service Role Key: Configured in .env.local
✅ Supabase Client: Created in lib/supabase.ts

## Environment Variables

Already configured in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://hgqyhqoieppwidrpkkvn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
JWT_SECRET=your-jwt-secret-key-change-this-in-production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Remember to never commit .env.local to git!** (Already in .gitignore)
