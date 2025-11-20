import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Kontrola či je shop povolený
  const shopEnabled = process.env.NEXT_PUBLIC_SHOP_ENABLED === 'true';
  const isShopRoute = pathname.startsWith('/shop') || pathname.startsWith('/cart');
  const isAdminRoute = pathname.startsWith('/admin');
  
  // Blokujeme shop routes ak je vypnutý (okrem admin sekcie)
  if (!shopEnabled && isShopRoute && !isAdminRoute) {
    // Redirect na homepage
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/shop/:path*',
    '/cart/:path*',
  ],
};
