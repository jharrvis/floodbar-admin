import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * Guard for API routes that are only meant for the logged-in admin.
 *
 * Returns a 401 response when the request carries no valid NextAuth
 * session token, or null when the request may proceed. Usage:
 *
 *   const denied = await requireAdmin(request)
 *   if (denied) return denied
 */
export async function requireAdmin(request: NextRequest | Request): Promise<NextResponse | null> {
  const token = await getToken({ req: request as NextRequest, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return null
}
