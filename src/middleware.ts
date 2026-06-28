import { NextRequest, NextResponse } from 'next/server';

// 간단한 공용 비밀번호 보호 (HTTP Basic Auth).
// APP_PASSWORD 환경변수가 설정돼 있을 때만 동작하며,
// 설정이 없으면(로컬 개발 등) 그대로 통과시킨다.
export function middleware(req: NextRequest) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) return NextResponse.next();

  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Basic ')) {
    try {
      const decoded = atob(auth.slice(6)); // "user:pass"
      const pass = decoded.slice(decoded.indexOf(':') + 1);
      if (pass === expected) return NextResponse.next();
    } catch {
      // 잘못된 헤더 → 아래에서 재요청
    }
  }

  return new NextResponse('인증이 필요합니다', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="hairlog"' },
  });
}

export const config = {
  // 정적 자원/파비콘을 제외한 모든 경로(페이지 + API) 보호
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
