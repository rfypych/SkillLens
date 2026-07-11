import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const path = request.nextUrl.pathname;
    
    // Protect recruiter and candidate routes
    if (!token && (path.startsWith('/recruiter') || path.startsWith('/candidate'))) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Redirect to dashboard if logged in and trying to access login/signup
    if (token && (path === '/login' || path === '/signup')) {
        // We might not know the role here easily without decoding the JWT, 
        // but typically they should be sent to their respective dashboard
        // For now, we'll let the client-side handle role redirection
        // or just let them access the login page where client side will redirect
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/recruiter/:path*', '/candidate/:path*', '/login', '/signup'],
};
