/**
 * Extract Supabase project reference ID from the URL
 * Example: https://hgqyhqoieppwidrpkkvn.supabase.co -> hgqyhqoieppwidrpkkvn
 */
export function getSupabaseProjectRef(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined');
  }
  
  // Extract project ref from URL (format: https://<project-ref>.supabase.co)
  const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
  if (!match || !match[1]) {
    throw new Error('Invalid Supabase URL format');
  }
  
  return match[1];
}

/**
 * Get the Supabase auth cookie name for the current project
 * Format: sb-<project-ref>-auth-token
 */
export function getSupabaseAuthCookieName(): string {
  const projectRef = getSupabaseProjectRef();
  return `sb-${projectRef}-auth-token`;
}
