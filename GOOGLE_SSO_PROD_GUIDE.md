# Google SSO Production Setup Guide

This guide outlines the steps to move your Google Sign-In implementation from **Testing** to **Production** mode.

## 1. Google Cloud Console Configuration

1.  **Go to Google Cloud Console**: [https://console.cloud.google.com/](https://console.cloud.google.com/)
2.  **Select Project**: Ensure you have selected your project (`bms-ubea` or equivalent).
3.  **Navigate to OAuth Consent Screen**:
    - Go to **APIs & Services** > **OAuth consent screen**.
4.  **Publish App**:
    - Under "Publishing status", click the **PUBLISH APP** button.
    - Confirm the dialog. This switches your app from "Testing" (limited to 100 test users) to "In production" (available to any Google user).

### Verification Status

- **No Sensitive Scopes**: Since you are only using `email` and `profile` (default Supabase scopes), your app **usually does not require verification** by Google.
- **"Unverified App" Screen**: Users might still see a "Google hasn't verified this app" screen if you haven't verified your domain. This is fine for initial launch, but for a professional look, you should verify.

### User Type

- **External**: You already selected this. This allows ANY user with a Google account to sign in, which is correct for a public booking site.

## 2. Domain Verification (Optional but Recommended)

To remove the "Unverified App" warning:

1.  Go to **APIs & Services** > **Domain verification**.
2.  Click **Add domain**.
3.  Enter your production domain (e.g., `happyholidays.com` or your Vercel URL).
4.  Follow the steps to verify ownership via Google Search Console (DNS record or HTML file upload).

## 3. update Authorized Domains & URIs

1.  **Navigate to Credentials**:
    - Go to **APIs & Services** > **Credentials**.
2.  **Edit OAuth 2.0 Client ID**:
    - Click the pencil icon next to your "Web client".
3.  **Authorized JavaScript Origins**:
    - Add your **Production URL** (e.g., `https://your-project.vercel.app`).
    - Add `https://hgqyhqoieppwidrpkkvn.supabase.co` (Your Supabase Project URL - usually already there).
4.  **Authorized Redirect URIs**:
    - Ensure this EXACT URL is present:
      `https://hgqyhqoieppwidrpkkvn.supabase.co/auth/v1/callback`
    - **Crucial**: This is the URL Supabase uses. It does NOT change even for production, because users are redirected to Supabase first, then back to your app.

## 4. Supabase Configuration

Your Supabase configuration likely remains the same if you are using the same project for production.

1.  **Go to Supabase Dashboard**: Authentication > Providers > Google.
2.  **Verify Client ID/Secret**: Ensure these match the credentials from Google Cloud Console.
3.  **Use a Custom Domain (Advanced)**:
    - If you want the redirect to look like `auth.yourdomain.com` instead of `.supabase.co`, you need to configure "Custom Domain" in Supabase settings (requires Pro plan usually).
    - Otherwise, the default setup works fine.

## 5. Environment Variables in Production

When deploying to Vercel/Netlify:

1.  **Add Environment Variables**:
    - `NEXT_PUBLIC_SUPABASE_URL`: `https://hgqyhqoieppwidrpkkvn.supabase.co`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Your public anon key)
    - `SUPABASE_SERVICE_ROLE_KEY`: (Your service role key - needed for API routes)

**That's it!** Once you click "PUBLISH APP" in step 1, anyone will be able to sign in immediately.
