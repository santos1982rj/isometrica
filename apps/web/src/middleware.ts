import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/', '/auth/login', '/auth/cadastro', '/auth/esqueceu-senha']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith('/_next') || pathname.startsWith('/api'),
  )

  if (isPublic) {
    return NextResponse.next()
  }

  const token = request.cookies.get('token')?.value
      ?? request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token && !pathname.startsWith('/auth/')) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt|sitemap.xml).*)'],
}
