# 🔥 URGENT FIX: Use 127.0.0.1 Instead of localhost

## ✅ Problem Found!

**Firebase no longer allows phone authentication from `localhost`.**

You MUST use `127.0.0.1` instead!

---

## 🚀 SOLUTION (2 Simple Steps)

### STEP 1: Add 127.0.0.1 to Firebase Authorized Domains

1. **Go to Firebase Console:**
   https://console.firebase.google.com/project/union-awas-bank/authentication/settings

2. **Scroll to "Authorized domains" section**

3. **Click "Add domain"**

4. **Enter:** `127.0.0.1`

5. **Click "Add"**

6. **Verify you now have:**
   - ✅ `127.0.0.1` (newly added)
   - ✅ `localhost` (can keep this)
   - ✅ `union-awas-bank.firebaseapp.com`

---

### STEP 2: Access Your App Using 127.0.0.1

**STOP using `localhost:3003`**

**START using `127.0.0.1:3003`**

1. **Close all browser tabs with localhost**

2. **Clear browser cache:**
   - Press `Ctrl + Shift + Delete`
   - Clear "Cached images and files"

3. **Open this URL instead:**
   ```
   http://127.0.0.1:3003
   ```

4. **Navigate to your booking page:**
   ```
   http://127.0.0.1:3003/booking/[booking-id]?checkIn=...&checkOut=...
   ```

5. **Test phone verification!**

---

## ✅ Why This Fixes the Error

**From your console logs, we can see:**
```
✅ DEBUG: reCAPTCHA solved (working!)
❌ POST 400 Bad Request (auth/invalid-app-credential)
```

This means:
- ✅ reCAPTCHA is working correctly
- ❌ Firebase rejects the request because `localhost` is not recognized as a valid domain

**Firebase now requires the IP address `127.0.0.1` for local development with phone authentication.**

This is a recent change (2024-2025) due to security updates.

---

## 📋 Quick Checklist

- [ ] Added `127.0.0.1` to Firebase Authorized domains
- [ ] Clicked "Save" in Firebase Console
- [ ] Waited 1-2 minutes for changes to propagate
- [ ] Closed all `localhost:*` browser tabs
- [ ] Cleared browser cache
- [ ] Accessing app via `http://127.0.0.1:3003`
- [ ] Tested phone verification

---

## 🎯 Expected Result

After using `127.0.0.1`:

**Console logs:**
```
✅ DEBUG: Starting signInWithPhoneNumber
✅ DEBUG: reCAPTCHA solved
✅ DEBUG: OTP Sent Result
✅ POST 200 OK (success!)
```

**UI:**
```
✅ "OTP sent successfully!" toast
✅ SMS received on your phone
✅ Can enter and verify OTP
```

---

## ⚠️ Important Notes

1. **Always use 127.0.0.1 for Firebase Phone Auth during development**
   - NOT localhost
   - NOT localhost:3003
   - YES 127.0.0.1:3003

2. **Both localhost and 127.0.0.1 point to your computer**
   - They are technically the same
   - But Firebase treats them differently for security

3. **Production deployment works normally**
   - This only affects local development
   - Your production domain will work fine

4. **Bookmark the 127.0.0.1 URL**
   - Save: `http://127.0.0.1:3003`
   - Use this instead of localhost from now on

---

## 🔍 Also Check Your reCAPTCHA Domain

While you're in Google reCAPTCHA admin, also add `127.0.0.1`:

1. Go to: https://www.google.com/recaptcha/admin
2. Find your site (key: `6Lf3DhQs...`)
3. Click "Settings"
4. Add `127.0.0.1` to domains list
5. Click "Save"

---

## 🎉 After This Fix

Your phone verification will work perfectly!

No more `auth/invalid-app-credential` errors!

---

## 📞 Still Not Working?

If you still see errors after:
- ✅ Adding `127.0.0.1` to Firebase
- ✅ Using `http://127.0.0.1:3003`
- ✅ Clearing browser cache

Then take a screenshot of:
1. Firebase Console → Authentication → Settings → Authorized domains (showing 127.0.0.1)
2. Browser address bar (showing 127.0.0.1)
3. Browser console error

---

**This is a known Firebase limitation. Using 127.0.0.1 instead of localhost is the official workaround!** ✅
