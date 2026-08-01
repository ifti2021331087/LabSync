import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await auth.api.getSession({
    headers: await headers(),
  });


  if (!session) {
    const signInUrl = new URL('/auth/signIn', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (pathname.startsWith('/admin') && session.user.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/ask/:path*',
    '/problem/:path*',
    '/notifications/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/pricing/:path*',
    // Add your LabSync specific routes if needed:
    '/checkouts/:path*',
    '/requests/:path*',
    '/history/:path*',
    '/reportDamage/:path*',
  ],
};