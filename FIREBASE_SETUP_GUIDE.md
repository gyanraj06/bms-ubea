# Firebase Phone Authentication Setup Guide

## Current Error Analysis

**Error:** `auth/invalid-app-credential` (400 Bad Request)
**Root Cause:** reCAPTCHA v2 site key not configured in Firebase Console

## Step-by-Step Fix

### 1. Get reCAPTCHA v2 Keys from Google

1. Go to: https://www.google.com/recaptcha/admin
2. Click **"+"** to create a new site
3. Fill in the form:
   - **Label:** `Happy Holidays Booking - Phone Auth`
   - **reCAPTCHA type:** Select **"reCAPTCHA v2"** → **"Invisible reCAPTCHA badge"**
   - **Domains:** Add:
     - `localhost`
     - `union-awas-bank.firebaseapp.com`
     - Your production domain (if any)
   - Accept the terms and click **"Submit"**

4. **Copy both keys:**
   - **Site Key** (starts with `6L...`)
   - **Secret Key** (starts with `6L...`)

---

### 2. Configure Firebase Console

#### A. Enable Phone Authentication

1. Go to: https://console.firebase.google.com/project/union-awas-bank/authentication/providers
2. Click on **"Phone"** provider
3. Click **"Enable"** toggle at the top
4. Scroll down to **"reCAPTCHA v2 Configuration"** section
5. Paste your **Site Key** and **Secret Key** from step 1
6. Click **"Save"**

#### B. Add Authorized Domains

1. In Firebase Console → Authentication → Settings
2. Scroll to **"Authorized domains"** section
3. Ensure these domains are listed:
   - `localhost`
   - `union-awas-bank.firebaseapp.com`
4. If missing, click **"Add domain"** and add them

#### C. (Optional) Add Test Phone Numbers

For development/testing without SMS costs:

1. In Phone provider settings, scroll to **"Phone numbers for testing"**
2. Click **"Add phone number"**
3. Add test numbers:
   - Phone: `+91 9999999999` → Code: `123456`
   - Phone: `+91 8888888888` → Code: `654321`
4. Click **"Save"**

---

### 3. Update Environment Variables (if needed)

If you want to use explicit reCAPTCHA keys in your code:

Add to `.env.local`:
```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key-from-step-1
```

**Note:** This is optional. Firebase SDK will use the keys configured in Console.

---

### 4. Verify the Fix

1. **Restart your dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Clear browser cache:**
   - Press `Ctrl + Shift + Delete`
   - Select "Cached images and files"
   - Click "Clear data"

3. **Test phone verification:**
   - Go to booking page: http://localhost:3001/booking/[booking-id]
   - Enter a test phone number (if configured) or real number
   - Click "Send OTP"
   - Check browser console - should see:
     - ✅ `DEBUG: reCAPTCHA solved`
     - ✅ `DEBUG: OTP Sent Result`
   - Enter the OTP received via SMS (or test code)
   - Click "Verify OTP"

---

## Common Issues & Solutions

### Issue 1: Still Getting `auth/invalid-app-credential`

**Solution:**
- Double-check reCAPTCHA keys are correctly pasted in Firebase Console
- Ensure you clicked "Save" in Firebase Console
- Wait 1-2 minutes for changes to propagate
- Clear browser cache and restart dev server

### Issue 2: `auth/too-many-requests`

**Solution:**
- Wait 15-30 minutes for rate limit to reset
- Use test phone numbers instead of real numbers during development
- This happens when you try too many times in quick succession

### Issue 3: reCAPTCHA not visible

**Solution:**
- Check browser console for script loading errors
- Ensure `https://www.google.com/recaptcha/api.js` is loaded
- Try using visible reCAPTCHA for debugging (change `size: "invisible"` to `size: "normal"`)

### Issue 4: Domain not authorized

**Solution:**
- Add your domain to both:
  1. Firebase Console → Authentication → Settings → Authorized domains
  2. Google reCAPTCHA Admin → Your site → Domains

---

## Code Changes Made

### 1. Updated `app/layout.tsx`
- Changed reCAPTCHA script strategy to `beforeInteractive`
- Added `?render=explicit` parameter for better control

### 2. Updated `components/booking/phone-verification.tsx`
- Added detailed console logging for debugging
- Better error callbacks for reCAPTCHA initialization

---

## Testing Checklist

- [ ] reCAPTCHA v2 keys obtained from Google
- [ ] Keys configured in Firebase Console Phone provider
- [ ] `localhost` added to authorized domains
- [ ] Phone provider enabled in Firebase Console
- [ ] Test phone numbers configured (optional but recommended)
- [ ] Browser cache cleared
- [ ] Dev server restarted
- [ ] Phone verification tested successfully

---

## Still Having Issues?

1. **Check Firebase Console logs:**
   - Go to: https://console.firebase.google.com/project/union-awas-bank/logs
   - Look for authentication errors

2. **Check browser console:**
   - Press F12
   - Look for network errors (400/403 responses)
   - Look for "DEBUG:" messages from the code

3. **Verify environment variables:**
   ```bash
   # In your project root
   cat .env.local
   # Ensure all NEXT_PUBLIC_FIREBASE_* variables are set
   ```

4. **Check Firebase quota:**
   - Go to: https://console.firebase.google.com/project/union-awas-bank/authentication/usage
   - Ensure you haven't exceeded free tier limits

---

## Contact Support

If issues persist after following all steps:
- Firebase Support: https://firebase.google.com/support
- Include: Project ID (`union-awas-bank`), error messages, browser console logs
