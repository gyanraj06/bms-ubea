# 🔥 Firebase Console Configuration - QUICK STEPS

## ✅ Your reCAPTCHA Keys (Already Generated)

```
Site Key:   6Lf3DhQsAAAAAIp8UIC-tdmGUnIvIsqek1qgwTWZ
Secret Key: 6Lf3DhQsAAAAAEQ_w5MdPMdpZhZR782bI9MteC-R
```

## 🚀 STEP 1: Configure Firebase Phone Authentication

### A. Open Firebase Console
1. Click this link: https://console.firebase.google.com/project/union-awas-bank/authentication/providers
2. You should see the **"Phone"** provider in the list

### B. Enable Phone Provider (if not already enabled)
1. Click on **"Phone"** row
2. Toggle **"Enable"** at the top right
3. Don't close this yet - continue to next step

### C. Configure reCAPTCHA v2 Keys
1. Stay in the Phone provider settings
2. Scroll down to **"Phone Authentication Settings"** section
3. Look for **"reCAPTCHA v2"** configuration
4. You'll see two input fields:
   - **reCAPTCHA site key**
   - **reCAPTCHA secret key**

5. **Paste your keys:**
   ```
   Site Key:   6Lf3DhQsAAAAAIp8UIC-tdmGUnIvIsqek1qgwTWZ
   Secret Key: 6Lf3DhQsAAAAAEQ_w5MdPMdpZhZR782bI9MteC-R
   ```

6. Click **"Save"** button at the bottom

---

## 🚀 STEP 2: Verify Authorized Domains

1. In Firebase Console, go to: **Authentication → Settings** (left sidebar)
   Direct link: https://console.firebase.google.com/project/union-awas-bank/authentication/settings

2. Scroll to **"Authorized domains"** section

3. **Check these domains are listed:**
   - ✅ `localhost`
   - ✅ `union-awas-bank.firebaseapp.com`

4. If `localhost` is missing:
   - Click **"Add domain"** button
   - Type: `localhost`
   - Click **"Add"**

---

## 🚀 STEP 3: (Optional) Add Test Phone Numbers

This lets you test without sending real SMS:

1. Go back to Phone provider settings:
   https://console.firebase.google.com/project/union-awas-bank/authentication/providers

2. Click on **"Phone"**

3. Scroll to **"Phone numbers for testing"** section

4. Click **"Add phone number"**

5. Add test numbers:
   ```
   Phone Number: +91 9999999999
   Test Code:    123456
   ```

   Click **"Add"**

6. (Optional) Add more test numbers:
   ```
   Phone Number: +91 8888888888
   Test Code:    654321
   ```

---

## 🚀 STEP 4: Verify reCAPTCHA Domain Configuration

1. Go to Google reCAPTCHA Admin: https://www.google.com/recaptcha/admin

2. Find your site (the one with key starting with `6Lf3DhQs`)

3. Click **"Settings"** (gear icon)

4. **Verify these domains are listed:**
   - ✅ `localhost`
   - ✅ `union-awas-bank.firebaseapp.com`
   - ✅ `127.0.0.1` (optional, but good to add)

5. If missing, add them in the **"Domains"** section

6. Click **"Save"**

---

## ✅ STEP 5: Test Your Setup

### A. Close All Old Browser Tabs
Close all tabs with `localhost:3000`, `localhost:3001`, `localhost:3002`

### B. Clear Browser Cache
- Press `Ctrl + Shift + Delete`
- Select **"Cached images and files"**
- Click **"Clear data"**

### C. Access Your App
Open: **http://localhost:3003**

### D. Navigate to Booking Page
Go to a booking URL like:
```
http://localhost:3003/booking/093fcd80-39a9-4feb-81f5-1a05cff00fce?checkIn=2025-11-26T18:30:00.000Z&checkOut=2025-11-29T18:30:00.000Z&guests=2&rooms=1
```

### E. Test Phone Verification

