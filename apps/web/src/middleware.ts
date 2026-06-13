import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/', '/entrar', '/cadastro', '/esqueceu-senha', '/recuperar-senha']

function decodeToken(token: string): { role?: string } | null {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return { role: decoded.role }
  } catch {
    return null
  }
}

function hasAccess(role: string | undefined, pathname: string): boolean {
  if (!role) return false
  if (pathname.startsWith('/admin')) return role === 'ADMIN'
  if (pathname.startsWith('/professor')) return role === 'PROFESSOR' || role === 'ADMIN'
  return true
}

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

  if (!token) {
    const loginUrl = new URL('/entrar', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const payload = decodeToken(token)
  if (!hasAccess(payload?.role, pathname)) {
    return NextResponse.redirect(new URL('/nao-autorizado', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|manifest.webmanifest|robots.txt|sitemap.xml).*)'],
}
