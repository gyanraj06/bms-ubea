# Firebase Phone Authentication Setup Guide

## Error Explanation

The error `auth/network-request-failed` occurs when Firebase cannot initialize reCAPTCHA properly. This happens due to:

1. **Domain not authorized** in Firebase Console
2. **Network/CORS issues** with reCAPTCHA
3. **Missing reCAPTCHA configuration** in Firebase project

## Step-by-Step Fix

### 1. Add Authorized Domains in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `union-awas-bank`
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain** and add:
   - `localhost`
   - `127.0.0.1`
   - Your production domain (when deploying)

### 2. Enable Phone Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Phone** provider
3. Save changes

### 3. Configure reCAPTCHA (Choose One Option)

#### Option A: Use Test Phone Numbers (Development Only)

For development, you can use test phone numbers to bypass reCAPTCHA:

1. Go to **Authentication** → **Settings** → **Phone numbers for testing**
2. Add test numbers:
   - Phone: `+919999999999`
   - Code: `123456`
3. Use these in your app for testing

#### Option B: Set Up reCAPTCHA Enterprise (Recommended for Production)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Enable **reCAPTCHA Enterprise API**
4. Create a reCAPTCHA Enterprise key:
   - Go to **Security** → **reCAPTCHA Enterprise**
   - Click **Create Key**
   - Select **Website**
   - Add your domains (localhost, production domain)
5. In Firebase Console:
   - Go to **Authentication** → **Settings**
   - Under **Phone**, select **reCAPTCHA Enterprise**
   - Enter your reCAPTCHA Enterprise Key ID

### 4. Update Firebase Security Rules

Ensure your Firebase project allows authentication:

```
// Firebase Auth doesn't use Security Rules, but if using Firestore:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Check Network Configuration

Ensure these URLs are accessible (not blocked by firewall/proxy):

- `https://www.google.com/recaptcha/`
- `https://www.gstatic.com/recaptcha/`
- `https://identitytoolkit.googleapis.com/`

### 6. Verify Environment Variables

Check `.env.local` has correct Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCRbKbLl9bJbOQYi3jjl7RbTRWBNDpqEyY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=union-awas-bank.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=union-awas-bank
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=union-awas-bank.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=363454195272
NEXT_PUBLIC_FIREBASE_APP_ID=1:363454195272:web:372b2da4d8a54a1b4e9a7d
```

### 7. Restart Development Server

After making changes:

```bash
# Stop the server (Ctrl+C)
# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

## Testing Phone Authentication

### Using Test Numbers (Development)

```typescript
// In your component, use the test number you configured:
Phone: +919999999999
OTP: 123456
```

### Using Real Numbers (Production)

1. Ensure reCAPTCHA is properly configured
2. Use a real phone number with country code: `+91XXXXXXXXXX`
3. reCAPTCHA widget should appear (invisible or visible based on config)
4. Receive actual SMS OTP
5. Verify the OTP

## Common Issues & Solutions

### Issue: "Domain not authorized"
**Solution**: Add `localhost` to authorized domains in Firebase Console

### Issue: "reCAPTCHA initialization failed"
**Solution**:
- Check if reCAPTCHA Enterprise is enabled
- Verify API key is correct
- Ensure domains are whitelisted

### Issue: "Network request failed"
**Solution**:
- Check internet connection
- Verify Firebase URLs are not blocked
- Try using test phone numbers first

### Issue: "Too many requests"
**Solution**:
- Use test phone numbers for development
- Wait a few minutes before retrying
- Enable reCAPTCHA to prevent abuse

## Alternative: Use Supabase Phone Auth Instead

Since you already have Supabase configured, consider using Supabase Phone Auth instead of Firebase:

### Advantages:
- Better integration with your existing Supabase setup
- No reCAPTCHA configuration needed
- Simpler setup
- Unified authentication system

### Setup:
1. Enable Phone Auth in Supabase Dashboard
2. Configure SMS provider (Twilio, MessageBird, etc.)
3. Use Supabase Auth SDK instead of Firebase

Would you like me to implement Supabase Phone Auth instead?

## Current Status

✅ **Fixed**: Added better error handling and initialization
❌ **Needs Action**: Configure Firebase Console settings above
⚠️ **Recommendation**: Consider switching to Supabase Phone Auth

## Next Steps

1. Complete Firebase Console configuration (Steps 1-3 above)
2. Test with test phone numbers first
3. Deploy and test with real numbers
4. OR switch to Supabase Phone Auth for unified authentication