**Option 1: Use Test Phone Number (Recommended)**
1. Enter: `9999999999` or `+91 9999999999`
2. Click **"Send OTP"**
3. Enter code: `123456`
4. Click **"Verify OTP"**
5. Should see success! ✅

**Option 2: Use Real Phone Number**
1. Enter your real phone number
2. Click **"Send OTP"**
3. Wait for SMS (may take 30-60 seconds)
4. Enter the 6-digit code received
5. Click **"Verify OTP"**
6. Should see success! ✅

### F. Check Browser Console (F12)
You should see:
```
✅ DEBUG: reCAPTCHA solved
✅ DEBUG: OTP Sent Result
✅ DEBUG: Starting signInWithPhoneNumber
```

You should NOT see:
```
❌ auth/invalid-app-credential
❌ auth/too-many-requests (unless you tried many times)
```

---

## 🐛 If You Still Get Errors

### Error: `auth/invalid-app-credential`

**Cause:** reCAPTCHA keys not saved in Firebase Console

**Fix:**
1. Go back to Step 1C
2. Make sure you pasted BOTH keys (site key AND secret key)
3. Make sure you clicked **"Save"**
4. Wait 2-3 minutes for changes to propagate
5. Clear browser cache and try again

---

### Error: `auth/too-many-requests`

**Cause:** Too many failed attempts (rate limited by Firebase)

**Fix:**
- Wait 15-30 minutes
- OR use test phone numbers (Step 3)
- Test phone numbers bypass rate limiting

---

### Error: reCAPTCHA not appearing

**Cause:** Script not loading or domain not authorized

**Fix:**
1. Open browser console (F12)
2. Check for script errors
3. Verify Step 4 - domain configuration
4. Make sure you're accessing via `http://localhost:3003` (not just `localhost`)

---

## 📝 Configuration Checklist

Before testing, verify:

- [ ] Firebase Phone provider is **Enabled**
- [ ] reCAPTCHA **Site Key** pasted in Firebase Console
- [ ] reCAPTCHA **Secret Key** pasted in Firebase Console
- [ ] Clicked **"Save"** in Firebase Console
- [ ] `localhost` is in Firebase **Authorized domains**
- [ ] `localhost` is in Google reCAPTCHA **Domains**
- [ ] Test phone numbers configured (optional but recommended)
- [ ] Browser cache cleared
- [ ] Accessing app at `http://localhost:3003`
- [ ] Waited 2-3 minutes after saving Firebase config

---

## 🎉 Success Indicators

When everything works, you'll see:

1. **No errors in browser console**
2. **OTP sent successfully** toast message
3. **SMS received** (for real numbers)
4. **Verification successful** after entering OTP
5. **Phone number stored** in booking

---

## 📞 Need Help?

If you completed ALL steps and still have issues:

1. **Check Firebase logs:**
   https://console.firebase.google.com/project/union-awas-bank/logs

2. **Take screenshots of:**
   - Firebase Phone provider settings (with keys visible)
   - Browser console errors (F12)
   - The exact error message

3. **Common mistakes:**
   - Forgot to click "Save" in Firebase Console
   - Keys pasted in wrong order (site key in secret field)
   - Using old browser tabs with cached config
   - Accessing wrong port (should be 3003 now)
   - Not waiting 2-3 minutes after config changes

---

## ✅ Environment Variables (Already Configured)

Your `.env.local` file now has:

```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lf3DhQsAAAAAIp8UIC-tdmGUnIvIsqek1qgwTWZ
RECAPTCHA_SECRET_KEY=6Lf3DhQsAAAAAEQ_w5MdPMdpZhZR782bI9MteC-R
```

These are already set - no action needed here.

---

## 🎯 Next Action: Configure Firebase Console NOW

**You must complete Step 1 (Configure Firebase Phone Authentication) for phone verification to work.**

The code is ready. The keys are ready. Firebase Console configuration is the ONLY remaining step.

**GO DO IT NOW! ⏰** It takes 2 minutes.
