/**
 * 세 클라이언트가 같은 접속 정보를 쓰도록 한곳에 모아 둡니다.
 *
 * Next.js는 `NEXT_PUBLIC_` 으로 시작하는 변수를 **빌드할 때 값으로 통째로 바꿔치기**합니다.
 * 그래서 `process.env[name]` 처럼 변수로 꺼내면 치환이 안 되고 undefined가 됩니다.
 * 아래처럼 이름을 그대로 적어야 하는 이유입니다.
 *
 * publishable key는 브라우저로 전송되는 값이라 공개돼도 되는 키입니다.
 * DB를 지키는 것은 이 키를 숨기는 게 아니라 RLS입니다.
 *
 * 예전 `anon` 키를 대체하는 이름입니다. Supabase가 anon·service_role 을
 * 2026년 말에 폐기한다고 공지해서 처음부터 새 이름을 씁니다.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** 접속 정보를 읽습니다. 없으면 원인을 알려 주고 멈춥니다. */
export function supabaseConfig() {
  if (!url || !publishableKey) {
    throw new Error(
      "Supabase 접속 정보가 없습니다. .env.local 에 " +
        "NEXT_PUBLIC_SUPABASE_URL 과 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 를 넣고 dev 서버를 다시 켜세요.",
    );
  }
  return { url, publishableKey };
}
