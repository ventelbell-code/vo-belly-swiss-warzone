import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register"
  const isPrivateRoute =
    request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/admin")

  if (!user && isPrivateRoute) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: ["/login", "/register", "/dashboard/:path*", "/admin/:path*"],
}
