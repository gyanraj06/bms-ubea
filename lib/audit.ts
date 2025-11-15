import { supabaseAdmin } from './supabase';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';

interface CreateAuditLogParams {
  user_id: string;
  action: AuditAction;
  table_name: string;
  record_id?: string;
  old_data?: any;
  new_data?: any;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    const {data, error} = await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: params.user_id,
        action: params.action,
        table_name: params.table_name,
        record_id: params.record_id || null,
        old_data: params.old_data || null,
        new_data: params.new_data || null,
        ip_address: params.ip_address || null,
        user_agent: params.user_agent || null,
      });

    if (error) {
      console.error('Error creating audit log:', error);
    }

    return { success: !error, data, error };
  } catch (error) {
    console.error('Audit log error:', error);
    return { success: false, error };
  }
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(request: Request): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (real) {
    return real;
  }

  return undefined;
}

/**
 * Get user agent from request headers
 */
export function getUserAgent(request: Request): string | undefined {
  return request.headers.get('user-agent') || undefined;
}
