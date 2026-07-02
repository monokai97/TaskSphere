import { getIronSession } from 'iron-session'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sessionOptions, type SessionData } from '@/lib/iron-session'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const requestHeaders = new Headers(request.headers)

  const session = await getIronSession<SessionData>(request, response, sessionOptions)

  if (!session.guestId) {
    session.guestId = crypto.randomUUID()
    session.createdAt = new Date().toISOString()
    await session.save()
  }

  requestHeaders.set('x-guest-id', session.guestId)

  const rewrittenResponse = NextResponse.next({
    request: { headers: requestHeaders },
  })

  const setCookie = response.headers.get('set-cookie')
  if (setCookie) {
    rewrittenResponse.headers.set('set-cookie', setCookie)
  }

  return rewrittenResponse
}

export const config = {
  matcher: '/((?!_next|api/auth|admin|static|favicon.ico).*)',
}
