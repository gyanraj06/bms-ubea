# ✅ CORRECT Firebase Phone Authentication Setup

## Important: Firebase Handles reCAPTCHA Automatically!

**You do NOT need to manually configure reCAPTCHA v2 keys in Firebase Console for web apps.**

Firebase automatically manages reCAPTCHA through the `RecaptchaVerifier` object in your code (which is already implemented).

---

## 🚀 Actual Steps Required

### STEP 1: Enable Phone Authentication in Firebase Console

1. **Open Firebase Console Authentication:**
   - Go to: https://console.firebase.google.com/project/union-awas-bank/authentication/providers

2. **Enable Phone Sign-in Method:**
   - Look for **"Phone"** in the list of providers
   - Click on the **"Phone"** row
   - Toggle **"Enable"** switch at the top right
   - Click **"Save"** button

**That's it for Phone provider!**

---

### STEP 2: Verify Authorized Domains

1. **Go to Authentication Settings:**
   - Click **"Settings"** tab at the top (next to "Users")
   - Or direct link: https://console.firebase.google.com/project/union-awas-bank/settings/general/web

2. **Scroll to "Authorized domains" section**

3. **Ensure these domains are listed:**
   - `localhost` ✅
   - `union-awas-bank.firebaseapp.com` ✅

4. **If `localhost` is missing:**
   - Click **"Add domain"**
   - Enter: `localhost`
   - Click **"Add"**

---

### STEP 3: (Optional) Add Test Phone Numbers

This lets you test without sending real SMS:

1. **Go back to Phone Provider:**
   - https://console.firebase.google.com/project/union-awas-bank/authentication/providers
   - Click on **"Phone"**

2. **Scroll down to "Phone numbers for testing"**

3. **Click "Add phone number"**

4. **Add test numbers:**
   ```
   Phone: +919999999999
   Code:  123456
   ```

5. Click **"Save"**

---

## 🔍 Why Was My Error Happening?

The `auth/invalid-app-credential` error occurs when:

1. **Phone provider is not enabled** in Firebase Console
2. **Domain is not authorized** in Firebase Console
3. **reCAPTCHA script is not loaded** (we fixed this in code)
4. **Rate limiting** from too many failed attempts

---

## ✅ Current Status

### Already Fixed in Code:
- ✅ reCAPTCHA script loading in [app/layout.tsx](app/layout.tsx)
- ✅ RecaptchaVerifier properly configured in [phone-verification.tsx](components/booking/phone-verification.tsx)
- ✅ Environment variables set in [.env.local](.env.local)

### You Need to Do:
1. ✅ Enable Phone provider in Firebase Console (STEP 1)
2. ✅ Verify `localhost` is authorized (STEP 2)
3. ✅ (Optional) Add test phone numbers (STEP 3)

---

## 🎯 How to Test

### After Enabling Phone Provider:

1. **Wait 1-2 minutes** for changes to propagate

2. **Clear browser cache:**
   - Press `Ctrl + Shift + Delete`
   - Clear "Cached images and files"

3. **Access your app:**
   - http://localhost:3003

4. **Go to a booking page:**
   ```
   http://localhost:3003/booking/[booking-id]?checkIn=...&checkOut=...&guests=2&rooms=1
   ```

5. **Test Phone Verification:**

   **Option A: Use Test Number (if configured)**
   - Enter: `9999999999`
   - Click "Send OTP"
   - Enter: `123456`
   - Click "Verify OTP"

   **Option B: Use Real Number**
   - Enter your real number
   - Click "Send OTP"
   - Wait for SMS (30-60 seconds)
   - Enter the 6-digit code
   - Click "Verify OTP"

---

## 🐛 Expected Results

### Success (What You Should See):

**Browser Console (F12):**
```
✅ DEBUG: Starting signInWithPhoneNumber
✅ DEBUG: reCAPTCHA solved
✅ DEBUG: OTP Sent Result
```

**UI:**
```
✅ "OTP sent successfully!" toast message
✅ OTP input field appears
✅ SMS received (for real numbers)
✅ "Phone verified successfully!" after entering correct OTP
```

### Failure (What You Might See):

**If Phone Provider Not Enabled:**
```
❌ Error: auth/operation-not-allowed
```
**Solution:** Enable Phone provider in Firebase Console (STEP 1)

**If Domain Not Authorized:**
```
❌ Error: auth/unauthorized-domain
```
**Solution:** Add `localhost` to authorized domains (STEP 2)

**If Too Many Attempts:**
```
❌ Error: auth/too-many-requests
```
**Solution:** Wait 15-30 minutes OR use test phone numbers

---

## 📸 Visual Guide: Where to Find Settings

### Finding Phone Provider in Firebase Console:

```
Firebase Console
└── Your Project (union-awas-bank)
    └── Build (left sidebar)
        └── Authentication
            └── Sign-in method (top tabs)
                └── Providers list
                    └── Phone (click this row)
                        └── Enable toggle (top right)
```

### Finding Authorized Domains:

```
Firebase Console
└── Your Project (union-awas-bank)
    └── Build (left sidebar)
        └── Authentication
            └── Settings (top tabs)
                └── Authorized domains (scroll down)
```

---

## 🔑 About Your reCAPTCHA Keys

The keys you have:
```
Site Key:   6Lf3DhQsAAAAAIp8UIC-tdmGUnIvIsqek1qgwTWZ
Secret Key: 6Lf3DhQsAAAAAEQ_w5MdPMdpZhZR782bI9MteC-R
```

**These are stored in `.env.local` but Firebase SDK doesn't use them for web apps.**

Firebase automatically generates and manages reCAPTCHA tokens through the `RecaptchaVerifier` API. Your keys are there for reference but Firebase Console doesn't have a field to enter them for phone authentication.

---

## ⚠️ Common Mistakes

1. **Looking for "reCAPTCHA v2 Configuration" field in Phone provider**
   - This field doesn't exist for standard Firebase Authentication
   - It only exists for Google Cloud Identity Platform (paid tier)

2. **Not clicking "Save" after enabling Phone provider**
   - Always click Save!

3. **Using old browser tabs**
   - Always clear cache after config changes

4. **Not waiting for changes to propagate**
   - Wait 1-2 minutes after saving

---

## 🎉 Quick Checklist

Before testing, ensure:

- [ ] Opened Firebase Console → Authentication → Sign-in method
- [ ] Clicked on "Phone" provider row
- [ ] Toggled "Enable" switch ON
- [ ] Clicked "Save" button
- [ ] Verified `localhost` is in Authorized domains
- [ ] Waited 2 minutes after saving
- [ ] Cleared browser cache
- [ ] Using http://localhost:3003 (not 3000, 3001, or 3002)

---

## 📞 Still Having Issues?

If you completed all steps and still see errors:

1. **Take a screenshot of:**
   - Firebase Console → Authentication → Sign-in method page (showing Phone enabled)
   - Browser console (F12) showing the exact error

2. **Check Firebase Console logs:**
   - https://console.firebase.google.com/project/union-awas-bank/logs

3. **Verify in browser console:**
   ```javascript
   // Check if script loaded
   window.grecaptcha !== undefined
   ```

---

**The setup is much simpler than initially thought. Just enable Phone provider in Firebase Console!** 🎯
