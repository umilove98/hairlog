// Edge(미들웨어)와 Node(라우트) 양쪽에서 동작하도록 Web Crypto 사용.
export const AUTH_COOKIE = 'hairlog_auth';
export const AUTH_MAX_AGE = 60 * 60 * 24 * 90; // 90일

// 쿠키에 원문 비밀번호 대신 해시 토큰을 저장한다.
export async function authToken(secret: string): Promise<string> {
  const data = new TextEncoder().encode(`hairlog:${secret}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
