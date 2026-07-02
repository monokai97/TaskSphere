import { getIronSession } from 'iron-session'
import type { SessionOptions, IronSession } from 'iron-session'
import { NextRequest, NextResponse } from 'next/server'

export interface SessionData {
  guestId?: string
  createdAt?: string
}

export const sessionOptions: SessionOptions = {
  password: process.env.IRON_SESSION_PASSWORD || 'complex_password_at_least_32_chars_long_here',
  cookieName: 'task-sphere-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  },
}

export async function getSession(
  request: NextRequest,
  response: NextResponse,
): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(request, response, sessionOptions)
}
