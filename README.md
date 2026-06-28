# hairlog

가족 미용 시술 기록 프로토타입.

## 실행

```
npm install
npm run dev
```

`http://localhost:3000` 또는 같은 네트워크에서 `http://<PC-IP>:3000`.

로컬에서는 데이터가 `data/data.json`에 저장됩니다. 첫 실행 시 자동 생성.

## 백업

`설정` 탭에서 JSON 내보내기/가져오기.

## Vercel 배포

1. **Upstash Redis(KV) 연결**
   - Vercel 프로젝트 → Storage → Upstash Redis(또는 KV) 생성 후 프로젝트에 연결
   - `KV_REST_API_URL`, `KV_REST_API_TOKEN` 환경변수가 자동 주입됨
   - (로컬에서 Redis 미설정 시 자동으로 파일 저장으로 폴백)
2. **비밀번호 설정**
   - 환경변수 `APP_PASSWORD`에 공용 비밀번호 지정
   - 접속 시 아이디는 아무거나, 비밀번호에 이 값을 입력 (Basic Auth)
   - 비워두면 보호 없이 공개됨
3. 환경변수 추가 후 **재배포(Redeploy)** 해야 적용됨

환경변수 예시는 `.env.example` 참고.
