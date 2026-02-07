import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { checkSetupRequired } from '@/lib/setup-actions'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Whitelist setup-related routes
    const isSetupRoute = pathname.startsWith('/setup') || pathname.startsWith('/api/setup')

    // Check if initial setup is required
    const setupRequired = await checkSetupRequired()

    if (setupRequired && !isSetupRoute) {
        // Redirect all routes to setup page if setup is incomplete
        return NextResponse.redirect(new URL('/setup', request.url))
    }

    if (!setupRequired && pathname === '/setup') {
        // Setup already complete, redirect to admin dashboard
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    // Continue with normal session update
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
