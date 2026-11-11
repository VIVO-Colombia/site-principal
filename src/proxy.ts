import { NextResponse, type NextRequest } from "next/server"

import { publicRoutes } from "@/config/routes"
import { isAdminPath, isAppPath, isAuthPath } from "@/config/routes"
import { updateSession } from "@/lib/supabase/proxy"

function nextWithPath(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  url.search = ""
  return NextResponse.redirect(url)
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { response, user, configured } = await updateSession(request)

  const needsAuth =
    isAppPath(pathname) ||
    isAdminPath(pathname) ||
    pathname === publicRoutes.activate ||
    pathname === publicRoutes.updatePassword

  if (needsAuth && (!configured || !user)) {
    const login = request.nextUrl.clone()
    login.pathname = publicRoutes.login
    login.searchParams.set("siguiente", pathname)
    if (!configured) {
      login.searchParams.set("razon", "configuracion")
    }
    return NextResponse.redirect(login)
  }

  if (user && isAuthPath(pathname)) {
    return nextWithPath(request, publicRoutes.activate)
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|webmanifest)$).*)",
  ],
}
