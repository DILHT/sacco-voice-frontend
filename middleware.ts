import { type NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE, isAccessAllowed } from '@/lib/access';

export function middleware(req: NextRequest) {
  // 1. Arriving from an access link: store the code in a cookie, then redirect
  //    to a clean URL so the code doesn't stay in the address bar or history.
  const fromLink = req.nextUrl.searchParams.get('access');
  if (fromLink !== null) {
    const cleanUrl = req.nextUrl.clone();
    cleanUrl.searchParams.delete('access');
    const res = NextResponse.redirect(cleanUrl);
    if (isAccessAllowed(fromLink)) {
      res.cookies.set(ACCESS_COOKIE, fromLink, {
        httpOnly: true, // page JavaScript can't read it
        secure: process.env.NODE_ENV !== 'development', // HTTPS only in production
        sameSite: 'strict', // not sent on requests from other sites
        path: '/',
        maxAge: 60 * 60 * 24 * 14, // 14 days
      });
    }
    return res;
  }

  // 2. Every other request needs a valid cookie.
  if (isAccessAllowed(req.cookies.get(ACCESS_COOKIE)?.value)) {
    return NextResponse.next();
  }
  return new NextResponse('This demo needs an access link. Please contact Daniel Kasambala.', {
    status: 401,
    headers: { 'content-type': 'text/plain' },
  });
}

// Run on pages and API routes, but not on static files (scripts, images, fonts).
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp|otf|woff)$).*)'],
};