import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/', '/entrar', '/cadastro', '/esqueceu-senha', '/recuperar-senha']

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

  if (!token && !pathname.startsWith('/entrar') && !pathname.startsWith('/cadastro') && !pathname.startsWith('/esqueceu-senha') && !pathname.startsWith('/recuperar-senha')) {
    const loginUrl = new URL('/entrar', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|manifest.webmanifest|robots.txt|sitemap.xml).*)'],
}
