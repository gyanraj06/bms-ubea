-- Create admin_settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default permission code if it doesn't exist
INSERT INTO public.admin_settings (key, value)
VALUES ('permission_code', '123456')
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for Admin read access (using existing admin authentication pattern if possible, or just public read for verification, restricting write)
-- OR: Since this is for verification on backend mostly (and admin dashboard), maybe we don't need public RLS if we use service role in API.
-- However, we likely want to allow reading the 'permission_code' key via specific RPC or just manage it via API.
-- Let's stick to API handling for security. But we might need RLS for admin dashboard if it calls Supabase directly. 
-- The existing admin dashboard seems to use custom API routes `/api/admin/...`.

-- Grant access to service_role (usually default, but good to ensure)
GRANT ALL ON public.admin_settings TO service_role;
