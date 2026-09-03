import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { supabaseConfig } from "./config";

/**
 * 서버에서 쓰는 클라이언트입니다. 목록·상세를 미리 그려서 내려보낼 때 씁니다.
 *
 * **요청마다 새로 만들어야 합니다.** 하나를 만들어 두고 돌려쓰면 A의 로그인 상태로
 * B의 화면을 그리는 사고가 납니다. 그래서 모듈 최상단에 만들어 두지 않고 함수로 뒀습니다.
 *
 * Next.js 15부터 `cookies()` 가 비동기라 `await` 가 필요합니다.
 */
export async function createClient() {
  const { url, publishableKey } = supabaseConfig();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // 서버 컴포넌트에서는 쿠키를 쓸 수 없어 여기서 예외가 납니다.
          // 토큰 갱신은 proxy.ts 가 대신 처리하므로 무시해도 됩니다.
        }
      },
    },
  });
}
