-- Run this SQL in Supabase SQL Editor to fix existing unconfirmed users
-- This will confirm all existing users in auth.users table

UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Verify the update
SELECT email, email_confirmed_at, confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
