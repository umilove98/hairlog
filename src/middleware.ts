import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE, authToken } from '@/lib/auth';

// 공용 비밀번호 보호. APP_PASSWORD가 설정돼 있을 때만 동작하며,
// 설정이 없으면(로컬 개발 등) 그대로 통과시킨다.
// 로그인은 쿠키 기반이라 한 번 로그인하면 90일간 유지된다.
export async function middleware(req: NextRequest) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) return NextResponse.next();

  const { pathname } = req.nextUrl;
  // 로그인 화면/엔드포인트는 통과
  if (pathname === '/login' || pathname === '/api/login') {
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (token && token === (await authToken(expected))) {
    return NextResponse.next();
  }

  // API는 401, 페이지는 로그인 화면으로 리다이렉트
  if (pathname.startsWith('/api/')) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('from', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // 정적 자원/파비콘을 제외한 모든 경로(페이지 + API) 보호
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
